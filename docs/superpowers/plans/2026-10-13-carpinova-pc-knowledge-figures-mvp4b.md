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

1. **Version drift:** `1.1.0` support must not accidentally allow `1.2.0` or weaken book/scope/source/hash checks. Task 1 and Task 2 pin this with explicit allowlists and negative tests.
2. **Legacy vs render-ready boundary:** a legacy figure missing camera/layers must load, while an opted-in malformed `normalized-2d-v1` must fail. Task 2 and Task 3 pin both sides.
3. **Reference integrity/order:** duplicate or missing figure IDs and repeated lesson references must never create ambiguous indexes, repeated diagrams, or empty support UI. Task 2 and Task 5 test these cases.
4. **SVG safety/accessibility:** annotation text must be React-escaped, painter order stable, and accessible naming must use `summary` then canonical `purpose`. Task 4 pins these behaviors.
5. **Fixture vs real bundle drift:** hand-built unit fixtures may pass while real Knowledge 1.0.0/1.1.0 differs. Task 6 runs the product against both exact real Knowledge revisions and a disposable real-bundle UI smoke.

---

## File Structure Map

### Existing files to modify

- `scripts/prepare-knowledge.mjs` — explicit dual-version preparation allowlist; preserve hash and atomic-install behavior.
- `src/app/Bootstrap.tsx` — version-neutral failure copy.
- `src/knowledge/types.ts` — minimal figure consumer types, supported-version type, `figures` / `figuresById`.
- `src/knowledge/loadKnowledge.ts` — dual-version runtime boundary; fetch/validate figures; indexes and cross-references.
- `src/features/lessons/LessonPage.tsx` — first-seen figure dedupe and support-figure placement.
- `src/styles/app.css` — minimal responsive figure styling using existing tokens.
- `tests/prepare-knowledge.test.ts` — preparation allowlist and invariant regression.
- `tests/bootstrap.test.tsx` — neutral error copy and later builder-fixture compatibility.
- `tests/knowledge-loader.test.ts` — runtime version/bundle/index/reference boundary.
- `tests/lesson-page.test.tsx` — one-time figure presentation and navigation regression.
- `tests/lesson-accessibility.test.tsx` — accessible lesson figure and existing keyboard/link regression.
- `tests/accessibility-ui.test.tsx`, `tests/content-page.test.tsx`, `tests/search-ui.test.tsx` — direct repository fixture compatibility only.

### New focused files

- `src/features/figures/FigureDiagram.tsx` — native React/SVG renderer for validated `normalized-2d-v1` only.
- `tests/figure-contract.test.ts` — render-contract boundary tests.
- `tests/figure-diagram.test.tsx` — renderer primitives/order/safety/accessibility.
- `docs/verification/knowledge-figures-mvp4b-local.md` — real 1.0.0/1.1.0 compatibility evidence.
- `docs/checkpoints/2026-10-13-knowledge-figures-mvp4b-candidate.md` — final candidate checkpoint.

No permanent workflow or dependency file should change.

---

### Task 1: Dual-version preparation boundary and neutral Bootstrap copy

**Files:**
- Modify: `scripts/prepare-knowledge.mjs`
- Modify: `src/app/Bootstrap.tsx`
- Modify: `tests/prepare-knowledge.test.ts`
- Modify: `tests/bootstrap.test.tsx`

**Interfaces:**
- Produces an explicit preparation allowlist containing only `"1.0.0"` and `"1.1.0"`.
- Preserves `validateManifest(manifest)`, `verifyArtifactHashes(bundleDir, manifest)`, and `prepareKnowledge(...)`.
- Produces exact UI copy: `No se pudo cargar CarpiNova Knowledge. Ejecuta la preparación del conocimiento y vuelve a intentar.`

- [ ] **Step 1: Open the implementation PR as draft before product mutation**

Create a draft PR from `design/knowledge-figures-mvp4b-20261013` to `main` titled `feat: MVP4B Knowledge figures compatibility`. Keep it draft throughout this plan unless a later explicit user decision says otherwise.

- [ ] **Step 2: Write RED preparation tests**

In `tests/prepare-knowledge.test.ts`, make the manifest helper accept field overrides and prove:

```ts
expect(() => validateManifest(manifest({ knowledge_version: "1.0.0" }))).not.toThrow();
expect(() => validateManifest(manifest({ knowledge_version: "1.1.0" }))).not.toThrow();
expect(() => validateManifest(manifest({ knowledge_version: "1.2.0" }))).toThrow("knowledge_version");
```

Keep explicit negative assertions for wrong `book_id`, `scope`, source SHA, missing artifact hashes, wrong hashes, and missing artifacts.

- [ ] **Step 3: Write RED Bootstrap-copy test**

In `tests/bootstrap.test.tsx`, require the exact neutral copy and assert `Knowledge 1.0.0` is absent from the error state.

Task 2 owns the later four-argument repository fixture update; do not pre-implement it here.

- [ ] **Step 4: Run Task 1 RED**

```bash
npm test -- tests/prepare-knowledge.test.ts tests/bootstrap.test.tsx
```

Expected: FAIL only because preparation still rejects `1.1.0` and Bootstrap still contains version-specific copy.

- [ ] **Step 5: Implement the preparation allowlist minimally**

In `scripts/prepare-knowledge.mjs`, define an explicit supported-version collection such as:

```js
export const SUPPORTED_KNOWLEDGE_VERSIONS = new Set(["1.0.0", "1.1.0"]);
```

`validateManifest(manifest)` checks membership and then preserves exact book/scope/source SHA and artifact-hash requirements. No semver package or range.

Make CLI success text version-neutral instead of claiming a single expected version.

- [ ] **Step 6: Make Bootstrap copy version-neutral**

Change only `KNOWLEDGE_LOAD_ERROR` to the approved text; preserve loading/error/ready behavior.

- [ ] **Step 7: Run focal GREEN**

```bash
npm test -- tests/prepare-knowledge.test.ts tests/bootstrap.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Run Task 1 regression checks**

```bash
npm test
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 9: Commit Task 1 explicitly**

```bash
git add scripts/prepare-knowledge.mjs src/app/Bootstrap.tsx tests/prepare-knowledge.test.ts tests/bootstrap.test.tsx
git commit -m "feat: accept supported Knowledge versions"
```

- [ ] **Step 10: CI/checkpoint gate and STOP**

Require exact-HEAD CI success. Record version tests, source/hash invariants, and draft PR state. STOP.

---

### Task 2: Runtime figure bundle, repository index, and cross-reference boundary

**Files:**
- Modify: `src/knowledge/types.ts`
- Modify: `src/knowledge/loadKnowledge.ts`
- Modify: `tests/knowledge-loader.test.ts`
- Modify fixture-only compatibility in: `tests/bootstrap.test.tsx`, `tests/lesson-accessibility.test.tsx`, `tests/lesson-page.test.tsx`, `tests/accessibility-ui.test.tsx`, `tests/content-page.test.tsx`, `tests/search-ui.test.tsx`

**Interfaces:**
- Produces `SupportedKnowledgeVersion = "1.0.0" | "1.1.0"`.
- Produces minimal types `FigurePrimitive`, `FigureBundle`, `FigureRecord`, `FigureEntity`, `FigureGeometry`, `FigureAnnotation`, `FigurePlacement`, `FigureLayer`, `FigureCamera`, `FigureReconstruction`, `FigurePoint`, `FigureBounds`.
- Changes builder signature to:

```ts
buildKnowledgeRepository(
  manifestValue: unknown,
  bundleValue: unknown,
  figuresValue: unknown,
  lessonsValue: unknown,
): KnowledgeRepository
```

- Produces repository fields `figures: FigureRecord[]` and `figuresById: Map<string, FigureRecord>`.
- Produces runtime fetch order with `/figures.bundle.json` before `/lessons.bundle.json`.

- [ ] **Step 1: Write RED loader fixtures for versions and figures**

Extend `tests/knowledge-loader.test.ts` with `figure(...)` and `figuresBundle(...)`. The generic legacy figure has canonical identity fields but no `render_contract`, camera, or layers.

Assert:

```text
1.0.0 accepted
1.1.0 accepted
1.2.0 rejected
figures bundle fetched
repository.figures contains figure
repository.figuresById resolves figure_id
```

