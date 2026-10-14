import type {
  ContentRecord,
  FigureBundle,
  FigurePrimitive,
  FigureRecord,
  KnowledgeBundle,
  KnowledgeManifest,
  KnowledgeRepository,
  LessonRecord,
  LessonsBundle,
  LessonStep,
  MappingStatus,
  PageRecord,
  SourceRecord,
  SupportedKnowledgeVersion,
} from "./types";

const EXPECTED_SOURCE_SHA = "318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c";
const SUPPORTED_KNOWLEDGE_VERSIONS = new Set<SupportedKnowledgeVersion>([
  "1.0.0",
  "1.1.0",
  "1.2.0",
]);
const SUPPORTED_FIGURE_PRIMITIVES = new Set<FigurePrimitive>([
  "rect",
  "line",
  "polyline",
]);
const MAPPING_STATUSES = new Set<MappingStatus>([
  "candidate",
  "verified",
  "unresolved",
  "not_printed",
]);

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function stringField(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string`);
  }
  return value;
}

function nonEmptyStringField(value: unknown, label: string): string {
  const result = stringField(value, label);
  if (result.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return result;
}

function numberField(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a number`);
  }
  return value;
}

function stringArrayField(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`${label} must be an array of strings`);
  }
  return [...value] as string[];
}

function validateManifest(value: unknown): KnowledgeManifest {
  const manifest = record(value, "manifest");
  const knowledgeVersion = stringField(manifest.knowledge_version, "knowledge_version");
  if (!SUPPORTED_KNOWLEDGE_VERSIONS.has(knowledgeVersion as SupportedKnowledgeVersion)) {
    throw new Error(
      `knowledge_version must be one of ${[...SUPPORTED_KNOWLEDGE_VERSIONS].join(", ")}`,
    );
  }

  const expected: Record<string, string> = {
    book_id: "cpnc-2025",
    scope: "BOOK",
    source_manifest_sha256: EXPECTED_SOURCE_SHA,
  };

  for (const [field, wanted] of Object.entries(expected)) {
    if (manifest[field] !== wanted) {
      throw new Error(`${field} must be ${wanted}`);
    }
  }

  stringField(manifest.schema_version, "schema_version");
  const files = record(manifest.files, "files");
  for (const name of [
    "knowledge.bundle.json",
    "figures.bundle.json",
    "lessons.bundle.json",
  ]) {
    const hash = files[name];
    if (typeof hash !== "string" || !/^[a-f0-9]{64}$/i.test(hash)) {
      throw new Error(`files.${name} must contain a SHA-256 hash`);
    }
  }

  return manifest as unknown as KnowledgeManifest;
}

function validateSource(value: unknown, label: string): SourceRecord {
  const source = record(value, label);
  const region = record(source.region, `${label}.region`);
  const extraction = record(source.extraction, `${label}.extraction`);

  return {
    book_id: stringField(source.book_id, `${label}.book_id`),
    pdf_page: numberField(source.pdf_page, `${label}.pdf_page`),
    printed_page:
      source.printed_page === null
        ? null
        : numberField(source.printed_page, `${label}.printed_page`),
    region: {
      x: numberField(region.x, `${label}.region.x`),
      y: numberField(region.y, `${label}.region.y`),
      width: numberField(region.width, `${label}.region.width`),
      height: numberField(region.height, `${label}.region.height`),
    },
    extraction: {
      method: stringField(extraction.method, `${label}.extraction.method`),
      confidence: numberField(extraction.confidence, `${label}.extraction.confidence`),
      review_status: stringField(
        extraction.review_status,
        `${label}.extraction.review_status`,
      ),
    },
  };
}

function validatePage(value: unknown, index: number): PageRecord {
  const item = record(value, `pages[${index}]`);
  const mappingStatus = stringField(item.mapping_status, `pages[${index}].mapping_status`);
  if (!MAPPING_STATUSES.has(mappingStatus as MappingStatus)) {
    throw new Error(`pages[${index}].mapping_status is invalid`);
  }

  return {
    page_id: stringField(item.page_id, `pages[${index}].page_id`),
    book_id: stringField(item.book_id, `pages[${index}].book_id`),
    pdf_page: numberField(item.pdf_page, `pages[${index}].pdf_page`),
    printed_page:
      item.printed_page === null
        ? null
        : numberField(item.printed_page, `pages[${index}].printed_page`),
    mapping_status: mappingStatus as MappingStatus,
    chapter:
      item.chapter === undefined || item.chapter === null
        ? (item.chapter as undefined | null)
        : stringField(item.chapter, `pages[${index}].chapter`),
    section:
      item.section === undefined || item.section === null
        ? (item.section as undefined | null)
        : stringField(item.section, `pages[${index}].section`),
  };
}

