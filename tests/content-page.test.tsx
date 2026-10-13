import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AppRoutes } from "../src/app/routes";
import { KnowledgeProvider } from "../src/knowledge/KnowledgeContext";
import { selectPrimaryText } from "../src/features/content/contentPresentation";
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
  printed_page: 12,
  region: { x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
  extraction: { method: "visual", confidence: 0.92, review_status: "VALIDATED" },
};

const page: PageRecord = {
  page_id: PAGE_ID,
  book_id: "cpnc-2025",
  pdf_page: 1,
  printed_page: 12,
  mapping_status: "verified",
  chapter: "Herrajes",
  section: "Instalación",
};

function content(overrides: Partial<ContentRecord> = {}): ContentRecord {
  return {
    content_id: CONTENT_ID,
    page_id: PAGE_ID,
    content_type: "hardware",
    source_transcription: "Transcripción exacta de la fuente.",
    normalized_text: "Texto normalizado de la fuente.",
    learning_text: "Explicación sencilla para principiantes.",
    derived_from_content_ids: [CONTENT_ID],
    source,
    tags: ["bisagras"],
    ...overrides,
  };
}

function repository(record = content(), pageRecord: PageRecord = page): KnowledgeRepository {
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
      pages: [pageRecord],
      content: [record],
      measurements: [
        {
          measurement_id: "MEAS-CPNC-2025-P0001-001",
          page_id: PAGE_ID,
          value: "UNIQUE-MEASUREMENT-37-MM",
          review_status: "CONFLICT",
        },
      ],
      rules: [
        {
          rule_id: "RULE-CPNC-2025-P0001-001",
          page_id: PAGE_ID,
          predicate: "UNIQUE-RULE-PREDICATE",
          status: "REVIEWED",
        },
      ],
      taxonomy: {},
    },
    pagesById: new Map([[pageRecord.page_id, pageRecord]]),
    contentById: new Map([[record.content_id, record]]),
  };
}

function renderAt(path: string, repo = repository()) {
  return render(
    <KnowledgeProvider repository={repo}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </KnowledgeProvider>,
  );
}

describe("content presentation", () => {
  it("uses the approved primary-text fallback order without synthesizing prose", () => {
    expect(selectPrimaryText(content())).toEqual({
      label: "Explicación sencilla",
      text: "Explicación sencilla para principiantes.",
    });

    expect(selectPrimaryText(content({ learning_text: "   " }))).toEqual({
      label: "Texto normalizado",
      text: "Texto normalizado de la fuente.",
    });

    expect(
      selectPrimaryText(
        content({ learning_text: "", normalized_text: "   " }),
      ),
    ).toEqual({
      label: "Transcripción de la fuente",
      text: "Transcripción exacta de la fuente.",
    });
  });

  it("shows pedagogical content and explicit provenance from the linked page/source", async () => {
    const user = userEvent.setup();
    renderAt(`/contenido/${CONTENT_ID}`);

    expect(screen.getByRole("heading", { name: "Explicación sencilla" })).toBeInTheDocument();
    expect(screen.getByText("Explicación sencilla para principiantes.")).toBeInTheDocument();

    await user.click(screen.getByText("Ver fuente"));

    expect(screen.getByText("Transcripción exacta de la fuente.")).toBeInTheDocument();
    expect(screen.getByText("Página PDF").parentElement).toHaveTextContent("Página PDF1");
    expect(screen.getByText("Página impresa").parentElement).toHaveTextContent("Página impresa12");
    expect(screen.getByText("Herrajes")).toBeInTheDocument();
    expect(screen.getByText("Instalación")).toBeInTheDocument();
    expect(screen.getByText("Método").parentElement).toHaveTextContent("Métodovisual");
    expect(screen.getByText("Estado").parentElement).toHaveTextContent("EstadoVALIDATED");
  });

  it("omits null printed-page output and handles an unknown content id clearly", () => {
    const pageWithoutPrinted = { ...page, printed_page: null };
    const record = content({
      source: { ...source, printed_page: null },
    });
    const repo = repository(record, pageWithoutPrinted);

    const { unmount } = renderAt(`/contenido/${CONTENT_ID}`, repo);
    expect(screen.queryByText(/Página impresa/)).not.toBeInTheDocument();
    expect(screen.queryByText("null")).not.toBeInTheDocument();
    unmount();

    renderAt("/contenido/CONTENT-CPNC-2025-P9999-999", repo);
    expect(screen.getByText("Contenido no encontrado")).toBeInTheDocument();
  });

  it("does not infer measurements or rules merely because they share the page", () => {
    renderAt(`/contenido/${CONTENT_ID}`);

    expect(screen.queryByText("UNIQUE-MEASUREMENT-37-MM")).not.toBeInTheDocument();
    expect(screen.queryByText("UNIQUE-RULE-PREDICATE")).not.toBeInTheDocument();
    expect(screen.queryByText("CONFLICT")).not.toBeInTheDocument();
    expect(screen.queryByText("REVIEWED")).not.toBeInTheDocument();
  });
});
