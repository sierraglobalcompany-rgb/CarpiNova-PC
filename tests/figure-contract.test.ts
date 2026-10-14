import { describe, expect, it } from "vitest";

import { buildKnowledgeRepository } from "../src/knowledge/loadKnowledge";

const SOURCE_SHA =
  "318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c";
const PAGE_ID = "PAGE-CPNC-2025-P0001";
const FIGURE_ID = "FIG-CPNC-2025-P0001-001";

function manifest() {
  return {
    schema_version: "0.1.0",
    knowledge_version: "1.1.0",
    book_id: "cpnc-2025",
    scope: "BOOK",
    source_manifest_sha256: SOURCE_SHA,
    files: {
      "knowledge.bundle.json": "a".repeat(64),
      "figures.bundle.json": "b".repeat(64),
      "lessons.bundle.json": "c".repeat(64),
    },
  };
}

function knowledgeBundle() {
  return {
    schema_version: "0.1.0",
    knowledge_version: "1.1.0",
    book_id: "cpnc-2025",
    scope: "BOOK",
    pages: [
      {
        page_id: PAGE_ID,
        book_id: "cpnc-2025",
        pdf_page: 1,
        printed_page: null,
        mapping_status: "verified",
      },
    ],
    content: [],
    measurements: [],
    rules: [],
    taxonomy: {},
  };
}

function lessonsBundle() {
  return {
    schema_version: "0.1.0",
    knowledge_version: "1.1.0",
    book_id: "cpnc-2025",
    scope: "BOOK",
    lessons: [],
  };
}

function renderReadyFigure() {
  return {
    figure_id: FIGURE_ID,
    page_id: PAGE_ID,
    type: "technical_diagram",
    purpose: "Contrato render-ready mínimo",
    entities: [
      {
        id: "rect-1",
        type: "panel",
        geometry: {
          primitive: "rect",
          precision: "approximate",
          bounds: { x: 0.1, y: 0.1, width: 0.3, height: 0.2 },
        },
      },
      {
        id: "line-1",
        type: "guide",
        geometry: {
          primitive: "line",
          precision: "approximate",
          points: [
            { x: 0.2, y: 0.4 },
            { x: 0.8, y: 0.4 },
          ],
        },
      },
      {
        id: "polyline-1",
        type: "profile",
        geometry: {
          primitive: "polyline",
          precision: "approximate",
          points: [
            { x: 0.2, y: 0.7 },
            { x: 0.5, y: 0.6 },
            { x: 0.8, y: 0.7 },
          ],
        },
      },
    ],
    annotations: [
      {
        id: "annotation-1",
        text: "Interior del mueble",
        entity_id: "rect-1",
        placement: { x: 0.15, y: 0.08, precision: "approximate" },
      },
    ],
    reconstruction: { render_contract: "normalized-2d-v1" },
    camera: {
      coordinate_space: "normalized_figure",
      viewport: { x: 0, y: 0, width: 1, height: 1 },
    },
    layers: [
      {
        id: "geometry",
        order: 1,
        entity_ids: ["rect-1", "line-1", "polyline-1"],
      },
      {
        id: "labels",
        order: 2,
        annotation_ids: ["annotation-1"],
      },
    ],
    accessibility: { summary: "Diagrama técnico de prueba" },
  };
}

function legacyFigure() {
  return {
    figure_id: FIGURE_ID,
    page_id: PAGE_ID,
    type: "technical_diagram",
    purpose: "Figura legacy",
    entities: [],
    annotations: [],
    reconstruction: {},
  };
}

function figuresBundle(figure: Record<string, unknown>) {
  return {
    schema_version: "0.1.0",
    knowledge_version: "1.1.0",
    book_id: "cpnc-2025",
    scope: "BOOK",
    figures: [figure],
  };
}

function build(figure: Record<string, unknown>) {
  return buildKnowledgeRepository(
    manifest(),
    knowledgeBundle(),
    figuresBundle(figure),
    lessonsBundle(),
  );
}

function cloneFigure() {
  return structuredClone(renderReadyFigure());
}

describe("normalized-2d-v1 consumer contract", () => {
  it("accepts the compact render-ready contract", () => {
    expect(() => build(renderReadyFigure())).not.toThrow();
  });

  it("keeps a legacy figure valid without render contract, camera, or layers", () => {
    expect(() => build(legacyFigure())).not.toThrow();
  });

  it("keeps an unknown future render contract loadable but non-render-ready", () => {
    const figure = legacyFigure();
    figure.reconstruction = { render_contract: "future-contract-v2" };
    expect(() => build(figure)).not.toThrow();
  });

  it("rejects normalized-2d-v1 without camera", () => {
    const figure = cloneFigure();
    delete (figure as { camera?: unknown }).camera;
    expect(() => build(figure)).toThrow("camera");
  });

  it("rejects the wrong normalized coordinate space", () => {
    const figure = cloneFigure();
    figure.camera.coordinate_space = "page";
    expect(() => build(figure)).toThrow("coordinate_space");
  });

  it("requires the exact normalized viewport", () => {
    const figure = cloneFigure();
    figure.camera.viewport = { x: 0, y: 0, width: 1000, height: 1000 };
    expect(() => build(figure)).toThrow("viewport");
  });

  it.each([
    ["missing", undefined],
    ["empty", []],
  ])("rejects %s layers", (_name, layers) => {
    const figure = cloneFigure();
    if (layers === undefined) {
      delete (figure as { layers?: unknown }).layers;
    } else {
      figure.layers = layers;
    }
    expect(() => build(figure)).toThrow("layers");
  });

  it("rejects unsupported primitives", () => {
    const figure = cloneFigure();
    figure.entities[0].geometry.primitive = "circle";
    expect(() => build(figure)).toThrow("primitive");
  });

  it("rejects a rect without finite bounds", () => {
    const figure = cloneFigure();
    figure.entities[0].geometry.bounds.width = Number.NaN;
    expect(() => build(figure)).toThrow("bounds");
  });

  it("rejects a line without exactly two finite points", () => {
    const figure = cloneFigure();
    figure.entities[1].geometry.points = [{ x: 0.2, y: 0.4 }];
    expect(() => build(figure)).toThrow("points");
  });

  it("rejects a polyline with fewer than two finite points", () => {
    const figure = cloneFigure();
    figure.entities[2].geometry.points = [{ x: 0.2, y: 0.7 }];
    expect(() => build(figure)).toThrow("points");
  });

  it("rejects a broken layer entity reference", () => {
    const figure = cloneFigure();
    figure.layers[0].entity_ids = ["missing-entity"];
    expect(() => build(figure)).toThrow("missing-entity");
  });

  it("rejects a broken layer annotation reference", () => {
    const figure = cloneFigure();
    figure.layers[1].annotation_ids = ["missing-annotation"];
    expect(() => build(figure)).toThrow("missing-annotation");
  });

  it("requires placement for an annotation included in a layer", () => {
    const figure = cloneFigure();
    delete (figure.annotations[0] as { placement?: unknown }).placement;
    expect(() => build(figure)).toThrow("placement");
  });

  it("rejects duplicate entity IDs", () => {
    const figure = cloneFigure();
    figure.entities.push(structuredClone(figure.entities[0]));
    expect(() => build(figure)).toThrow("rect-1");
  });

  it("rejects duplicate annotation IDs", () => {
    const figure = cloneFigure();
    figure.annotations.push(structuredClone(figure.annotations[0]));
    expect(() => build(figure)).toThrow("annotation-1");
  });
});
