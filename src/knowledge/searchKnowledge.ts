import { isKnownContentType } from "./contentTypes";
import type {
  ContentRecord,
  KnowledgeRepository,
  PageRecord,
} from "./types";

export interface SearchParams {
  query: string;
  contentType?: string | null;
}

export interface KnowledgeHit {
  content: ContentRecord;
  page: PageRecord;
  rank: 1 | 2 | 3;
}

export function normalizeSearchText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^\p{L}\p{N}_]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function searchableFields(content: ContentRecord): string[] {
  return [
    content.learning_text,
    content.normalized_text,
    ...(content.tags ?? []),
    content.content_type,
  ]
    .map(normalizeSearchText);
}

function tokenSet(fields: string[]): Set<string> {
  return new Set(fields.flatMap((field) => field.split(" ").filter(Boolean)));
}

function hasWholePhrase(field: string, query: string): boolean {
  return ` ${field} `.includes(` ${query} `);
}

function rankFields(fields: string[], query: string): 1 | 2 | 3 | null {
  if (fields.some((field) => hasWholePhrase(field, query))) {
    return 3;
  }

  const queryTokens = query.split(" ").filter(Boolean);
  const tokens = tokenSet(fields);

  if (queryTokens.every((token) => tokens.has(token))) {
    return 2;
  }

  if (
    queryTokens.some((queryToken) =>
      [...tokens].some((fieldToken) => fieldToken.includes(queryToken)),
    )
  ) {
    return 1;
  }

  return null;
}

export function searchKnowledge(
  repository: KnowledgeRepository,
  params: SearchParams,
): KnowledgeHit[] {
  const query = normalizeSearchText(params.query);
  const requestedType = params.contentType ?? null;
  const knownType = requestedType && isKnownContentType(requestedType)
    ? requestedType
    : null;
  const hasUnknownType = Boolean(requestedType && !knownType);

  if (!query && (!knownType || hasUnknownType)) {
    return [];
  }

  const hits: Array<{ hit: KnowledgeHit; fieldPriority: number }> = [];

  for (const content of repository.bundle.content) {
    if (knownType && content.content_type !== knownType) {
      continue;
    }

    const page = repository.pagesById.get(content.page_id);
    if (!page) {
      continue;
    }

    if (!query) {
      hits.push({ hit: { content, page, rank: 1 }, fieldPriority: 0 });
      continue;
    }

    const fields = searchableFields(content);
    const rank = rankFields(fields, query);
    if (rank !== null) {
      const exactMatchField = fields.findIndex((field) => hasWholePhrase(field, query));
      hits.push({
        hit: { content, page, rank },
        fieldPriority: exactMatchField === -1 ? fields.length : exactMatchField,
      });
    }
  }

  return hits
    .sort((left, right) =>
      right.hit.rank - left.hit.rank ||
      left.fieldPriority - right.fieldPriority ||
      left.hit.content.content_id.localeCompare(right.hit.content.content_id),
    )
    .map(({ hit }) => hit);
}
