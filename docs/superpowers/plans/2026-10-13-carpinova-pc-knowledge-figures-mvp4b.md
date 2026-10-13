# CarpiNova-PC Knowledge Figures MVP4B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make CarpiNova-PC consume both Knowledge `1.0.0` and the `1.1.0` candidate, load and validate `figures.bundle.json`, and render the first `normalized-2d-v1` technical figure once inside the existing guided lesson without introducing a general graphics or interaction engine.

**Architecture:** Extend the existing Knowledge preparation and runtime boundaries instead of adding parallel services. `KnowledgeRepository` gains `figures` / `figuresById`; a small React/SVG `FigureDiagram` renders only already-validated `normalized-2d-v1` records; `LessonPage` deduplicates step `figure_ids` in first-seen order and shows renderable support figures once before the steps.

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, native SVG, Vitest 5, Testing Library, Vite 7, Node 22. No new dependency.

**Spec:** `docs/superpowers/specs/2026-10-13-carpinova-pc-knowledge-figures-mvp4b-design.md`

## Global Constraints

- Follow KISS and anti-noise: `REUTILIZAR > SIMPLIFICAR > MEJORAR > CREAR`.
- Knowledge remains the only technical source of truth; PC must not invent geometry, annotations, measures, layer relationships, or interaction behavior.
- `UNRESOLVED > INVENTED`.
- Supported Knowledge versions are exactly `1.0.0` and `1.1.0`; `1.2.0` and any other unapproved version fail closed.
- `book_id` remains exactly `cpnc-2025`.
- `scope` remains exactly `BOOK`.
- source SHA-256 remains exactly `318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c`.
- Artifact hash verification in `scripts/prepare-knowledge.mjs` remains mandatory for `knowledge.bundle.json`, `figures.bundle.json`, and `lessons.bundle.json`.
- Legacy figures without `reconstruction.render_contract = normalized-2d-v1` remain valid and are silently omitted from figure UI.
- A figure that opts into `normalized-2d-v1` must fail closed if its consumer contract is malformed.
- Render only `rect`, `line`, `polyline`, and annotation text.
- No Canvas, Three.js, WebGL, renderer registry, plugin system, raw SVG injection, `dangerouslySetInnerHTML`, interaction runtime, animation, zoom/pan, 3D, CAD, backend, DB, accounts, progress, course engine, or CarpiNova-cell work.
- Keep Knowledge PR #31 `DRAFT / NOT MERGED`; MVP4B does not publish Knowledge `1.1.0`.
- Use TDD for every product change.
- Operational rule: one task → evidence/CI → checkpoint → STOP. A user `continua` authorizes only the next task.

## Review Focus

1. **Version drift:** `1.1.0` support must not accidentally allow `1.2.0` or weaken book/scope/source/hash checks. Task 1 and Task 2 pin this with explicit allowlist and negative tests.
2. **Legacy vs render-ready boundary:** a legacy figure missing camera/layers must load, while an opted-in malformed `normalized-2d-v1` must fail. Task 2 and Task 3 pin both sides.
3. **Reference integrity/order:** duplicate or missing figure IDs and repeated lesson references must never create ambiguous indexes, repeated diagrams, or empty support UI. Task 2 and Task 5 test these cases.
4. **SVG safety/accessibility:** annotation text must be React-escaped, painter order stable, and accessible naming must use `summary` then canonical `purpose`. Task 4 pins these behaviors.
5. **Fixture vs real bundle drift:** hand-built unit fixtures may pass while real Knowledge 1.0.0/1.1.0 differs. Task 6 runs the product against both exact real Knowledge revisions and a disposable real-bundle UI smoke.

---

## File Structure Map

### Existing files to modify

