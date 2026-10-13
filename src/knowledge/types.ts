export interface KnowledgeManifest {
  schema_version: string;
  knowledge_version: "1.0.0";
  book_id: "cpnc-2025";
  scope: "BOOK";
  source_manifest_sha256: string;
  files: Record<string, string>;
}

export type MappingStatus = "candidate" | "verified" | "unresolved" | "not_printed";

export interface PageRecord {
  page_id: string;
  book_id: string;
  pdf_page: number;
  printed_page: number | null;
  mapping_status: MappingStatus;
  chapter?: string | null;
  section?: string | null;
}

export interface SourceRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SourceExtraction {
  method: string;
  confidence: number;
  review_status: string;
}

export interface SourceRecord {
  book_id: string;
  pdf_page: number;
  printed_page: number | null;
  region: SourceRegion;
  extraction: SourceExtraction;
}

export interface ContentRecord {
  content_id: string;
  page_id: string;
  content_type: string;
  source_transcription: string;
  normalized_text: string;
  learning_text: string;
  derived_from_content_ids: string[];
  source: SourceRecord;
  external_source?: Record<string, unknown>;
  tags?: string[];
}

export interface KnowledgeBundle {
  schema_version?: string;
  knowledge_version?: string;
  book_id?: string;
  scope?: string;
  pages: PageRecord[];
  content: ContentRecord[];
  measurements: unknown[];
  rules: unknown[];
  taxonomy: Record<string, unknown>;
}

export interface LessonStep {
  order: number;
  title: string;
  content_ids: string[];
  figure_ids?: string[];
  interaction?: Record<string, unknown>;
}

export interface LessonRecord {
  lesson_id: string;
  title: string;
  source_content_ids: string[];
  steps: LessonStep[];
}

export interface LessonsBundle {
  schema_version?: string;
  knowledge_version?: string;
  book_id?: string;
  scope?: string;
  lessons: LessonRecord[];
}

export interface KnowledgeRepository {
  manifest: KnowledgeManifest;
  bundle: KnowledgeBundle;
  pagesById: Map<string, PageRecord>;
  contentById: Map<string, ContentRecord>;
  lessons: LessonRecord[];
  lessonsById: Map<string, LessonRecord>;
}
