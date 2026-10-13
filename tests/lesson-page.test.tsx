import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AppRoutes } from "../src/app/routes";
import { KnowledgeProvider } from "../src/knowledge/KnowledgeContext";
import { buildKnowledgeRepository } from "../src/knowledge/loadKnowledge";

const SOURCE_SHA = "318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c";
const PAGE_ID = "PAGE-CPNC-2025-P0001";
const LESSON_ID = "LESSON-SLIDES-X-2X-PILOT";
const LESSON_TITLE = "Calcular e instalar correderas con X y 2X";

function manifest() {
  return {
    schema_version: "0.1.0",
    knowledge_version: "1.0.0",
    book_id: "cpnc-2025",
    scope: "BOOK",
    source_manifest_sha256: SOURCE_SHA,
    files: {
      "knowledge.bundle.json": "a".repeat(64),
      "figures.bundle.json": "b".repeat(64),
      "lessons.bundle.json": "c".repeat(64),
    },
  };
}

function content(suffix: string, learningText: string) {
  const contentId = `CONTENT-CPNC-2025-P0001-${suffix}`;
  return {
    content_id: contentId,
    page_id: PAGE_ID,
    content_type: "procedure",
    source_transcription: `Fuente ${suffix}`,
    normalized_text: `Texto ${suffix}`,
    learning_text: learningText,
    derived_from_content_ids: [contentId],
    source: {
      book_id: "cpnc-2025",
      pdf_page: 1,
      printed_page: null,
      region: { x: 0, y: 0, width: 1, height: 1 },
      extraction: { method: "text", confidence: 1, review_status: "VALIDATED" },
    },
  };
}

function repository() {
  const one = content("001", "Explicación del paso uno.");
  const three = content("003", "Explicación del paso tres.");
  const five = content("005", "Explicación del paso cinco.");

  return buildKnowledgeRepository(
    manifest(),
    {
      schema_version: "0.1.0",
      knowledge_version: "1.0.0",
      book_id: "cpnc-2025",
      scope: "BOOK",
      pages: [
        {
          page_id: PAGE_ID,
          book_id: "cpnc-2025",
          pdf_page: 1,
          printed_page: null,
          mapping_status: "verified",
          chapter: "Herrajes",
          section: "Correderas",
        },
      ],
      content: [one, three, five],
      measurements: [],
      rules: [],
      taxonomy: {},
    },
    {
      schema_version: "0.1.0",
      knowledge_version: "1.0.0",
      book_id: "cpnc-2025",
      scope: "BOOK",
      lessons: [
        {
          lesson_id: LESSON_ID,
          title: LESSON_TITLE,
          source_content_ids: [one.content_id, three.content_id, five.content_id],
          steps: [
            { order: 5, title: "Paso 5", content_ids: [five.content_id] },
            { order: 1, title: "Paso 1", content_ids: [one.content_id] },
            { order: 3, title: "Paso 3", content_ids: [three.content_id] },
          ],
        },
      ],
    },
  );
}

function LocationProbe() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {JSON.stringify({ pathname: location.pathname, state: location.state })}
    </output>
  );
}

function renderAt(path: string) {
  return render(
    <KnowledgeProvider repository={repository()}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>
    </KnowledgeProvider>,
  );
}

describe("guided lesson page", () => {
  it("renders canonical lesson steps in validated order and links to canonical content", async () => {
    const user = userEvent.setup();
    renderAt(`/lecciones/${LESSON_ID}`);

    expect(
      screen.getByRole("heading", { level: 1, name: LESSON_TITLE }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(["Paso 1", "Paso 3", "Paso 5"]);
    expect(screen.getByText("Explicación del paso uno.")).toBeInTheDocument();

    const links = screen.getAllByRole("link", { name: "Ver contenido" });
    expect(links[0]).toHaveAttribute(
      "href",
      "/contenido/CONTENT-CPNC-2025-P0001-001",
    );

    await user.click(links[0]);
    expect(screen.getByTestId("location")).toHaveTextContent(
      '"pathname":"/contenido/CONTENT-CPNC-2025-P0001-001"',
    );
    expect(screen.getByTestId("location")).toHaveTextContent(
      `"returnTo":"/lecciones/${LESSON_ID}"`,
    );
  });

  it("shows a clear not-found state for an unknown lesson id", () => {
    renderAt("/lecciones/LESSON-NOT-REAL");

    expect(
      screen.getByRole("heading", { name: "Lección no encontrada" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.queryByText(LESSON_TITLE)).not.toBeInTheDocument();
  });
});
