import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import type { ContentRecord, FigureRecord, LessonStep } from "../../knowledge/types";
import { useKnowledge } from "../../knowledge/KnowledgeContext";
import { selectPrimaryText } from "../content/contentPresentation";
import { FigureDiagram } from "../figures/FigureDiagram";

interface IdentifiedPart {
  label: string;
  installationLocation: string;
}

interface GuidedSequenceItem {
  order: number;
  contentId: string;
}

function stepFigures(
  step: LessonStep,
  figuresById: ReadonlyMap<string, FigureRecord>,
): FigureRecord[] {
  const figures: FigureRecord[] = [];
  for (const figureId of step.figure_ids ?? []) {
    const figure = figuresById.get(figureId);
    if (figure?.reconstruction.render_contract === "normalized-2d-v1") {
      figures.push(figure);
    }
  }
  return figures;
}

function highlightTargets(
  step: LessonStep,
  figuresById: ReadonlyMap<string, FigureRecord>,
): string[] {
  const interaction = step.interaction;
  if (interaction?.type !== "highlight") {
    return [];
  }

  const rawTargets = interaction.target_entity_ids;
  if (!Array.isArray(rawTargets)) {
    return [];
  }

  const allowed = new Set<string>();
  for (const figure of stepFigures(step, figuresById)) {
    for (const entity of figure.entities) {
      allowed.add(entity.id);
    }
  }

  return rawTargets.filter(
    (target): target is string =>
      typeof target === "string" && target.trim().length > 0 && allowed.has(target),
  );
}

function measurementHighlightTargets(
  step: LessonStep,
  figuresById: ReadonlyMap<string, FigureRecord>,
): string[] {
  const interaction = step.interaction;
  if (interaction?.type !== "highlight_measurements") {
    return [];
  }

  const rawTargets = interaction.measurement_ids;
  if (!Array.isArray(rawTargets)) {
    return [];
  }

  const allowed = new Set<string>();
  for (const figure of stepFigures(step, figuresById)) {
    for (const annotation of figure.annotations) {
      if (annotation.measurement_id !== undefined) {
        allowed.add(annotation.measurement_id);
      }
    }
  }

  return rawTargets.filter(
    (target): target is string =>
      typeof target === "string" && target.trim().length > 0 && allowed.has(target),
  );
}

function identifiedParts(step: LessonStep): IdentifiedPart[] {
  const interaction = step.interaction;
  if (interaction?.type !== "identify_parts") {
    return [];
  }

  const sourceContentId = interaction.source_content_id;
  if (
    typeof sourceContentId !== "string" ||
    !step.content_ids.includes(sourceContentId) ||
    !Array.isArray(interaction.parts) ||
    interaction.parts.length === 0
  ) {
    return [];
  }

  const parts: IdentifiedPart[] = [];
  for (const rawPart of interaction.parts) {
    if (typeof rawPart !== "object" || rawPart === null || Array.isArray(rawPart)) {
      return [];
    }

    const part = rawPart as Record<string, unknown>;
    const label = part.label;
    const installationLocation = part.installation_location;
    if (
      typeof label !== "string" ||
      label.trim().length === 0 ||
      typeof installationLocation !== "string" ||
      installationLocation.trim().length === 0
    ) {
      return [];
    }

    parts.push({ label, installationLocation });
  }

  return parts;
}

function measurementIds(measurements: readonly unknown[]): Set<string> {
  const ids = new Set<string>();
  for (const rawMeasurement of measurements) {
    if (
      typeof rawMeasurement !== "object" ||
      rawMeasurement === null ||
      Array.isArray(rawMeasurement)
    ) {
      continue;
    }

    const measurementId = (rawMeasurement as Record<string, unknown>).measurement_id;
    if (typeof measurementId === "string" && measurementId.trim().length > 0) {
      ids.add(measurementId);
    }
  }
  return ids;
}

