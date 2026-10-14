import { describe, expect, it } from "vitest";

import {
  buildKnowledgeRepository,
  loadKnowledge,
} from "../src/knowledge/loadKnowledge";

const SOURCE_SHA = "318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c";
const CONTENT_ID = "CONTENT-CPNC-2025-P0001-001";
const FIGURE_ID = "FIG-CPNC-2025-P0001-001";
const LESSON_ID = "LESSON-SLIDES-X-2X-PILOT";

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
    content_id: CONTENT_ID,
    page_id: "PAGE-CPNC-2025-P0001",
    content_type: "concept",
    source_transcription: "Texto original",
    normalized_text: "Texto normalizado",
    learning_text: "Explicación sencilla",
    derived_from_content_ids: [CONTENT_ID],
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

function figure(overrides: Record<string, unknown> = {}) {
  return {
    figure_id: FIGURE_ID,
    page_id: "PAGE-CPNC-2025-P0001",
    type: "technical_diagram",
    purpose: "Figura legacy de prueba",
    entities: [],
    annotations: [],
    reconstruction: {},
    accessibility: { summary: "Figura de prueba" },
    ...overrides,
  };
}

function figuresBundle(overrides: Record<string, unknown> = {}) {
  return {
    schema_version: "0.1.0",
    knowledge_version: "1.0.0",
    book_id: "cpnc-2025",
    scope: "BOOK",
    figures: [figure()],
    ...overrides,
  };
}

function emptyFiguresBundle(overrides: Record<string, unknown> = {}) {
  return figuresBundle({ figures: [], ...overrides });
}

function step(order: number, overrides: Record<string, unknown> = {}) {
  return {
    order,
    title: `Paso ${order}`,
    content_ids: [CONTENT_ID],
    ...overrides,
  };
}

function lesson(overrides: Record<string, unknown> = {}) {
  return {
    lesson_id: LESSON_ID,
    title: "Calcular e instalar correderas con X y 2X",
    source_content_ids: [CONTENT_ID],
    steps: [step(1), step(2), step(3), step(4), step(5)],
    ...overrides,
  };
}

function lessonsBundle(overrides: Record<string, unknown> = {}) {
  return {
    schema_version: "0.1.0",
    knowledge_version: "1.0.0",
    book_id: "cpnc-2025",
    scope: "BOOK",
    lessons: [lesson()],
    ...overrides,
  };
}

