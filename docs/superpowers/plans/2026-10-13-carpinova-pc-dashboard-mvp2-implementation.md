# CarpiNova-PC Dashboard educativo MVP 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir `/` en una entrada pedagógica clara para principiantes, reutilizando el buscador y las categorías existentes sin añadir arquitectura, rutas, dependencias ni conocimiento paralelo.

**Architecture:** `HomePage` seguirá consumiendo `KnowledgeRepository` y `getAvailableContentTypes(repository)`. Calculará un subconjunto prioritario fijo y reutilizará `CategoryFilter` dos veces: “Empieza aquí” y “Explora todo”. Búsqueda, loader, rutas y detalle permanecen intactos salvo defecto demostrado.

**Tech Stack:** React 19, TypeScript 5.9, React Router, Vite 7, Vitest 5, Testing Library y CSS existente.

**Spec:** `docs/superpowers/specs/2026-10-13-carpinova-pc-dashboard-mvp2-design.md`

## Global Constraints

- KISS: `REUTILIZAR > SIMPLIFICAR > MEJORAR > CREAR`.
- `CarpiNova-Knowledge 1.0.0` sigue siendo la única fuente canónica.
- Prioridad exacta: `material`, `hardware`, `procedure`, `construction_pattern`, `warning`.
- Solo se muestran tipos conocidos y realmente presentes según `getAvailableContentTypes(repository)`.
- “Empieza aquí” y “Explora todo” reutilizan `CategoryFilter`.
- No se crean rutas nuevas; siguen `/`, `/buscar`, `/contenido/:contentId`.
- No se añaden backend, DB, auth, IA, embeddings, RAG, analytics, PWA, CAD/3D, Furniture Engine ni CarpiNova Cell.
- No se añaden dependencias ni se modifica `package.json` salvo defecto imprescindible demostrado.
- No se modifican `scripts/prepare-knowledge.mjs`, `src/knowledge/loadKnowledge.ts`, `src/knowledge/searchKnowledge.ts`, `src/features/content/ContentPage.tsx` ni `src/app/routes.tsx` salvo defecto concreto demostrado antes del cambio.
- `generated/knowledge/` continúa ignorado y nunca se versiona.
- Responsive real objetivo: 1440 px, 768 px y 390 px.
- El dashboard solo navega; no inventa contenido, relaciones, medidas, jerarquías técnicas ni reglas.

## Review Focus

1. **Duplicación visual intencional:** una categoría prioritaria aparece en “Empieza aquí” y en “Explora todo”; las pruebas deben consultar dentro de cada región.
2. **Sin tipos prioritarios:** “Empieza aquí” desaparece por completo, pero buscador y “Explora todo” siguen funcionando.
3. **Tipo desconocido en datos:** no aparece en ninguna zona porque `getAvailableContentTypes` solo expone tipos conocidos.
4. **Orden:** “Empieza aquí” conserva `material → hardware → procedure → construction_pattern → warning`, aunque “Explora todo” esté ordenado alfabéticamente.
5. **390 px/teclado:** sin overflow horizontal; enlaces alcanzables con Tab, activables con Enter y foco visible.

---

## File Structure

**Modificar:**
- `src/features/search/HomePage.tsx` — composición del dashboard y prioridad.
- `src/styles/app.css` — jerarquía visual contextual y responsive.
- `tests/search-ui.test.tsx` — comportamiento visible y regresión de navegación.
- `tests/accessibility-ui.test.tsx` — semántica/teclado.

**Crear solo después de aceptación real:**
- `docs/verification/dashboard-mvp2-local.md`.

**No crear:** componentes, hooks, stores, providers, servicios, configuración JSON ni taxonomía nueva.

---

### Task 1: Dashboard funcional reutilizando `CategoryFilter`

**Files:**
- Modify: `src/features/search/HomePage.tsx`
- Modify: `tests/search-ui.test.tsx`

**Interfaces:**
- Consumes: `getAvailableContentTypes(repository): string[]`, `CategoryFilter`, `SearchForm`.
- Produces: dos regiones identificables en `/`: “Empieza aquí” cuando haya tipos prioritarios y “Explora todo” cuando haya tipos conocidos disponibles.
- Local constant: `START_HERE_TYPES = ["material", "hardware", "procedure", "construction_pattern", "warning"] as const`.

- [ ] **Step 1: Escribir RED del dashboard**

En `tests/search-ui.test.tsx`, importar `within` y probar `/` con registros creados en un orden distinto al prioritario. Afirmar:

```ts
expect(screen.getByRole("heading", { name: "Aprende carpintería desde cero" })).toBeInTheDocument();
expect(screen.getByRole("searchbox", { name: /buscar en carpinova/i })).toBeInTheDocument();

const startHere = screen.getByRole("region", { name: "Empieza aquí" });
expect(within(startHere).getAllByRole("link").map((link) => link.textContent)).toEqual([
  "Materiales",
  "Herrajes",
  "Procedimientos",
  "Sistemas constructivos",
  "Advertencias",
]);

const exploreAll = screen.getByRole("region", { name: "Explora todo" });
expect(within(exploreAll).getByRole("link", { name: "Materiales" })).toHaveAttribute(
  "href",
  "/buscar?type=material",
);
```

