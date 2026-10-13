# CarpiNova-PC Knowledge Explorer MVP 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el primer MVP local de CarpiNova-PC como explorador educativo de `CarpiNova-Knowledge 1.0.0`, con búsqueda determinística, categorías por `content_type`, fichas pedagógicas trazables y comportamiento fail-closed.

**Architecture:** Una SPA React/Vite/TypeScript consume un bundle generado localmente desde el repositorio canónico `CarpiNova-Knowledge`. Un script de preparación valida versión, fuente y hashes antes de reemplazar atómicamente `generated/knowledge/`; una capa `src/knowledge/` es la única puerta de entrada del frontend al bundle. No hay backend, base de datos, API, IA, Docker ni sincronización remota.

**Tech Stack:** React, Vite, TypeScript, React Router DOM, Vitest, Testing Library, CSS propio, Node.js para scripts locales.

**Spec:** `docs/superpowers/specs/2026-10-12-carpinova-pc-knowledge-explorer-mvp1-design.md`

## Global Constraints

- Primera ejecución exclusivamente local en un PC Windows mediante `localhost`.
- Knowledge esperado: `knowledge_version = 1.0.0`, `book_id = cpnc-2025`, `scope = BOOK`.
- SHA-256 canónico esperado: `318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c`.
- Los bundles generados viven en `generated/knowledge/` y `generated/` permanece ignorado por Git.
- `CarpiNova-Knowledge` es la única fuente de verdad; no se crean copias manualmente editables en CarpiNova-PC.
- La búsqueda indexa únicamente `learning_text`, `normalized_text`, `tags` y `content_type`; `source_transcription` no se indexa.
- Las categorías se derivan de los `content_type` realmente presentes; no se crea una taxonomía paralela.
- `learning_text` es la presentación principal; fallback exacto: `normalized_text` como **Texto normalizado**, luego `source_transcription` como **Transcripción de la fuente**.
- Mediciones separadas y RuleSpec no se convierten en instrucciones de fabricación ni se asocian por proximidad de página.
- Estrategia de error: fail closed; un bundle/version/fuente/estructura inválidos impiden usar Knowledge.
- Sin backend, API propia, base de datos, Docker, login, IA/chatbot, embeddings, búsqueda vectorial, PWA, app móvil, CAD/3D, Furniture Engine ni dashboard avanzado.
- Sin Tailwind, Bootstrap, Material UI ni store global externo en el MVP.
- No añadir funciones fuera de la especificación por “ya que estamos”.

## Review Focus

1. **Fallo durante la preparación con una copia válida ya instalada:** la preparación debe conservar intacto el último `generated/knowledge/` válido y limpiar temporales; Task 2 lo fija con prueba de reemplazo atómico.
2. **IDs duplicados o referencias de contenido a páginas inexistentes:** el loader debe rechazar el bundle en vez de sobrescribir silenciosamente índices; Task 3 lo fija con pruebas de duplicado y referencia colgante.
3. **URL manipulada (`type` desconocido), consulta vacía o solo espacios:** la UI no debe fallar ni convertir eso en recomendaciones; Task 5 lo fija con pruebas de query params inválidos y estados vacíos.
4. **Unicode/acentos/espacios repetidos y `tags` ausentes:** la búsqueda debe seguir siendo determinística y no lanzar errores; Task 4 lo fija con pruebas de normalización y campos opcionales.
5. **Ficha inexistente, `printed_page = null` o capas pedagógicas vacías:** la ficha debe degradar de forma explícita, sin mostrar `null` ni inventar texto; Task 6 lo fija con pruebas de 404, procedencia y fallback.

---

## File Map

### Repository/runtime foundation

- `package.json` — scripts y dependencias mínimas del frontend/test runner.
- `package-lock.json` — lock reproducible de dependencias.
- `index.html` — entrada Vite.
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — compilación TypeScript.
- `vite.config.ts` — React, Vitest y `publicDir: "generated"` para servir `generated/knowledge/` como `/knowledge/` sin copiarlo al source tree.
- `.gitignore` — incluye `/generated/`, `node_modules/`, `dist/` y artefactos locales.
- `src/main.tsx` — punto de montaje.
- `src/app/AppShell.tsx` — layout base accesible de CarpiNova.
- `src/styles/app.css` — estilo “Taller moderno” y responsive.
- `tests/setup.ts` — configuración Testing Library/Vitest.

