# CarpiNova-PC Dashboard educativo MVP 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir la portada `/` en una entrada pedagógica clara para principiantes, reutilizando el buscador y las categorías existentes sin añadir arquitectura, rutas, dependencias ni conocimiento paralelo.

**Architecture:** `HomePage` seguirá consumiendo `KnowledgeRepository` y `getAvailableContentTypes(repository)`. La portada calculará un subconjunto prioritario fijo y reutilizará `CategoryFilter` dos veces: primero para “Empieza aquí” y después para “Explora todo”. No se modifica el motor de búsqueda, el loader de Knowledge, las rutas ni la ficha de contenido.

**Tech Stack:** React 19, TypeScript 5.9, React Router, Vite 7, Vitest 5, Testing Library, CSS existente.

**Spec:** `docs/superpowers/specs/2026-10-13-carpinova-pc-dashboard-mvp2-design.md`

## Global Constraints

- KISS: `REUTILIZAR > SIMPLIFICAR > MEJORAR > CREAR`.
- `CarpiNova-Knowledge 1.0.0` sigue siendo la única fuente canónica del contenido.
- Tipos prioritarios exactos y en este orden: `material`, `hardware`, `procedure`, `construction_pattern`, `warning`.
- Solo se muestran tipos conocidos y realmente presentes según `getAvailableContentTypes(repository)`.
- “Empieza aquí” y “Explora todo” reutilizan `CategoryFilter`; no se crea navegación paralela.
- No se crean nuevas rutas; permanecen `/`, `/buscar`, `/contenido/:contentId`.
- No se añade backend, DB, auth, IA, embeddings, RAG, analytics, PWA, CAD/3D, Furniture Engine ni CarpiNova Cell.
- No se añaden dependencias ni se modifica `package.json` salvo defecto imprescindible y demostrado.
- No se modifican `scripts/prepare-knowledge.mjs`, `src/knowledge/loadKnowledge.ts`, `src/knowledge/searchKnowledge.ts`, `src/features/content/ContentPage.tsx` ni `src/app/routes.tsx` salvo defecto concreto demostrado antes del cambio.
- `generated/knowledge/` continúa ignorado y nunca se versiona.
- Responsive objetivo real: 1440 px, 768 px y 390 px.
- El dashboard es navegación; no inventa contenido, relaciones, medidas, jerarquías técnicas ni reglas.

## Review Focus

1. **Categorías duplicadas visualmente por intención:** un tipo prioritario aparece en “Empieza aquí” y también en “Explora todo”; cada sección debe ser identificable y las pruebas deben consultar dentro de su región, no asumir un único enlace global.
2. **Bundle sin tipos prioritarios:** “Empieza aquí” debe desaparecer por completo mientras buscador y “Explora todo” siguen funcionando.
3. **Tipos desconocidos presentes en datos:** no deben aparecer ni en “Empieza aquí” ni en “Explora todo”, porque `getAvailableContentTypes` solo expone tipos conocidos.
4. **Orden alfabético del conjunto completo:** no debe contaminar el orden prioritario; “Empieza aquí” conserva exactamente `material → hardware → procedure → construction_pattern → warning` filtrado por disponibilidad.
5. **Viewport estrecho/teclado:** a 390 px no debe existir overflow horizontal y los enlaces prioritarios deben seguir siendo alcanzables con Tab y activables con Enter con foco visible.

---

## File Structure

**Modificar:**

- `src/features/search/HomePage.tsx` — composición del dashboard, constante de prioridad e instancias de `CategoryFilter`.
- `src/styles/app.css` — jerarquía visual contextual de las dos zonas y responsive sin layout paralelo.
- `tests/search-ui.test.tsx` — comportamiento visible del dashboard y regresión de navegación por categoría.
- `tests/accessibility-ui.test.tsx` — smoke de teclado/semántica del nuevo inicio.

**Crear solo al cerrar aceptación real:**

- `docs/verification/dashboard-mvp2-local.md` — evidencia de aceptación real del MVP 2; no se crea con PASS simulado.

**No crear:** nuevos componentes, hooks, stores, providers, servicios, configuración JSON ni nueva taxonomía para este MVP.

---

### Task 1: Dashboard funcional reutilizando `CategoryFilter`

**Files:**
- Modify: `src/features/search/HomePage.tsx`
- Modify: `tests/search-ui.test.tsx`

**Interfaces:**
- Consumes: `getAvailableContentTypes(repository): string[]`, `CategoryFilter({ types, query?, selectedType? })`, `SearchForm`.
- Produces: `HomePage` con dos regiones identificables: “Empieza aquí” cuando exista al menos un tipo prioritario y “Explora todo” cuando existan tipos conocidos disponibles.
- Produces local constant: `START_HERE_TYPES = ["material", "hardware", "procedure", "construction_pattern", "warning"] as const`.

- [ ] **Step 1: Escribir RED para encabezado, buscador, prioridad y conjunto completo**

En `tests/search-ui.test.tsx`, importar `within` desde Testing Library y adaptar/agregar una prueba de `/` que construya registros en orden deliberadamente distinto al prioritario. Debe afirmar:

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

