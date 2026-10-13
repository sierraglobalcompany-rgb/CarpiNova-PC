import { useSearchParams } from "react-router-dom";

import {
  getAvailableContentTypes,
  isKnownContentType,
} from "../../knowledge/contentTypes";
import { useKnowledge } from "../../knowledge/KnowledgeContext";
import {
  normalizeSearchText,
  searchKnowledge,
} from "../../knowledge/searchKnowledge";
import { CategoryFilter } from "./CategoryFilter";
import { SearchForm } from "./SearchForm";
import { SearchResultCard } from "./SearchResultCard";

export function SearchPage() {
  const repository = useKnowledge();
  const [params] = useSearchParams();
  const query = params.get("q") ?? "";
  const requestedType = params.get("type");
  const contentType =
    requestedType && isKnownContentType(requestedType) ? requestedType : null;
  const availableTypes = getAvailableContentTypes(repository);
  const hits = searchKnowledge(repository, { query, contentType });
  const hasSearchIntent = Boolean(normalizeSearchText(query) || contentType);

  return (
    <section className="search-page">
      <h1>Buscar conocimiento</h1>
      <SearchForm initialQuery={query} />
      <div className="search-page__layout">
        <aside className="search-page__filters" aria-label="Filtros de búsqueda">
          <CategoryFilter
            types={availableTypes}
            query={query}
            selectedType={contentType}
          />
        </aside>

        <section className="search-page__results" aria-live="polite">
          {!hasSearchIntent ? (
            <p>Busca un término o elige una categoría.</p>
          ) : hits.length === 0 ? (
            <p>No encontramos resultados.</p>
          ) : (
            <div className="search-results" aria-label="Resultados de búsqueda">
              {hits.map((hit) => (
                <SearchResultCard key={hit.content.content_id} hit={hit} />
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