- `scripts/prepare-knowledge.mjs` — explicit dual-version preparation allowlist; keep existing hash and atomic-install behavior.
- `src/app/Bootstrap.tsx` — make the failure copy version-neutral.
- `src/knowledge/types.ts` — add minimal figure consumer types, supported-version type, and `figures` / `figuresById` repository fields.
- `src/knowledge/loadKnowledge.ts` — accept supported manifest versions, fetch/validate figures, build figure index, validate cross-references and render-contract safety.
- `src/features/lessons/LessonPage.tsx` — deduplicate renderable figures and place support figures before lesson steps.
- `src/styles/app.css` — minimal responsive support-figure/SVG presentation using existing design tokens.
- `tests/prepare-knowledge.test.ts` — preparation version allowlist and invariant regression.
- `tests/bootstrap.test.tsx` — neutral actionable error copy and updated repository fixture signature.
- `tests/knowledge-loader.test.ts` — runtime version/bundle/index/reference boundary.
- `tests/lesson-page.test.tsx` — one-time figure presentation, order, and existing navigation regression.
- `tests/lesson-accessibility.test.tsx` — updated builder fixture and lesson accessibility regression.
- `tests/accessibility-ui.test.tsx` — add empty figure repository fields to direct fixture.
- `tests/content-page.test.tsx` — add empty figure repository fields to direct fixture.
- `tests/search-ui.test.tsx` — add empty figure repository fields to direct fixture.

### New focused files

- `src/features/figures/FigureDiagram.tsx` — native React/SVG renderer for validated `normalized-2d-v1` only.
- `tests/figure-contract.test.ts` — focused malformed/legacy `normalized-2d-v1` loader tests.
- `tests/figure-diagram.test.tsx` — focused renderer ordering, primitives, safety, and accessibility tests.
- `docs/verification/knowledge-figures-mvp4b-local.md` — real 1.0.0 and 1.1.0 compatibility evidence.
- `docs/checkpoints/2026-10-13-knowledge-figures-mvp4b-candidate.md` — final MVP4B candidate checkpoint.

No permanent workflow or dependency file should change.

---

### Task 1: Dual-version preparation boundary and neutral bootstrap copy

**Files:**
- Modify: `scripts/prepare-knowledge.mjs`
- Modify: `src/app/Bootstrap.tsx`
- Modify: `tests/prepare-knowledge.test.ts`
- Modify: `tests/bootstrap.test.tsx`

**Interfaces:**
- Produces: preparation allowlist containing exactly `"1.0.0"` and `"1.1.0"`.
- Preserves: `validateManifest(manifest)`, `verifyArtifactHashes(bundleDir, manifest)`, and `prepareKnowledge(...)` public entry points.
- Produces UI copy: `No se pudo cargar CarpiNova Knowledge. Ejecuta la preparación del conocimiento y vuelve a intentar.`

- [ ] **Step 1: Open the implementation PR as draft before product mutation**

Create a draft PR from `design/knowledge-figures-mvp4b-20261013` to `main` titled `feat: MVP4B Knowledge figures compatibility`. Keep it draft throughout the plan unless a later explicit user decision says otherwise.

- [ ] **Step 2: Write RED preparation tests**

In `tests/prepare-knowledge.test.ts`, replace the single-version assertion with tests that prove:

```ts
expect(() => validateManifest(manifest({ knowledge_version: "1.0.0" }))).not.toThrow();
expect(() => validateManifest(manifest({ knowledge_version: "1.1.0" }))).not.toThrow();
expect(() => validateManifest(manifest({ knowledge_version: "1.2.0" }))).toThrow("knowledge_version");
```

Keep explicit negative assertions for wrong `book_id`, `scope`, source SHA, missing artifact hashes, wrong artifact hashes, and missing artifacts.

Adjust the fixture helper to accept overrides without weakening those invariants.

- [ ] **Step 3: Write RED bootstrap-copy test**

In `tests/bootstrap.test.tsx`, set the expected copy exactly to:

```text
No se pudo cargar CarpiNova Knowledge. Ejecuta la preparación del conocimiento y vuelve a intentar.
```

Assert the old substring `Knowledge 1.0.0` is absent from the error state.

When the builder signature later changes, Task 2 will add the figures argument; do not pre-implement that here.

- [ ] **Step 4: Run the Task 1 RED tests**

Run:

```bash
npm test -- tests/prepare-knowledge.test.ts tests/bootstrap.test.tsx
```

Expected: FAIL only because preparation still rejects `1.1.0` and Bootstrap still contains version-specific copy.