Añadir un tipo conocido no prioritario, por ejemplo `definition`, y comprobar que aparece en “Explora todo”.

- [ ] **Step 2: Ejecutar RED focal**

```bash
npm test -- tests/search-ui.test.tsx
```

Expected: FAIL por ausencia del nuevo encabezado/regiones/orden. Si falla por harness, corregir solo el harness hasta obtener RED válido.

- [ ] **Step 3: Implementar mínimo en `HomePage.tsx`**

Implementar únicamente:

```ts
const START_HERE_TYPES = [
  "material",
  "hardware",
  "procedure",
  "construction_pattern",
  "warning",
] as const;
```

Luego:
- `availableTypes = getAvailableContentTypes(repository)`;
- `startHereTypes = START_HERE_TYPES.filter((type) => availableTypes.includes(type))`;
- `h1`: `Aprende carpintería desde cero`;
- copy aprobado por la spec;
- `SearchForm` existente;
- `<section aria-labelledby="start-here-heading">` solo si `startHereTypes.length > 0`;
- dentro: `h2#start-here-heading` + `CategoryFilter types={startHereTypes}`;
- `<section aria-labelledby="explore-all-heading">` solo si `availableTypes.length > 0`;
- dentro: `h2#explore-all-heading` + `CategoryFilter types={availableTypes}`.

No crear helper, componente, hook ni nueva construcción de URLs.

- [ ] **Step 4: Ejecutar GREEN focal**