function emptyLessonsBundle(overrides: Record<string, unknown> = {}) {
  return lessonsBundle({ lessons: [], ...overrides });
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
  it("loads valid figures and lessons and builds both indexes", async () => {
    const requested: string[] = [];
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input);
      requested.push(url);
      const values: Record<string, unknown> = {
        "/knowledge/manifest.json": manifest(),
        "/knowledge/knowledge.bundle.json": bundle(),
        "/knowledge/figures.bundle.json": figuresBundle(),
        "/knowledge/lessons.bundle.json": lessonsBundle(),
      };
      const body = values[url];
      if (body === undefined) return new Response("not found", { status: 404 });
      return new Response(JSON.stringify(body), { status: 200 });
    }) as typeof fetch;

    const repository = await loadKnowledge(fetchImpl);

    expect(requested).toEqual([
      "/knowledge/manifest.json",
      "/knowledge/knowledge.bundle.json",
      "/knowledge/figures.bundle.json",
      "/knowledge/lessons.bundle.json",
    ]);
    expect(repository.contentById.get(CONTENT_ID)?.page_id).toBe(
      "PAGE-CPNC-2025-P0001",
    );
    expect(repository.pagesById.get("PAGE-CPNC-2025-P0001")?.pdf_page).toBe(1);
    expect(repository.figures).toHaveLength(1);
    expect(repository.figuresById.get(FIGURE_ID)?.purpose).toBe("Figura legacy de prueba");
    expect(repository.lessons).toHaveLength(1);
    expect(repository.lessonsById.get(LESSON_ID)?.steps).toHaveLength(5);
  });

  it.each(["1.0.0", "1.1.0", "1.2.0"])("accepts supported runtime Knowledge %s", (version) => {
    expect(() =>
      buildKnowledgeRepository(
        manifest({ knowledge_version: version }),
        bundle({ knowledge_version: version }),
        figuresBundle({ knowledge_version: version }),
        emptyLessonsBundle({ knowledge_version: version }),
      ),
    ).not.toThrow();
  });

  it("rejects unapproved runtime Knowledge 1.3.0", () => {
    expect(() =>
      buildKnowledgeRepository(
        manifest({ knowledge_version: "1.3.0" }),
        bundle({ knowledge_version: "1.3.0" }),
        emptyFiguresBundle({ knowledge_version: "1.3.0" }),
        emptyLessonsBundle({ knowledge_version: "1.3.0" }),
      ),
    ).toThrow("knowledge_version");
  });

  it("accepts a legacy figure without render contract, camera, or layers", () => {
    const repository = buildKnowledgeRepository(
      manifest(),
      bundle(),
      figuresBundle({ figures: [figure()] }),
      emptyLessonsBundle(),
    );

    expect(repository.figuresById.get(FIGURE_ID)?.reconstruction).toEqual({});
  });

  it("sorts lesson steps without synthesizing missing order values", () => {
    const interaction = { type: "highlight", target_entity_ids: ["slide"] };
    const repository = buildKnowledgeRepository(
      manifest(),
      bundle(),
      figuresBundle(),
      lessonsBundle({
        lessons: [
          lesson({
            steps: [
              step(5),
              step(1, { interaction }),
              step(3),
            ],
          }),
        ],
      }),
    );

    expect(repository.lessons[0].steps.map((item) => item.order)).toEqual([1, 3, 5]);
    expect(repository.lessons[0].steps[0].interaction).toEqual(interaction);
  });

  it.each([
    ["lessons", { lessons: {} }, "lessons"],
    ["lesson_id", { lessons: [lesson({ lesson_id: 1 })] }, "lesson_id"],
    ["title", { lessons: [lesson({ title: 1 })] }, "title"],
    [
      "source_content_ids",
      { lessons: [lesson({ source_content_ids: [1] })] },
      "source_content_ids",
    ],
    ["steps", { lessons: [lesson({ steps: {} })] }, "steps"],
    ["order zero", { lessons: [lesson({ steps: [step(0)] })] }, "order"],
    ["order fraction", { lessons: [lesson({ steps: [step(1.5)] })] }, "order"],
    [
      "step title",
      { lessons: [lesson({ steps: [step(1, { title: 1 })] })] },
      "title",
    ],
    [
      "content_ids",
      { lessons: [lesson({ steps: [step(1, { content_ids: [1] })] })] },
      "content_ids",
    ],
    [
      "figure_ids",
      { lessons: [lesson({ steps: [step(1, { figure_ids: [1] })] })] },
      "figure_ids",
    ],
    [
      "interaction null",
      { lessons: [lesson({ steps: [step(1, { interaction: null })] })] },
      "interaction",
    ],
    [
      "interaction array",
      { lessons: [lesson({ steps: [step(1, { interaction: [] })] })] },
      "interaction",
    ],
  ])("rejects malformed lesson field %s", (_name, overrides, expectedField) => {
    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle(),
        figuresBundle(),
        lessonsBundle(overrides),
      ),
    ).toThrow(expectedField as string);
  });

  it("rejects duplicate lesson IDs", () => {
    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle(),
        figuresBundle(),
        lessonsBundle({ lessons: [lesson(), lesson()] }),
      ),
    ).toThrow(LESSON_ID);
  });

  it("rejects duplicate step order inside one lesson", () => {
    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle(),
        figuresBundle(),
        lessonsBundle({ lessons: [lesson({ steps: [step(1), step(1)] })] }),
      ),
    ).toThrow("order");
  });

  it.each([
    ["knowledge_version", "1.0.1"],
    ["book_id", "other-book"],
    ["scope", "BATCH"],
  ])("rejects lessons metadata that conflicts with manifest field %s", (field, value) => {
    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle(),
        figuresBundle(),
        lessonsBundle({ [field]: value }),
      ),
    ).toThrow(field);
  });

  it("rejects lessons that reference missing canonical content", () => {
    const missingId = "CONTENT-CPNC-2025-P9999-999";

    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle(),
        figuresBundle(),
        lessonsBundle({
          lessons: [lesson({ source_content_ids: [missingId] })],
        }),
      ),
    ).toThrow(missingId);

    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle(),
        figuresBundle(),
        lessonsBundle({
          lessons: [lesson({ steps: [step(1, { content_ids: [missingId] })] })],
        }),
      ),
    ).toThrow(missingId);
  });

  it.each([
    ["knowledge_version", "1.3.0"],
    ["book_id", "other-book"],
    ["scope", "BATCH"],
    ["source_manifest_sha256", "f".repeat(64)],
  ])("fails closed for invalid manifest field %s", (field, value) => {
    expect(() =>
      buildKnowledgeRepository(
        manifest({ [field]: value }),
        bundle(),
        emptyFiguresBundle(),
        emptyLessonsBundle(),
      ),
    ).toThrow(field);
  });

  it.each([
    ["knowledge_version", "1.1.0"],
    ["book_id", "other-book"],
    ["scope", "BATCH"],
  ])("rejects figures metadata that conflicts with manifest field %s", (field, value) => {
    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle(),
        figuresBundle({ [field]: value }),
        emptyLessonsBundle(),
      ),
    ).toThrow(field);
  });

  it("rejects a figures bundle whose figures field is not an array", () => {
    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle(),
        figuresBundle({ figures: {} }),
        emptyLessonsBundle(),
      ),
    ).toThrow("figures");
  });

  it("rejects duplicate figure IDs", () => {
    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle(),
        figuresBundle({ figures: [figure(), figure()] }),
        emptyLessonsBundle(),
      ),
    ).toThrow(FIGURE_ID);
  });

  it("rejects figures that reference a missing canonical page", () => {
    const missingPage = "PAGE-CPNC-2025-P9999";
    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle(),
        figuresBundle({ figures: [figure({ page_id: missingPage })] }),
        emptyLessonsBundle(),
      ),
    ).toThrow(missingPage);
  });

  it("rejects lessons that reference a missing figure", () => {
    const missingFigure = "FIG-CPNC-2025-P9999-999";
    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle(),
        emptyFiguresBundle(),
        lessonsBundle({
          lessons: [lesson({ steps: [step(1, { figure_ids: [missingFigure] })] })],
        }),
      ),
    ).toThrow(missingFigure);
  });

  it("rejects malformed page/content collections", () => {
    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle({ pages: {} }),
        emptyFiguresBundle(),
        emptyLessonsBundle(),
      ),
    ).toThrow("pages");
    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle({ content: {} }),
        emptyFiguresBundle(),
        emptyLessonsBundle(),
      ),
    ).toThrow("content");
  });

  it("rejects duplicate page IDs", () => {
    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle({ pages: [page(), page()] }),
        emptyFiguresBundle(),
        emptyLessonsBundle(),
      ),
    ).toThrow("PAGE-CPNC-2025-P0001");
  });

  it("rejects duplicate content IDs", () => {
    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle({ content: [content(), content()] }),
        emptyFiguresBundle(),
        emptyLessonsBundle(),
      ),
    ).toThrow(CONTENT_ID);
  });

  it("rejects content that references a missing page", () => {
    expect(() =>
      buildKnowledgeRepository(
        manifest(),
        bundle({ content: [content({ page_id: "PAGE-CPNC-2025-P9999" })] }),
        emptyFiguresBundle(),
        emptyLessonsBundle(),
      ),
    ).toThrow("PAGE-CPNC-2025-P9999");
  });

  it("fails closed when figures.bundle.json cannot be fetched", async () => {
    await expect(
      loadKnowledge(
        fetchStub({
          "/knowledge/manifest.json": manifest(),
          "/knowledge/knowledge.bundle.json": bundle(),
          "/knowledge/lessons.bundle.json": emptyLessonsBundle(),
        }),
      ),
    ).rejects.toThrow("figures.bundle.json");
  });

  it("fails closed when figures.bundle.json is invalid JSON", async () => {
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("manifest.json")) {
        return new Response(JSON.stringify(manifest()), { status: 200 });
      }
      if (url.endsWith("knowledge.bundle.json")) {
        return new Response(JSON.stringify(bundle()), { status: 200 });
      }
      if (url.endsWith("figures.bundle.json")) {
        return new Response("{not-json", { status: 200 });
      }
      if (url.endsWith("lessons.bundle.json")) {
        return new Response(JSON.stringify(emptyLessonsBundle()), { status: 200 });
      }
      return new Response("not found", { status: 404 });
    }) as typeof fetch;

    await expect(loadKnowledge(fetchImpl)).rejects.toThrow("figures.bundle.json");
  });

  it("fails closed when lessons.bundle.json cannot be fetched", async () => {
    await expect(
      loadKnowledge(
        fetchStub({
          "/knowledge/manifest.json": manifest(),
          "/knowledge/knowledge.bundle.json": bundle(),
          "/knowledge/figures.bundle.json": emptyFiguresBundle(),
        }),
      ),
    ).rejects.toThrow("lessons.bundle.json");
  });

  it("fails closed when lessons.bundle.json is invalid JSON", async () => {
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("manifest.json")) {
        return new Response(JSON.stringify(manifest()), { status: 200 });
      }
      if (url.endsWith("knowledge.bundle.json")) {
        return new Response(JSON.stringify(bundle()), { status: 200 });
      }
      if (url.endsWith("figures.bundle.json")) {
        return new Response(JSON.stringify(emptyFiguresBundle()), { status: 200 });
      }
      if (url.endsWith("lessons.bundle.json")) {
        return new Response("{not-json", { status: 200 });
      }
      return new Response("not found", { status: 404 });
    }) as typeof fetch;

    await expect(loadKnowledge(fetchImpl)).rejects.toThrow("Invalid JSON");
  });
});