function validateContent(value: unknown, index: number): ContentRecord {
  const item = record(value, `content[${index}]`);
  const derivedFrom = stringArrayField(
    item.derived_from_content_ids,
    `content[${index}].derived_from_content_ids`,
  );
  const tags =
    item.tags === undefined
      ? undefined
      : stringArrayField(item.tags, `content[${index}].tags`);

  return {
    content_id: stringField(item.content_id, `content[${index}].content_id`),
    page_id: stringField(item.page_id, `content[${index}].page_id`),
    content_type: stringField(item.content_type, `content[${index}].content_type`),
    source_transcription: stringField(
      item.source_transcription,
      `content[${index}].source_transcription`,
    ),
    normalized_text: stringField(item.normalized_text, `content[${index}].normalized_text`),
    learning_text: stringField(item.learning_text, `content[${index}].learning_text`),
    derived_from_content_ids: derivedFrom,
    source: validateSource(item.source, `content[${index}].source`),
    external_source:
      item.external_source === undefined
        ? undefined
        : record(item.external_source, `content[${index}].external_source`),
    tags,
  };
}

function validateBundle(value: unknown): KnowledgeBundle {
  const bundle = record(value, "knowledge.bundle.json");
  if (!Array.isArray(bundle.pages)) {
    throw new Error("pages must be an array");
  }
  if (!Array.isArray(bundle.content)) {
    throw new Error("content must be an array");
  }
  if (!Array.isArray(bundle.measurements)) {
    throw new Error("measurements must be an array");
  }
  if (!Array.isArray(bundle.rules)) {
    throw new Error("rules must be an array");
  }

  return {
    schema_version:
      bundle.schema_version === undefined
        ? undefined
        : stringField(bundle.schema_version, "bundle.schema_version"),
    knowledge_version:
      bundle.knowledge_version === undefined
        ? undefined
        : stringField(bundle.knowledge_version, "bundle.knowledge_version"),
    book_id:
      bundle.book_id === undefined
        ? undefined
        : stringField(bundle.book_id, "bundle.book_id"),
    scope:
      bundle.scope === undefined
        ? undefined
        : stringField(bundle.scope, "bundle.scope"),
    pages: bundle.pages.map(validatePage),
    content: bundle.content.map(validateContent),
    measurements: [...bundle.measurements],
    rules: [...bundle.rules],
    taxonomy: record(bundle.taxonomy, "taxonomy"),
  };
}

function validateFigurePoint(value: unknown, label: string): void {
  const point = record(value, label);
  numberField(point.x, `${label}.x`);
  numberField(point.y, `${label}.y`);
}

function validateFigureBounds(value: unknown, label: string) {
  const bounds = record(value, label);
  return {
    x: numberField(bounds.x, `${label}.x`),
    y: numberField(bounds.y, `${label}.y`),
    width: numberField(bounds.width, `${label}.width`),
    height: numberField(bounds.height, `${label}.height`),
  };
}

