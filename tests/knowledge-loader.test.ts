import { describe, expect, it } from "vitest";

import {
  buildKnowledgeRepository,
  loadKnowledge,
} from "../src/knowledge/loadKnowledge";

const SOURCE_SHA = "318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c";

function manifest(overrides: Record<string, unknown> = {}) {
  return {
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
    ...overrides,
  };
}

function page(overrides: Record<string, unknown> = {}) {
  return {
    page_id: "PAGE-CPNC-2025-P0001",
    book_id: "cpnc-2025",
    pdf_page: 1,
    printed_page: null,
    mapping_status: "verified",
    chapter: "Introducción",
    section: "Conceptos",
    ...overrides,
  };
}

function content(overrides: Record<string, unknown> = {}) {
  return {
    content_id: "CONTENT-CPNC-2025-P0001-001",
    page_id: "PAGE-CPNC-2025-P0001",
    content_type: "concept",
    source_transcription: "Texto original",
    normalized_text: "Texto normalizado",
    learning_text: "Explicación sencilla",
    derived_from_content_ids: ["CONTENT-CPNC-2025-P0001-001"],
    source: {
      book_id: "cpnc-2025",
      pdf_page: 1,
      printed_page: null,
      region: { x: 0, y: 0, width: 1, height: 1 },
      extraction: { method: "text", confidence: 1, review_status: "VALIDATED" },
    },
    tags: ["inicio"],
    ...overrides,
  };
}

function bundle(overrides: Record<string, unknown> = {}) {
  return {
    schema_version: "0.1.0",
    knowledge_version: "1.0.0",
    book_id: "cpnc-2025",
    scope: "BOOK",
    pages: [page()],
    content: [content()],
    measurements: [],
    rules: [],
    taxonomy: {},
    ...overrides,
  };
}

function fetchStub(values: Record<string, unknown>): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input);
    const body = values[url];
    if (body === undefined) {
      return new Response("not found", { status: 404 });
    }
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
}

describe("runtime Knowledge boundary", () => {
  it("loads a valid bundle and builds page/content indexes", async () => {
    const repository = await loadKnowledge(
      fetchStub({
        "/knowledge/manifest.json": manifest(),
        "/knowledge/knowledge.bundle.json": bundle(),
      }),
    );

    expect(repository.contentById.get("CONTENT-CPNC-2025-P0001-001")?.page_id).toBe("PAGE-CPNC-2025-P0001");
    expect(repository.pagesById.get("PAGE-CPNC-2025-P0001")?.pdf_page).toBe(1);
  });

  it.each([
    ["knowledge_version", "1.0.1"],
    ["book_id", "other-book"],
    ["scope", "BATCH"],
    ["source_manifest_sha256", "f".repeat(64)],
  ])("fails closed for invalid manifest field %s", (field, value) => {
    expect(() => buildKnowledgeRepository(manifest({ [field]: value }), bundle())).toThrow(field);
  });

  it("rejects malformed page/content collections", () => {
    expect(() => buildKnowledgeRepository(manifest(), bundle({ pages: {} }))).toThrow("pages");
    expect(() => buildKnowledgeRepository(manifest(), bundle({ content: {} }))).toThrow("content");
  });

  it("rejects duplicate page IDs", () => {
    expect(() =>
      buildKnowledgeRepository(manifest(), bundle({ pages: [page(), page()] })),
    ).toThrow("PAGE-CPNC-2025-P0001");
  });

  it("rejects duplicate content IDs", () => {
    expect(() =>
      buildKnowledgeRepository(manifest(), bundle({ content: [content(), content()] })),
    ).toThrow("CONTENT-CPNC-2025-P0001-001");
  });

  it("rejects content that references a missing page", () => {
    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle({ content: [content({ page_id: "PAGE-CPNC-2025-P9999" })] }),
      ),
    ).toThrow("PAGE-CPNC-2025-P9999");
  });

  it("fails closed when a Knowledge asset cannot be fetched", async () => {
    await expect(
      loadKnowledge(fetchStub({ "/knowledge/manifest.json": manifest() })),
    ).rejects.toThrow("knowledge.bundle.json");
  });
});