- [ ] **Step 5: Implement the preparation allowlist minimally**

In `scripts/prepare-knowledge.mjs` define an explicit value such as:

```js
export const SUPPORTED_KNOWLEDGE_VERSIONS = new Set(["1.0.0", "1.1.0"]);
```

`validateManifest(manifest)` must check membership, then continue enforcing exact book/scope/source SHA and artifact hashes exactly as before. Do not use semver ranges.

Remove any CLI success text that falsely claims a single expected version; success output may be version-neutral.

- [ ] **Step 6: Make Bootstrap copy version-neutral**

Keep the existing fail-closed UI state and change only `KNOWLEDGE_LOAD_ERROR` to the exact approved neutral text.

- [ ] **Step 7: Run focal GREEN tests**

Run:

```bash
npm test -- tests/prepare-knowledge.test.ts tests/bootstrap.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Run Task 1 regression checks**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: PASS with the same application behavior except the approved version compatibility at prepare boundary and neutral error copy.

- [ ] **Step 9: Commit Task 1**

```bash
git add scripts/prepare-knowledge.mjs src/app/Bootstrap.tsx tests/prepare-knowledge.test.ts tests/bootstrap.test.tsx
git commit -m "feat: accept supported Knowledge versions"
```

- [ ] **Step 10: CI/checkpoint gate and STOP**

Require exact-HEAD CI success. Record version tests, hash/source invariants, and draft PR state. STOP; do not start Task 2 until the next `continua`.

---

### Task 2: Runtime figure bundle, repository index, and cross-reference boundary

**Files:**
- Modify: `src/knowledge/types.ts`
- Modify: `src/knowledge/loadKnowledge.ts`
- Modify: `tests/knowledge-loader.test.ts`
- Modify fixture-only compatibility in: `tests/bootstrap.test.tsx`, `tests/lesson-accessibility.test.tsx`, `tests/lesson-page.test.tsx`, `tests/accessibility-ui.test.tsx`, `tests/content-page.test.tsx`, `tests/search-ui.test.tsx`

**Interfaces:**
- Produces: `SupportedKnowledgeVersion = "1.0.0" | "1.1.0"`.
- Produces minimal types: `FigureBundle`, `FigureRecord`, `FigureEntity`, `FigureGeometry`, `FigureAnnotation`, `FigurePlacement`, `FigureLayer`, `FigureCamera`, `FigureReconstruction`, `FigurePoint`, `FigureBounds`.
- Changes builder signature to:

```ts
buildKnowledgeRepository(
  manifestValue: unknown,
  bundleValue: unknown,
  figuresValue: unknown,
  lessonsValue: unknown,
): KnowledgeRepository
```

- Produces repository fields:

```ts
figures: FigureRecord[];
figuresById: Map<string, FigureRecord>;
```

- Produces runtime fetch order containing `/figures.bundle.json` before `/lessons.bundle.json`.

- [ ] **Step 1: Write RED loader fixtures for dual versions and figures**

Extend `tests/knowledge-loader.test.ts` with `figure(...)` and `figuresBundle(...)` fixture helpers. The generic legacy fixture must include canonical minimum identity fields but no `render_contract`.

Add assertions proving:

```text
1.0.0 manifest accepted
1.1.0 manifest accepted
1.2.0 rejected
figures bundle fetched
repository.figures contains record
repository.figuresById resolves figure_id
```

- [ ] **Step 2: Write RED bundle identity/integrity tests**

Add focused tests that reject:

```text
figures not array
figures.knowledge_version mismatch
figures.book_id mismatch
figures.scope mismatch
duplicate figure_id
figure page_id missing from pagesById
lesson figure_id missing from figuresById
```

Also add a positive test that a legacy figure without `render_contract`, camera, or layers loads successfully.

- [ ] **Step 3: Write RED fetch failure tests**

Update runtime fetch tests so missing or invalid JSON in `figures.bundle.json` rejects with a message naming that artifact, just as lessons currently do.

- [ ] **Step 4: Run Task 2 RED**

Run:

```bash
npm test -- tests/knowledge-loader.test.ts
npm run typecheck
```

Expected: tests/typecheck fail because figure types, fourth builder argument, figure fetch, and indexes do not yet exist.

- [ ] **Step 5: Add minimal consumer figure types**

In `src/knowledge/types.ts` add only fields consumed by validation/rendering. Use permissive optional geometry members for legacy compatibility rather than duplicating the Knowledge JSON Schema.

Required shape decisions:

```ts
export type SupportedKnowledgeVersion = "1.0.0" | "1.1.0";