function validateNormalized2dFigure(item: Record<string, unknown>, label: string): void {
  const camera = record(item.camera, `${label}.camera`);
  const coordinateSpace = stringField(
    camera.coordinate_space,
    `${label}.camera.coordinate_space`,
  );
  if (coordinateSpace !== "normalized_figure") {
    throw new Error(`${label}.camera.coordinate_space must be normalized_figure`);
  }

  const viewport = validateFigureBounds(camera.viewport, `${label}.camera.viewport`);
  if (
    viewport.x !== 0 ||
    viewport.y !== 0 ||
    viewport.width !== 1 ||
    viewport.height !== 1
  ) {
    throw new Error(`${label}.camera.viewport must be exactly 0,0,1,1`);
  }

  if (!Array.isArray(item.layers) || item.layers.length === 0) {
    throw new Error(`${label}.layers must be a non-empty array`);
  }

  const entities = item.entities as unknown[];
  const entityIds = new Set<string>();
  for (const [index, value] of entities.entries()) {
    const entityLabel = `${label}.entities[${index}]`;
    const entity = record(value, entityLabel);
    const id = nonEmptyStringField(entity.id, `${entityLabel}.id`);
    if (entityIds.has(id)) {
      throw new Error(`Duplicate entity id: ${id}`);
    }
    entityIds.add(id);

    const geometryLabel = `${entityLabel}.geometry`;
    const geometry = record(entity.geometry, geometryLabel);
    const primitive = stringField(geometry.primitive, `${geometryLabel}.primitive`);
    if (!SUPPORTED_FIGURE_PRIMITIVES.has(primitive as FigurePrimitive)) {
      throw new Error(`${geometryLabel}.primitive is unsupported: ${primitive}`);
    }

    if (primitive === "rect") {
      validateFigureBounds(geometry.bounds, `${geometryLabel}.bounds`);
      continue;
    }

    if (!Array.isArray(geometry.points)) {
      throw new Error(`${geometryLabel}.points must be an array`);
    }
    const expectedLength = primitive === "line" ? 2 : 2;
    if (
      (primitive === "line" && geometry.points.length !== expectedLength) ||
      (primitive === "polyline" && geometry.points.length < expectedLength)
    ) {
      throw new Error(
        primitive === "line"
          ? `${geometryLabel}.points must contain exactly 2 points`
          : `${geometryLabel}.points must contain at least 2 points`,
      );
    }
    geometry.points.forEach((point, pointIndex) =>
      validateFigurePoint(point, `${geometryLabel}.points[${pointIndex}]`),
    );
  }

  const annotations = item.annotations as unknown[];
  const annotationIds = new Set<string>();
  const annotationsById = new Map<string, Record<string, unknown>>();
  for (const [index, value] of annotations.entries()) {
    const annotationLabel = `${label}.annotations[${index}]`;
    const annotation = record(value, annotationLabel);
    const id = nonEmptyStringField(annotation.id, `${annotationLabel}.id`);
    if (annotationIds.has(id)) {
      throw new Error(`Duplicate annotation id: ${id}`);
    }
    annotationIds.add(id);
    stringField(annotation.text, `${annotationLabel}.text`);
    annotationsById.set(id, annotation);
  }

  for (const [index, value] of item.layers.entries()) {
    const layerLabel = `${label}.layers[${index}]`;
    const layer = record(value, layerLabel);
    nonEmptyStringField(layer.id, `${layerLabel}.id`);
    numberField(layer.order, `${layerLabel}.order`);

    const entityRefs =
      layer.entity_ids === undefined
        ? []
        : stringArrayField(layer.entity_ids, `${layerLabel}.entity_ids`);
    for (const entityId of entityRefs) {
      if (!entityIds.has(entityId)) {
        throw new Error(`${layerLabel} references missing entity id ${entityId}`);
      }
    }

    const annotationRefs =
      layer.annotation_ids === undefined
        ? []
        : stringArrayField(layer.annotation_ids, `${layerLabel}.annotation_ids`);
    for (const annotationId of annotationRefs) {
      const annotation = annotationsById.get(annotationId);
      if (!annotation) {
        throw new Error(`${layerLabel} references missing annotation id ${annotationId}`);
      }
      const placement = record(
        annotation.placement,
        `${label}.annotations.${annotationId}.placement`,
      );
      numberField(placement.x, `${label}.annotations.${annotationId}.placement.x`);
      numberField(placement.y, `${label}.annotations.${annotationId}.placement.y`);
    }
  }
}

function validateFigure(value: unknown, index: number): FigureRecord {
  const label = `figures[${index}]`;
  const item = record(value, label);
  if (!Array.isArray(item.entities)) {
    throw new Error(`${label}.entities must be an array`);
  }
  if (!Array.isArray(item.annotations)) {
    throw new Error(`${label}.annotations must be an array`);
  }
  const reconstruction = record(item.reconstruction, `${label}.reconstruction`);
  const renderContract =
    reconstruction.render_contract === undefined
      ? undefined
      : stringField(reconstruction.render_contract, `${label}.reconstruction.render_contract`);

  let layers: FigureRecord["layers"];
  if (item.layers !== undefined) {
    if (!Array.isArray(item.layers)) {
      throw new Error(`${label}.layers must be an array`);
    }
    layers = [...item.layers] as FigureRecord["layers"];
  }

  let camera: FigureRecord["camera"];
  if (item.camera !== undefined) {
    camera = record(item.camera, `${label}.camera`) as unknown as FigureRecord["camera"];
  }

  let accessibility: FigureRecord["accessibility"];
  if (item.accessibility !== undefined) {
    const rawAccessibility = record(item.accessibility, `${label}.accessibility`);
    accessibility = {
      summary:
        rawAccessibility.summary === undefined
          ? undefined
          : stringField(rawAccessibility.summary, `${label}.accessibility.summary`),
    };
  }

  if (renderContract === "normalized-2d-v1") {
    validateNormalized2dFigure(item, label);
  }

  return {
    figure_id: nonEmptyStringField(item.figure_id, `${label}.figure_id`),
    page_id: stringField(item.page_id, `${label}.page_id`),
    type: stringField(item.type, `${label}.type`),
    purpose: stringField(item.purpose, `${label}.purpose`),
    entities: [...item.entities] as FigureRecord["entities"],
    annotations: [...item.annotations] as FigureRecord["annotations"],
    layers,
    camera,
    reconstruction: {
      render_contract: renderContract,
    },
    accessibility,
  };
}

