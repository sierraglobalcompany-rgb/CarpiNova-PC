import type { KnowledgeRepository } from "./types";

const CONTENT_TYPE_LABELS = {
  concept: "Conceptos",
  definition: "Definiciones",
  material: "Materiales",
  hardware: "Herrajes",
  furniture_pattern: "Muebles",
  construction_pattern: "Sistemas constructivos",
  rule: "Reglas",
  formula: "Fórmulas",
  dimension: "Dimensiones",
  tolerance: "Tolerancias",
  procedure: "Procedimientos",
  warning: "Advertencias",
  recommendation: "Recomendaciones",
  example: "Ejemplos",
  checklist: "Listas de verificación",
  table: "Tablas",
  form: "Formularios",
  reference: "Referencias",
  external_enrichment: "Información complementaria",
} as const;

export type KnownContentType = keyof typeof CONTENT_TYPE_LABELS;

const KNOWN_TYPES = new Set<string>(Object.keys(CONTENT_TYPE_LABELS));

export function isKnownContentType(type: string): type is KnownContentType {
  return KNOWN_TYPES.has(type);
}

export function getContentTypeLabel(type: string): string {
  return isKnownContentType(type) ? CONTENT_TYPE_LABELS[type] : type;
}

export function getAvailableContentTypes(
  repository: KnowledgeRepository,
): string[] {
  const present = new Set<string>();

  for (const content of repository.bundle.content) {
    if (isKnownContentType(content.content_type)) {
      present.add(content.content_type);
    }
  }

  return [...present].sort((left, right) =>
    getContentTypeLabel(left).localeCompare(getContentTypeLabel(right), "es"),
  );
}
