# CarpiNova-PC Guided Lesson MVP 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consumir la primera lección guiada canónica de CarpiNova-Knowledge 1.0.0 en CarpiNova-PC, presentarla paso a paso y conservar navegación/procedencia sin duplicar conocimiento ni abrir un motor general de cursos.

**Architecture:** `CarpiNova-Knowledge` continúa siendo la única fuente de verdad. `CarpiNova-PC` amplía el `KnowledgeRepository` existente para cargar `lessons.bundle.json`, indexar lecciones por ID y representar una lección con una sola ruta nueva. La UI reutiliza `KnowledgeContext`, `ContentRecord`, `contentById`, `selectPrimaryText(...)`, `ContentPage`, React Router y CSS existente; no se crea backend, contexto adicional, motor de cursos ni soporte de figuras/interacciones.

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, Vite 7, Vitest 5, Testing Library, CarpiNova-Knowledge 1.0.0 local-first.

**Spec:** `docs/superpowers/specs/2026-10-13-carpinova-pc-guided-lesson-mvp3-design.md`

## Global Constraints

- Base de trabajo: `main` cerrado en `27cb3e3346db041084898e633724861f9f8501c6`; rama MVP3: `design/guided-lesson-mvp3-20261013`.
- Knowledge esperado: `knowledge_version=1.0.0`, `book_id=cpnc-2025`, `scope=BOOK`.
- Fuente exacta: SHA-256 `318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c`.
- Gate obligatorio antes de código de producto: el `generated/knowledge/lessons.bundle.json` real debe contener `LESSON-SLIDES-X-2X-PILOT` con exactamente 5 pasos.
- Si el gate no pasa: STOP. No hardcodear la lección, no copiar `lessons/pilot` a PC y no continuar la implementación.
- KISS / cero ruido: `REUTILIZAR > SIMPLIFICAR > MEJORAR > CREAR`; no añadir dependencias nuevas salvo necesidad demostrada.
- `UNRESOLVED > INVENTED`: datos de Knowledge inválidos fallan cerrados; PC no completa relaciones ni contenido manualmente.
- No cargar `figures.bundle.json` en runtime en MVP3; su integridad continúa comprobada por `prepare-knowledge.mjs`.
- `interaction` se conserva como `Record<string, unknown>` y no se ejecuta ni representa.
- Nueva ruta única: `/lecciones/:lessonId`.
- Fuera de alcance: progreso, cuentas, favoritos, recomendaciones, IA, backend, base de datos, Cell, CAD/3D, figuras, overlays, interacciones y course engine.
- TDD obligatorio: RED verificable → GREEN mínimo → regresión focal → commit de un propósito.
- No crear una factory/helper global de fixtures solo para añadir lecciones; actualizar directamente los pocos repositorios de prueba existentes.

## Review Focus

- `lessons.bundle.json` ausente, 404 o JSON inválido debe mantener el bootstrap fail-closed; nunca iniciar la app sin contrato de lecciones válido.
- `knowledge_version`, `book_id` o `scope` incompatible entre lessons y manifest debe rechazarse antes de construir `KnowledgeRepository`.
- Cualquier `source_content_ids` o `steps[].content_ids` inexistente debe fallar cerrado; la UI nunca omite silenciosamente una referencia rota.
- Orden de pasos: solo enteros positivos y únicos; se ordenan ascendentemente, pero los huecos numéricos son válidos y no se rellenan.
- `returnTo` manipulado o externo no puede convertirse en navegación arbitraria; solo `/buscar`, `/buscar?...` y `/lecciones/<segmento>` son retornos aceptados.

---

### Task 0: Probar el artefacto BOOK real antes de modificar producto

**Files:**
- Read only: `scripts/prepare-knowledge.mjs`
- Read only: `../CarpiNova-Knowledge/**`
- Generated/ignored: `generated/knowledge/manifest.json`
- Generated/ignored: `generated/knowledge/lessons.bundle.json`

**Interfaces:**
- Consumes: `npm run knowledge:prepare -- --knowledge-root ../CarpiNova-Knowledge`.
- Produces: evidencia local de que `LESSON-SLIDES-X-2X-PILOT` existe en BOOK 1.0.0 y contiene 5 pasos; habilita Task 1.

