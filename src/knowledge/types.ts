export type SupportedKnowledgeVersion = "1.0.0" | "1.1.0";
export type FigurePrimitive = "rect" | "line" | "polyline";

export interface KnowledgeManifest {
  schema_version: string;
  knowledge_version: SupportedKnowledgeVersion;
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

export interface FigurePoint {
  x: number;
  y: number;
}

export interface FigureBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FigurePlacement {
  x: number;
  y: number;
  precision?: string;
}

export interface FigureGeometry {
  primitive?: string | null;
  precision?: string;
  bounds?: FigureBounds;
  points?: FigurePoint[];
}

export interface FigureEntity {
  id: string;
  type: string;
  geometry: FigureGeometry;
}

export interface FigureAnnotation {
  id: string;
  text: string;
  entity_id?: string;
  measurement_id?: string;
  placement?: FigurePlacement;
}

export interface FigureLayer {
  id: string;
  order: number;
  entity_ids?: string[];
  annotation_ids?: string[];
}

export interface FigureCamera {
  coordinate_space: string;
  viewport: FigureBounds;
}

export interface FigureReconstruction {
  render_contract?: string;
}

export interface FigureRecord {
  figure_id: string;
  page_id: string;
  type: string;
  purpose: string;
  entities: FigureEntity[];
  annotations: FigureAnnotation[];
  layers?: FigureLayer[];
  camera?: FigureCamera;
  reconstruction: FigureReconstruction;
  accessibility?: { summary?: string };
}

export interface FigureBundle {
  schema_version?: string;
  knowledge_version?: string;
  book_id?: string;
  scope?: string;
  figures: FigureRecord[];
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
  figures: FigureRecord[];
  figuresById: Map<string, FigureRecord>;
  lessons: LessonRecord[];
  lessonsById: Map<string, LessonRecord>;
}