export interface FigurePoint { x: number; y: number }
export interface FigureBounds { x: number; y: number; width: number; height: number }
export interface FigurePlacement { x: number; y: number; precision?: string }
export interface FigureGeometry {
  primitive?: string | null;
  precision?: string;
  bounds?: FigureBounds;
  points?: FigurePoint[];
}
export interface FigureEntity { id: string; type: string; geometry: FigureGeometry }
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
export interface FigureReconstruction { render_contract?: string }
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
```

Change `KnowledgeManifest.knowledge_version` to `SupportedKnowledgeVersion` and extend `KnowledgeRepository` with `figures` and `figuresById`.

- [ ] **Step 6: Extend runtime manifest validation without weakening invariants**

In `src/knowledge/loadKnowledge.ts`, use an explicit set of supported versions. Keep exact `book_id`, `scope`, source SHA and file-hash shape checks.

Do not import or add a semver package.

- [ ] **Step 7: Implement generic figure-bundle parsing/indexing**

Add internal validation functions that:

```text
validate optional bundle identity fields against manifest
require figures array
parse canonical consumer fields
require non-empty unique figure_id
require page_id to resolve
build figuresById
```

At this task, legacy figures remain accepted even when camera/layers are absent.

- [ ] **Step 8: Add lesson → figure cross-reference validation**

Pass `figuresById` into lesson validation. Every `step.figure_ids` value must resolve; no inference or synthetic record is allowed.

- [ ] **Step 9: Fetch `figures.bundle.json` in `loadKnowledge()`**

Fetch exactly:

```text
manifest.json
knowledge.bundle.json
figures.bundle.json
lessons.bundle.json
```

Call the four-argument `buildKnowledgeRepository(...)` in that order.

- [ ] **Step 10: Repair only test fixtures affected by the explicit repository contract**

Update all builder calls listed under Files to pass an empty/fixture figures bundle as the third argument.

For direct `KnowledgeRepository` object fixtures in `accessibility-ui.test.tsx`, `content-page.test.tsx`, and `search-ui.test.tsx`, add:

```ts
figures: [],
figuresById: new Map(),
```

Do not refactor unrelated fixture structure.

- [ ] **Step 11: Run focal GREEN and typecheck**

Run:

```bash
npm test -- tests/knowledge-loader.test.ts tests/bootstrap.test.tsx tests/lesson-page.test.tsx tests/lesson-accessibility.test.tsx tests/accessibility-ui.test.tsx tests/content-page.test.tsx tests/search-ui.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 12: Run full Task 2 regression**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 13: Commit Task 2**

Commit only the loader/types and fixture changes:

```bash
git commit -am "feat: load Knowledge figure bundles"
```

If a new file was unexpectedly needed, STOP and justify it before including it.

- [ ] **Step 14: CI/checkpoint gate and STOP**

Require exact-HEAD CI success. Record supported versions, figure counts in fixtures, cross-reference behavior, and unchanged dependency/workflow files. STOP.

---

### Task 3: `normalized-2d-v1` consumer validation

**Files:**
- Modify: `src/knowledge/loadKnowledge.ts`
- Create: `tests/figure-contract.test.ts`

**Interfaces:**
- Consumes: `FigureRecord` / `FigureLayer` / geometry types and four-argument builder from Task 2.
- Produces internal validator behavior: legacy figures pass untouched; `normalized-2d-v1` figures are guaranteed safe for `FigureDiagram`.
- No new public service or repository type.

- [ ] **Step 1: Write a reusable render-ready figure fixture in the new test file**

Fixture contract must include:

```text
render_contract = normalized-2d-v1
camera.coordinate_space = normalized_figure
viewport = {x:0,y:0,width:1,height:1}
non-empty layers
rect + line + polyline entities
visible annotation with placement
```

