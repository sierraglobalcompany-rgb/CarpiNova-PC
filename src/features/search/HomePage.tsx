import { getAvailableContentTypes } from "../../knowledge/contentTypes";
import { useKnowledge } from "../../knowledge/KnowledgeContext";
import { CategoryFilter } from "./CategoryFilter";
import { SearchForm } from "./SearchForm";

const START_HERE_TYPES = [
  "material",
  "hardware",
  "procedure",
  "construction_pattern",
  "warning",
] as const;

export function HomePage() {
  const repository = useKnowledge();
  const availableTypes = getAvailableContentTypes(repository);
  const startHereTypes = START_HERE_TYPES.filter((type) =>
    availableTypes.includes(type),
  );

  return (
    <section className="home-page">
      <h1>Aprende carpintería desde cero</h1>
      <p>
        Explora materiales, herrajes, procedimientos y otros conceptos con
        información trazable de CarpiNova.
      </p>
      <SearchForm />

      {startHereTypes.length > 0 ? (
        <section aria-labelledby="start-here-heading">
          <h2 id="start-here-heading">Empieza aquí</h2>
          <CategoryFilter types={startHereTypes} />
        </section>
      ) : null}

      {availableTypes.length > 0 ? (
        <section aria-labelledby="explore-all-heading">
          <h2 id="explore-all-heading">Explora todo</h2>
          <CategoryFilter types={availableTypes} />
        </section>
      ) : null}
    </section>
  );
}
