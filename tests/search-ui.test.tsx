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

function content(
  suffix: string,
  overrides: Partial<ContentRecord> = {},
): ContentRecord {
  return {
    content_id: `CONTENT-CPNC-2025-P0001-${suffix}`,
    page_id: PAGE_ID,
    content_type: "hardware",
    source_transcription: "Texto original",
    normalized_text: "instalacion de bisagras",
    learning_text: "Explicación sencilla sobre bisagras.",
    derived_from_content_ids: [`CONTENT-CPNC-2025-P0001-${suffix}`],
    source,
    tags: ["bisagras"],
    ...overrides,
  };
}

function repository(records: ContentRecord[]): KnowledgeRepository {
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
    contentById: new Map(records.map((record) => [record.content_id, record])),
  };
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
}

function renderAt(initialEntry: string, records: ContentRecord[]) {
  return render(
    <KnowledgeProvider repository={repository(records)}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>
    </KnowledgeProvider>,
  );
}

describe("Knowledge search UI", () => {
  it("renders only available categories and navigates a submitted search", async () => {
    const user = userEvent.setup();
    renderAt("/", [
      content("001", { content_type: "hardware" }),
      content("002", {
        content_type: "material",
        learning_text: "Tablero MDF para muebles.",
        normalized_text: "tablero mdf",
        tags: ["mdf"],
      }),
    ]);

    expect(screen.getByRole("searchbox", { name: /buscar en carpinova/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Herrajes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Materiales" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Procedimientos" })).not.toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: /buscar en carpinova/i }), "bisagras");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(screen.getByTestId("location")).toHaveTextContent("/buscar?q=bisagras");
  });

  it("navigates a category and lists all records of that type without q", async () => {
    const user = userEvent.setup();
    renderAt("/", [
      content("002", { content_type: "hardware", learning_text: "Bisagra dos" }),
      content("001", { content_type: "hardware", learning_text: "Bisagra uno" }),
      content("003", { content_type: "material", learning_text: "MDF" }),
    ]);

    await user.click(screen.getByRole("link", { name: "Herrajes" }));

    expect(screen.getByTestId("location")).toHaveTextContent("/buscar?type=hardware");
    expect(screen.getByText("Bisagra uno")).toBeInTheDocument();
    expect(screen.getByText("Bisagra dos")).toBeInTheDocument();
    expect(screen.queryByText("MDF")).not.toBeInTheDocument();
  });

  it("renders pedagogical result context and links with the real content id", () => {
    const record = content("017", {
      learning_text: "Explicación sencilla sobre bisagras de cazoleta.",
    });
    renderAt("/buscar?q=bisagras", [record]);

    expect(screen.getByText("Herrajes")).toBeInTheDocument();
    expect(screen.getByText("Explicación sencilla sobre bisagras de cazoleta.")).toBeInTheDocument();
    expect(screen.getByText(/Herrajes.*Instalación.*Página PDF 1/)).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /ver contenido/i });
    expect(link).toHaveAttribute(
      "href",
      `/contenido/${record.content_id}`,
    );
    expect(screen.queryByText(/Resultado 1/i)).not.toBeInTheDocument();
  });

  it("handles empty and manipulated URL parameters without fake categories", () => {
    renderAt("/buscar?q=%20%20&type=not-real", [content("001")]);

    expect(screen.getByText(/busca un término o elige una categoría/i)).toBeInTheDocument();
    expect(screen.queryByText("not-real")).not.toBeInTheDocument();
  });

  it("ignores an unknown manual type filter when a real query exists", () => {
    renderAt("/buscar?q=bisagras&type=not-real", [content("001")]);

    expect(screen.getByText("Explicación sencilla sobre bisagras.")).toBeInTheDocument();
    expect(screen.queryByText("not-real")).not.toBeInTheDocument();
  });
});
