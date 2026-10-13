import { Link, useParams } from "react-router-dom";

import { useKnowledge } from "../../knowledge/KnowledgeContext";
import { selectPrimaryText } from "../content/contentPresentation";

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const repository = useKnowledge();
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

  return (
    <article className="lesson-page">
      <Link to="/">Volver al inicio</Link>
      <h1>{lesson.title}</h1>

      <ol className="lesson-page__steps" aria-label="Pasos de la lección">
        {lesson.steps.map((step) => (
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
            </section>
          </li>
        ))}
      </ol>
    </article>
  );
}
