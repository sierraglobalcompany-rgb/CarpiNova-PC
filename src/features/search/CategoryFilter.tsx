import { Link } from "react-router-dom";

import { getContentTypeLabel } from "../../knowledge/contentTypes";

function categoryHref(type: string, query: string) {
  const params = new URLSearchParams();
  const trimmedQuery = query.trim();
  if (trimmedQuery) {
    params.set("q", trimmedQuery);
  }
  params.set("type", type);
  return `/buscar?${params.toString()}`;
}

export function CategoryFilter({
  types,
  query = "",
  selectedType = null,
}: {
  types: string[];
  query?: string;
  selectedType?: string | null;
}) {
  if (types.length === 0) {
    return null;
  }

  return (
    <nav className="category-filter" aria-label="Categorías">
      <ul>
        {types.map((type) => (
          <li key={type}>
            <Link
              to={categoryHref(type, query)}
              aria-current={type === selectedType ? "page" : undefined}
            >
              {getContentTypeLabel(type)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
