import { getAvailableContentTypes } from "../../knowledge/contentTypes";
import { useKnowledge } from "../../knowledge/KnowledgeContext";
import { CategoryFilter } from "./CategoryFilter";
import { SearchForm } from "./SearchForm";

export function HomePage() {
  const repository = useKnowledge();
  const contentTypes = getAvailableContentTypes(repository);

  return (
    <section className="home-page">
      <h1>Explora carpintería paso a paso</h1>
      <p>Busca conceptos, materiales, herrajes y procedimientos de CarpiNova.</p>
      <SearchForm />
      {contentTypes.length > 0 ? <h2>Categorías</h2> : null}
      <CategoryFilter types={contentTypes} />
    </section>
  );
}