- [ ] **Step 1: Confirmar que ambos repositorios están en los estados esperados**

Run:

```bash
git status --short
git rev-parse HEAD
git -C ../CarpiNova-Knowledge status --short
git -C ../CarpiNova-Knowledge rev-parse HEAD
```

Expected: PC limpio sobre la rama MVP3; Knowledge limpio y en el SHA canónico `a47119aba3d4711c1ac69f33f7d236d9bc20bb78` o un estado posterior explícitamente auditado antes de continuar.

- [ ] **Step 2: Preparar el Knowledge BOOK real**

Run:

```bash
npm ci
npm run knowledge:prepare -- --knowledge-root ../CarpiNova-Knowledge
```

Expected: salida `CarpiNova Knowledge 1.0.0 prepared ...`; `generated/knowledge/manifest.json` declara `knowledge_version=1.0.0`, `book_id=cpnc-2025`, `scope=BOOK`.

- [ ] **Step 3: Verificar la lección canónica exacta**

Run:

```bash
node -e "const fs=require('fs');const b=JSON.parse(fs.readFileSync('generated/knowledge/lessons.bundle.json','utf8'));const l=b.lessons.find(x=>x.lesson_id==='LESSON-SLIDES-X-2X-PILOT');if(!l||l.steps.length!==5)process.exit(1);console.log(l.lesson_id,l.steps.length,l.title)"
```

Expected:

```text
LESSON-SLIDES-X-2X-PILOT 5 Calcular e instalar correderas con X y 2X
```

- [ ] **Step 4: Aplicar el gate**

If PASS: continuar a Task 1.

If FAIL: detener implementación y abrir investigación en `CarpiNova-Knowledge`; no modificar runtime/UI de PC.

No commit en este task: es un gate de evidencia, no un cambio de producto.

---

### Task 1: Extender el contrato runtime y cargar lecciones con fail-closed

**Files:**
- Modify: `src/knowledge/types.ts`
- Modify: `src/knowledge/loadKnowledge.ts`
- Modify: `tests/knowledge-loader.test.ts`
- Modify: `tests/bootstrap.test.tsx`
- Modify mechanically for the new required repository fields: `tests/search-ui.test.tsx`
- Modify mechanically for the new required repository fields: `tests/content-page.test.tsx`
- Modify mechanically for the new required repository fields: `tests/accessibility-ui.test.tsx`

**Interfaces:**
- Consumes: manifest + `knowledge.bundle.json` + `lessons.bundle.json` from one `baseUrl`.
- Produces: `LessonStep`, `LessonRecord`, `LessonsBundle`; `KnowledgeRepository.lessons: LessonRecord[]`; `KnowledgeRepository.lessonsById: Map<string, LessonRecord>`; `buildKnowledgeRepository(manifestValue, bundleValue, lessonsValue): KnowledgeRepository`; `loadKnowledge(fetchImpl?, baseUrl?): Promise<KnowledgeRepository>`.

- [ ] **Step 1: Escribir RED para carga válida e índice de lecciones**

In `tests/knowledge-loader.test.ts`, add fixture `lessonsBundle(...)` and a test named:

```ts
it("loads a valid lessons bundle and builds a lesson index", async () => {
  // fetch manifest, knowledge bundle and lessons bundle
  // expect repository.lessons[0].lesson_id to be LESSON-SLIDES-X-2X-PILOT
  // expect repository.lessonsById.get(... )?.steps to have length 5
});
```

Also change existing direct `buildKnowledgeRepository(...)` calls to pass a valid empty lessons bundle when the test is not about lessons.

- [ ] **Step 2: Escribir RED de validación estructural**

Add parameterized/focused tests asserting rejection of:

```text
lessons not array
lesson_id missing/non-string
duplicate lesson_id
title non-string
source_content_ids non-array/non-string member
steps non-array
order non-integer, zero or negative
duplicate order inside one lesson
step title non-string
content_ids non-array/non-string member
figure_ids non-array/non-string member when present
interaction null/array/non-object when present
```

Expected: each case throws a message naming the invalid field or lesson.

- [ ] **Step 3: Escribir RED de integridad referencial, identidad y orden**