- [ ] **Step 2: Write RED bundle/reference tests**

Reject:

```text
figures not array
figures.knowledge_version mismatch
figures.book_id mismatch
figures.scope mismatch
duplicate figure_id
figure page_id missing from pagesById
lesson figure_id missing from figuresById
```

Also prove a legacy figure without render contract/camera/layers loads.

- [ ] **Step 3: Write RED fetch-failure tests**

Missing or invalid JSON in `figures.bundle.json` must reject with the artifact named in the error.

- [ ] **Step 4: Run Task 2 RED**

```bash
npm test -- tests/knowledge-loader.test.ts
npm run typecheck
```

Expected: FAIL because figure types, fourth builder argument, fetch, and indexes do not exist.

- [ ] **Step 5: Add the minimal consumer types**

In `src/knowledge/types.ts` use exactly these decisions:

```ts
export type SupportedKnowledgeVersion = "1.0.0" | "1.1.0";
export type FigurePrimitive = "rect" | "line" | "polyline";

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

`FigurePrimitive` is the renderer allowlist; raw parsed geometry stays `string | null` until Task 3 validation narrows it. Change `KnowledgeManifest.knowledge_version` to `SupportedKnowledgeVersion` and extend `KnowledgeRepository` with `figures` / `figuresById`.

- [ ] **Step 6: Extend runtime manifest validation**

Use an explicit runtime version allowlist. Preserve exact book/scope/source SHA and file-hash-shape checks. No semver dependency.

- [ ] **Step 7: Implement generic figure-bundle parsing/indexing**

Internal validation must:

```text
validate optional bundle identity against manifest
require figures array
parse consumer fields
require non-empty unique figure_id
require page_id to resolve
build figuresById
```

Legacy figures remain accepted without camera/layers.

- [ ] **Step 8: Add lesson → figure cross-reference validation**

Pass `figuresById` into lesson validation. Every `step.figure_ids` value must resolve. Do not synthesize figures.

- [ ] **Step 9: Fetch the fourth runtime artifact**

`loadKnowledge()` fetches exactly:

```text
manifest.json
knowledge.bundle.json
figures.bundle.json
lessons.bundle.json
```

Then calls the four-argument builder in that order.

- [ ] **Step 10: Repair only affected fixtures**

All builder calls listed under Files receive an empty/fixture figures bundle as argument three.

Direct `KnowledgeRepository` fixtures in `accessibility-ui.test.tsx`, `content-page.test.tsx`, and `search-ui.test.tsx` gain only:

```ts
figures: [],
figuresById: new Map(),
```

No unrelated fixture refactor.

- [ ] **Step 11: Run focal GREEN and typecheck**

```bash
npm test -- tests/knowledge-loader.test.ts tests/bootstrap.test.tsx tests/lesson-page.test.tsx tests/lesson-accessibility.test.tsx tests/accessibility-ui.test.tsx tests/content-page.test.tsx tests/search-ui.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 12: Run full Task 2 regression**

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 13: Commit Task 2 explicitly**

```bash
git add src/knowledge/types.ts src/knowledge/loadKnowledge.ts tests/knowledge-loader.test.ts tests/bootstrap.test.tsx tests/lesson-accessibility.test.tsx tests/lesson-page.test.tsx tests/accessibility-ui.test.tsx tests/content-page.test.tsx tests/search-ui.test.tsx
git commit -m "feat: load Knowledge figure bundles"
```

- [ ] **Step 14: CI/checkpoint gate and STOP**

Require exact-HEAD CI success. Record supported versions, cross-reference behavior, and unchanged dependency/workflow files. STOP.

---

### Task 3: `normalized-2d-v1` consumer validation

**Files:**
- Modify: `src/knowledge/loadKnowledge.ts`
- Create: `tests/figure-contract.test.ts`

**Interfaces:**
- Consumes Task 2 figure types and four-argument builder.
- Produces the invariant that a record with `render_contract = normalized-2d-v1` is safe for `FigureDiagram`.
- Legacy/non-supported contracts remain valid but non-renderable.

- [ ] **Step 1: Write the compact render-ready fixture**

Include:

```text
render_contract = normalized-2d-v1
camera.coordinate_space = normalized_figure
viewport = {x:0,y:0,width:1,height:1}
non-empty layers
rect + line + polyline entities
visible annotation with placement
```

Do not copy full P0113.

- [ ] **Step 2: Write RED contract cases**

Independently reject:

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

Also prove legacy without render contract/camera/layers passes.

- [ ] **Step 3: Run RED**

```bash
npm test -- tests/figure-contract.test.ts
```

Expected: malformed render-ready cases currently pass or fail only generically.

- [ ] **Step 4: Implement internal render-contract validation**

Validate only consumer-critical structure:

```text
exact camera/viewport
non-empty layers
unique entity/annotation IDs
supported primitive names using FigurePrimitive allowlist
required finite primitive coordinates
layer local references
placement for annotations included in layers
```

Do not validate editorial/review semantics already owned by Knowledge.

- [ ] **Step 5: Run focal GREEN**

```bash
npm test -- tests/figure-contract.test.ts tests/knowledge-loader.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Run full regression**

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

Require exact-HEAD CI success. Record both legacy acceptance and render-ready fail-closed evidence. STOP.

---

### Task 4: Native React/SVG `FigureDiagram`

**Files:**
- Create: `src/features/figures/FigureDiagram.tsx`
- Create: `tests/figure-diagram.test.tsx`

**Interfaces:**
- Consumes `FigureRecord` already validated by Task 3.
- Produces:

```ts
import type { ReactElement } from "react";

export function FigureDiagram({
  figure,
}: {
  figure: FigureRecord;
}): ReactElement
```

- Defensively throws if called with a non-`normalized-2d-v1` record or unsupported/missing primitive data.

- [ ] **Step 1: Write RED primitive/accessibility tests**

Render one compact figure and assert:

```text
svg role = img
aria-label uses non-empty accessibility.summary
viewBox = "0 0 1000 1000"
preserveAspectRatio = "xMidYMid meet"
rect coordinates map ×1000
line points map ×1000
polyline points map ×1000
annotation appears as SVG text
```

Second case: empty/missing `summary` falls back exactly to `figure.purpose`.

- [ ] **Step 2: Write RED ordering/safety tests**

Layers deliberately out of order must render by:

```text
order ascending
then id stable tie-break
then each layer's member-array order
```

Annotation text containing `<script>&` must appear only as text content, never raw/executable markup.

Assert defensive failure for non-render contract and unknown primitive.

- [ ] **Step 3: Run renderer RED**

```bash
npm test -- tests/figure-diagram.test.tsx
```

Expected: FAIL because `FigureDiagram` does not exist.

- [ ] **Step 4: Implement native SVG only**

Rules:

```text
normalized coordinate × 1000
rect -> <rect>
line -> <line>
polyline -> <polyline>
annotation -> <text>
layer sorting deterministic
React text escaping only
```

Do not interpret interactions, educational sequence, measurements, precision, or visual-style metadata. No dependency addition.

- [ ] **Step 5: Run renderer GREEN**

```bash
npm test -- tests/figure-diagram.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Run full regression/build**

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

Require exact-HEAD CI success and confirm package files remain unchanged. STOP.

---

### Task 5: Lesson support figures, dedupe, and responsive presentation

**Files:**
- Modify: `src/features/lessons/LessonPage.tsx`
- Modify: `src/styles/app.css`
- Modify: `tests/lesson-page.test.tsx`
- Modify: `tests/lesson-accessibility.test.tsx`

**Interfaces:**
- Consumes `repository.figuresById`, `FigureDiagram`, and existing `LessonStep.figure_ids`.
- Produces selection rule: canonical step order → each `figure_ids` array order → first-seen dedupe → only exact `normalized-2d-v1`.
- Produces no support section when zero renderable figures remain.

- [ ] **Step 1: Write RED lesson fixture with repeated/order-sensitive figures**

Use:

```text
FIG-A = renderable normalized-2d-v1
FIG-LEGACY = legacy
FIG-B = renderable normalized-2d-v1
```

Reference across steps so `FIG-A` repeats and first-seen order is A, legacy, B.

- [ ] **Step 2: Write RED integration assertions**

Assert:

```text
support figure section exists when needed
A appears exactly once
B appears exactly once
renderable order A then B
legacy produces no placeholder
lesson heading unchanged
step order unchanged
Ver contenido href unchanged
returnTo remains /lecciones/:lessonId
```

A legacy-only lesson must create no support figure section.

- [ ] **Step 3: Write accessibility RED**

In `tests/lesson-accessibility.test.tsx`, include one render-ready figure and assert role `img` with the canonical Knowledge name; preserve existing keyboard/link assertions.

- [ ] **Step 4: Run Task 5 RED**

```bash
npm test -- tests/lesson-page.test.tsx tests/lesson-accessibility.test.tsx
```

Expected: FAIL because LessonPage ignores figures.

- [ ] **Step 5: Implement local first-seen dedupe**

Keep selection inside `LessonPage`; do not create a service. Visit ordered steps and `figure_ids ?? []`, keep unseen records whose contract is exactly `normalized-2d-v1`.

Missing refs require no UI fallback because Task 2 rejects them at load time.

- [ ] **Step 6: Render support figures before steps**

Only when the list is non-empty, render:

```text
className = lesson-page__figures
aria-label = Figuras de apoyo
```

One `FigureDiagram` per selected record. No figure route; no interaction execution.

- [ ] **Step 7: Add minimal responsive CSS**

Add only `.lesson-page__figures` and `.figure-diagram` rules. Reuse current surface/border/radius/shadow tokens. SVG: `display:block`, `width:100%`, `height:auto`.

- [ ] **Step 8: Run focal GREEN**

