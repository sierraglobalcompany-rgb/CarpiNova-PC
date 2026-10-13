import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const EXPECTED_KNOWLEDGE_VERSION = "1.0.0";
export const EXPECTED_BOOK_ID = "cpnc-2025";
export const EXPECTED_SCOPE = "BOOK";
export const EXPECTED_SOURCE_SHA256 = "318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c";
export const REQUIRED_ARTIFACTS = [
  "knowledge.bundle.json",
  "figures.bundle.json",
  "lessons.bundle.json",
];

function fail(field, detail) {
  throw new Error(`Invalid Knowledge manifest ${field}: ${detail}`);
}

export function validateManifest(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    fail("manifest", "expected object");
  }

  const expected = {
    knowledge_version: EXPECTED_KNOWLEDGE_VERSION,
    book_id: EXPECTED_BOOK_ID,
    scope: EXPECTED_SCOPE,
    source_manifest_sha256: EXPECTED_SOURCE_SHA256,
  };

  for (const [field, value] of Object.entries(expected)) {
    if (manifest[field] !== value) {
      fail(field, `expected ${value}`);
    }
  }

  if (!manifest.files || typeof manifest.files !== "object" || Array.isArray(manifest.files)) {
    fail("files", "expected hash map");
  }

  for (const artifact of REQUIRED_ARTIFACTS) {
    const hash = manifest.files[artifact];
    if (typeof hash !== "string" || !/^[a-f0-9]{64}$/i.test(hash)) {
      fail(artifact, "missing or invalid SHA-256");
    }
  }
}

export async function verifyArtifactHashes(bundleDir, manifest) {
  validateManifest(manifest);

  for (const artifact of REQUIRED_ARTIFACTS) {
    let data;
    try {
      data = await readFile(join(bundleDir, artifact));
    } catch (error) {
      throw new Error(`Knowledge artifact ${artifact} is missing or unreadable`, { cause: error });
    }
    const actual = createHash("sha256").update(data).digest("hex");
    if (actual.toLowerCase() !== manifest.files[artifact].toLowerCase()) {
      throw new Error(`Knowledge artifact ${artifact} SHA-256 mismatch`);
    }
  }
}

async function exists(path) {
  try {
    await readFile(path);
    return true;
  } catch (error) {
    if (error?.code === "EISDIR") return true;
    if (error?.code === "ENOENT") return false;
    try {
      const { stat } = await import("node:fs/promises");
      await stat(path);
      return true;
    } catch (statError) {
      if (statError?.code === "ENOENT") return false;
      throw statError;
    }
  }
}

async function defaultRunCommand(command, args, options = {}) {
  try {
    await execFileAsync(command, args, {
      cwd: options.cwd,
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (error) {
    const stderr = typeof error?.stderr === "string" ? error.stderr.trim() : "";
    throw new Error(`${command} failed${stderr ? `: ${stderr}` : ""}`, { cause: error });
  }
}

export async function prepareKnowledge({
  knowledgeRoot,
  generatedRoot,
  runCommand = defaultRunCommand,
}) {
  const resolvedKnowledgeRoot = resolve(knowledgeRoot);
  const resolvedGeneratedRoot = resolve(generatedRoot);
  const finalDir = join(resolvedGeneratedRoot, "knowledge");
  const backupDir = join(
    resolvedGeneratedRoot,
    `.knowledge-backup-${process.pid}-${Date.now()}`,
  );

  await mkdir(resolvedGeneratedRoot, { recursive: true });
  const tempDir = await mkdtemp(join(resolvedGeneratedRoot, ".knowledge-temp-"));
  let previousMoved = false;
  let newInstalled = false;

  try {
    await runCommand(
      "uv",
      ["run", "python", "-m", "carpinova_knowledge", "validate", "--root", resolvedKnowledgeRoot],
      { cwd: resolvedKnowledgeRoot },
    );
    await runCommand(
      "uv",
      [
        "run",
        "python",
        "-m",
        "carpinova_knowledge",
        "build-book-dist",
        "--root",
        resolvedKnowledgeRoot,
        "--book-id",
        EXPECTED_BOOK_ID,
        "--out",
        tempDir,
      ],
      { cwd: resolvedKnowledgeRoot },
    );

    const manifestPath = join(tempDir, "manifest.json");
    let manifest;
    try {
      manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    } catch (error) {
      throw new Error("Knowledge manifest.json is missing or invalid JSON", { cause: error });
    }

    validateManifest(manifest);
    await verifyArtifactHashes(tempDir, manifest);

    if (await exists(finalDir)) {
      await rename(finalDir, backupDir);
      previousMoved = true;
    }

    try {
      await rename(tempDir, finalDir);
      newInstalled = true;
    } catch (error) {
      if (previousMoved) {
        await rename(backupDir, finalDir);
        previousMoved = false;
      }
      throw error;
    }

    if (previousMoved) {
      await rm(backupDir, { recursive: true, force: true });
      previousMoved = false;
    }
  } catch (error) {
    if (!newInstalled) {
      await rm(tempDir, { recursive: true, force: true });
    }
    if (previousMoved && !(await exists(finalDir))) {
      await rename(backupDir, finalDir);
    }
    throw error;
  }
}

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(scriptPath), "..");
const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";

if (import.meta.url === invokedPath) {
  const knowledgeRoot = resolve(readArg("--knowledge-root") ?? join(repoRoot, "..", "CarpiNova-Knowledge"));
  const generatedRoot = join(repoRoot, "generated");
  prepareKnowledge({ knowledgeRoot, generatedRoot })
    .then(() => {
      console.log(`CarpiNova Knowledge ${EXPECTED_KNOWLEDGE_VERSION} prepared in ${join(generatedRoot, "knowledge")}`);
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