Keep it small; do not copy all of P0113.

- [ ] **Step 2: Write RED contract tests**

Using `buildKnowledgeRepository(...)`, prove that an opted-in figure rejects each of these independently:

```text
missing camera
wrong coordinate_space
viewport not exactly 0/0/1/1
missing/empty layers
unsupported primitive
rect missing finite bounds
line not exactly 2 finite points
polyline fewer than 2 finite points
broken layer entity ref
broken layer annotation ref
visible annotation missing placement
duplicate entity id
duplicate annotation id
```

Also prove a legacy figure with no render contract and no camera/layers still passes.

- [ ] **Step 3: Run RED**

Run:

```bash
npm test -- tests/figure-contract.test.ts
```

Expected: render-ready malformed cases currently pass or fail for the wrong generic reason.

- [ ] **Step 4: Implement internal `normalized-2d-v1` validation**

In `src/knowledge/loadKnowledge.ts`, validate only consumer-critical structure:

```text
exact camera contract
non-empty layers
unique local entity/annotation IDs
supported primitive names
required numeric coordinates for the selected primitive
layer local references
annotation placement for annotations included in layers
```

Do not reproduce editorial fields or Knowledge review semantics.

A contract other than `normalized-2d-v1` is treated as non-renderable legacy for MVP4B unless a later spec explicitly supports it.

- [ ] **Step 5: Run focal GREEN**

Run:

```bash
npm test -- tests/figure-contract.test.ts tests/knowledge-loader.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Run full regression**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit Task 3**

```bash
git add src/knowledge/loadKnowledge.ts tests/figure-contract.test.ts
git commit -m "feat: validate render-ready Knowledge figures"
```

- [ ] **Step 8: CI/checkpoint gate and STOP**

Require exact-HEAD CI success and document that legacy acceptance and render-ready fail-closed behavior both pass. STOP.

---

### Task 4: Native React/SVG `FigureDiagram`

**Files:**
- Create: `src/features/figures/FigureDiagram.tsx`
- Create: `tests/figure-diagram.test.tsx`

**Interfaces:**
- Consumes: `FigureRecord` already validated by Task 3.
- Produces:

```ts
export function FigureDiagram({ figure }: { figure: FigureRecord }): JSX.Element
```

- Defensive contract: throws if called with a non-`normalized-2d-v1` record or unsupported/missing primitive data.

- [ ] **Step 1: Write RED primitive/accessibility tests**

Render one compact figure and assert:

```text
svg role = img
aria-label uses non-empty accessibility.summary
viewBox = "0 0 1000 1000"
preserveAspectRatio = "xMidYMid meet"
rect coordinates map x/y/width/height ×1000
line two points map ×1000
polyline points map ×1000
annotation text is present as an SVG text node
```

Add a second test where `summary = ""` and assert accessible name falls back exactly to `figure.purpose`.

- [ ] **Step 2: Write RED ordering/safety tests**

Use layers intentionally out of order and assert rendered SVG child primitive/text sequence follows:

```text
layer.order ascending
then layer.id stable tie-break
then each layer's entity_ids / annotation_ids array order
```

Use annotation text containing `<script>&` and assert it appears as text content, not executable/raw markup.

Assert defensive failure for a non-render contract or unknown primitive.

- [ ] **Step 3: Run renderer RED**

Run:

```bash
npm test -- tests/figure-diagram.test.tsx
```

Expected: FAIL because `FigureDiagram` does not exist.

- [ ] **Step 4: Implement `FigureDiagram` with native SVG only**

Rules:

```text
normalized coordinate * 1000
rect -> <rect>
line -> <line>
polyline -> <polyline>
annotation -> <text>
layer sorting deterministic
React text escaping only
```

Do not interpret `interaction`, `educational_sequence`, measurements, precision metadata, or visual-style metadata.

No new dependency.

- [ ] **Step 5: Run renderer GREEN**

Run:

```bash
npm test -- tests/figure-diagram.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Run full regression/build**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit Task 4**