function validateFiguresBundle(
  value: unknown,
  manifest: KnowledgeManifest,
  pagesById: Map<string, PageRecord>,
): FigureBundle {
  const bundle = record(value, "figures.bundle.json");
  if (!Array.isArray(bundle.figures)) {
    throw new Error("figures must be an array");
  }

  const identities: Array<keyof Pick<
    KnowledgeManifest,
    "knowledge_version" | "book_id" | "scope"
  >> = ["knowledge_version", "book_id", "scope"];
  for (const field of identities) {
    if (bundle[field] === undefined) {
      continue;
    }
    const actual = stringField(bundle[field], `figures.${field}`);
    if (actual !== manifest[field]) {
      throw new Error(`figures.${field} must be ${manifest[field]}`);
    }
  }

  const figures = bundle.figures.map(validateFigure);
  const seen = new Set<string>();
  for (const figure of figures) {
    if (seen.has(figure.figure_id)) {
      throw new Error(`Duplicate figure_id: ${figure.figure_id}`);
    }
    seen.add(figure.figure_id);
    if (!pagesById.has(figure.page_id)) {
      throw new Error(`Figure ${figure.figure_id} references missing page_id ${figure.page_id}`);
    }
  }

  return {
    schema_version:
      bundle.schema_version === undefined
        ? undefined
        : stringField(bundle.schema_version, "figures.schema_version"),
    knowledge_version:
      bundle.knowledge_version === undefined
        ? undefined
        : stringField(bundle.knowledge_version, "figures.knowledge_version"),
    book_id:
      bundle.book_id === undefined
        ? undefined
        : stringField(bundle.book_id, "figures.book_id"),
    scope:
      bundle.scope === undefined
        ? undefined
        : stringField(bundle.scope, "figures.scope"),
    figures,
  };
}

function validateLessonStep(
  value: unknown,
  lessonIndex: number,
  stepIndex: number,
): LessonStep {
  const label = `lessons[${lessonIndex}].steps[${stepIndex}]`;
  const item = record(value, label);
  const order = numberField(item.order, `${label}.order`);
  if (!Number.isInteger(order) || order <= 0) {
    throw new Error(`${label}.order must be a positive integer`);
  }

  return {
    order,
    title: stringField(item.title, `${label}.title`),
    content_ids: stringArrayField(item.content_ids, `${label}.content_ids`),
    figure_ids:
      item.figure_ids === undefined
        ? undefined
        : stringArrayField(item.figure_ids, `${label}.figure_ids`),
    interaction:
      item.interaction === undefined
        ? undefined
        : { ...record(item.interaction, `${label}.interaction`) },
  };
}

function validateLesson(value: unknown, index: number): LessonRecord {
  const label = `lessons[${index}]`;
  const item = record(value, label);
  if (!Array.isArray(item.steps)) {
    throw new Error(`${label}.steps must be an array`);
  }

  const steps = item.steps.map((stepValue, stepIndex) =>
    validateLessonStep(stepValue, index, stepIndex),
  );
  const seenOrders = new Set<number>();
  for (const step of steps) {
    if (seenOrders.has(step.order)) {
      throw new Error(`${label}.steps contains duplicate order ${step.order}`);
    }
    seenOrders.add(step.order);
  }

  return {
    lesson_id: stringField(item.lesson_id, `${label}.lesson_id`),
    title: stringField(item.title, `${label}.title`),
    source_content_ids: stringArrayField(
      item.source_content_ids,
      `${label}.source_content_ids`,
    ),
    steps: [...steps].sort((a, b) => a.order - b.order),
  };
}

