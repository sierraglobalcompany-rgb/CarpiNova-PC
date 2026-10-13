import { Link } from "react-router-dom";

import { getContentTypeLabel } from "../../knowledge/contentTypes";
import type { KnowledgeHit } from "../../knowledge/searchKnowledge";

export function SearchResultCard({ hit }: { hit: KnowledgeHit }) {
  const preview = hit.content.learning_text.trim() || hit.content.normalized_text.trim();
  const context = [
    hit.page.chapter,
    hit.page.section,
    `Página PDF ${hit.page.pdf_page}`,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" · ");

  return (
    <article className="search-result-card">
      <p className="search-result-card__type">
        {getContentTypeLabel(hit.content.content_type)}
      </p>
      {preview ? <p>{preview}</p> : null}
      <p className="search-result-card__context">{context}</p>
      <Link to={`/contenido/${hit.content.content_id}`}>Ver contenido</Link>
    </article>
  );
}
