import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import type { FigureRecord, LessonStep } from "../../knowledge/types";
import { useKnowledge } from "../../knowledge/KnowledgeContext";
import { selectPrimaryText } from "../content/contentPresentation";
import { FigureDiagram } from "../figures/FigureDiagram";

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

  const rawTargets = interaction.target_measurement_ids;
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

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const repository = useKnowledge();
  const [highlightedEntityIds, setHighlightedEntityIds] = useState<readonly string[]>([]);
  const [highlightedMeasurementIds, setHighlightedMeasurementIds] = useState<readonly string[]>([]);
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
          const entityHighlightActive =
            entityTargets.length > 0 &&
            entityTargets.every((target) => highlightedEntityIds.includes(target));
          const measurementHighlightActive =
            measurementTargets.length > 0 &&
            measurementTargets.every((target) => highlightedMeasurementIds.includes(target));

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
              </section>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
