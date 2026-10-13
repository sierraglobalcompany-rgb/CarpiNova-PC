# CarpiNova-PC Guided Lesson MVP 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consumir la primera lección guiada canónica de CarpiNova-Knowledge 1.0.0 en CarpiNova-PC, presentarla paso a paso y conservar navegación/procedencia sin duplicar conocimiento ni abrir un motor general de cursos.

**Architecture:** `CarpiNova-Knowledge` sigue siendo la única fuente de verdad. `CarpiNova-PC` amplía el `KnowledgeRepository` existente para cargar `lessons.bundle.json`, indexar lecciones por ID y representar una lección con una sola ruta nueva. La UI reutiliza `KnowledgeContext`, `ContentRecord`, `contentById`, `selectPrimaryText(...)`, `ContentPage`, React Router y CSS existente; no crea backend, contexto adicional, motor de cursos ni soporte de figuras/interacciones.

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, Vite 7, Vitest 5, Testing Library, CarpiNova-Knowledge 1.0.0 local-first.

**Spec:** `docs/superpowers/specs/2026-10-13-carpinova-pc-guided-lesson-mvp3-design.md` — aprobada por el usuario el 2026-10-13 antes de este plan.

## Global Constraints

- Base estable: `main @ 27cb3e3346db041084898e633724861f9f8501c6`; rama: `design/guided-lesson-mvp3-20261013`.
- Knowledge esperado: `knowledge_version=1.0.0`, `book_id=cpnc-2025`, `scope=BOOK`.
- Fuente exacta: SHA-256 `318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c`.
- Gate antes de producto: `generated/knowledge/lessons.bundle.json` real debe contener `LESSON-SLIDES-X-2X-PILOT` con exactamente 5 pasos.
- Si el gate falla: STOP; no hardcodear, no copiar `lessons/pilot` a PC y no continuar runtime/UI.
- KISS / cero ruido: `REUTILIZAR > SIMPLIFICAR > MEJORAR > CREAR`; sin dependencias nuevas salvo necesidad demostrada.
- `UNRESOLVED > INVENTED`: Knowledge inválido falla cerrado; PC no completa relaciones ni contenido manualmente.
- `figures.bundle.json` no se carga en runtime en MVP3; `interaction` se conserva opaca como `Record<string, unknown>` y no se ejecuta.
- Única ruta nueva: `/lecciones/:lessonId`.
- Fuera de alcance: progreso, cuentas, favoritos, recomendaciones, IA, backend, DB, Cell, CAD/3D, figuras, overlays, interacciones y course engine.
- TDD: RED verificable → GREEN mínimo → regresión focal → commit de un propósito.
- No crear factory/helper global de fixtures solo para añadir dos campos; actualizar directamente los pocos repositorios de prueba existentes.

## Review Focus

- `lessons.bundle.json` ausente/404/JSON inválido debe mantener bootstrap fail-closed.
- `knowledge_version`, `book_id` o `scope` incompatible entre lessons y manifest debe rechazarse.
- `source_content_ids` o `steps[].content_ids` inexistente debe fallar cerrado; la UI nunca omite una referencia rota.
- `order` solo entero positivo y único; ordenar ascendente, permitir huecos y no sintetizar pasos.
- `returnTo` externo/manipulado nunca se acepta; solo `/buscar`, `/buscar?...` y `/lecciones/<segmento>`.

---

### Task 0: Probar el artefacto BOOK real

**Files:**
- Read only: `scripts/prepare-knowledge.mjs`
- Read only: `../CarpiNova-Knowledge/**`
- Generated/ignored: `generated/knowledge/manifest.json`, `generated/knowledge/lessons.bundle.json`

**Interfaces:**
- Consumes: `npm run knowledge:prepare -- --knowledge-root ../CarpiNova-Knowledge`.
- Produces: evidencia de que `LESSON-SLIDES-X-2X-PILOT` está en BOOK 1.0.0 con 5 pasos; habilita Task 1.

- [ ] **Step 1: Confirmar estados de repositorio**