Add tests proving:

```ts
expect(() => buildKnowledgeRepository(manifest(), bundle(), lessonsWithMissingContent())).toThrow(missingId);
expect(() => buildKnowledgeRepository(manifest(), bundle(), lessonsWithMetadata({ book_id: "other-book" }))).toThrow("book_id");
expect(repository.lessons[0].steps.map((step) => step.order)).toEqual([1, 3, 5]);
```

The `[1, 3, 5]` assertion deliberately proves: sort ascending, preserve gaps, synthesize nothing.

- [ ] **Step 4: Escribir RED de fetch fail-closed y bootstrap**

Extend the fetch stub so a successful `loadKnowledge(...)` requires:

```text
/knowledge/manifest.json
/knowledge/knowledge.bundle.json
/knowledge/lessons.bundle.json
```

Add/adjust tests so missing `lessons.bundle.json` rejects with `lessons.bundle.json`, and `Bootstrap` keeps the existing approved failure copy.

- [ ] **Step 5: Ejecutar RED focal**

Run:

```bash
npm test -- tests/knowledge-loader.test.ts tests/bootstrap.test.tsx
```

Expected: FAIL because lesson types, third repository input and runtime fetch do not exist yet.

- [ ] **Step 6: Añadir los tipos mínimos**

In `src/knowledge/types.ts`, add exactly:

```ts
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
```

Extend `KnowledgeRepository` with required `lessons` and `lessonsById`; do not add a second context or lesson service.

- [ ] **Step 7: Implementar validación y construcción mínima**

In `src/knowledge/loadKnowledge.ts`:

- add a private `validateLessonsBundle(value, manifest, contentById): LessonsBundle`;
- validate only fields required by the spec;
- accept `interaction` only as non-null, non-array object and preserve it opaquely;
- validate `source_content_ids` and every `steps[].content_ids` against `contentById`;
- sort copied steps by `order` ascending;
- build `lessonsById` while rejecting duplicates;
- do not load/validate figure records in runtime.

Change signature to:

```ts
export function buildKnowledgeRepository(
  manifestValue: unknown,
  bundleValue: unknown,
  lessonsValue: unknown,
): KnowledgeRepository
```

- [ ] **Step 8: Extender `loadKnowledge` sin nueva abstracción**

Fetch `${base}/lessons.bundle.json` using the existing `fetchJson(...)`, then pass all three values to `buildKnowledgeRepository(...)`.

- [ ] **Step 9: Actualizar fixtures manuales mínimos**

In existing `KnowledgeRepository` literals used by `search-ui`, `content-page` and `accessibility-ui`, add only:

```ts
lessons: [],
lessonsById: new Map(),
```

Do not create a shared fixture factory in this task.

- [ ] **Step 10: Ejecutar GREEN focal y typecheck**

Run:

```bash
npm test -- tests/knowledge-loader.test.ts tests/bootstrap.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add src/knowledge/types.ts src/knowledge/loadKnowledge.ts tests/knowledge-loader.test.ts tests/bootstrap.test.tsx tests/search-ui.test.tsx tests/content-page.test.tsx tests/accessibility-ui.test.tsx
git commit -m "feat: load canonical guided lessons"
```

---

### Task 2: Descubrir lecciones desde el dashboard sin hardcodearlas

**Files:**
- Modify: `src/features/search/HomePage.tsx`
- Modify: `tests/search-ui.test.tsx`

**Interfaces:**
- Consumes: `repository.lessons: LessonRecord[]` from Task 1.
- Produces: conditional region `Aprende paso a paso`; one real link per distributed lesson at `/lecciones/:lessonId`.

- [ ] **Step 1: Escribir RED de presencia, ausencia y URL real**

Extend the local `repository(...)` test helper to accept an optional `LessonRecord[]` and construct `lessonsById` from the same array.

Add tests proving:

```text
one lesson => region "Aprende paso a paso" exists
canonical title is rendered exactly from lesson.title
link href is /lecciones/LESSON-SLIDES-X-2X-PILOT
zero lessons => region is absent
```

Do not assert difficulty, duration, image, ranking or progress because those fields do not exist.

- [ ] **Step 2: Ejecutar RED focal**

Run:

```bash
npm test -- tests/search-ui.test.tsx
```

Expected: FAIL because Home has no guided-lessons region.

- [ ] **Step 3: Implementar la sección mínima en `HomePage`**

Import `Link` from `react-router-dom` and render, between `Empieza aquí` and `Explora todo`, only when `repository.lessons.length > 0`:

```text
section aria-labelledby="guided-lessons-heading"
h2 id="guided-lessons-heading" => Aprende paso a paso
list of links derived directly from repository.lessons
```

Use `lesson.lesson_id` for key/path and `lesson.title` for visible copy. No hardcoded lesson ID/title and no new component unless the final JSX becomes materially less clear without one.

- [ ] **Step 4: Ejecutar GREEN focal**

Run:

```bash
npm test -- tests/search-ui.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/search/HomePage.tsx tests/search-ui.test.tsx
git commit -m "feat: surface guided lessons on home"
```

---

### Task 3: Añadir la página de lección y su única ruta nueva

**Files:**
- Create: `src/features/lessons/LessonPage.tsx`
- Modify: `src/app/routes.tsx`
- Create: `tests/lesson-page.test.tsx`

**Interfaces:**
- Consumes: `repository.lessonsById`, `repository.contentById`, `selectPrimaryText(content)`.
- Produces: `LessonPage()` bound to `/lecciones/:lessonId`; content links carry `state={{ returnTo: lessonPath }}`.

- [ ] **Step 1: Escribir el fixture focal de lección**

In `tests/lesson-page.test.tsx`, construct one repository with:

```text
lesson_id = LESSON-SLIDES-X-2X-PILOT
title = Calcular e instalar correderas con X y 2X
steps supplied out of order in the fixture: 5, 1, 3
each step references existing ContentRecord IDs
```

The repository handed to UI should already reflect Task 1 validation/sorting when built through `buildKnowledgeRepository(...)`, rather than reimplementing sorting in the test fixture.

- [ ] **Step 2: Escribir RED de estado encontrado**

Add a test asserting:

```text
exactly one h1 = canonical lesson title
step headings/content appear in order 1, 3, 5
pedagogical text comes from selectPrimaryText inputs
content link href = /contenido/<real-content-id>
```

Inspect the link navigation state after click and assert `returnTo` equals `/lecciones/LESSON-SLIDES-X-2X-PILOT`.

- [ ] **Step 3: Escribir RED de lección inexistente**

For `/lecciones/LESSON-NOT-REAL`, assert:

```text
Lección no encontrada
Volver al inicio
```

and no fallback/similar lesson title is rendered.

- [ ] **Step 4: Ejecutar RED focal**

Run:

```bash
npm test -- tests/lesson-page.test.tsx
```

Expected: FAIL because route/component do not exist.

- [ ] **Step 5: Implementar `LessonPage`**

Create `src/features/lessons/LessonPage.tsx` with one responsibility: resolve the already validated lesson and render it.

Required behavior:

```ts
const { lessonId } = useParams<{ lessonId: string }>();
const lesson = lessonId ? repository.lessonsById.get(lessonId) : undefined;
```

- missing lesson => `Lección no encontrada` + home link;
- found lesson => home link, one `h1`, semantic ordered steps;
- for each `content_id`, resolve from `contentById` and render `selectPrimaryText(content)` output;
- link to `/contenido/:contentId` with `state={{ returnTo: `/lecciones/${lesson.lesson_id}` }}`;
- do not display `figure_ids` or execute `interaction`.

No defensive fallback for missing content is needed in UI because Task 1 rejects such Knowledge during bootstrap.

- [ ] **Step 6: Registrar solo la ruta aprobada**

In `src/app/routes.tsx`, import `LessonPage` and add exactly:

```tsx
<Route path="/lecciones/:lessonId" element={<LessonPage />} />
```

Do not add lesson index/course routes.

- [ ] **Step 7: Ejecutar GREEN focal**

Run:

```bash
npm test -- tests/lesson-page.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/features/lessons/LessonPage.tsx src/app/routes.tsx tests/lesson-page.test.tsx
git commit -m "feat: add guided lesson page"
```

---

### Task 4: Hacer seguro y semántico el retorno lección → ficha → lección