### Knowledge preparation

- `scripts/prepare-knowledge.mjs` — valida el repo Knowledge, genera BOOK 1.0.0, verifica contrato/hashes y reemplaza `generated/knowledge/` atómicamente.
- `tests/prepare-knowledge.test.ts` — pruebas del contrato del manifest, hashes, fallos y atomicidad.

### Runtime Knowledge boundary

- `src/knowledge/types.ts` — tipos mínimos consumidos por la app.
- `src/knowledge/loadKnowledge.ts` — carga/validación runtime y construcción de índices.
- `src/knowledge/KnowledgeContext.tsx` — entrega el repositorio ya validado a las rutas; no es un store global externo.
- `tests/knowledge-loader.test.ts` — contrato de carga y fail-closed.

### Search

- `src/knowledge/searchKnowledge.ts` — normalización, ranking, filtro y exploración de categorías.
- `src/knowledge/contentTypes.ts` — lista/guard/etiquetas humanas de `content_type`.
- `tests/search-knowledge.test.ts` — ranking, filtros, acentos, orden estable y exclusión de `source_transcription`.

### Search UI

- `src/app/routes.tsx` — rutas `/`, `/buscar`, `/contenido/:contentId`.
- `src/features/search/HomePage.tsx` — buscador principal + categorías disponibles.
- `src/features/search/SearchPage.tsx` — resultados y filtros desde URL.
- `src/features/search/SearchForm.tsx` — formulario reutilizable.
- `src/features/search/CategoryFilter.tsx` — categorías por tipos presentes.
- `src/features/search/SearchResultCard.tsx` — resultado sin título inventado.
- `tests/search-ui.test.tsx` — navegación, query params, categoría vacía y resultados.

### Content detail and provenance

- `src/features/content/contentPresentation.ts` — fallback pedagógico exacto y resolución de procedencia.
- `src/features/content/ContentPage.tsx` — ficha y bloque “Ver fuente”.
- `tests/content-page.test.tsx` — fallback, 404, página impresa nula, procedencia y no exposición de reglas/mediciones como instrucciones.

### Bootstrap/error and documentation

- `src/app/Bootstrap.tsx` — estados loading/error/ready al cargar Knowledge.
- `tests/bootstrap.test.tsx` — mensaje fail-closed frente a Knowledge inválido.
- `README.md` — instalación local, preparación de Knowledge, dev/test/build/preview y aceptación manual.
- `docs/verification/knowledge-explorer-mvp1-local.md` — evidencia final de verificación local, creada solo al cerrar el MVP.

---

