import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AppRoutes } from "../src/app/routes";
import { KnowledgeProvider } from "../src/knowledge/KnowledgeContext";
import { buildKnowledgeRepository } from "../src/knowledge/loadKnowledge";

const LESSON_ID = "LESSON-ACCESSIBLE";
const CONTENT_ID = "CONTENT-CPNC-2025-P0001-001";
const PAGE_ID = "PAGE-CPNC-2025-P0001";
const SOURCE_SHA = "318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c";

function repository() {
  return buildKnowledgeRepository(
    {
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
    },
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
        },
      ],
      content: [
        {
          content_id: CONTENT_ID,
          page_id: PAGE_ID,
          content_type: "procedure",
          source_transcription: "Fuente",
          normalized_text: "Texto",
          learning_text: "Explicación del paso.",
          derived_from_content_ids: [CONTENT_ID],
          source: {
            book_id: "cpnc-2025",
            pdf_page: 1,
            printed_page: null,
            region: { x: 0, y: 0, width: 1, height: 1 },
            extraction: {
              method: "text",
              confidence: 1,
              review_status: "VALIDATED",
            },
          },
        },
      ],
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
          title: "Lección accesible",
          source_content_ids: [CONTENT_ID],
          steps: [
            {
              order: 1,
              title: "Paso uno",
              content_ids: [CONTENT_ID],
            },
          ],
        },
      ],
    },
  );
}

describe("guided lesson accessibility", () => {
  it("names the ordered steps and reaches lesson actions by keyboard", async () => {
    const user = userEvent.setup();

    render(
      <KnowledgeProvider repository={repository()}>
        <MemoryRouter initialEntries={[`/lecciones/${LESSON_ID}`]}>
          <AppRoutes />
        </MemoryRouter>
      </KnowledgeProvider>,
    );

    expect(
      screen.getByRole("list", { name: "Pasos de la lección" }),
    ).toBeInTheDocument();

    await user.tab();
    expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Ver contenido" })).toHaveFocus();
  });
});
