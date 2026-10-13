import type {
  ContentRecord,
  KnowledgeBundle,
  KnowledgeManifest,
  KnowledgeRepository,
  MappingStatus,
  PageRecord,
  SourceRecord,
} from "./types";

const EXPECTED_SOURCE_SHA = "318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c";
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

function numberField(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a number`);
  }
  return value;
}

function validateManifest(value: unknown): KnowledgeManifest {
  const manifest = record(value, "manifest");
  const expected: Record<string, string> = {
    knowledge_version: "1.0.0",
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
        ? item.chapter as undefined | null
        : stringField(item.chapter, `pages[${index}].chapter`),
    section:
      item.section === undefined || item.section === null
        ? item.section as undefined | null
        : stringField(item.section, `pages[${index}].section`),
  };
}

function validateContent(value: unknown, index: number): ContentRecord {
  const item = record(value, `content[${index}]`);
  if (!Array.isArray(item.derived_from_content_ids) || !item.derived_from_content_ids.every((id) => typeof id === "string")) {
    throw new Error(`content[${index}].derived_from_content_ids must be an array of strings`);
  }
  if (item.tags !== undefined && (!Array.isArray(item.tags) || !item.tags.every((tag) => typeof tag === "string"))) {
    throw new Error(`content[${index}].tags must be an array of strings`);
  }

  return {
    content_id: stringField(item.content_id, `content[${index}].content_id`),
    page_id: stringField(item.page_id, `content[${index}].page_id`),
    content_type: stringField(item.content_type, `content[${index}].content_type`),
    source_transcription: stringField(item.source_transcription, `content[${index}].source_transcription`),
    normalized_text: stringField(item.normalized_text, `content[${index}].normalized_text`),
    learning_text: stringField(item.learning_text, `content[${index}].learning_text`),
    derived_from_content_ids: [...item.derived_from_content_ids] as string[],
    source: validateSource(item.source, `content[${index}].source`),
    external_source:
      item.external_source === undefined
        ? undefined
        : record(item.external_source, `content[${index}].external_source`),
    tags: item.tags === undefined ? undefined : [...item.tags] as string[],
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

export function buildKnowledgeRepository(
  manifestValue: unknown,
  bundleValue: unknown,
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

  return { manifest, bundle, pagesById, contentById };
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
  return buildKnowledgeRepository(manifest, bundle);
}
