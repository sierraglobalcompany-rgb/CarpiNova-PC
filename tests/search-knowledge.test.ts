import { describe, expect, it } from "vitest";

import {
  getAvailableContentTypes,
  getContentTypeLabel,
  isKnownContentType,
} from "../src/knowledge/contentTypes";
import {
  normalizeSearchText,
  searchKnowledge,
} from "../src/knowledge/searchKnowledge";
import type {
  ContentRecord,
  KnowledgeRepository,
  PageRecord,
  SourceRecord,
} from "../src/knowledge/types";

const PAGE_ID = "PAGE-CPNC-2025-P0001";

const source: SourceRecord = {
  book_id: "cpnc-2025",
  pdf_page: 1,
  printed_page: null,
  region: { x: 0, y: 0, width: 1, height: 1 },
  extraction: { method: "text", confidence: 1, review_status: "VALIDATED" },
};

const page: PageRecord = {
  page_id: PAGE_ID,
  book_id: "cpnc-2025",
  pdf_page: 1,
  printed_page: null,
  mapping_status: "verified",
  chapter: "Herrajes",
  section: "Instalación",
};

function content(
  suffix: string,
  overrides: Partial<ContentRecord> = {},
): ContentRecord {
  return {
    content_id: `CONTENT-CPNC-2025-P0001-${suffix}`,
    page_id: PAGE_ID,
    content_type: "concept",
    source_transcription: "Fuente sin términos especiales",
    normalized_text: "",
    learning_text: "",
    derived_from_content_ids: [`CONTENT-CPNC-2025-P0001-${suffix}`],
    source,
    ...overrides,
  };
}

function repository(records: ContentRecord[]): KnowledgeRepository {
  return {
    manifest: {
      schema_version: "0.1.0",
      knowledge_version: "1.0.0",
      book_id: "cpnc-2025",
      scope: "BOOK",
      source_manifest_sha256:
        "318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c",
      files: {
        "knowledge.bundle.json": "a".repeat(64),
        "figures.bundle.json": "b".repeat(64),
        "lessons.bundle.json": "c".repeat(64),
      },
    },
    bundle: {
      schema_version: "0.1.0",
      knowledge_version: "1.0.0",
      book_id: "cpnc-2025",
      pages: [page],
      content: records,
      measurements: [],
      rules: [],
      taxonomy: {},
    },
    pagesById: new Map([[PAGE_ID, page]]),
    contentById: new Map(records.map((record) => [record.content_id, record])),
  };
}

describe("deterministic Knowledge search", () => {
  it("normalizes case, accents and repeated whitespace", () => {
    expect(normalizeSearchText("  Instalación   de BISÁGRAS ")).toBe(
      "instalacion de bisagras",
    );
    expect(normalizeSearchText("MDF")).toBe("mdf");
  });

  it("ranks phrase, distributed-term and partial-token matches deterministically", () => {
    const repo = repository([
      content("003", { learning_text: "Revisa una bisagra lateral" }),
      content("002", {
        learning_text: "Instalación segura",
        tags: ["bisagras"],
      }),
      content("001", {
        learning_text: "Instalación de bisagras sencilla",
      }),
      content("004", { learning_text: "Bisagras para mueble" }),
      content("005", { learning_text: "Bisagras para puerta" }),
    ]);

    const strong = searchKnowledge(repo, {
      query: "Instalación de BISÁGRAS",
    });
    expect(strong[0]?.content.content_id).toBe("CONTENT-CPNC-2025-P0001-001");
    expect(strong[0]?.rank).toBe(3);

    const distributed = searchKnowledge(repo, {
      query: "instalacion bisagras",
    });
    expect(
      distributed.find(
        (hit) => hit.content.content_id === "CONTENT-CPNC-2025-P0001-002",
      )?.rank,
    ).toBe(2);
    expect(distributed[0]?.content.content_id).toBe("CONTENT-CPNC-2025-P0001-001");

    const partial = searchKnowledge(repo, { query: "bisagr" });
    expect(partial.length).toBeGreaterThan(0);
    expect(partial.every((hit) => hit.rank === 1)).toBe(true);

    const tied = searchKnowledge(repo, { query: "mueble puerta" });
    expect(tied.filter((hit) => hit.rank === 1).map((hit) => hit.content.content_id)).toEqual([
      "CONTENT-CPNC-2025-P0001-004",
      "CONTENT-CPNC-2025-P0001-005",
    ]);
  });

  it("does not index source_transcription and tolerates missing tags", () => {
    const repo = repository([
      content("001", {
        source_transcription: "token-solo-en-la-fuente",
        learning_text: "Explicación visible",
        tags: undefined,
      }),
    ]);

    expect(searchKnowledge(repo, { query: "token-solo-en-la-fuente" })).toEqual([]);
    expect(() => searchKnowledge(repo, { query: "visible" })).not.toThrow();
  });

  it("filters by a canonical content type", () => {
    const repo = repository([
      content("001", { content_type: "hardware", learning_text: "Bisagras" }),
      content("002", { content_type: "material", learning_text: "Bisagras decorativas" }),
    ]);

    const hits = searchKnowledge(repo, { query: "bisagras", contentType: "hardware" });
    expect(hits.map((hit) => hit.content.content_type)).toEqual(["hardware"]);
  });

  it("supports category-only exploration and empty-query rules", () => {
    const repo = repository([
      content("002", { content_type: "hardware" }),
      content("001", { content_type: "hardware" }),
      content("003", { content_type: "material" }),
    ]);

    expect(
      searchKnowledge(repo, { query: "", contentType: "hardware" }).map(
        (hit) => hit.content.content_id,
      ),
    ).toEqual([
      "CONTENT-CPNC-2025-P0001-001",
      "CONTENT-CPNC-2025-P0001-002",
    ]);
    expect(searchKnowledge(repo, { query: "   ", contentType: "hardware" })).toHaveLength(2);
    expect(searchKnowledge(repo, { query: "" })).toEqual([]);
    expect(searchKnowledge(repo, { query: "", contentType: "not-real" })).toEqual([]);
  });

  it("derives categories only from present canonical content types", () => {
    const repo = repository([
      content("001", { content_type: "material" }),
      content("002", { content_type: "hardware" }),
      content("003", { content_type: "material" }),
      content("004", { content_type: "not-real" }),
    ]);

    expect(isKnownContentType("hardware")).toBe(true);
    expect(isKnownContentType("not-real")).toBe(false);
    expect(getContentTypeLabel("hardware")).toBe("Herrajes");
    expect(getAvailableContentTypes(repo)).toEqual(["hardware", "material"]);
  });
});
