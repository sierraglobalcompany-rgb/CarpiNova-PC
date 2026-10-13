import { Link, useLocation, useParams } from "react-router-dom";

import { useKnowledge } from "../../knowledge/KnowledgeContext";
import { selectPrimaryText } from "./contentPresentation";

export function ContentPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const location = useLocation();
  const repository = useKnowledge();
  const content = contentId ? repository.contentById.get(contentId) : undefined;
  const returnTo = (location.state as { returnTo?: unknown } | null)?.returnTo;
  const isLessonReturn =
    typeof returnTo === "string" && /^\/lecciones\/[^/?#]+$/.test(returnTo);
  const isSearchReturn =
    typeof returnTo === "string" &&
    (returnTo === "/buscar" || returnTo.startsWith("/buscar?"));
  const returnPath = isLessonReturn || isSearchReturn ? returnTo : "/buscar";
  const returnLabel = isLessonReturn ? "Volver a la lección" : "Volver a resultados";

  if (!content) {
    return (
      <section className="content-page">
        <h1>Contenido no encontrado</h1>
        <Link to="/">Volver al inicio</Link>
      </section>
    );
  }

  const page = repository.pagesById.get(content.page_id);
  const primary = selectPrimaryText(content);
  const source = content.source;

  return (
    <article className="content-page">
      <Link to={returnPath}>{returnLabel}</Link>

      <section className="content-page__primary">
        <h1>{primary.label}</h1>
        {primary.text ? <p>{primary.text}</p> : null}
      </section>

      <details className="content-page__source">
        <summary>Ver fuente</summary>
        <p>{content.source_transcription}</p>
        <dl>
          <div>
            <dt>Página PDF</dt>
            <dd>{source.pdf_page}</dd>
          </div>
          {source.printed_page !== null ? (
            <div>
              <dt>Página impresa</dt>
              <dd>{source.printed_page}</dd>
            </div>
          ) : null}
          {page?.chapter ? (
            <div>
              <dt>Capítulo</dt>
              <dd>{page.chapter}</dd>
            </div>
          ) : null}
          {page?.section ? (
            <div>
              <dt>Sección</dt>
              <dd>{page.section}</dd>
            </div>
          ) : null}
          <div>
            <dt>Método</dt>
            <dd>{source.extraction.method}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>{source.extraction.review_status}</dd>
          </div>
        </dl>
      </details>
    </article>
  );
}
