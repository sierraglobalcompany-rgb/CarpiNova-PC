import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AppRoutes } from "../src/app/routes";
import { KnowledgeProvider } from "../src/knowledge/KnowledgeContext";
import type {
  ContentRecord,
  KnowledgeRepository,
  LessonRecord,
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

function guidedLesson(): LessonRecord {
  return {
    lesson_id: "LESSON-SLIDES-X-2X-PILOT",
    title: "Calcular e instalar correderas con X y 2X",
    source_content_ids: [],
    steps: [],
  };
}

function repository(
  records: ContentRecord[],
  lessons: LessonRecord[] = [],
): KnowledgeRepository {
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
    figures: [],
    figuresById: new Map(),
    lessons,
    lessonsById: new Map(lessons.map((lesson) => [lesson.lesson_id, lesson])),
  };
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
}

function renderAt(
  initialEntry: string,
  records: ContentRecord[],
  lessons: LessonRecord[] = [],
) {
  return render(
    <KnowledgeProvider repository={repository(records, lessons)}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>
    </KnowledgeProvider>,
  );
}

describe("Knowledge search UI", () => {
  it("renders the beginner dashboard with priority order and all known categories", async () => {
    const user = userEvent.setup();
    renderAt("/", [
      content("001", { content_type: "warning" }),
      content("002", { content_type: "hardware" }),
      content("003", { content_type: "definition" }),
      content("004", { content_type: "material" }),
      content("005", { content_type: "procedure" }),
      content("006", { content_type: "construction_pattern" }),
    ]);

    expect(
      screen.getByRole("heading", { name: "Aprende carpintería desde cero" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: /buscar en carpinova/i }),
    ).toBeInTheDocument();

    const startHere = screen.getByRole("region", { name: "Empieza aquí" });
    expect(
      within(startHere).getAllByRole("link").map((link) => link.textContent),
    ).toEqual([
      "Materiales",
      "Herrajes",
      "Procedimientos",
      "Sistemas constructivos",
      "Advertencias",
    ]);

    const exploreAll = screen.getByRole("region", { name: "Explora todo" });
    expect(
      within(exploreAll).getByRole("link", { name: "Materiales" }),
    ).toHaveAttribute("href", "/buscar?type=material");
    expect(
      within(exploreAll).getByRole("link", { name: "Definiciones" }),
    ).toBeInTheDocument();

    await user.type(
      screen.getByRole("searchbox", { name: /buscar en carpinova/i }),
      "bisagras",
    );
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(screen.getByTestId("location")).toHaveTextContent("/buscar?q=bisagras");
  });

  it("surfaces canonical guided lessons only from the repository", () => {
    const lesson = guidedLesson();
    renderAt("/", [content("020")], [lesson]);

    const guided = screen.getByRole("region", { name: "Aprende paso a paso" });
    const link = within(guided).getByRole("link", { name: lesson.title });
    expect(link).toHaveAttribute("href", `/lecciones/${lesson.lesson_id}`);
  });

  it("omits guided lessons when the repository has none", () => {
    renderAt("/", [content("021")]);

    expect(
      screen.queryByRole("region", { name: "Aprende paso a paso" }),
    ).not.toBeInTheDocument();
  });

  it("omits Empieza aquí when no priority type is available", () => {
    renderAt("/", [content("010", { content_type: "definition" })]);

    expect(
      screen.queryByRole("region", { name: "Empieza aquí" }),
    ).not.toBeInTheDocument();

    const exploreAll = screen.getByRole("region", { name: "Explora todo" });
    expect(
      within(exploreAll).getByRole("link", { name: "Definiciones" }),
    ).toBeInTheDocument();
  });

  it("ignores unknown content types in both dashboard sections", () => {
    renderAt("/", [
      content("011", { content_type: "definition" }),
      content("012", { content_type: "not-real" }),
    ]);

    expect(
      screen.queryByRole("region", { name: "Empieza aquí" }),
    ).not.toBeInTheDocument();
    const exploreAll = screen.getByRole("region", { name: "Explora todo" });
    expect(within(exploreAll).queryByText("not-real")).not.toBeInTheDocument();
  });

  it("navigates a start-here category through the existing search route", async () => {
    const user = userEvent.setup();
    renderAt("/", [content("013", { content_type: "hardware" })]);

    const startHere = screen.getByRole("region", { name: "Empieza aquí" });
    await user.click(within(startHere).getByRole("link", { name: "Herrajes" }));

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/buscar?type=hardware",
    );
  });

  it("navigates a category and lists all records of that type without q", async () => {
    const user = userEvent.setup();
    renderAt("/", [
      content("002", { content_type: "hardware", learning_text: "Bisagra dos" }),
      content("001", { content_type: "hardware", learning_text: "Bisagra uno" }),
      content("003", { content_type: "material", learning_text: "MDF" }),
    ]);

    const exploreAll = screen.getByRole("region", { name: "Explora todo" });
    await user.click(within(exploreAll).getByRole("link", { name: "Herrajes" }));

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

    expect(screen.getAllByText("Herrajes").length).toBeGreaterThan(0);
    expect(
      screen.getByText("Explicación sencilla sobre bisagras de cazoleta."),
    ).toBeInTheDocument();
    expect(screen.getByText(/Herrajes.*Instalación.*Página PDF 1/)).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /ver contenido/i });
    expect(link).toHaveAttribute("href", `/contenido/${record.content_id}`);
    expect(screen.queryByText(/Resultado 1/i)).not.toBeInTheDocument();
  });

  it("returns from a result to the exact filtered search that opened it", async () => {
    const user = userEvent.setup();
    const record = content("018");
    renderAt("/buscar?q=bisagras&type=hardware", [record]);

    await user.click(screen.getByRole("link", { name: /ver contenido/i }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      `/contenido/${record.content_id}`,
    );

    await user.click(screen.getByRole("link", { name: /volver a resultados/i }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/buscar?q=bisagras&type=hardware",
    );
  });

  it("handles empty and manipulated URL parameters without fake categories", () => {
    renderAt("/buscar?q=%20%20&type=not-real", [content("001")]);

    expect(
      screen.getByText(/busca un término o elige una categoría/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("not-real")).not.toBeInTheDocument();
  });

  it("ignores an unknown manual type filter when a real query exists", () => {
    renderAt("/buscar?q=bisagras&type=not-real", [content("001")]);

    expect(
      screen.getByText("Explicación sencilla sobre bisagras."),
    ).toBeInTheDocument();
    expect(screen.queryByText("not-real")).not.toBeInTheDocument();
  });
});