```bash
git add src/features/figures/FigureDiagram.tsx tests/figure-diagram.test.tsx
git commit -m "feat: render normalized Knowledge figures"
```

- [ ] **Step 8: CI/checkpoint gate and STOP**

Require exact-HEAD CI success. Confirm no package files changed. STOP.

---

### Task 5: Lesson support figures, deduplication, responsive presentation

**Files:**
- Modify: `src/features/lessons/LessonPage.tsx`
- Modify: `src/styles/app.css`
- Modify: `tests/lesson-page.test.tsx`
- Modify: `tests/lesson-accessibility.test.tsx`

**Interfaces:**
- Consumes: `repository.figuresById`, `FigureDiagram`, and existing `LessonStep.figure_ids`.
- Produces lesson selection rule:

```text
steps in canonical validated order
→ figure_ids in array order
→ first-seen dedupe
→ keep only render_contract === normalized-2d-v1
```

- Produces UI section only when at least one renderable figure exists.

- [ ] **Step 1: Write RED lesson fixture with repeated and ordered figures**

In `tests/lesson-page.test.tsx`, extend the fixture to contain:

```text
FIG-A = renderable normalized-2d-v1
FIG-LEGACY = non-renderable legacy
FIG-B = renderable normalized-2d-v1
```

Reference them across multiple steps so `FIG-A` repeats and first-seen order is `FIG-A`, `FIG-LEGACY`, `FIG-B`.

- [ ] **Step 2: Write RED lesson integration assertions**

Assert:

```text
support figure section exists when renderable figures exist
FIG-A diagram appears exactly once
FIG-B diagram appears exactly once
renderable diagram order is A then B
legacy figure creates no placeholder
lesson heading remains unchanged
step heading order remains unchanged
"Ver contenido" href remains unchanged
returnTo state remains /lecciones/:lessonId
```

Add a legacy-only lesson case asserting the support figure section is absent entirely.

- [ ] **Step 3: Extend accessibility test RED**

In `tests/lesson-accessibility.test.tsx`, include one render-ready support figure and assert it is discoverable by role `img` with the canonical Knowledge accessible name. Preserve existing keyboard/link assertions.

- [ ] **Step 4: Run Task 5 RED**

Run:

```bash
npm test -- tests/lesson-page.test.tsx tests/lesson-accessibility.test.tsx
```

Expected: FAIL because LessonPage does not consume figures.

- [ ] **Step 5: Implement first-seen dedupe in `LessonPage`**

Keep the algorithm local to `LessonPage`; do not create a selection service.

For each ordered step, visit its `figure_ids ?? []`. Add each unseen ID once, look it up in `figuresById`, and include it only if its render contract is exactly `normalized-2d-v1`.

Missing IDs should already be impossible because Task 2 loader fails closed; do not invent fallback records.

- [ ] **Step 6: Render support figures once before the ordered list**

When the deduped list is non-empty, render a section with:

```text
className = lesson-page__figures
aria-label = Figuras de apoyo
```

Render one `<FigureDiagram>` per selected record. Do not add a `/figuras/:id` route and do not render step interactions.

- [ ] **Step 7: Add minimal responsive CSS**

In `src/styles/app.css`, add only selectors needed for:

```text
.lesson-page__figures
.figure-diagram
```

Use existing `--surface`, `--border`, `--radius`, `--shadow`, and text variables. SVG must be `display:block`, `width:100%`, `height:auto`; do not hardcode a separate visual theme.

- [ ] **Step 8: Run focal GREEN**

Run:

```bash
npm test -- tests/lesson-page.test.tsx tests/lesson-accessibility.test.tsx tests/figure-diagram.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 9: Run MVP1/MVP2/MVP3 regression suite**

Run:

```bash
npm test
npm run build
```

Expected: PASS; search/content/home/lesson navigation remains green.

- [ ] **Step 10: Commit Task 5**

```bash
git add src/features/lessons/LessonPage.tsx src/styles/app.css tests/lesson-page.test.tsx tests/lesson-accessibility.test.tsx
git commit -m "feat: show Knowledge figures in guided lessons"
```

- [ ] **Step 11: CI/checkpoint gate and STOP**

Require exact-HEAD CI success and record one-time rendering, order, legacy omission, accessibility, and navigation regression. STOP.

---

### Task 6: Real Knowledge 1.0.0 and 1.1.0 compatibility gate

**Files:**
- Create: `docs/verification/knowledge-figures-mvp4b-local.md`
- Temporary only, never commit: disposable Knowledge worktrees and a disposable Vitest real-bundle smoke file.

**Interfaces:**
- Consumes exact Knowledge revisions:
  - stable 1.0.0: `a47119aba3d4711c1ac69f33f7d236d9bc20bb78`
  - MVP4A 1.1.0 candidate: `1eede2f0521451c011e0d41124fe0313289fa0eb`
- Produces evidence that the same PC HEAD works with both.

- [ ] **Step 1: Create two disposable Knowledge worktrees from exact SHAs**

Use `git worktree` from a local `CarpiNova-Knowledge` clone; do not move its main working tree:

```bash
git -C ../CarpiNova-Knowledge worktree add <tmp>/knowledge-1.0.0 a47119aba3d4711c1ac69f33f7d236d9bc20bb78
git -C ../CarpiNova-Knowledge worktree add <tmp>/knowledge-1.1.0 1eede2f0521451c011e0d41124fe0313289fa0eb
```

If exact SHAs are unavailable locally, fetch them without changing branch heads.

- [ ] **Step 2: Prepare stable Knowledge 1.0.0 with the MVP4B PC branch**

Run:

```bash
npm run knowledge:prepare -- --knowledge-root <tmp>/knowledge-1.0.0
```

Inspect `generated/knowledge/manifest.json` and require:

```text
knowledge_version = 1.0.0
book_id = cpnc-2025
scope = BOOK
source SHA exact
```

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 3: Run a disposable real-bundle 1.0.0 runtime smoke**

In a disposable worktree/audit context, create an uncommitted Vitest file that reads the four `generated/knowledge/*.json` files, calls the real four-argument `buildKnowledgeRepository(...)`, mounts the real lesson route, and asserts:

```text
repository.manifest.knowledge_version = 1.0.0
LESSON-SLIDES-X-2X-PILOT resolves
existing lesson text/links render
no failure occurs because figures are legacy
```

Run it, record PASS, then delete the temporary file and verify clean product diff.

- [ ] **Step 4: Prepare candidate Knowledge 1.1.0 on the same PC HEAD**

Run:

```bash
npm run knowledge:prepare -- --knowledge-root <tmp>/knowledge-1.1.0
```

Require manifest version `1.1.0` and the same exact book/scope/source identity.

- [ ] **Step 5: Run a disposable real-bundle 1.1.0 UI smoke**

Using the same temporary-test pattern, assert from real generated JSON:

```text
FIG-CPNC-2025-P0113-001 resolves exactly once in figuresById
render_contract = normalized-2d-v1
LESSON-SLIDES-X-2X-PILOT resolves
lesson route exposes exactly one support figure for P0113
support figure accessible name comes from real Knowledge
5 canonical lesson steps remain available
```

Delete the temporary test after recording PASS.

- [ ] **Step 6: Run full PC verification on the real 1.1.0 prepared state**

Run:

```bash
npm test
npm run typecheck
npm run build
npm audit
```

Expected: all PASS, audit reports no unresolved vulnerability requiring a dependency mutation in this MVP.

- [ ] **Step 7: Write verification evidence**

Create `docs/verification/knowledge-figures-mvp4b-local.md` recording:

```text
PC HEAD
Knowledge 1.0.0 exact SHA + manifest result
Knowledge 1.1.0 exact SHA + manifest result
real P0113 count/contract
real lesson figure count
commands/results
temporary smoke removed
Knowledge PR #31 still draft/not merged
```

- [ ] **Step 8: Commit evidence only**

```bash
git add docs/verification/knowledge-figures-mvp4b-local.md
git commit -m "docs: verify MVP4B Knowledge compatibility"
```

- [ ] **Step 9: CI/checkpoint gate and STOP**

Require exact-HEAD CI success after the evidence commit and a clean diff with no temporary audit files. STOP.

---

### Task 7: Final candidate QA, diff audit, and handoff to coordinated release decision

**Files:**
- Create: `docs/checkpoints/2026-10-13-knowledge-figures-mvp4b-candidate.md`
- No product file should change unless a verified regression is discovered; if one is discovered, STOP and return to its owning task instead of patching here.

**Interfaces:**
- Consumes all prior task evidence.
- Produces final status `MVP4B PC compatibility candidate PASS` only if every gate below is green.
- Does not merge PC or Knowledge and does not mark Knowledge PR #31 ready.

- [ ] **Step 1: Run fresh full verification from final product HEAD**

Run:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm audit
```

Expected: all PASS.

- [ ] **Step 2: Audit the branch diff against exact MVP3 base**

Compare against:

`a34ac92647be87417d2163bc6824a801deffe778`

Require no changes to:

```text
package.json
package-lock.json
.github/workflows/*
routes.tsx
ContentPage behavior
search architecture
Knowledge source data
CarpiNova-cell
```

unless a prior task explicitly and evidentially required them. Package/workflow changes are not expected and should block closure.

- [ ] **Step 3: Confirm architectural guardrails**

Search the final diff and verify absence of:

```text
Three.js
WebGL
Canvas renderer
renderer registry
plugin architecture
dangerouslySetInnerHTML
raw SVG injection
interaction execution
figure standalone route
backend/state service
```

- [ ] **Step 4: Re-read Task 6 real-integration evidence**

Require both exact Knowledge revisions and real P0113/lesson smoke to be recorded as PASS. If evidence is incomplete, do not claim MVP4B PASS.

- [ ] **Step 5: Create the final candidate checkpoint**

`docs/checkpoints/2026-10-13-knowledge-figures-mvp4b-candidate.md` must record:

```text
final PC SHA
final CI run/job
full test count
TypeScript/build/audit result
1.0.0 compatibility PASS
1.1.0 candidate compatibility PASS
P0113 rendered once PASS
legacy omission PASS
KISS/anti-noise PASS
PC PR state DRAFT / NOT MERGED
Knowledge PR #31 DRAFT / NOT MERGED
Knowledge public release still 1.0.0
next action = coordinated release decision, not automatic release
```

- [ ] **Step 6: Commit final checkpoint**

```bash
git add docs/checkpoints/2026-10-13-knowledge-figures-mvp4b-candidate.md
git commit -m "docs: close MVP4B compatibility candidate"
```

- [ ] **Step 7: Require final CI on documentation HEAD**

Wait for the exact checkpoint HEAD CI. Require test, typecheck, and build success. Re-run `npm audit` locally if CI does not include it.

- [ ] **Step 8: Final PR state and STOP**

Verify the PC PR remains `OPEN / DRAFT / NOT MERGED`. Verify Knowledge PR #31 remains `DRAFT / NOT MERGED`. Do not release Knowledge `1.1.0` in this task.

STOP and ask for the separate coordinated release decision.

---

## Expected Task Sequence

```text
Task 1 — preparation/version boundary + Bootstrap copy
Task 2 — runtime figure bundle/index + references
Task 3 — normalized-2d-v1 validation
Task 4 — native React/SVG renderer
Task 5 — lesson integration + responsive UI
Task 6 — real Knowledge 1.0.0 / 1.1.0 integration
Task 7 — final QA/checkpoint/handoff
```

Each task is independently reviewable. Do not combine tasks after a single `continua`.

## Expected End State

If every task passes:

```text
CarpiNova-PC accepts exact Knowledge 1.0.0 and 1.1.0
figures.bundle.json is a first-class runtime artifact
KnowledgeRepository exposes figures / figuresById
legacy figures stay valid but non-rendered
normalized-2d-v1 fails closed when malformed
FigureDiagram renders only native SVG primitives from Knowledge
P0113 appears once in the guided lesson
MVP1/MVP2/MVP3 stay green
real 1.0.0 and 1.1.0 compatibility is proven
no dependency or graphics-engine expansion occurred
PC candidate remains unmerged pending user decision
Knowledge 1.1.0 remains unreleased pending coordinated decision
```