```bash
git status --short
git rev-parse HEAD
git -C ../CarpiNova-Knowledge status --short
git -C ../CarpiNova-Knowledge rev-parse HEAD
```

Expected: PC limpio en rama MVP3; Knowledge limpio en `a47119aba3d4711c1ac69f33f7d236d9bc20bb78` o estado posterior auditado explícitamente.

- [ ] **Step 2: Preparar BOOK real**

```bash
npm ci
npm run knowledge:prepare -- --knowledge-root ../CarpiNova-Knowledge
```

Expected: Knowledge 1.0.0 preparado; manifest `book_id=cpnc-2025`, `scope=BOOK`.

- [ ] **Step 3: Comprobar lección exacta**

```bash
node -e "const fs=require('fs');const b=JSON.parse(fs.readFileSync('generated/knowledge/lessons.bundle.json','utf8'));const l=b.lessons.find(x=>x.lesson_id==='LESSON-SLIDES-X-2X-PILOT');if(!l||l.steps.length!==5)process.exit(1);console.log(l.lesson_id,l.steps.length,l.title)"
```

Expected:

```text
LESSON-SLIDES-X-2X-PILOT 5 Calcular e instalar correderas con X y 2X
```

- [ ] **Step 4: Aplicar gate**

PASS → Task 1. FAIL → detener e investigar Knowledge. Sin commit: es evidencia, no producto.

---

### Task 1: Extender el contrato runtime y cargar lecciones fail-closed

**Files:**
- Modify: `src/knowledge/types.ts`
- Modify: `src/knowledge/loadKnowledge.ts`
- Modify: `tests/knowledge-loader.test.ts`
- Modify: `tests/bootstrap.test.tsx`
- Mechanical only: `tests/search-ui.test.tsx`, `tests/content-page.test.tsx`, `tests/accessibility-ui.test.tsx`

**Interfaces:**
- Consumes: manifest + `knowledge.bundle.json` + `lessons.bundle.json` desde un mismo `baseUrl`.
- Produces: `LessonStep`, `LessonRecord`, `LessonsBundle`; `KnowledgeRepository.lessons`; `KnowledgeRepository.lessonsById`; `buildKnowledgeRepository(manifestValue, bundleValue, lessonsValue): KnowledgeRepository`.

- [ ] **Step 1: Escribir RED de carga válida e índice**

En `tests/knowledge-loader.test.ts`, crear fixture `lessonsBundle(...)` y probar que `loadKnowledge(...)` carga los tres archivos, conserva `LESSON-SLIDES-X-2X-PILOT` y construye `lessonsById`.

- [ ] **Step 2: Escribir RED de estructura**

Probar rechazo de: `lessons` no array; `lesson_id` faltante/no string/duplicado; título no string; `source_content_ids` no array de strings; `steps` no array; `order` no entero positivo/duplicado; título de paso no string; `content_ids` no array de strings; `figure_ids` inválido; `interaction` null/array/no objeto.

- [ ] **Step 3: Escribir RED de identidad, referencias y orden**

Assertions mínimas:

```ts
expect(() => buildKnowledgeRepository(manifest(), bundle(), lessonsWithMissingContent())).toThrow(missingId);
expect(() => buildKnowledgeRepository(manifest(), bundle(), lessonsWithMetadata({ book_id: "other-book" }))).toThrow("book_id");
expect(repository.lessons[0].steps.map((step) => step.order)).toEqual([1, 3, 5]);
expect(repository.lessons[0].steps[0].interaction).toEqual(originalInteraction);
```

`[1,3,5]` demuestra: orden ascendente, huecos válidos, nada sintetizado.

- [ ] **Step 4: Escribir RED de fetch/Bootstrap fail-closed**

El stub exitoso debe responder a:

```text
/knowledge/manifest.json
/knowledge/knowledge.bundle.json
/knowledge/lessons.bundle.json
```

Falta/JSON inválido de lessons debe rechazar y `Bootstrap` debe mantener el copy de error actual.

- [ ] **Step 5: Ejecutar RED**

