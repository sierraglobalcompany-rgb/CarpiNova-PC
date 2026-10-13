import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AppRoutes } from "../src/app/routes";
import { KnowledgeProvider } from "../src/knowledge/KnowledgeContext";
import type {
  ContentRecord,
  KnowledgeRepository,
  PageRecord,
  SourceRecord,
} from "../src/knowledge/types";

const PAGE_ID = "PAGE-CPNC-2025-P0001";
const CONTENT_ID = "CONTENT-CPNC-2025-P0001-001";
const SOURCE_SHA = "318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c";

const source: SourceRecord = {
  book_id: "cpnc-2025",
  pdf_page: 1,
  printed_page: null,
  region: { x: 0, y: 0, width: 1, height: 1 },
  extraction: { method: "text", confidence: 1, review_status: "VALIDATED" },
};

const page: PageRecord = {
  page_id: PAGE_ID,
  book_id: "cpnc-2025",
  pdf_page: 1,
  printed_page: null,
  mapping_status: "verified",
  chapter: "Herrajes",
  section: "Instalación",
};

function record(
  suffix: string,
  overrides: Partial<ContentRecord> = {},
): ContentRecord {
  return {
    content_id: `CONTENT-CPNC-2025-P0001-${suffix}`,
    page_id: PAGE_ID,
    content_type: "hardware",
    source_transcription: "Texto fuente",
    normalized_text: "instalacion de bisagras",
    learning_text: "Explicación sencilla sobre bisagras.",
    derived_from_content_ids: [CONTENT_ID],
    source,
    tags: ["bisagras"],
    ...overrides,
  };
}

function repository(): KnowledgeRepository {
  const records = [
    record("001"),
    record("002", {
      content_type: "material",
      normalized_text: "tablero mdf",
      learning_text: "Tablero MDF.",
      tags: ["mdf"],
    }),
  ];

  return {
    manifest: {
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
    bundle: {
      schema_version: "0.1.0",
      knowledge_version: "1.0.0",
      book_id: "cpnc-2025",
      pages: [page],
      content: records,
      measurements: [],
      rules: [],
      taxonomy: {},
    },
    pagesById: new Map([[PAGE_ID, page]]),
    contentById: new Map(records.map((item) => [item.content_id, item])),
  };
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
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

describe("accessible workshop UI", () => {
  it("exposes landmarks, labelled search, focusable results and selected category state", () => {
    renderAt("/buscar?q=bisagras&type=hardware");

    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("searchbox", { name: /buscar en carpinova/i })).toBeInTheDocument();

    const selectedCategory = screen.getByRole("link", { name: "Herrajes" });
    expect(selectedCategory).toHaveAttribute("aria-current", "page");

    const resultLink = screen.getByRole("link", { name: /ver contenido/i });
    resultLink.focus();
    expect(resultLink).toHaveFocus();
  });

  it("submits search with Enter exactly like the button", async () => {
    const user = userEvent.setup();
    renderAt("/");

    const input = screen.getByRole("searchbox", { name: /buscar en carpinova/i });
    await user.click(input);
    await user.type(input, "MDF");
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("location")).toHaveTextContent("/buscar?q=MDF");
  });

  it("keeps source provenance in a native disclosure", () => {
    renderAt(`/contenido/${CONTENT_ID}`);

    const summary = screen.getByText("Ver fuente");
    expect(summary.tagName).toBe("SUMMARY");
    expect(summary.parentElement?.tagName).toBe("DETAILS");
  });
});
