import type { ReactElement } from "react";

import type { FigureRecord } from "../../knowledge/types";

const SVG_SIZE = 1000;

function finite(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
  return value;
}

function scaled(value: unknown, label: string): number {
  return finite(value, label) * SVG_SIZE;
}

function compareLayerIds(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function renderEntity(
  entity: FigureRecord["entities"][number],
): ReactElement {
  const { geometry } = entity;
  switch (geometry.primitive) {
    case "rect": {
      if (geometry.bounds === undefined) {
        throw new Error(`Figure entity ${entity.id} rect requires bounds`);
      }
      return (
        <rect
          key={`entity:${entity.id}`}
          x={scaled(geometry.bounds.x, `${entity.id}.bounds.x`)}
          y={scaled(geometry.bounds.y, `${entity.id}.bounds.y`)}
          width={scaled(geometry.bounds.width, `${entity.id}.bounds.width`)}
          height={scaled(geometry.bounds.height, `${entity.id}.bounds.height`)}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />
      );
    }
    case "line": {
      if (geometry.points === undefined || geometry.points.length !== 2) {
        throw new Error(`Figure entity ${entity.id} line requires exactly two points`);
      }
      const [start, end] = geometry.points;
      return (
        <line
          key={`entity:${entity.id}`}
          x1={scaled(start.x, `${entity.id}.points[0].x`)}
          y1={scaled(start.y, `${entity.id}.points[0].y`)}
          x2={scaled(end.x, `${entity.id}.points[1].x`)}
          y2={scaled(end.y, `${entity.id}.points[1].y`)}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />
      );
    }
    case "polyline": {
      if (geometry.points === undefined || geometry.points.length < 2) {
        throw new Error(`Figure entity ${entity.id} polyline requires at least two points`);
      }
      const points = geometry.points
        .map(
          (point, index) =>
            `${scaled(point.x, `${entity.id}.points[${index}].x`)},${scaled(
              point.y,
              `${entity.id}.points[${index}].y`,
            )}`,
        )
        .join(" ");
      return (
        <polyline
          key={`entity:${entity.id}`}
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />
      );
    }
    default:
      throw new Error(
        `Figure entity ${entity.id} has unsupported primitive ${String(geometry.primitive)}`,
      );
  }
}

function renderAnnotation(
  annotation: FigureRecord["annotations"][number],
): ReactElement {
  if (annotation.placement === undefined) {
    throw new Error(`Figure annotation ${annotation.id} requires placement`);
  }
  return (
    <text
      key={`annotation:${annotation.id}`}
      x={scaled(annotation.placement.x, `${annotation.id}.placement.x`)}
      y={scaled(annotation.placement.y, `${annotation.id}.placement.y`)}
      fill="currentColor"
    >
      {annotation.text}
    </text>
  );
}

export function FigureDiagram({
  figure,
}: {
  figure: FigureRecord;
}): ReactElement {
  if (figure.reconstruction.render_contract !== "normalized-2d-v1") {
    throw new Error("FigureDiagram requires normalized-2d-v1");
  }
  if (figure.layers === undefined || figure.layers.length === 0) {
    throw new Error("FigureDiagram requires non-empty layers");
  }

  const entitiesById = new Map(figure.entities.map((entity) => [entity.id, entity] as const));
  const annotationsById = new Map(
    figure.annotations.map((annotation) => [annotation.id, annotation] as const),
  );
  const elements: ReactElement[] = [];

  const layers = [...figure.layers].sort(
    (left, right) => left.order - right.order || compareLayerIds(left.id, right.id),
  );

  for (const layer of layers) {
    for (const entityId of layer.entity_ids ?? []) {
      const entity = entitiesById.get(entityId);
      if (entity === undefined) {
        throw new Error(`Figure layer ${layer.id} references missing entity ${entityId}`);
      }
      elements.push(renderEntity(entity));
    }
    for (const annotationId of layer.annotation_ids ?? []) {
      const annotation = annotationsById.get(annotationId);
      if (annotation === undefined) {
        throw new Error(`Figure layer ${layer.id} references missing annotation ${annotationId}`);
      }
      elements.push(renderAnnotation(annotation));
    }
  }

  const summary = figure.accessibility?.summary;
  const accessibleName = summary !== undefined && summary.trim().length > 0 ? summary : figure.purpose;

  return (
    <svg
      role="img"
      aria-label={accessibleName}
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid meet"
    >
      {elements}
    </svg>
  );
}