```bash
npm test -- tests/knowledge-loader.test.ts tests/bootstrap.test.tsx
```

Expected: FAIL por contrato/fetch aún inexistente.

- [ ] **Step 6: Añadir tipos mínimos**

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

`KnowledgeRepository` añade campos requeridos `lessons` y `lessonsById`; no segundo contexto ni service.

- [ ] **Step 7: Implementar validación mínima**

En `loadKnowledge.ts`, `validateLessonsBundle(value, manifest, contentById): LessonsBundle` debe validar solo el contrato aprobado, referencias a `contentById`, metadata opcional coherente, `interaction` opaca, pasos copiados/ordenados y IDs duplicados. No cargar figuras.

Cambiar firma:

```ts
export function buildKnowledgeRepository(
  manifestValue: unknown,
  bundleValue: unknown,
  lessonsValue: unknown,
): KnowledgeRepository
```

- [ ] **Step 8: Extender `loadKnowledge`**

Fetch `${base}/lessons.bundle.json` con `fetchJson(...)` existente y pasar los tres valores al builder.

- [ ] **Step 9: Actualizar fixtures manuales existentes**

En los tres repositorios literales de UI añadir solo:

```ts
lessons: [],
lessonsById: new Map(),
```

Sin factory compartida nueva.

- [ ] **Step 10: GREEN + typecheck**

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

### Task 2: Entregar el slice navegable Home → lección → contenido

**Files:**
- Modify: `src/features/search/HomePage.tsx`
- Create: `src/features/lessons/LessonPage.tsx`
- Modify: `src/app/routes.tsx`
- Modify: `tests/search-ui.test.tsx`
- Create: `tests/lesson-page.test.tsx`

**Interfaces:**
- Consumes: `repository.lessons`, `repository.lessonsById`, `repository.contentById`, `selectPrimaryText(content)`.
- Produces: región condicional `Aprende paso a paso`, ruta `/lecciones/:lessonId`, `LessonPage()`, y links de contenido con `state={{ returnTo: lessonPath }}`.

- [ ] **Step 1: Escribir RED de Home**

Extender helper de `search-ui` para aceptar `LessonRecord[]`. Probar:

```text
1 lesson => aparece región "Aprende paso a paso"
título visible = lesson.title exacto
href = /lecciones/LESSON-SLIDES-X-2X-PILOT
0 lessons => región ausente
```

No inventar dificultad, duración, imagen, ranking ni progreso.

- [ ] **Step 2: Escribir RED de LessonPage**

En `tests/lesson-page.test.tsx`, construir el repositorio mediante `buildKnowledgeRepository(...)` con pasos de entrada `5,1,3` y contenidos reales del fixture. Probar:

```text
exactamente un h1 = título canónico
pasos renderizados en orden 1,3,5
texto pedagógico deriva de selectPrimaryText
link a /contenido/<contentId>
state.returnTo = /lecciones/LESSON-SLIDES-X-2X-PILOT
```

- [ ] **Step 3: Escribir RED de lesson ID inexistente**

`/lecciones/LESSON-NOT-REAL` debe mostrar `Lección no encontrada` + `Volver al inicio`, sin sugerir otra lección.

- [ ] **Step 4: Ejecutar RED conjunto**

```bash
npm test -- tests/search-ui.test.tsx tests/lesson-page.test.tsx
```

Expected: FAIL porque Home/ruta/página aún no existen.

- [ ] **Step 5: Implementar Home mínimo**

Importar `Link` y, entre `Empieza aquí` y `Explora todo`, renderizar solo cuando `repository.lessons.length > 0`:

```text
section aria-labelledby="guided-lessons-heading"
h2 => Aprende paso a paso
lista de links derivada directamente de repository.lessons
```

`lesson_id` define key/path y `lesson.title` el copy. Sin hardcodear lección y sin componente adicional salvo que el JSX realmente pierda claridad.

- [ ] **Step 6: Implementar `LessonPage`**

Firma de comportamiento:

