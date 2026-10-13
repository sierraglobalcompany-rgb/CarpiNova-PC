# CarpiNova-PC MVP 1 — Local Acceptance

Date: 2026-10-13
Platform: Windows 10 Home Single Language (OS build 26300)
Branch: `design/knowledge-explorer-mvp1-20261012`
CarpiNova-PC SHA: `585244ee902fcf6d30eedcb90984a50db8e78f9b` (source revision used for final suite and preview)
Knowledge SHA: `a47119aba3d4711c1ac69f33f7d236d9bc20bb78`
Knowledge version: 1.0.0
book_id: cpnc-2025
scope: BOOK
source_manifest_sha256: `318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c`

## Automated verification

- `npm ci`: PASS (0 vulnerabilities)
- `npm test`: 39/39 PASS (baseline before source changes: 37/37)
- `npm run typecheck`: PASS
- `npm run build`: PASS
- Production preview: PASS; home loaded, MDF search returned 7 results, a content detail opened, and `/knowledge/manifest.json` served version 1.0.0 with the expected source manifest hash.
- Knowledge preparation: PASS via `npm run knowledge:prepare` with the canonical Knowledge checkout.
- Manifest/hashes: PASS; manifest contract and three artifact hashes matched the prepared Knowledge 1.0.0 manifest.
- Generated Knowledge ignored: PASS; `generated/knowledge/manifest.json` is ignored by `/generated/`, and `git ls-files generated` returned no tracked files.
- Existing certified CI evidence: PC run `38346140824` PASS; canonical Knowledge Windows integration run `38347622078` PASS, as recorded in the Task 9 checkpoint.

## Search probes

- bisagras: PASS — 25 results
- correderas: PASS — 16 results
- MDF: PASS — 7 results
- tapacanto: PASS — 28 results
- gabinete: PASS — 15 results

## Representative end-to-end flows

- Materiales — `CONTENT-CPNC-2025-P0083-001`: PASS; explanation, source disclosure, PDF p. 83, printed p. 61, and preserved p83/p84 unit discrepancy verified.
- Herrajes — `CONTENT-CPNC-2025-P0111-002`: PASS; explanation and source verified (PDF p. 111, printed p. 89, `VISUALLY_VERIFIED`).
- Procedimientos — `CONTENT-CPNC-2025-P0068-001`: PASS; explanation, source, and return to the filtered search verified (PDF p. 68, printed p. 46).

## Edge cases

- Empty search: PASS — prompt asks for a term or category.
- No-result search: PASS — unique nonexistent term displays no results and zero cards.
- Case normalization: PASS — `MDF` and `mdf` return the same 7 content IDs.
- Diacritic normalization: PASS — `clóset` and `closet` return the same 34 content IDs.
- Category-only filter: PASS — `/buscar?type=material` returns 17 records; submitting an empty search returns `/buscar`.
- Back navigation: PASS — browser back and “Volver a resultados” restore query and category filter.
- Direct content deep-link: PASS — detail route opens directly and its fallback return link targets `/buscar`.

## Responsive

- 1440 px: PASS — no horizontal overflow; search, filters, results, detail, and source remain readable.
- 768 px: PASS — no horizontal overflow; controls and results remain usable.
- 390 px: PASS — no horizontal overflow; content stacks vertically and remains readable while scrolling.

## Accessibility smoke

- Keyboard navigation: PASS — search submission, result opening, and source disclosure work by keyboard.
- Visible focus: PASS — keyboard focus on the source summary shows a visible outline.
- Labelled search: PASS — search field is labelled “Buscar en CarpiNova”.
- Source disclosure: PASS — keyboard Space opens “Ver fuente” and reveals source provenance.

## Safety / provenance

- No inferred measurement join: PASS — detail presentation reads the selected content record and linked page; a regression test verifies same-page measurement data is not displayed by proximity.
- No executable RuleSpec invention: PASS — search/detail UI renders content text and provenance; it does not execute or derive manufacturing instructions from rules.
- Conflicts/unresolved preserved: PASS — MDF result retains the p83/p84 discrepancy and states it requires technical validation.
- Provenance visible: PASS — source disclosure shows PDF/printed page, source text, extraction method, and review status when present.

## Scope / noise audit

- Generated Knowledge committed: NO
- Backend/database/Docker added: NO
- AI/vector/RAG added: NO
- Parallel taxonomy added: NO
- Manual Knowledge duplication added: NO
- Unauthorized dependencies added: NO
- Temporary `tsconfig.*.tsbuildinfo` files created by typecheck/build: removed.

## Defects found

1. Exact matches in tags or normalized text could appear ahead of matches in visible explanatory text because equal-rank hits were sorted only by content ID.
2. Opening a detail from a filtered search and selecting “Volver a resultados” dropped the query and category filter.

## Defects fixed

1. Search now prioritizes the first exact matching field in visible-text, normalized-text, tags, and type order; added a regression test.
2. Result links retain the originating search URL in router state; the detail validates it and falls back to `/buscar` for direct links; added an end-to-end regression test.

## Remaining blockers

NONE for local acceptance.

## Final verdict

MVP1_LOCAL_ACCEPTANCE_PASS
