import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  prepareKnowledge,
  validateManifest,
  verifyArtifactHashes,
} from "../scripts/prepare-knowledge.mjs";

const SOURCE_SHA = "318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c";
const ARTIFACTS = [
  "knowledge.bundle.json",
  "figures.bundle.json",
  "lessons.bundle.json",
] as const;

type ManifestOverrides = Partial<{
  schema_version: string;
  knowledge_version: string;
  book_id: string;
  scope: string;
  source_manifest_sha256: string;
  files: Record<string, string>;
}>;

function manifest(overrides: ManifestOverrides = {}) {
  return {
    schema_version: "0.1.0",
    knowledge_version: "1.0.0",
    book_id: "cpnc-2025",
    scope: "BOOK",
    source_manifest_sha256: SOURCE_SHA,
    files: Object.fromEntries(ARTIFACTS.map((name) => [name, "0".repeat(64)])),
    ...overrides,
  };
}

async function makeBundleDir() {
  const dir = await mkdtemp(join(tmpdir(), "carpinova-bundle-"));
  const hashes: Record<string, string> = {};
  for (const name of ARTIFACTS) {
    const body = `${name}:fixture\n`;
    await writeFile(join(dir, name), body, "utf8");
    hashes[name] = createHash("sha256").update(body).digest("hex");
  }
  return { dir, hashes };
}

describe("Knowledge preparation contract", () => {
  it("accepts only supported Knowledge book contracts", () => {
    expect(() => validateManifest(manifest({ knowledge_version: "1.0.0" }))).not.toThrow();
    expect(() => validateManifest(manifest({ knowledge_version: "1.1.0" }))).not.toThrow();
    expect(() => validateManifest(manifest({ knowledge_version: "1.2.0" }))).toThrow(
      "knowledge_version",
    );

    for (const [field, value] of [
      ["book_id", "other-book"],
      ["scope", "BATCH"],
      ["source_manifest_sha256", "f".repeat(64)],
    ] as const) {
      expect(() => validateManifest(manifest({ [field]: value }))).toThrow(field);
    }
  });

  it("requires hashes for all three consumer bundle files", () => {
    for (const missing of ARTIFACTS) {
      const files = { ...manifest().files };
      delete files[missing];
      expect(() => validateManifest(manifest({ files }))).toThrow(missing);
    }
  });

  it("verifies every declared artifact hash and names mismatches", async () => {
    const { dir, hashes } = await makeBundleDir();
    await expect(verifyArtifactHashes(dir, manifest({ files: hashes }))).resolves.toBeUndefined();

    await writeFile(join(dir, "knowledge.bundle.json"), "changed\n", "utf8");
    await expect(verifyArtifactHashes(dir, manifest({ files: hashes }))).rejects.toThrow(
      "knowledge.bundle.json",
    );
  });

  it("rejects a missing bundle artifact", async () => {
    const { dir, hashes } = await makeBundleDir();
    const missingDir = await mkdtemp(join(tmpdir(), "carpinova-missing-"));
    for (const name of ARTIFACTS.filter((item) => item !== "figures.bundle.json")) {
      await writeFile(join(missingDir, name), await readFile(join(dir, name)));
    }

    await expect(
      verifyArtifactHashes(missingDir, manifest({ files: hashes })),
    ).rejects.toThrow("figures.bundle.json");
  });

  it("preserves an installed valid directory when preparation fails and cleans temporary output", async () => {
    const root = await mkdtemp(join(tmpdir(), "carpinova-prepare-"));
    const knowledgeRoot = join(root, "CarpiNova-Knowledge");
    const generatedRoot = join(root, "generated");
    const installed = join(generatedRoot, "knowledge");
    await mkdir(knowledgeRoot, { recursive: true });
    await mkdir(installed, { recursive: true });
    await writeFile(join(installed, "manifest.json"), "sentinel", "utf8");

    await expect(
      prepareKnowledge({
        knowledgeRoot,
        generatedRoot,
        runCommand: async () => {
          throw new Error("simulated command failure");
        },
      }),
    ).rejects.toThrow("simulated command failure");

    expect(await readFile(join(installed, "manifest.json"), "utf8")).toBe("sentinel");
    expect((await readdir(generatedRoot)).filter((name) => name.startsWith(".knowledge-temp-"))).toEqual([]);
  });
});