```ts
const { lessonId } = useParams<{ lessonId: string }>();
const lesson = lessonId ? repository.lessonsById.get(lessonId) : undefined;
```

Found: enlace a inicio, un `h1`, pasos semánticos en orden ya validado, contenido resuelto desde `contentById`, presentación con `selectPrimaryText`, link a `/contenido/:contentId` con `returnTo` de la lección. Missing: estado explícito. No figuras/interacciones.

- [ ] **Step 7: Registrar únicamente la ruta aprobada**

```tsx
<Route path="/lecciones/:lessonId" element={<LessonPage />} />
```

Sin índice de lecciones ni course routes.

- [ ] **Step 8: GREEN + typecheck**

```bash
npm test -- tests/search-ui.test.tsx tests/lesson-page.test.tsx
npm run typecheck
```

Expected: PASS y el commit ya es navegable de extremo a extremo; no existe enlace roto intermedio.

- [ ] **Step 9: Commit**

```bash
git add src/features/search/HomePage.tsx src/features/lessons/LessonPage.tsx src/app/routes.tsx tests/search-ui.test.tsx tests/lesson-page.test.tsx
git commit -m "feat: add guided lesson flow"
```

---

### Task 3: Hacer seguro y semántico el retorno lección → ficha → lección

**Files:**
- Modify: `src/features/content/ContentPage.tsx`
- Modify: `tests/content-page.test.tsx`
- Modify: `tests/lesson-page.test.tsx`

**Interfaces:**
- Consumes: location state `returnTo` emitido por Task 2.
- Produces: whitelist local; label `Volver a la lección` para rutas válidas.

- [ ] **Step 1: RED de retorno válido**

Con state `{ returnTo: "/lecciones/LESSON-SLIDES-X-2X-PILOT" }`, assert `Volver a la lección` y href exacto.

- [ ] **Step 2: RED de retorno manipulado**

Casos:

```text
https://example.com
//example.com
/lecciones/foo/bar
/lecciones/foo?next=https://example.com
```

Todos deben caer a `/buscar` + `Volver a resultados`. Retorno de búsqueda existente debe seguir funcionando.

- [ ] **Step 3: Ejecutar RED**

```bash
npm test -- tests/content-page.test.tsx tests/lesson-page.test.tsx
```

Expected: FAIL porque whitelist actual solo acepta búsqueda.

- [ ] **Step 4: Implementar whitelist mínima**

Aceptar lesson return solo si cumple:

```text
^/lecciones/[^/?#]+$
```

Conservar `/buscar` y `/buscar?...`. Derivar destino + label del path validado. No crear sanitizer general.

- [ ] **Step 5: GREEN + typecheck**

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

### Task 4: Cerrar accesibilidad y presentación KISS

**Files:**
- Modify: `src/styles/app.css`
- Modify: `tests/accessibility-ui.test.tsx`
- Modify only if test demonstrates necessity: `src/features/lessons/LessonPage.tsx`, `src/features/search/HomePage.tsx`

**Interfaces:**
- Consumes: flow funcional Tasks 2-3.
- Produces: navegación por teclado y layout sin desbordamiento; sin sistema visual nuevo.

- [ ] **Step 1: Añadir lección al fixture de accesibilidad**

Extender `repository()` con un `LessonRecord` realista y matching `lessonsById`.

- [ ] **Step 2: Añadir prueba de teclado**

Desde `/`, tabular hasta el link guiado, Enter, confirmar `/lecciones/LESSON-SLIDES-X-2X-PILOT`, comprobar un único `h1` y que el primer link de contenido recibe foco por teclado.

- [ ] **Step 3: Ejecutar prueba focal**

```bash
npm test -- tests/accessibility-ui.test.tsx
```

Si ya está GREEN por usar enlaces nativos, no fabricar código para producir un RED artificial.

- [ ] **Step 4: Añadir solo CSS necesario**

Selectores contextuales para lista de lecciones, pasos y links. Sin fixed widths que desborden 390 px, sin icon library, sin stepper/progreso. Reutilizar focus visible existente.

- [ ] **Step 5: Matriz focal UI**

