import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams();
    if (trimmed) {
      params.set("q", trimmed);
    }
    const search = params.toString();
    navigate(search ? `/buscar?${search}` : "/buscar");
  }

  return (
    <form className="search-form" role="search" onSubmit={handleSubmit}>
      <label htmlFor="knowledge-search">Buscar en CarpiNova</label>
      <div className="search-form__controls">
        <input
          id="knowledge-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit">Buscar</button>
      </div>
    </form>
  );
}
