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
    .map(normalizeSearchText)
    .filter(Boolean);
}

function tokenSet(fields: string[]): Set<string> {
  return new Set(fields.flatMap((field) => field.split(" ").filter(Boolean)));
}

function hasWholePhrase(field: string, query: string): boolean {
  return ` ${field} `.includes(` ${query} `);
}

function rankContent(content: ContentRecord, query: string): 1 | 2 | 3 | null {
  const fields = searchableFields(content);

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

  const hits: KnowledgeHit[] = [];

  for (const content of repository.bundle.content) {
    if (knownType && content.content_type !== knownType) {
      continue;
    }

    const page = repository.pagesById.get(content.page_id);
    if (!page) {
      continue;
    }

    if (!query) {
      hits.push({ content, page, rank: 1 });
      continue;
    }

    const rank = rankContent(content, query);
    if (rank !== null) {
      hits.push({ content, page, rank });
    }
  }

  return hits.sort((left, right) =>
    right.rank - left.rank ||
    left.content.content_id.localeCompare(right.content.content_id),
  );
}