```bash
npm test -- tests/search-ui.test.tsx tests/lesson-page.test.tsx tests/content-page.test.tsx tests/accessibility-ui.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit solo si hay cambio significativo**

```bash
git add src/styles/app.css src/features/lessons/LessonPage.tsx src/features/search/HomePage.tsx tests/accessibility-ui.test.tsx
git commit -m "test: verify guided lesson accessibility"
```

Si no hay cambio de producto/estilo justificado, incluir el test en el commit funcional anterior en vez de crear ruido.

---

### Task 5: Verificación total, aceptación visual y evidencia

**Files:**
- Modify after acceptance: `README.md`
- Create after acceptance: `docs/verification/guided-lesson-mvp3-local.md`
- No product changes during evidence-only closure.

**Interfaces:**
- Consumes: MVP3 completo.
- Produces: evidencia reproducible y rama lista para PR/CI.

- [ ] **Step 1: Regresión completa**

```bash
npm test
npm run typecheck
npm run build
npm run knowledge:prepare -- --knowledge-root ../CarpiNova-Knowledge
```

Expected: PASS; Knowledge sigue 1.0.0 y contiene lección canónica.

- [ ] **Step 2: Verificación funcional local**

Comprobar:

```text
Home muestra la lección porque el bundle la distribuye
Home → lesson funciona
orden coincide con Knowledge
lesson → content funciona
content → lesson vuelve correctamente
lesson inexistente muestra estado explícito
MVP2 search/dashboard sigue intacto
no aparece UI de figuras/interacciones
```

- [ ] **Step 3: Responsive/accesibilidad en navegador**

Widths `1440`, `768`, `390` px. Acceptance: sin scroll horizontal, un solo h1 en lesson, DOM=orden pedagógico, links esenciales por teclado, foco visible, nada esencial hover-only.

Cualquier fix de producto reabre sus pruebas focales antes de aceptación.

- [ ] **Step 4: Auditar diff KISS/cero ruido**

```bash
git diff 27cb3e3346db041084898e633724861f9f8501c6...HEAD --stat
git diff 27cb3e3346db041084898e633724861f9f8501c6...HEAD -- src tests
```

Scope esperado cerca de: `types.ts`, `loadKnowledge.ts`, `HomePage.tsx`, `LessonPage.tsx`, `ContentPage.tsx`, `routes.tsx`, `app.css`, tests focales. Rechazar refactors no relacionados, deps, contextos, course engine, figures/interactions, Cell/CAD.

- [ ] **Step 5: Registrar aceptación local**

Crear `docs/verification/guided-lesson-mvp3-local.md` con hechos: branch/head SHA; Knowledge SHA/version/source SHA; gate lesson ID/title/5 pasos PASS; test/typecheck/build/prepare; 1440/768/390; teclado; figuras/interacciones fuera de alcance; token `MVP3_GUIDED_LESSON_LOCAL_ACCEPTANCE_PASS`.

No declarar CI/merge aún no ocurridos.

- [ ] **Step 6: Sincronizar README al alcance real**

Knowledge Explorer + Dashboard educativo + primera lección guiada. Mantener backend, DB, cuentas, IA, Cell, CAD/3D, progreso/course engine y figuras/interacciones fuera de alcance.

- [ ] **Step 7: Commit docs de aceptación**

```bash
git add README.md docs/verification/guided-lesson-mvp3-local.md
git commit -m "docs: record guided lesson MVP3 acceptance"
```

- [ ] **Step 8: Verificación final limpia**

```bash
git status --short
npm test
npm run typecheck
npm run build
```

Expected: working tree limpio y todo PASS.

- [ ] **Step 9: Handoff PR/CI**

Abrir/actualizar un único PR MVP3 después de aceptación local. El body fija HEAD final, identidad Knowledge, pruebas focales/full y figuras/interacciones fuera de alcance. Ready solo con CI success sobre ese HEAD. Merge con expected-head; luego read-back de `main` + CI post-merge antes de declarar `CARPINOVA-PC MVP3 = CLOSED`.
