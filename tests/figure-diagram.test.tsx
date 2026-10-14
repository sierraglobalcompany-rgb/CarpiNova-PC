import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FigureDiagram } from "../src/features/figures/FigureDiagram";
import type { FigureRecord } from "../src/knowledge/types";

function figure(): FigureRecord {
  return {
    figure_id: "FIG-TEST-001",
    page_id: "PAGE-TEST-001",
    type: "technical_diagram",
    purpose: "Diagrama técnico de respaldo",
    entities: [
      {
        id: "rect-1",
        type: "panel",
        geometry: {
          primitive: "rect",
          bounds: { x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
        },
      },
      {
        id: "line-1",
        type: "guide",
        geometry: {
          primitive: "line",
          points: [
            { x: 0.2, y: 0.3 },
            { x: 0.8, y: 0.9 },
          ],
        },
      },
      {
        id: "polyline-1",
        type: "profile",
        geometry: {
          primitive: "polyline",
          points: [
            { x: 0.1, y: 0.9 },
            { x: 0.5, y: 0.5 },
            { x: 0.9, y: 0.9 },
          ],
        },
      },
    ],
    annotations: [
      {
        id: "annotation-1",
        text: "Interior <script>& seguro",
        placement: { x: 0.25, y: 0.15 },
      },
    ],
    layers: [
      { id: "z-profile", order: 2, entity_ids: ["polyline-1"] },
      { id: "labels", order: 3, annotation_ids: ["annotation-1"] },
      { id: "b-main", order: 1, entity_ids: ["rect-1"] },
      { id: "a-main", order: 1, entity_ids: ["line-1"] },
    ],
    camera: {
      coordinate_space: "normalized_figure",
      viewport: { x: 0, y: 0, width: 1, height: 1 },
    },
    reconstruction: { render_contract: "normalized-2d-v1" },
    accessibility: { summary: "Diagrama técnico accesible" },
  };
}

describe("FigureDiagram", () => {
  it("renders normalized primitives, annotations, and accessibility as native SVG", () => {
    const { container } = render(<FigureDiagram figure={figure()} />);

    const svg = screen.getByRole("img", { name: "Diagrama técnico accesible" });
    expect(svg).toHaveAttribute("viewBox", "0 0 1000 1000");
    expect(svg).toHaveAttribute("preserveAspectRatio", "xMidYMid meet");

    const line = container.querySelector("line");
    expect(line).toHaveAttribute("x1", "200");
    expect(line).toHaveAttribute("y1", "300");
    expect(line).toHaveAttribute("x2", "800");
    expect(line).toHaveAttribute("y2", "900");

    const rect = container.querySelector("rect");
    expect(rect).toHaveAttribute("x", "100");
    expect(rect).toHaveAttribute("y", "200");
    expect(rect).toHaveAttribute("width", "300");
    expect(rect).toHaveAttribute("height", "400");

    const polyline = container.querySelector("polyline");
    expect(polyline).toHaveAttribute("points", "100,900 500,500 900,900");

    const annotation = screen.getByText("Interior <script>& seguro");
    expect(annotation.tagName.toLowerCase()).toBe("text");
    expect(annotation).toHaveAttribute("x", "250");
    expect(annotation).toHaveAttribute("y", "150");
    expect(container.querySelector("script")).toBeNull();
  });

  it("uses purpose when accessibility summary is missing or blank", () => {
    const missing = figure();
    delete missing.accessibility;
    const first = render(<FigureDiagram figure={missing} />);
    expect(screen.getByRole("img", { name: missing.purpose })).toBeInTheDocument();
    first.unmount();

    const blank = figure();
    blank.accessibility = { summary: "   " };
    render(<FigureDiagram figure={blank} />);
    expect(screen.getByRole("img", { name: blank.purpose })).toBeInTheDocument();
  });

  it("renders by layer order, stable id tie-break, and member-array order", () => {
    const ordered = figure();
    ordered.layers = [
      { id: "z-layer", order: 1, entity_ids: ["polyline-1"] },
      { id: "labels", order: 2, annotation_ids: ["annotation-1"] },
      { id: "a-layer", order: 1, entity_ids: ["line-1", "rect-1"] },
    ];

    const { container } = render(<FigureDiagram figure={ordered} />);
    expect(
      Array.from(container.querySelectorAll("svg > *"), (node) => node.tagName.toLowerCase()),
    ).toEqual(["line", "rect", "polyline", "text"]);
  });

  it("throws defensively for a non-render-ready figure", () => {
    const legacy = figure();
    legacy.reconstruction = {};
    expect(() => render(<FigureDiagram figure={legacy} />)).toThrow("normalized-2d-v1");
  });

  it("throws defensively for an unsupported primitive", () => {
    const unsupported = figure();
    unsupported.entities[0].geometry.primitive = "circle";
    expect(() => render(<FigureDiagram figure={unsupported} />)).toThrow("primitive");
  });
});