**Files:**
- Modify: `src/features/content/ContentPage.tsx`
- Modify: `tests/content-page.test.tsx`
- Modify: `tests/lesson-page.test.tsx`

**Interfaces:**
- Consumes: React Router location state `returnTo` emitted by Task 3.
- Produces: whitelist local de retorno y etiqueta `Volver a la lección` para rutas de lección válidas.

- [ ] **Step 1: Escribir RED para retorno válido desde lección**

Render `ContentPage` with location state:

```ts
{ returnTo: "/lecciones/LESSON-SLIDES-X-2X-PILOT" }
```

Assert link text `Volver a la lección` and href exacto a esa ruta.

- [ ] **Step 2: Escribir RED para retorno manipulado**

Test at least:

```text
https://example.com
//example.com
/lecciones/foo/bar
/lecciones/foo?next=https://example.com
```

Expected: none are accepted as lesson return; ContentPage falls back to `/buscar` and `Volver a resultados`.

Keep existing search return behavior unchanged.

- [ ] **Step 3: Ejecutar RED focal**

Run:

```bash
npm test -- tests/content-page.test.tsx tests/lesson-page.test.tsx
```

Expected: FAIL because current whitelist only accepts search paths.

- [ ] **Step 4: Implementar la whitelist mínima**

In `ContentPage.tsx`, treat a lesson return as valid only when it matches one local path segment:

```text
^/lecciones/[^/?#]+$
```

Preserve existing acceptance of `/buscar` and `/buscar?...`.

Derive both destination and label from the validated path:

```text
lesson return => Volver a la lección
search/fallback => Volver a resultados
```

Do not introduce a general-purpose URL sanitizer for this one local requirement.

- [ ] **Step 5: Ejecutar GREEN focal**

Run:

```bash
npm test -- tests/content-page.test.tsx tests/lesson-page.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/content/ContentPage.tsx tests/content-page.test.tsx tests/lesson-page.test.tsx
git commit -m "fix: return safely from content to lesson"
```

---

### Task 5: Cerrar accesibilidad y presentación sin abrir un sistema visual nuevo

**Files:**
- Modify: `src/styles/app.css`
- Modify: `tests/accessibility-ui.test.tsx`
- Modify if needed only for semantics discovered by the test: `src/features/lessons/LessonPage.tsx`
- Modify if needed only for semantics discovered by the test: `src/features/search/HomePage.tsx`

**Interfaces:**
- Consumes: Home + LessonPage behavior from Tasks 2-4.
- Produces: keyboard-complete lesson flow, visible focus through existing rules, no horizontal overflow at 390 px.

- [ ] **Step 1: Añadir una lección realista al fixture de accesibilidad**

Extend `repository()` in `tests/accessibility-ui.test.tsx` with one `LessonRecord` and matching `lessonsById`; keep existing material/hardware records.

- [ ] **Step 2: Escribir RED de navegación por teclado**

Add a test that starts at `/`, tabs through the existing search controls/categories until the guided lesson link receives focus, presses Enter, then confirms `/lecciones/LESSON-SLIDES-X-2X-PILOT` and that the first content link on the lesson is keyboard-focusable.

Also assert the lesson page exposes exactly one `h1` with the canonical lesson title.

- [ ] **Step 3: Ejecutar RED focal**

Run:

```bash
npm test -- tests/accessibility-ui.test.tsx
```

Expected: fail only on semantics/tab behavior not yet satisfied; if it is already GREEN through native links, do not manufacture code just to create a diff.

- [ ] **Step 4: Añadir únicamente CSS necesario**

Use contextual selectors in `src/styles/app.css` for the guided-lessons list and lesson steps/content links. Requirements:

```text
no fixed widths that can overflow 390 px
reuse existing spacing/radius/focus behavior
no third-party icons or design dependency
no stepper/progress visualization
```

If existing styles already satisfy focus visibility, do not duplicate them.

- [ ] **Step 5: Ejecutar la matriz focal de UI**

Run:

```bash
npm test -- tests/search-ui.test.tsx tests/lesson-page.test.tsx tests/content-page.test.tsx tests/accessibility-ui.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit only if code/style changed**

```bash
git add src/styles/app.css src/features/lessons/LessonPage.tsx src/features/search/HomePage.tsx tests/accessibility-ui.test.tsx
git commit -m "test: verify guided lesson accessibility"
```

If the RED in Step 3 was already GREEN and no production/style change is justified, fold only the meaningful accessibility test into the nearest feature commit rather than creating an empty/noise commit.

---

### Task 6: Verificación total, aceptación visual y evidencia de cierre

**Files:**
- Modify after acceptance: `README.md`
- Create after acceptance: `docs/verification/guided-lesson-mvp3-local.md`
- No product changes during evidence-only closure.

**Interfaces:**
- Consumes: complete MVP3 branch from Tasks 0-5.
- Produces: reproducible acceptance evidence and a branch ready for PR/review; no new feature behavior.

- [ ] **Step 1: Ejecutar regresión completa**

Run:

```bash
npm test
npm run typecheck
npm run build
npm run knowledge:prepare -- --knowledge-root ../CarpiNova-Knowledge
```

Expected: all PASS; prepared Knowledge remains 1.0.0 and contains the canonical guided lesson.

- [ ] **Step 2: Verificar flujo funcional local**

Run app/preview and verify:

```text
Home shows canonical lesson only because bundle contains it
Home → guided lesson works
step order matches Knowledge
lesson → content works
content → lesson returns correctly
unknown lesson shows Lección no encontrada
search/dashboard MVP2 behavior remains intact
```

No figure/interaction UI should appear.

- [ ] **Step 3: Verificar responsive/accessibility en navegador**

Check widths:

```text
1440 px
768 px
390 px
```

Acceptance:

```text
no horizontal overflow
single h1 on lesson page
DOM step order equals pedagogical order
all essential links reachable/activatable by keyboard
visible focus
no hover-only essential behavior
```

Any product-affecting fix discovered here reopens the relevant focal tests before acceptance.

- [ ] **Step 4: Auditar diff contra KISS/cero ruido**

Run:

```bash
git diff 27cb3e3346db041084898e633724861f9f8501c6...HEAD --stat
git diff 27cb3e3346db041084898e633724861f9f8501c6...HEAD -- src tests
```

Expected scope stays near:

```text
src/knowledge/types.ts
src/knowledge/loadKnowledge.ts
src/features/search/HomePage.tsx
src/features/lessons/LessonPage.tsx
src/features/content/ContentPage.tsx
src/app/routes.tsx
src/styles/app.css
focused tests
```

Reject unrelated refactors, new dependencies, new contexts, course engines, figures/interactions or Cell/CAD work.

- [ ] **Step 5: Registrar aceptación local**

Create `docs/verification/guided-lesson-mvp3-local.md` containing factual evidence only:

```text
branch/head SHA
Knowledge SHA/version/source SHA
canonical lesson ID/title/5-step gate PASS
test/typecheck/build/knowledge:prepare results
1440/768/390 result
keyboard result
known out-of-scope: figures/interactions
final acceptance token: MVP3_GUIDED_LESSON_LOCAL_ACCEPTANCE_PASS
```

Do not claim CI/merge results that have not happened yet.

- [ ] **Step 6: Actualizar README al alcance real MVP3**

Update only current product scope: Knowledge Explorer + Dashboard educativo + primera lección guiada. Keep backend, DB, accounts, IA, Cell, CAD/3D, progress/course engine and figure interactions explicitly out of scope.

- [ ] **Step 7: Commit docs de aceptación**

```bash
git add README.md docs/verification/guided-lesson-mvp3-local.md
git commit -m "docs: record guided lesson MVP3 acceptance"
```

- [ ] **Step 8: Verificación final limpia**

Run:

```bash
git status --short
npm test
npm run typecheck
npm run build
```

Expected: clean working tree after commit; all commands PASS.

- [ ] **Step 9: Handoff a PR/CI**

Open/update one MVP3 PR only after local acceptance. PR body must state the exact final HEAD, Knowledge identity, focal/full verification and the fact that figures/interactions remain intentionally out of scope. Mark ready only after CI succeeds on that exact HEAD.

Merge only with expected-head protection, then verify `main` and post-merge CI before declaring `CARPINOVA-PC MVP3 = CLOSED`.