function validateLessonsBundle(
  value: unknown,
  manifest: KnowledgeManifest,
  contentById: Map<string, ContentRecord>,
  figuresById: Map<string, FigureRecord>,
): LessonsBundle {
  const bundle = record(value, "lessons.bundle.json");
  if (!Array.isArray(bundle.lessons)) {
    throw new Error("lessons must be an array");
  }

  const identities: Array<keyof Pick<
    KnowledgeManifest,
    "knowledge_version" | "book_id" | "scope"
  >> = ["knowledge_version", "book_id", "scope"];
  for (const field of identities) {
    if (bundle[field] === undefined) {
      continue;
    }
    const actual = stringField(bundle[field], `lessons.${field}`);
    if (actual !== manifest[field]) {
      throw new Error(`lessons.${field} must be ${manifest[field]}`);
    }
  }

  const lessons = bundle.lessons.map(validateLesson);
  const lessonsById = new Set<string>();
  for (const lesson of lessons) {
    if (lessonsById.has(lesson.lesson_id)) {
      throw new Error(`Duplicate lesson_id: ${lesson.lesson_id}`);
    }
    lessonsById.add(lesson.lesson_id);

    for (const contentId of lesson.source_content_ids) {
      if (!contentById.has(contentId)) {
        throw new Error(`Lesson ${lesson.lesson_id} references missing content_id ${contentId}`);
      }
    }
    for (const step of lesson.steps) {
      for (const contentId of step.content_ids) {
        if (!contentById.has(contentId)) {
          throw new Error(`Lesson ${lesson.lesson_id} references missing content_id ${contentId}`);
        }
      }
      for (const figureId of step.figure_ids ?? []) {
        if (!figuresById.has(figureId)) {
          throw new Error(`Lesson ${lesson.lesson_id} references missing figure_id ${figureId}`);
        }
      }
    }
  }

  return {
    schema_version:
      bundle.schema_version === undefined
        ? undefined
        : stringField(bundle.schema_version, "lessons.schema_version"),
    knowledge_version:
      bundle.knowledge_version === undefined
        ? undefined
        : stringField(bundle.knowledge_version, "lessons.knowledge_version"),
    book_id:
      bundle.book_id === undefined
        ? undefined
        : stringField(bundle.book_id, "lessons.book_id"),
    scope:
      bundle.scope === undefined
        ? undefined
        : stringField(bundle.scope, "lessons.scope"),
    lessons,
  };
}

export function buildKnowledgeRepository(
  manifestValue: unknown,
  bundleValue: unknown,
  figuresValue: unknown,
  lessonsValue: unknown,
): KnowledgeRepository {
  const manifest = validateManifest(manifestValue);
  const bundle = validateBundle(bundleValue);
  const pagesById = new Map<string, PageRecord>();
  const contentById = new Map<string, ContentRecord>();

  for (const page of bundle.pages) {
    if (pagesById.has(page.page_id)) {
      throw new Error(`Duplicate page_id: ${page.page_id}`);
    }
    if (page.book_id !== manifest.book_id) {
      throw new Error(`Page ${page.page_id} has unexpected book_id ${page.book_id}`);
    }
    pagesById.set(page.page_id, page);
  }

  for (const item of bundle.content) {
    if (contentById.has(item.content_id)) {
      throw new Error(`Duplicate content_id: ${item.content_id}`);
    }
    if (!pagesById.has(item.page_id)) {
      throw new Error(`Content ${item.content_id} references missing page_id ${item.page_id}`);
    }
    contentById.set(item.content_id, item);
  }

  const figuresBundle = validateFiguresBundle(figuresValue, manifest, pagesById);
  const figuresById = new Map(
    figuresBundle.figures.map((figure) => [figure.figure_id, figure] as const),
  );
  const lessonsBundle = validateLessonsBundle(
    lessonsValue,
    manifest,
    contentById,
    figuresById,
  );
  const lessonsById = new Map(
    lessonsBundle.lessons.map((lesson) => [lesson.lesson_id, lesson] as const),
  );

  return {
    manifest,
    bundle,
    pagesById,
    contentById,
    figures: figuresBundle.figures,
    figuresById,
    lessons: lessonsBundle.lessons,
    lessonsById,
  };
}

async function fetchJson(fetchImpl: typeof fetch, url: string): Promise<unknown> {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Could not load ${url}`);
  }
  try {
    return await response.json();
  } catch {
    throw new Error(`Invalid JSON in ${url}`);
  }
}

export async function loadKnowledge(
  fetchImpl: typeof fetch = fetch,
  baseUrl = "/knowledge",
): Promise<KnowledgeRepository> {
  const base = baseUrl.replace(/\/+$/, "");
  const manifest = await fetchJson(fetchImpl, `${base}/manifest.json`);
  const bundle = await fetchJson(fetchImpl, `${base}/knowledge.bundle.json`);
  const figures = await fetchJson(fetchImpl, `${base}/figures.bundle.json`);
  const lessons = await fetchJson(fetchImpl, `${base}/lessons.bundle.json`);
  return buildKnowledgeRepository(manifest, bundle, figures, lessons);
}