```bash
npm test -- tests/lesson-page.test.tsx tests/lesson-accessibility.test.tsx tests/figure-diagram.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 9: Run MVP1/MVP2/MVP3 regression**

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 10: Commit Task 5**

```bash
git add src/features/lessons/LessonPage.tsx src/styles/app.css tests/lesson-page.test.tsx tests/lesson-accessibility.test.tsx
git commit -m "feat: show Knowledge figures in guided lessons"
```

- [ ] **Step 11: CI/checkpoint gate and STOP**

Require exact-HEAD CI success. Record one-time rendering, ordering, legacy omission, accessibility, and navigation regression. STOP.

---

### Task 6: Real Knowledge 1.0.0 and 1.1.0 compatibility gate

**Files:**
- Create: `docs/verification/knowledge-figures-mvp4b-local.md`
- Temporary only, never commit: disposable Knowledge worktrees and disposable Vitest real-bundle smoke file.

**Interfaces:**
- Consumes exact Knowledge stable SHA `a47119aba3d4711c1ac69f33f7d236d9bc20bb78`.
- Consumes exact MVP4A candidate SHA `1eede2f0521451c011e0d41124fe0313289fa0eb`.
- Produces evidence that the same PC HEAD works against both.

- [ ] **Step 1: Create disposable Knowledge worktrees at exact SHAs**

```bash
git -C ../CarpiNova-Knowledge worktree add <tmp>/knowledge-1.0.0 a47119aba3d4711c1ac69f33f7d236d9bc20bb78
git -C ../CarpiNova-Knowledge worktree add <tmp>/knowledge-1.1.0 1eede2f0521451c011e0d41124fe0313289fa0eb
```

If absent locally, fetch exact SHAs without moving branch heads.

- [ ] **Step 2: Prepare real Knowledge 1.0.0**

```bash
npm run knowledge:prepare -- --knowledge-root <tmp>/knowledge-1.0.0
```

Require generated manifest:

```text
knowledge_version = 1.0.0
book_id = cpnc-2025
scope = BOOK
source SHA exact
```

Then run `npm test`, `npm run typecheck`, `npm run build` and require PASS.

- [ ] **Step 3: Run disposable 1.0.0 runtime/UI smoke**

In a disposable worktree/audit context, create an uncommitted Vitest test that reads the four real `generated/knowledge/*.json` files, calls the four-argument builder, mounts the real lesson route, and asserts:

```text
version = 1.0.0
LESSON-SLIDES-X-2X-PILOT resolves
existing lesson text/links render
legacy figure data does not cause load/render failure
```

Run it, record PASS, delete it, and verify no product diff remains.

- [ ] **Step 4: Prepare real Knowledge 1.1.0 candidate on the same PC HEAD**

```bash
npm run knowledge:prepare -- --knowledge-root <tmp>/knowledge-1.1.0
```

Require version `1.1.0` and identical book/scope/source identity.

- [ ] **Step 5: Run disposable 1.1.0 real-bundle UI smoke**

Using the same disposable pattern, assert:

```text
FIG-CPNC-2025-P0113-001 resolves exactly once in figuresById
render_contract = normalized-2d-v1
LESSON-SLIDES-X-2X-PILOT resolves
lesson route shows exactly one support figure for P0113
accessible name comes from real Knowledge
5 canonical lesson steps remain available
```

Delete the temporary test after PASS.

- [ ] **Step 6: Run full verification on real 1.1.0 prepared state**

```bash
npm test
npm run typecheck
npm run build
npm audit
```

Expected: all PASS.

- [ ] **Step 7: Write real-integration evidence**

Create `docs/verification/knowledge-figures-mvp4b-local.md` with PC HEAD, both exact Knowledge SHAs, manifest identities, real P0113 count/contract, real lesson figure count, command results, cleanup proof, and confirmation that Knowledge PR #31 remains draft/not merged.

- [ ] **Step 8: Commit evidence only**

```bash
git add docs/verification/knowledge-figures-mvp4b-local.md
git commit -m "docs: verify MVP4B Knowledge compatibility"
```

- [ ] **Step 9: CI/checkpoint gate and STOP**

Require exact-HEAD CI success and no temporary audit files. STOP.

---

### Task 7: Final candidate QA, diff audit, and handoff

**Files:**
- Create: `docs/checkpoints/2026-10-13-knowledge-figures-mvp4b-candidate.md`
- No product file should change here unless a verified regression is found; then STOP and return to the owning task.

**Interfaces:**
- Consumes all prior task evidence.
- Produces final status `MVP4B PC compatibility candidate PASS` only if every gate is green.
- Does not merge PC or Knowledge and does not mark Knowledge PR #31 ready.

- [ ] **Step 1: Run fresh full verification**

```bash
npm ci
npm test
npm run typecheck
npm run build
npm audit
```

Expected: all PASS.

- [ ] **Step 2: Audit final diff against exact MVP3 base**

Compare against `a34ac92647be87417d2163bc6824a801deffe778`.

Require no changes to:

```text
package.json
package-lock.json
.github/workflows/*
src/app/routes.tsx
ContentPage behavior
search architecture
Knowledge source data
CarpiNova-cell
```

Package/workflow changes are not expected and block closure unless a prior task explicitly proved necessity.

- [ ] **Step 3: Confirm architecture guardrails from the diff**

Verify absence of:

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

- [ ] **Step 4: Require complete real-integration evidence**

Task 6 must contain PASS for both exact Knowledge revisions plus real P0113/lesson smoke. Incomplete evidence blocks closure.

- [ ] **Step 5: Create the final checkpoint**

`docs/checkpoints/2026-10-13-knowledge-figures-mvp4b-candidate.md` records:

```text
final PC SHA
final CI run/job
full test count
typecheck/build/audit result
1.0.0 compatibility PASS
1.1.0 compatibility PASS
P0113 rendered once PASS
legacy omission PASS
KISS/anti-noise PASS
PC PR DRAFT / NOT MERGED
Knowledge PR #31 DRAFT / NOT MERGED
Knowledge public release still 1.0.0
next action = coordinated release decision
```

- [ ] **Step 6: Commit final checkpoint**

```bash
git add docs/checkpoints/2026-10-13-knowledge-figures-mvp4b-candidate.md
git commit -m "docs: close MVP4B compatibility candidate"
```

- [ ] **Step 7: Require final CI on the checkpoint HEAD**

Require existing CI test/typecheck/build success on exact HEAD. Re-run `npm audit` locally because current CI does not include it.

- [ ] **Step 8: Verify final PR states and STOP**

PC PR remains `OPEN / DRAFT / NOT MERGED`. Knowledge PR #31 remains `DRAFT / NOT MERGED`. Do not release Knowledge `1.1.0`.

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

Do not combine tasks after one `continua`.

## Expected End State

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
