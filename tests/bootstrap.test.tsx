import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Bootstrap } from "../src/app/Bootstrap";
import {
  buildKnowledgeRepository,
  loadKnowledge,
} from "../src/knowledge/loadKnowledge";
import type { KnowledgeRepository } from "../src/knowledge/types";

const SOURCE_SHA =
  "318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c";
const ERROR_COPY =
  "No se pudo cargar CarpiNova Knowledge 1.0.0. Ejecuta la preparación del conocimiento y vuelve a intentar.";

function validRepository(): KnowledgeRepository {
  return buildKnowledgeRepository(
    {
      schema_version: "0.1.0",
      knowledge_version: "1.0.0",
      book_id: "cpnc-2025",
      scope: "BOOK",
      source_manifest_sha256: SOURCE_SHA,
      files: {
        "knowledge.bundle.json": "a".repeat(64),
        "figures.bundle.json": "b".repeat(64),
        "lessons.bundle.json": "c".repeat(64),
      },
    },
    {
      schema_version: "0.1.0",
      knowledge_version: "1.0.0",
      book_id: "cpnc-2025",
      pages: [],
      content: [],
      measurements: [],
      rules: [],
      taxonomy: {},
    },
  );
}

function jsonResponse(value: unknown): Response {
  return {
    ok: true,
    json: async () => value,
  } as Response;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Bootstrap", () => {
  it("renders the real application only after Knowledge loads successfully", async () => {
    const load = vi.fn(async () => validRepository());

    render(<Bootstrap load={load} />);

    expect(screen.getByText(/cargando conocimiento/i)).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", {
        name: "Explora carpintería paso a paso",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: /buscar en carpinova/i })).toBeInTheDocument();
    expect(screen.queryByText(ERROR_COPY)).not.toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("fails closed with the approved user-facing message when Knowledge cannot load", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const load = vi.fn(async () => {
      throw new Error("manifest missing");
    });

    render(<Bootstrap load={load} />);

    expect(await screen.findByText(ERROR_COPY)).toBeInTheDocument();
    expect(
      screen.queryByRole("searchbox", { name: /buscar en carpinova/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: "Explora carpintería paso a paso",
      }),
    ).not.toBeInTheDocument();
  });

  it("uses the same fail-closed state when the real loader receives stale Knowledge", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const staleManifest = {
      schema_version: "0.1.0",
      knowledge_version: "0.9.0",
      book_id: "cpnc-2025",
      scope: "BOOK",
      source_manifest_sha256: SOURCE_SHA,
      files: {
        "knowledge.bundle.json": "a".repeat(64),
        "figures.bundle.json": "b".repeat(64),
        "lessons.bundle.json": "c".repeat(64),
      },
    };
    const bundle = {
      schema_version: "0.1.0",
      knowledge_version: "0.9.0",
      book_id: "cpnc-2025",
      pages: [],
      content: [],
      measurements: [],
      rules: [],
      taxonomy: {},
    };
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      return jsonResponse(url.endsWith("manifest.json") ? staleManifest : bundle);
    }) as unknown as typeof fetch;
    const load = () => loadKnowledge(fetchImpl);

    render(<Bootstrap load={load} />);

    expect(await screen.findByText(ERROR_COPY)).toBeInTheDocument();
    expect(
      screen.queryByRole("searchbox", { name: /buscar en carpinova/i }),
    ).not.toBeInTheDocument();
  });
});