Usar `content_type` reales del test para los cinco tipos prioritarios más al menos un tipo conocido no prioritario, por ejemplo `definition`, de modo que “Explora todo” pruebe el conjunto completo.

- [ ] **Step 2: Ejecutar el test focal y observar RED válido**

Run:

```bash
npm test -- tests/search-ui.test.tsx
```

Expected: FAIL porque el encabezado/regiones/orden prioritario todavía no existen. Si falla por un error del harness, corregir solo el harness hasta obtener el RED de comportamiento esperado.

- [ ] **Step 3: Implementar el mínimo dashboard funcional en `HomePage.tsx`**

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

Calcular `availableTypes` con `getAvailableContentTypes(repository)` y `startHereTypes` filtrando `START_HERE_TYPES` contra disponibilidad. Renderizar:

- `h1`: `Aprende carpintería desde cero`;
- copy aprobado de la spec;
- `SearchForm` existente;
- `<section aria-labelledby="start-here-heading">` solo si `startHereTypes.length > 0`;
- dentro de ella `h2#start-here-heading` y `CategoryFilter types={startHereTypes}`;
- `<section aria-labelledby="explore-all-heading">` solo si `availableTypes.length > 0`;
- dentro de ella `h2#explore-all-heading` y `CategoryFilter types={availableTypes}`.

No crear helper, componente, hook ni nueva construcción de URL.

- [ ] **Step 4: Ejecutar test focal y dejar GREEN**

Run:

```bash
npm test -- tests/search-ui.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Añadir RED de ausencia, tipo desconocido y navegación**

Agregar pruebas visibles que afiancen los Review Focus 1–4:

```ts
it("omits Empieza aquí when no priority type is available", ...)
it("ignores unknown content types in both dashboard sections", ...)
it("navigates a start-here category through the existing search route", ...)
```

La primera usa solo un tipo conocido no prioritario como `definition`; debe existir “Explora todo” y no existir región “Empieza aquí”.

La segunda incluye un registro con `content_type: "not-real"`; ese texto no debe aparecer como enlace.

La tercera hace click dentro de la región “Empieza aquí” en `Herrajes` y espera exactamente:

```text
/buscar?type=hardware
```

Además adaptar cualquier prueba antigua que asumía un único enlace global `Herrajes` para consultar dentro de la región correspondiente, ya que ahora la duplicación entre ambas zonas es intencional.

- [ ] **Step 6: Ejecutar pruebas focales y GREEN**

Run:

```bash
npm test -- tests/search-ui.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Ejecutar regresión funcional completa**

Run:

```bash
npm test
npm run typecheck
```

Expected: todas las pruebas PASS y TypeScript PASS.

- [ ] **Step 8: Commit Task 1**

```bash
git add src/features/search/HomePage.tsx tests/search-ui.test.tsx
git commit -m "feat: add beginner dashboard navigation"
```

---

### Task 2: Jerarquía visual, responsive y accesibilidad del dashboard

**Files:**
- Modify: `src/styles/app.css`
- Modify: `tests/accessibility-ui.test.tsx`
- Modify only if a demonstrated accessibility defect requires it: `src/features/search/HomePage.tsx`

**Interfaces:**
- Consumes: las dos regiones y las dos instancias existentes de `CategoryFilter` creadas en Task 1.
- Produces: jerarquía visual “Empieza aquí” > “Explora todo”, responsive con el CSS existente y navegación por teclado sin una nueva capa de componentes.

- [ ] **Step 1: Escribir RED accesible para regiones y teclado**

En `tests/accessibility-ui.test.tsx`, agregar un caso que renderice `/` y compruebe:

```ts
expect(screen.getByRole("region", { name: "Empieza aquí" })).toBeInTheDocument();
expect(screen.getByRole("region", { name: "Explora todo" })).toBeInTheDocument();
```

Luego usar `user.tab()` hasta un enlace prioritario o enfocarlo mediante la secuencia real de teclado y activar `Enter`; la ubicación esperada para `Herrajes` es:

```text
/buscar?type=hardware
```

No probar estilos internos de CSS; probar semántica y comportamiento.

- [ ] **Step 2: Ejecutar el smoke accesible y observar RED si falta semántica/comportamiento**

Run:

```bash
npm test -- tests/accessibility-ui.test.tsx
```

Expected: RED únicamente si Task 1 no dejó la semántica suficiente; si ya pasa por comportamiento existente, registrar que la semántica está cubierta y avanzar al CSS sin inventar código para forzar un RED artificial.

- [ ] **Step 3: Añadir CSS contextual mínimo**

En `src/styles/app.css`, usar clases/contenedores de `HomePage` o selectores contextuales para:

- dar separación clara entre encabezado, “Empieza aquí” y “Explora todo”;
- hacer que la primera instancia de `.category-filter` tenga accesos visualmente más prominentes que la segunda;
- reutilizar `--surface`, `--border`, `--accent`, `--radius`, `--shadow` y `:focus-visible` existentes;
- mantener el buscador cerca del encabezado;
- permitir wrap/grid fluido sin ancho fijo que genere overflow;
- a `max-width: 720px`, apilar/adaptar accesos sin crear un layout móvil alterno.

