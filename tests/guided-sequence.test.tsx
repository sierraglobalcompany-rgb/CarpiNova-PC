import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AppRoutes } from "../src/app/routes";
import { KnowledgeProvider } from "../src/knowledge/KnowledgeContext";
import { buildKnowledgeRepository } from "../src/knowledge/loadKnowledge";

const SOURCE_SHA = "318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c";
const PAGE_ID = "PAGE-CPNC-2025-P0001";
const LESSON_ID = "LESSON-SLIDES-X-2X-PILOT";
const CONTENT_X = "CONTENT-CPNC-2025-P0001-001";
const CONTENT_37 = "CONTENT-CPNC-2025-P0001-002";
const CONTENT_REPEAT = "CONTENT-CPNC-2025-P0001-003";
const MEASUREMENT_X = "MEAS-X";
const MEASUREMENT_2X = "MEAS-2X";
const MEASUREMENT_37 = "MEAS-37";
const MEASUREMENT_REPEAT_2X = "MEAS-REPEAT-2X";

function content(contentId: string, learningText: string) {
  return {
    content_id: contentId,
    page_id: PAGE_ID,
    content_type: "procedure",
    source_transcription: learningText,
    normalized_text: learningText,
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
  const x = content(CONTENT_X, "Usa X para la gaveta y 2X para el lateral.");
  const offset = content(CONTENT_37, "Comienza con 37 mm desde el frente del mueble.");
  const repeat = content(CONTENT_REPEAT, "Repite 2X para la siguiente gaveta.");

  return buildKnowledgeRepository(
    {
      schema_version: "0.1.0",
      knowledge_version: "1.2.0",
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
      knowledge_version: "1.2.0",
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
      content: [x, offset, repeat],
      measurements: [
        { measurement_id: MEASUREMENT_X },
        { measurement_id: MEASUREMENT_2X },
        { measurement_id: MEASUREMENT_37 },
        { measurement_id: MEASUREMENT_REPEAT_2X },
      ],
      rules: [],
      taxonomy: {},
    },
    {
      schema_version: "0.1.0",
      knowledge_version: "1.2.0",
      book_id: "cpnc-2025",
      scope: "BOOK",
      figures: [],
    },
    {
      schema_version: "0.1.0",
      knowledge_version: "1.2.0",
      book_id: "cpnc-2025",
      scope: "BOOK",
      lessons: [
        {
          lesson_id: LESSON_ID,
          title: "Calcular e instalar correderas con X y 2X",
          source_content_ids: [CONTENT_X, CONTENT_37, CONTENT_REPEAT],
          steps: [
            {
              order: 5,
              title: "Ubicar X y 2X",
              content_ids: [CONTENT_X, CONTENT_37, CONTENT_REPEAT],
              interaction: {
                type: "guided_sequence",
                sequence: [
                  {
                    order: 1,
                    content_id: CONTENT_X,
                    measurement_ids: [MEASUREMENT_X, MEASUREMENT_2X],
                  },
                  {
                    order: 2,
                    content_id: CONTENT_37,
                    measurement_ids: [MEASUREMENT_37],
                  },
                  {
                    order: 3,
                    content_id: CONTENT_REPEAT,
                    measurement_ids: [MEASUREMENT_REPEAT_2X],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  );
}

describe("guided sequence interaction", () => {
  it("reveals the three canonical sequence items in order without exposing technical ids", async () => {
    const user = userEvent.setup();
    render(
      <KnowledgeProvider repository={repository()}>
        <MemoryRouter initialEntries={[`/lecciones/${LESSON_ID}`]}>
          <AppRoutes />
        </MemoryRouter>
      </KnowledgeProvider>,
    );

    const step = screen.getByRole("heading", { level: 2, name: "Ubicar X y 2X" }).closest("section");
    expect(step).not.toBeNull();
    expect(
      within(step as HTMLElement).queryByRole("list", { name: "Secuencia guiada" }),
    ).not.toBeInTheDocument();

    await user.click(
      within(step as HTMLElement).getByRole("button", { name: "Ver secuencia" }),
    );

    const sequence = within(step as HTMLElement).getByRole("list", {
      name: "Secuencia guiada",
    });
    expect(
      within(sequence).getAllByRole("listitem").map((item) => item.textContent),
    ).toEqual([
      "Usa X para la gaveta y 2X para el lateral.",
      "Comienza con 37 mm desde el frente del mueble.",
      "Repite 2X para la siguiente gaveta.",
    ]);
    expect(sequence).not.toHaveTextContent(MEASUREMENT_X);
    expect(sequence).not.toHaveTextContent(MEASUREMENT_37);
  });
});