function guidedSequence(
  step: LessonStep,
  contentById: ReadonlyMap<string, ContentRecord>,
  measurements: readonly unknown[],
): GuidedSequenceItem[] {
  const interaction = step.interaction;
  if (
    interaction?.type !== "guided_sequence" ||
    !Array.isArray(interaction.sequence) ||
    interaction.sequence.length === 0
  ) {
    return [];
  }

  const allowedMeasurementIds = measurementIds(measurements);
  const sequence: GuidedSequenceItem[] = [];
  const seenOrders = new Set<number>();

  for (const rawItem of interaction.sequence) {
    if (typeof rawItem !== "object" || rawItem === null || Array.isArray(rawItem)) {
      return [];
    }

    const item = rawItem as Record<string, unknown>;
    const order = item.order;
    const contentId = item.content_id;
    const rawMeasurementIds = item.measurement_ids;
    if (
      typeof order !== "number" ||
      !Number.isInteger(order) ||
      order <= 0 ||
      seenOrders.has(order) ||
      typeof contentId !== "string" ||
      !step.content_ids.includes(contentId) ||
      !contentById.has(contentId) ||
      !Array.isArray(rawMeasurementIds) ||
      rawMeasurementIds.length === 0 ||
      !rawMeasurementIds.every(
        (measurementId) =>
          typeof measurementId === "string" &&
          measurementId.trim().length > 0 &&
          allowedMeasurementIds.has(measurementId),
      )
    ) {
      return [];
    }

    seenOrders.add(order);
    sequence.push({ order, contentId });
  }

  return sequence.sort((a, b) => a.order - b.order);
}

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const repository = useKnowledge();
  const [highlightedEntityIds, setHighlightedEntityIds] = useState<readonly string[]>([]);
  const [highlightedMeasurementIds, setHighlightedMeasurementIds] = useState<readonly string[]>([]);
  const [identifiedStepOrder, setIdentifiedStepOrder] = useState<number | null>(null);
  const [guidedStepOrder, setGuidedStepOrder] = useState<number | null>(null);
  const lesson = lessonId ? repository.lessonsById.get(lessonId) : undefined;

  if (!lesson) {
    return (
      <section className="lesson-page">
        <h1>Lección no encontrada</h1>
        <Link to="/">Volver al inicio</Link>
      </section>
    );
  }

  const lessonPath = `/lecciones/${lesson.lesson_id}`;
  const seenFigureIds = new Set<string>();
  const supportFigures: FigureRecord[] = [];

  for (const step of lesson.steps) {
    for (const figureId of step.figure_ids ?? []) {
      if (seenFigureIds.has(figureId)) {
        continue;
      }
      seenFigureIds.add(figureId);

      const figure = repository.figuresById.get(figureId);
      if (!figure) {
        throw new Error(
          `Lesson ${lesson.lesson_id} references missing figure_id ${figureId}`,
        );
      }
      if (figure.reconstruction.render_contract === "normalized-2d-v1") {
        supportFigures.push(figure);
      }
    }
  }

  return (
    <article className="lesson-page">
      <Link to="/">Volver al inicio</Link>
      <h1>{lesson.title}</h1>

      {supportFigures.length > 0 ? (
        <section
          className="lesson-page__figures"
          aria-labelledby="lesson-support-figures-heading"
        >
          <h2 id="lesson-support-figures-heading">Figuras de apoyo</h2>
          <div className="lesson-page__figure-grid">
            {supportFigures.map((figure) => (
              <figure key={figure.figure_id} className="lesson-page__figure">
                <FigureDiagram
                  figure={figure}
                  highlightedEntityIds={highlightedEntityIds}
                  highlightedMeasurementIds={highlightedMeasurementIds}
                />
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <ol className="lesson-page__steps" aria-label="Pasos de la lección">
        {lesson.steps.map((step) => {
          const entityTargets = highlightTargets(step, repository.figuresById);
          const measurementTargets = measurementHighlightTargets(step, repository.figuresById);
          const parts = identifiedParts(step);
          const sequence = guidedSequence(
            step,
            repository.contentById,
            repository.bundle.measurements,
          );
          const entityHighlightActive =
            entityTargets.length > 0 &&
            entityTargets.every((target) => highlightedEntityIds.includes(target));
          const measurementHighlightActive =
            measurementTargets.length > 0 &&
            measurementTargets.every((target) => highlightedMeasurementIds.includes(target));
          const identifiedPartsVisible =
            parts.length > 0 && identifiedStepOrder === step.order;
          const guidedSequenceVisible =
            sequence.length > 0 && guidedStepOrder === step.order;

          return (
            <li key={step.order}>
              <section>
                <h2>{step.title}</h2>
                {step.content_ids.map((contentId) => {
                  const content = repository.contentById.get(contentId);
                  if (!content) {
                    throw new Error(
                      `Lesson ${lesson.lesson_id} references missing content_id ${contentId}`,
                    );
                  }
                  const primary = selectPrimaryText(content);

                  return (
                    <div key={contentId} className="lesson-page__content">
                      {primary.text ? <p>{primary.text}</p> : null}
                      <Link
                        to={`/contenido/${contentId}`}
                        state={{ returnTo: lessonPath }}
                      >
                        Ver contenido
                      </Link>
                    </div>
                  );
                })}
                {entityTargets.length > 0 ? (
                  <button
                    type="button"
                    aria-pressed={entityHighlightActive}
                    onClick={() => {
                      setHighlightedEntityIds(entityTargets);
                      setHighlightedMeasurementIds([]);
                    }}
                  >
                    Resaltar en figura
                  </button>
                ) : null}
                {measurementTargets.length > 0 ? (
                  <button
                    type="button"
                    aria-pressed={measurementHighlightActive}
                    onClick={() => {
                      setHighlightedMeasurementIds(measurementTargets);
                      setHighlightedEntityIds([]);
                    }}
                  >
                    Resaltar medidas
                  </button>
                ) : null}
                {parts.length > 0 ? (
                  <>
                    <button
                      type="button"
                      aria-expanded={identifiedPartsVisible}
                      onClick={() =>
                        setIdentifiedStepOrder(identifiedPartsVisible ? null : step.order)
                      }
                    >
                      Identificar partes
                    </button>
                    {identifiedPartsVisible ? (
                      <ul aria-label="Partes identificadas">
                        {parts.map((part) => (
                          <li key={`${part.label}:${part.installationLocation}`}>
                            <strong>{part.label}</strong>: {part.installationLocation}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                ) : null}
                {sequence.length > 0 ? (
                  <>
                    <button
                      type="button"
                      aria-expanded={guidedSequenceVisible}
                      onClick={() =>
                        setGuidedStepOrder(guidedSequenceVisible ? null : step.order)
                      }
                    >
                      Ver secuencia
                    </button>
                    {guidedSequenceVisible ? (
                      <ol aria-label="Secuencia guiada">
                        {sequence.map((item) => {
                          const content = repository.contentById.get(item.contentId);
                          if (!content) {
                            return null;
                          }
                          const primary = selectPrimaryText(content);
                          return <li key={item.order}>{primary.text}</li>;
                        })}
                      </ol>
                    ) : null}
                  </>
                ) : null}
              </section>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