```bash
npm test -- tests/search-ui.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Añadir casos de Review Focus 1–4**

Agregar pruebas:

```ts
it("omits Empieza aquí when no priority type is available", ...)
it("ignores unknown content types in both dashboard sections", ...)
it("navigates a start-here category through the existing search route", ...)
```

Condiciones:
- sin prioridad: usar solo `definition`; debe existir “Explora todo” y no “Empieza aquí”;
- desconocido: incluir `content_type: "not-real"`; nunca aparece como enlace;
- navegación: click en `Herrajes` dentro de “Empieza aquí” y esperar `/buscar?type=hardware`;
- adaptar pruebas antiguas que asumían un único enlace global `Herrajes`, porque ahora aparecerá legítimamente en dos regiones.

- [ ] **Step 6: Regresión Task 1**

```bash
npm test -- tests/search-ui.test.tsx
npm test
npm run typecheck
```

Expected: todo PASS.

- [ ] **Step 7: Commit Task 1**

```bash
git add src/features/search/HomePage.tsx tests/search-ui.test.tsx
git commit -m "feat: add beginner dashboard navigation"
```

---

### Task 2: Jerarquía visual, responsive y accesibilidad

**Files:**
- Modify: `src/styles/app.css`
- Modify: `tests/accessibility-ui.test.tsx`
- Modify only if a demonstrated accessibility defect requires it: `src/features/search/HomePage.tsx`

**Interfaces:**
- Consumes: regiones e instancias de `CategoryFilter` de Task 1.
- Produces: “Empieza aquí” con mayor jerarquía visual que “Explora todo”, responsive sin layout paralelo y navegación por teclado funcional.

- [ ] **Step 1: Añadir prueba de semántica/teclado**

En `tests/accessibility-ui.test.tsx`, renderizar `/` y comprobar las regiones “Empieza aquí” y “Explora todo”. Navegar por teclado hasta un acceso prioritario y activarlo con Enter. Para `Herrajes`, ubicación esperada:

```text
/buscar?type=hardware
```

No probar detalles internos de CSS.

- [ ] **Step 2: Ejecutar smoke accesible**

```bash
npm test -- tests/accessibility-ui.test.tsx
```

Si ya pasa por semántica existente, no fabricar un RED artificial; registrar cobertura y continuar al CSS. Si falla por comportamiento real, usar ese fallo como RED.

- [ ] **Step 3: Añadir CSS contextual mínimo**

En `src/styles/app.css`:
- separar encabezado, “Empieza aquí” y “Explora todo”;
- hacer la primera `.category-filter` visualmente más prominente mediante selectores contextuales del `HomePage`;
- reutilizar `--surface`, `--border`, `--accent`, `--radius`, `--shadow` y `:focus-visible`;
- mantener el buscador cerca del encabezado;
- usar wrap/grid fluido sin anchos rígidos que causen overflow;
- en `max-width: 720px`, adaptar/apilar sin crear layout móvil independiente.

No añadir framework CSS, iconos, fuentes ni dependencia.

- [ ] **Step 4: Verificación Task 2**

```bash
npm test -- tests/search-ui.test.tsx tests/accessibility-ui.test.tsx
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/styles/app.css tests/accessibility-ui.test.tsx
git add src/features/search/HomePage.tsx  # solo si cambió realmente en esta tarea
git commit -m "feat: polish dashboard accessibility and responsive layout"
```

---

### Task 3: Aceptación real y evidencia de cierre

**Files:**
- Create only after actual PASS: `docs/verification/dashboard-mvp2-local.md`
- Modify product code only for a reproduced defect, siguiendo RED → minimal GREEN → regression.

**Interfaces:**
- Consumes: Tasks 1–2 y Knowledge canónico 1.0.0.
- Produces: evidencia real local + rama lista para PR; no hace merge automáticamente.

- [ ] **Step 1: Higiene Git**

```bash
git status --short
git diff --check
git ls-files generated
git check-ignore generated/knowledge/manifest.json
```

Expected: sin ruido; `generated` no trackeado; manifest ignorado.

- [ ] **Step 2: Baseline reproducible**

```bash
npm ci
npm test
npm run typecheck
npm run build
```

Expected: PASS. No ejecutar `npm audit fix` ni actualizar dependencias salvo bloqueo real demostrado.

- [ ] **Step 3: Preparar Knowledge real**

En Windows:

```bash
npm run knowledge:prepare -- --knowledge-root "<ruta-real-a-CarpiNova-Knowledge>"
```

Contrato esperado:

```text
knowledge_version = 1.0.0
book_id = cpnc-2025
scope = BOOK
source_manifest_sha256 = 318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c
```

Registrar SHA exacto de Knowledge usado. No copiar Knowledge al repo público.

- [ ] **Step 4: Preview y flujo visible real**

```bash
npm run build
npm run preview
```

Comprobar en navegador:

```text
abrir /
→ ver buscador
→ ver “Empieza aquí”
→ confirmar orden de tipos prioritarios disponibles
→ abrir Materiales si existe
→ comprobar /buscar?type=material
→ abrir una ficha
→ comprobar explicación/procedencia
→ volver
→ abrir otra categoría prioritaria disponible
→ comprobar “Explora todo”
```

No declarar PASS solo por tests o inspección de código.

- [ ] **Step 5: Responsive + accessibility real**

Comprobar 1440, 768 y 390 px: sin overflow horizontal, buscador usable, orden de lectura estable y ambas zonas usables.

Comprobar `Tab`, `Enter`, foco visible y nombres accesibles.

- [ ] **Step 6: Auditoría de ruido**

Registrar:

```text
NEW_ROUTES: NO
NEW_DEPENDENCIES: NO
NEW_COMPONENTS: NO
BACKEND_DB_AUTH: NO
AI_VECTOR_RAG: NO
PARALLEL_TAXONOMY: NO
MANUAL_TECHNICAL_CONTENT: NO
GENERATED_KNOWLEDGE_TRACKED: NO
```

Cualquier `YES` detiene el cierre hasta justificarlo contra la spec.

- [ ] **Step 7: Crear documento de verificación solo tras PASS real**

Crear `docs/verification/dashboard-mvp2-local.md` con:
- fecha/plataforma;
- branch y SHA PC probado;
- SHA Knowledge y contrato 1.0.0;
- resultados `npm ci`, tests, typecheck, build y preview;
- flujo visible;
- responsive 1440/768/390;
- accessibility smoke;
- auditoría de ruido;
- defectos encontrados/corregidos;
- bloqueadores restantes;
- `MVP2_DASHBOARD_LOCAL_ACCEPTANCE_PASS` solo si todo pasó.

- [ ] **Step 8: Verificación final de rama**

```bash
npm test
npm run typecheck
npm run build
git diff --check
git status --short
```

Expected: PASS.

- [ ] **Step 9: Commit de evidencia**

```bash
git add docs/verification/dashboard-mvp2-local.md
git commit -m "docs: record dashboard MVP2 local acceptance"
```

- [ ] **Step 10: Push, PR y CI correcto**

```bash
git push -u origin design/dashboard-mvp2-20261013
```

Abrir PR contra `main`. El workflow actual debe ejecutarse por evento `pull_request`; esperar CI del **SHA final de la rama** y exigir PASS en install, tests, typecheck y build.

No declarar “integrado en main” todavía.

- [ ] **Step 11: Gate de integración**

Con PR verde, presentar al usuario la decisión de merge. Solo tras aprobación explícita:
- merge del PR con protección por expected head SHA;
- verificar nuevo `main`;
- esperar CI disparado por `push: main`;
- exigir PASS final antes de declarar **MVP 2 CLOSED / integrado**.

---

## Definition of Done

El MVP 2 está cerrado e integrado únicamente cuando:

```text
DASHBOARD_BEGINNER_ENTRY: PASS
START_HERE_REAL_TYPES_ONLY: PASS
START_HERE_PRIORITY_ORDER: PASS
EXPLORE_ALL_KNOWN_TYPES: PASS
SEARCH_MVP1_REGRESSION: PASS
DETAIL_PROVENANCE_REGRESSION: PASS
RESPONSIVE_1440_768_390: PASS
ACCESSIBILITY_SMOKE: PASS
TESTS: PASS
TYPECHECK: PASS
BUILD: PASS
REAL_KNOWLEDGE_PREVIEW: PASS
NOISE_AUDIT: PASS
GENERATED_KNOWLEDGE_TRACKED: NO
PR_CI: PASS
MAIN_POST_MERGE_CI: PASS
REMAINING_BLOCKERS: NONE
```

No se declara cierre parcial como cierre total.