### Task 1: Create the minimal React/Vite application foundation

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/app/AppShell.tsx`
- Create: `src/styles/app.css`
- Create: `tests/setup.ts`
- Create: `tests/app-shell.test.tsx`
- Create or modify: `.gitignore`

**Interfaces:**
- Produces: `AppShell({ children }: { children: React.ReactNode }): JSX.Element`.
- Produces npm scripts: `dev`, `test`, `typecheck`, `build`, `preview`.
- Produces static asset mapping: `generated/knowledge/*` is served by Vite at `/knowledge/*` through `publicDir: "generated"`.
- Consumes: nothing from later tasks.

- [ ] **Step 1: Write the failing shell test**

```tsx
render(<AppShell><p>Contenido de prueba</p></AppShell>);
expect(screen.getByRole("banner")).toHaveTextContent("CarpiNova");
expect(screen.getByRole("main")).toHaveTextContent("Contenido de prueba");
```

- [ ] **Step 2: Run the shell test and verify RED**

Run: `npm test -- tests/app-shell.test.tsx`

Expected: FAIL because the application/test harness does not exist yet.

- [ ] **Step 3: Scaffold the minimal app and test harness**

Install only React, React DOM, React Router DOM plus Vite/TypeScript/Vitest/jsdom/Testing Library tooling. Configure `vite.config.ts` with `publicDir: "generated"`; do not add UI frameworks, state libraries or lint/tooling unrelated to the accepted MVP.

- [ ] **Step 4: Add repository ignore guards**

`.gitignore` must include at least `/generated/`, `/dist/` and `/node_modules/` so Knowledge artifacts cannot be committed accidentally.

- [ ] **Step 5: Run tests, typecheck and production build**

Run:

```bash
npm test -- tests/app-shell.test.tsx
npm run typecheck
npm run build
```

Expected: all PASS; `dist/` builds without Knowledge-specific code yet.

- [ ] **Step 6: Commit the foundation**

```bash
git add package.json package-lock.json index.html tsconfig*.json vite.config.ts src tests/setup.ts tests/app-shell.test.tsx .gitignore
git commit -m "feat: scaffold CarpiNova knowledge explorer"
```

---

### Task 2: Implement deterministic local Knowledge preparation

**Files:**
- Create: `scripts/prepare-knowledge.mjs`
- Create: `tests/prepare-knowledge.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces CLI: `npm run knowledge:prepare -- --knowledge-root <path>`.
- Produces default root: sibling `../CarpiNova-Knowledge` when `--knowledge-root` is omitted.
- Produces function: `prepareKnowledge({ knowledgeRoot, generatedRoot, runCommand? }): Promise<void>`.
- Produces function: `validateManifest(manifest): void`.
- Produces function: `verifyArtifactHashes(bundleDir, manifest): Promise<void>`.
- Output directory on success: `<CarpiNova-PC>/generated/knowledge/`.
- Requires commands in the Knowledge repo:
  - `uv run python -m carpinova_knowledge validate --root <knowledgeRoot>`
  - `uv run python -m carpinova_knowledge build-book-dist --root <knowledgeRoot> --book-id cpnc-2025 --out <tempDir>`

- [ ] **Step 1: Write RED tests for the exact manifest contract**

Tests must assert that `validateManifest` accepts only:

```text
knowledge_version = 1.0.0
book_id = cpnc-2025
scope = BOOK
source_manifest_sha256 = 318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c
```

and requires hash entries for `knowledge.bundle.json`, `figures.bundle.json`, and `lessons.bundle.json`.

- [ ] **Step 2: Write RED tests for hash mismatch and missing artifacts**

Create temporary files; assert `verifyArtifactHashes` rejects a changed byte or missing bundle and names the failing artifact.

- [ ] **Step 3: Write the RED atomicity test**

Seed `generated/knowledge/manifest.json` with a known valid sentinel, inject a `runCommand` failure during preparation, and assert the existing directory remains unchanged while the temporary directory is removed.

- [ ] **Step 4: Run the preparation tests and verify RED**

Run: `npm test -- tests/prepare-knowledge.test.ts`

Expected: FAIL because the script/functions do not exist.

- [ ] **Step 5: Implement minimal preparation orchestration**

Use Node built-ins only (`fs/promises`, `path`, `crypto`, `child_process`). Build into a temporary sibling under `generated/`, validate manifest and SHA-256 files, then replace `generated/knowledge/` only after every check passes. On any failure, preserve the previous valid directory and remove temporary output.

- [ ] **Step 6: Run preparation tests and verify GREEN**

Run: `npm test -- tests/prepare-knowledge.test.ts`

Expected: PASS.

- [ ] **Step 7: Verify `generated/` remains untracked**

Run: `git check-ignore generated/knowledge/manifest.json`

Expected: output identifies the path as ignored.

- [ ] **Step 8: Commit preparation support**

```bash
git add scripts/prepare-knowledge.mjs tests/prepare-knowledge.test.ts package.json package-lock.json
git commit -m "feat: prepare validated Knowledge bundle"
```

---

### Task 3: Add the runtime Knowledge boundary and fail-closed indexes

**Files:**
- Create: `src/knowledge/types.ts`
- Create: `src/knowledge/loadKnowledge.ts`
- Create: `src/knowledge/KnowledgeContext.tsx`
- Create: `tests/knowledge-loader.test.ts`

**Interfaces:**
- Produces type: `KnowledgeManifest` with the exact version/book/scope/source/hash fields consumed by the app.
- Produces type: `PageRecord` with `page_id`, `book_id`, `pdf_page`, `printed_page`, `mapping_status`, optional `chapter`, optional `section`.
- Produces type: `ContentRecord` with `content_id`, `page_id`, `content_type`, `source_transcription`, `normalized_text`, `learning_text`, `derived_from_content_ids`, `source`, optional `tags`.
- Produces type: `KnowledgeBundle` with `pages`, `content`, `measurements`, `rules`, `taxonomy` plus version metadata.
- Produces type: `KnowledgeRepository` with `manifest`, `bundle`, `pagesById`, `contentById`.
- Produces: `loadKnowledge(fetchImpl = fetch, baseUrl = "/knowledge"): Promise<KnowledgeRepository>`.
- Produces: `buildKnowledgeRepository(manifest, bundle): KnowledgeRepository`.
- Produces: `KnowledgeProvider({ repository, children })` and `useKnowledge(): KnowledgeRepository`.

- [ ] **Step 1: Write RED tests for a valid manifest/bundle load**

Use an in-memory fetch stub returning `/knowledge/manifest.json` and `/knowledge/knowledge.bundle.json`; assert indexes resolve a known `content_id` and its `page_id`.

- [ ] **Step 2: Write RED tests for fail-closed contract errors**

Assert rejection for:

```text
wrong knowledge_version
wrong book_id
wrong scope
wrong canonical source SHA
non-array pages/content
```

- [ ] **Step 3: Write RED tests for duplicate and dangling IDs**

Assert rejection when two records share a `content_id`, two pages share a `page_id`, or a content record references a `page_id` not present in `pages`.

- [ ] **Step 4: Run loader tests and verify RED**

Run: `npm test -- tests/knowledge-loader.test.ts`

Expected: FAIL because the runtime Knowledge boundary does not exist.

- [ ] **Step 5: Implement the smallest loader and repository indexes**

Validate only the contract the UI actually depends on; do not recreate the complete JSON Schema engine in the browser. Preserve `measurements` and `rules` in the bundle but expose no convenience method that turns them into instructions.

- [ ] **Step 6: Run loader tests and verify GREEN**

Run: `npm test -- tests/knowledge-loader.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit the runtime boundary**

```bash
git add src/knowledge tests/knowledge-loader.test.ts
git commit -m "feat: load Knowledge with fail-closed contract"
```

---

### Task 4: Implement deterministic search and category exploration

**Files:**
- Create: `src/knowledge/searchKnowledge.ts`
- Create: `src/knowledge/contentTypes.ts`
- Create: `tests/search-knowledge.test.ts`

**Interfaces:**
- Produces: `normalizeSearchText(input: string): string`.
- Produces: `SearchParams = { query: string; contentType?: string | null }`.
- Produces: `KnowledgeHit = { content: ContentRecord; page: PageRecord; rank: 1 | 2 | 3 }`.
- Produces: `searchKnowledge(repository: KnowledgeRepository, params: SearchParams): KnowledgeHit[]`.
- Produces: `getAvailableContentTypes(repository: KnowledgeRepository): string[]` sorted by human label.
- Produces: `getContentTypeLabel(type: string): string` and `isKnownContentType(type: string): boolean` for the canonical schema values.

- [ ] **Step 1: Write RED normalization tests**

Assert at minimum:

```ts
normalizeSearchText("  Instalación   de BISÁGRAS ") === "instalacion de bisagras"
normalizeSearchText("MDF") === "mdf"
```

and verify `tags` being absent does not throw.

- [ ] **Step 2: Write RED ranking tests**

Create fixtures proving stable order:

1. normalized exact phrase match ranks `3`;
2. all query terms distributed across indexed fields rank `2`;
3. partial token match ranks `1`;
4. equal rank breaks ties by `content_id`.

- [ ] **Step 3: Write RED exclusion/filter tests**

Assert a token present only in `source_transcription` yields no result. Assert a valid `contentType` restricts results.

- [ ] **Step 4: Write RED category/empty-query tests**

Assert:

- `query = ""` + valid `contentType` returns all records of that type sorted by `content_id`;
- query containing only spaces behaves as empty;
- `query = ""` without type returns `[]`;
- unknown type never crashes and yields no category-only records.

- [ ] **Step 5: Run search tests and verify RED**

Run: `npm test -- tests/search-knowledge.test.ts`

Expected: FAIL because search functions do not exist.

- [ ] **Step 6: Implement deterministic search**

Build searchable text only from `learning_text`, `normalized_text`, `tags`, and `content_type`. Use normalized substring/token checks; do not add fuzzy libraries, embeddings, taxonomy aliases or `source_transcription`.

- [ ] **Step 7: Run search tests and verify GREEN**

Run: `npm test -- tests/search-knowledge.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit search**

```bash
git add src/knowledge/searchKnowledge.ts src/knowledge/contentTypes.ts tests/search-knowledge.test.ts
git commit -m "feat: add deterministic Knowledge search"
```

---

### Task 5: Build home, search results and category navigation

**Files:**
- Create: `src/app/routes.tsx`
- Create: `src/features/search/HomePage.tsx`
- Create: `src/features/search/SearchPage.tsx`
- Create: `src/features/search/SearchForm.tsx`
- Create: `src/features/search/CategoryFilter.tsx`
- Create: `src/features/search/SearchResultCard.tsx`
- Create: `tests/search-ui.test.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: `useKnowledge`, `searchKnowledge`, `getAvailableContentTypes`, `getContentTypeLabel`, `isKnownContentType`.
- Produces routes: `/` and `/buscar`; Task 6 adds `/contenido/:contentId` implementation to the same route table.
- `SearchForm` writes `q` to `/buscar` only on submit.
- Category selection writes `type` to `/buscar`; an unknown manual `type` query parameter is ignored as a filter rather than crashing the UI.
- A result links to `/contenido/<content_id>` without inventing a title.

- [ ] **Step 1: Write RED home navigation tests**

With a memory router and fixture repository, assert the home page renders a labelled search input and only categories actually present in the bundle. Submitting `bisagras` navigates to `/buscar?q=bisagras`.

- [ ] **Step 2: Write RED category navigation test**

Click a category and assert navigation to `/buscar?type=<content_type>`; the resulting page lists all records of that type even with no `q`.

- [ ] **Step 3: Write RED result rendering test**

Assert each result shows the human type label, `learning_text` fragment when present, available chapter/section/page context, and a link containing the real `content_id`. Assert no synthetic title such as “Resultado 1” is rendered.

- [ ] **Step 4: Write RED empty/invalid URL tests**

Assert `/buscar` with no query/filter invites the user to search or choose a category. Assert `?q=%20%20&type=not-real` does not crash and does not create a fake category.

- [ ] **Step 5: Run search UI tests and verify RED**

Run: `npm test -- tests/search-ui.test.tsx`

Expected: FAIL because the routes/components do not exist.

- [ ] **Step 6: Implement the minimum search UI**

Keep URL parameters as the source of search/filter state. Use React local state only for form input/disclosure controls. Do not add Redux/Zustand or dashboard content.

- [ ] **Step 7: Run search UI tests and verify GREEN**

Run: `npm test -- tests/search-ui.test.tsx`

Expected: PASS.

- [ ] **Step 8: Commit the searchable UI**

```bash
git add src/app/routes.tsx src/features/search src/main.tsx tests/search-ui.test.tsx
git commit -m "feat: add Knowledge search experience"
```

---

### Task 6: Add content detail, fallback and provenance without unsafe inference

**Files:**
- Create: `src/features/content/contentPresentation.ts`
- Create: `src/features/content/ContentPage.tsx`
- Create: `tests/content-page.test.tsx`
- Modify: `src/app/routes.tsx`

**Interfaces:**
- Produces: `selectPrimaryText(content: ContentRecord): { label: "Explicación sencilla" | "Texto normalizado" | "Transcripción de la fuente"; text: string }`.
- Consumes: `repository.contentById`, `repository.pagesById`.
- Route: `/contenido/:contentId`.
- Provenance UI: native `<details>` with summary `Ver fuente`.

- [ ] **Step 1: Write RED primary-text fallback tests**

Assert exact order:

```text
non-empty learning_text -> label "Explicación sencilla"
empty learning_text + normalized_text -> label "Texto normalizado"
empty learning_text + empty normalized_text -> label "Transcripción de la fuente"
```

No branch synthesizes replacement prose.

- [ ] **Step 2: Write RED provenance test**

Open `Ver fuente` and assert `source_transcription`, physical `pdf_page`, optional `printed_page`, chapter/section and source metadata are presented when available.

- [ ] **Step 3: Write RED null/missing-route tests**

Assert `printed_page = null` does not render the literal string `null`. Assert an unknown `contentId` shows a clear `Contenido no encontrado` state and does not crash.

- [ ] **Step 4: Write RED semantic-safety test**

Add fixture measurement/rule records containing unique strings that do not occur in the content record. Assert the detail page does **not** render those measurement values, predicates or rule statuses merely because they share the same page.

- [ ] **Step 5: Run content tests and verify RED**

Run: `npm test -- tests/content-page.test.tsx`

Expected: FAIL because detail presentation does not exist.

- [ ] **Step 6: Implement the content route and provenance disclosure**

Resolve only explicit `content.page_id -> page`. Do not build “related content”, measurement joins, rule joins, figure placeholders or technical recommendations.

- [ ] **Step 7: Run content tests and verify GREEN**

Run: `npm test -- tests/content-page.test.tsx`

Expected: PASS.

- [ ] **Step 8: Commit the content detail**

```bash
git add src/features/content src/app/routes.tsx tests/content-page.test.tsx
git commit -m "feat: add traceable Knowledge detail view"
```

---

### Task 7: Apply the “Taller moderno” responsive/accessibility layer

**Files:**
- Modify: `src/app/AppShell.tsx`
- Modify: `src/features/search/HomePage.tsx`
- Modify: `src/features/search/SearchPage.tsx`
- Modify: `src/features/search/SearchForm.tsx`
- Modify: `src/features/search/CategoryFilter.tsx`
- Modify: `src/features/search/SearchResultCard.tsx`
- Modify: `src/features/content/ContentPage.tsx`
- Modify: `src/styles/app.css`
- Create: `tests/accessibility-ui.test.tsx`

**Interfaces:**
- No new domain API.
- Preserves all route/data interfaces from Tasks 3–6.
- Search input has a programmatic label; filters expose selected state; links/buttons remain keyboard reachable.

- [ ] **Step 1: Write RED semantic/accessibility tests**

Assert the rendered app has one main landmark, a labelled search input, keyboard-focusable result links, a semantic source disclosure, and selected category state available to assistive technology.

- [ ] **Step 2: Write RED keyboard submit test**

Use `userEvent` to focus the search input, type a term and submit with Enter; assert the route changes exactly as mouse submission does.

- [ ] **Step 3: Run accessibility tests and verify RED where markup is incomplete**

Run: `npm test -- tests/accessibility-ui.test.tsx`

Expected: at least the newly required semantics fail before the markup/style pass.

- [ ] **Step 4: Implement the CSS/markup pass**

Use CSS custom properties plus focused component classes. Desktop may use a two-column results/filter layout; a single media query collapses it to one column and a compact filter control for small widths. Include visible `:focus-visible`, readable line lengths, contrast-safe text/background choices and no decorative animation dependency.

- [ ] **Step 5: Run automated tests and build**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 6: Perform manual responsive smoke checks**

With `npm run dev`, inspect approximately `1440px`, `768px`, and `390px` widths. Confirm no horizontal overflow, readable text, usable filters and keyboard focus. Record only defects; do not add unrelated polish.

- [ ] **Step 7: Commit the visual/accessibility pass**

```bash
git add src tests/accessibility-ui.test.tsx
git commit -m "feat: apply responsive workshop UI"
```

---

### Task 8: Add fail-closed bootstrap and user-facing load errors

**Files:**
- Create: `src/app/Bootstrap.tsx`
- Create: `tests/bootstrap.test.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: `loadKnowledge()` from Task 3.
- Produces `Bootstrap({ load?: typeof loadKnowledge }): JSX.Element` for deterministic tests.
- Loading copy may be short and neutral.
- Error copy must include: `No se pudo cargar CarpiNova Knowledge 1.0.0. Ejecuta la preparación del conocimiento y vuelve a intentar.`

- [ ] **Step 1: Write RED bootstrap success/error tests**

Assert a resolved repository renders the app. Assert a rejected load renders the exact user-facing error and does not render search/results against partial data.

- [ ] **Step 2: Write RED stale-version bootstrap test**

Feed the real loader a manifest with `knowledge_version != 1.0.0`; assert Bootstrap reaches the same fail-closed error state.

- [ ] **Step 3: Run bootstrap tests and verify RED**

Run: `npm test -- tests/bootstrap.test.tsx`

Expected: FAIL because Bootstrap does not exist.

- [ ] **Step 4: Implement Bootstrap and wire `src/main.tsx`**

Do not add retry loops, remote fetch fallback, cached stale Knowledge or GitHub access. A reload after fixing local preparation is sufficient for MVP 1.

- [ ] **Step 5: Run bootstrap/full tests and verify GREEN**

Run:

```bash
npm test -- tests/bootstrap.test.tsx
npm test
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit bootstrap handling**

```bash
git add src/app/Bootstrap.tsx src/main.tsx tests/bootstrap.test.tsx
git commit -m "feat: fail closed when Knowledge cannot load"
```

---

### Task 9: Document and execute the real local acceptance flow

**Files:**
- Create: `README.md`
- Create after real verification: `docs/verification/knowledge-explorer-mvp1-local.md`

**Interfaces:**
- README commands:
  - `npm ci`
  - `npm run knowledge:prepare -- --knowledge-root "<ruta-al-repo-CarpiNova-Knowledge>"`
  - `npm run dev`
  - `npm test`
  - `npm run typecheck`
  - `npm run build`
  - `npm run preview`
- Verification record identifies Knowledge version/source SHA and actual probe terms tested; it never claims a term is present if the generated bundle does not contain it.

- [ ] **Step 1: Write the local README**

Document prerequisites Node/npm + `uv`/Python as required by the sibling Knowledge repository, the default sibling-repo convention, explicit `--knowledge-root` override, localhost-only scope, and that `generated/` is disposable/reproducible.

- [ ] **Step 2: Run the complete automated suite from a clean install**

Run:

```bash
npm ci
npm test
npm run typecheck
npm run build
```

Expected: all commands exit `0`.

- [ ] **Step 3: Prepare the real canonical Knowledge bundle on the Windows workstation**

Run:

```bash
npm run knowledge:prepare -- --knowledge-root "<ruta-real-a-CarpiNova-Knowledge>"
```

Expected: `generated/knowledge/manifest.json` reports `knowledge_version=1.0.0`, `book_id=cpnc-2025`, `scope=BOOK`, canonical SHA exactly `318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c`, and all artifact hashes verify.

- [ ] **Step 4: Verify the bundle is not tracked**

Run:

```bash
git status --short
git check-ignore generated/knowledge/manifest.json
```

Expected: no Knowledge bundle appears as tracked/untracked work; `git check-ignore` confirms the ignore rule.

- [ ] **Step 5: Run the manual acceptance probes**

Start `npm run dev` and try `bisagras`, `correderas`, `MDF`, `tapacanto`, `gabinete` against the generated bundle. If a probe is absent from the actual 1.0.0 bundle, record that fact and replace it with another canonical present term of the same broad content class; never import taxonomy manually to make the test pass.

For every present probe, verify the path:

```text
buscar -> filtrar -> abrir ficha -> leer explicación/fallback -> abrir Ver fuente -> comprobar procedencia
```

- [ ] **Step 6: Verify preview and responsive acceptance**

Run:

```bash
npm run build
npm run preview
```

Repeat one successful search/detail/source path in preview mode and the `1440px`, `768px`, `390px` smoke check.

- [ ] **Step 7: Write the verification record**

Create `docs/verification/knowledge-explorer-mvp1-local.md` with date, branch/commit, Knowledge manifest identifiers, commands executed, automated results, actual manual probes and any remaining non-blocking observations. Do not record PASS for a check not actually run.

- [ ] **Step 8: Final scope/noise audit**

Compare the branch against the spec and confirm there is no backend, DB, Docker, auth, AI/vector search, dashboard, taxonomic duplication, figure regeneration, measurement/rule inference or Knowledge bundle committed to Git.

- [ ] **Step 9: Commit documentation/evidence**

```bash
git add README.md docs/verification/knowledge-explorer-mvp1-local.md
git commit -m "docs: verify Knowledge Explorer MVP 1"
```

---

## Final Verification Gate

Before claiming MVP completion, all of the following must be true:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run knowledge:prepare -- --knowledge-root "<ruta-real-a-CarpiNova-Knowledge>"
git check-ignore generated/knowledge/manifest.json
npm run preview
```

And the human-visible flow must complete against real Knowledge 1.0.0:

```text
abrir CarpiNova -> buscar -> filtrar -> abrir una ficha -> entender -> comprobar procedencia
```

A green synthetic test suite is not sufficient to claim the local MVP complete if the real canonical Knowledge preparation and acceptance flow have not been run.