No añadir framework CSS, iconos, fuentes ni dependencia.

- [ ] **Step 4: Ejecutar suite focal de UI**

Run:

```bash
npm test -- tests/search-ui.test.tsx tests/accessibility-ui.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Build de producción**

Run:

```bash
npm run build
```

Expected: PASS sin nuevos warnings de compilación atribuibles al dashboard.

- [ ] **Step 6: Commit Task 2**

```bash
git add src/styles/app.css tests/accessibility-ui.test.tsx src/features/search/HomePage.tsx
git commit -m "feat: polish dashboard accessibility and responsive layout"
```

Si `HomePage.tsx` no cambió en Task 2, no incluirlo en el commit.

---

### Task 3: Regresión total y aceptación real del MVP 2

**Files:**
- Create only after actual PASS: `docs/verification/dashboard-mvp2-local.md`
- Modify product code only if a real defect is reproduced; any fix must follow RED → minimal GREEN → regression before continuing acceptance.

**Interfaces:**
- Consumes: dashboard terminado de Tasks 1–2 y Knowledge canónico 1.0.0.
- Produces: evidencia verificable de que MVP 2 funciona sin regresión y sin ruido.

- [ ] **Step 1: Confirmar higiene Git antes de aceptar**

Run:

```bash
git status --short
git diff --check
git ls-files generated
git check-ignore generated/knowledge/manifest.json
```

Expected:

- working tree limpio salvo trabajo intencional;
- `git diff --check` sin errores;
- `git ls-files generated` sin salida;
- manifest generado reconocido como ignorado.

- [ ] **Step 2: Ejecutar baseline reproducible completo**

Run:

```bash
npm ci
npm test
npm run typecheck
npm run build
```

Expected: todo PASS. No usar `npm audit fix` ni actualizar dependencias salvo vulnerabilidad/defecto real que bloquee el gate.

- [ ] **Step 3: Preparar Knowledge real canónico**

Run en Windows con el checkout privado real:

```bash
npm run knowledge:prepare -- --knowledge-root "<ruta-real-a-CarpiNova-Knowledge>"
```

Expected contract:

```text
knowledge_version = 1.0.0
book_id = cpnc-2025
scope = BOOK
source_manifest_sha256 = 318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c
```

Registrar el SHA exacto de `CarpiNova-Knowledge` usado. No copiar Knowledge al repositorio público.

- [ ] **Step 4: Ejecutar preview de producción y flujo visible**

Run:

```bash
npm run build
npm run preview
```

Comprobar realmente en navegador:

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

No declarar PASS por inspección de código o test sintético solamente.

- [ ] **Step 5: Aceptación responsive real**

Comprobar aproximadamente:

```text
1440 px
768 px
390 px
```

En cada ancho: sin overflow horizontal, buscador utilizable, orden de lectura estable, accesos prioritarios visibles/usables y “Explora todo” usable.

- [ ] **Step 6: Accessibility smoke real**

Comprobar:

```text
Tab
Enter
foco visible
nombres accesibles
```

Expected: el usuario puede alcanzar y activar accesos prioritarios sin mouse; ninguna acción depende solo del color.

- [ ] **Step 7: Auditoría de ruido y alcance**

Verificar y registrar explícitamente:

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

Si cualquiera es `YES`, detener cierre y justificar contra la spec antes de continuar.

- [ ] **Step 8: Crear documento de verificación solo después del PASS real**

Crear `docs/verification/dashboard-mvp2-local.md` con:

- fecha y plataforma;
- branch y SHA de CarpiNova-PC probado;
- SHA de Knowledge real y contrato 1.0.0;
- resultado de `npm ci`, tests, typecheck, build y preview;
- resultado del flujo visible;
- responsive 1440/768/390;
- accessibility smoke;
- auditoría de ruido;
- defectos encontrados/corregidos, si existieron;
- bloqueadores restantes;
- veredicto exacto `MVP2_DASHBOARD_LOCAL_ACCEPTANCE_PASS` únicamente si todo lo anterior pasó.

- [ ] **Step 9: Ejecutar verificación final después del documento**

Run:

```bash
npm test
npm run typecheck
npm run build
git diff --check
git status --short
```

Expected: PASS; solo el documento de verificación debe quedar pendiente de commit si el producto no necesitó cambios adicionales.

- [ ] **Step 10: Commit de evidencia**

```bash
git add docs/verification/dashboard-mvp2-local.md
git commit -m "docs: record dashboard MVP2 local acceptance"
```

- [ ] **Step 11: Push + CI + cierre**

Push de la rama y esperar CI remoto. MVP 2 solo puede marcarse CLOSED cuando el CI del SHA final pase y el documento de aceptación real exista.

---

## Definition of Done

El MVP 2 está cerrado solo cuando se cumplen simultáneamente:

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
REMOTE_CI: PASS
REMAINING_BLOCKERS: NONE
```

No se declara cierre parcial como cierre total.