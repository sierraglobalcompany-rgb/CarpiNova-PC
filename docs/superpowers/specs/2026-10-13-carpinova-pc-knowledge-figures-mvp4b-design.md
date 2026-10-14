# CarpiNova-PC — Knowledge Figures MVP 4B

**Fecha:** 2026-10-13  
**Estado:** DESIGN WRITTEN — USER REVIEW REQUIRED  
**Rama de diseño:** `design/knowledge-figures-mvp4b-20261013`  
**Base:** `main` @ `a34ac92647be87417d2163bc6824a801deffe778`  
**Predecesor estable PC:** Guided Lesson MVP 3 — CLOSED / GREEN  
**Predecesor Knowledge:** MVP4A renderable figure candidate — PASS / CLOSED  
**Knowledge release público vigente:** `1.0.0`  
**Knowledge candidate objetivo:** `1.1.0` — `READY_FOR_MVP4B_COMPATIBILITY_GATE`

## 1. Propósito

MVP 3 demostró que CarpiNova-PC puede consumir una lección pedagógica canónica desde `lessons.bundle.json` sin duplicar ni inventar el contenido del libro.

MVP4A demostró en `CarpiNova-Knowledge` que una figura técnica real puede declarar un contrato de render determinístico, preservar trazabilidad a la página fuente, sobrevivir al builder BOOK y superar una comparación visual contra la fuente canónica.

MVP4B debe cerrar el siguiente hueco con el menor cambio correcto posible:

> CarpiNova-PC debe poder consumir Knowledge `1.1.0`, cargar figuras distribuidas y mostrar la primera figura técnica `normalized-2d-v1` dentro de la lección guiada existente, sin romper compatibilidad con Knowledge `1.0.0` y sin crear todavía un motor gráfico o de interacciones general.

Recorrido objetivo:

```text
abrir CarpiNova
→ cargar Knowledge 1.0.0 o 1.1.0 compatible
→ abrir “Calcular e instalar correderas con X y 2X”
→ ver una única figura técnica de apoyo cuando el bundle la declara renderizable
→ seguir leyendo los 5 pasos canónicos
→ abrir contenido/procedencia como hoy
```

MVP4B no redefine la lección ni la figura. Solo consume contratos ya distribuidos por Knowledge.

## 2. Evidencia que justifica MVP4B

### 2.1 PC ya transporta `figures.bundle.json`

`scripts/prepare-knowledge.mjs` ya exige:

```text
knowledge.bundle.json
figures.bundle.json
lessons.bundle.json
```

y verifica sus SHA-256 antes de instalar `generated/knowledge` de forma atómica.

Por tanto, MVP4B NO necesita nuevo pipeline, downloader, caché, copia de Knowledge ni almacenamiento separado de figuras.

### 2.2 Runtime todavía no carga figuras

`src/knowledge/loadKnowledge.ts` carga actualmente:

```text
manifest.json
knowledge.bundle.json
lessons.bundle.json
```

pero no `figures.bundle.json`.

`KnowledgeRepository` tampoco contiene:

```text
figures
figuresById
```

El hueco es concreto:

```text
Knowledge construye figures.bundle.json
→ PC verifica su integridad durante prepare
→ runtime todavía no lo consume
```

### 2.3 PC está fijado a Knowledge 1.0.0

Hay locks explícitos en:

```text
scripts/prepare-knowledge.mjs
src/knowledge/loadKnowledge.ts
src/knowledge/types.ts
```

El candidato MVP4A usa:

```text
knowledge_version = 1.1.0
scope = BOOK
book_id = cpnc-2025
source_manifest_sha256 = 318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c
```

Sin MVP4B, PC debe seguir rechazándolo.

### 2.4 La lección ya conserva `figure_ids`

`LessonStep` ya contiene:

```ts
figure_ids?: string[];
```

La lección `LESSON-SLIDES-X-2X-PILOT` referencia `FIG-CPNC-2025-P0113-001` en varios pasos. `LessonPage` actualmente ignora esas referencias.

No hace falta crear una ruta pedagógica nueva: el punto de integración ya existe.

### 2.5 Primera figura render-ready real

Knowledge `1.1.0` candidate distribuye:

```text
FIG-CPNC-2025-P0113-001
```

con:

```text
render_contract = normalized-2d-v1
coordinate_space = normalized_figure
viewport = {x:0,y:0,width:1,height:1}
```

Primitivas MVP4A:

```text
rect
line
polyline
```

Además conserva layers, entities, annotations con placement, `accessibility.summary` y las medidas 009 / 010 / 011.

## 3. Principios obligatorios

### 3.1 KISS

La solución debe ser:

- local-first;
- determinística;
- aditiva;
- sin backend;
- sin base de datos;
- sin servicio adicional de figuras;
- sin estado global nuevo fuera del `KnowledgeRepository` existente;
- sin dependencia gráfica nueva;
- sin engine genérico de render;
- sin duplicar el schema completo de Knowledge en PC.

### 3.2 Anti-ruido

Orden de decisión:

```text
REUTILIZAR > SIMPLIFICAR > MEJORAR > CREAR
```

Se reutilizan:

- `scripts/prepare-knowledge.mjs`;
- `loadKnowledge()`;
- `KnowledgeRepository`;
- `KnowledgeContext`;
- `LessonPage`;
- React;
- SVG nativo;
- tests y CI existentes.

### 3.3 Knowledge sigue siendo la única fuente de verdad

PC no inventa geometría, layers, posiciones, annotations, medidas, asociaciones de figuras con pasos ni interacción runtime.

Si Knowledge no declara un dato, PC no lo reconstruye.

### 3.4 `UNRESOLVED > INVENTED`

Una figura legacy válida pero no render-ready sigue siendo válida y simplemente no se dibuja.

Una figura que declara `normalized-2d-v1` pero viola el contrato mínimo de consumo falla cerrada durante carga.

## 4. Decisión arquitectónica aprobada

Se selecciona:

```text
A — compatibilidad aditiva en el loader existente
+
A1 — figura única deduplicada por lección
```

Se rechaza:

- corte directo a 1.1.0, porque rompería la transición con Knowledge 1.0.0;
- adapters/loaders separados por versión, porque añaden arquitectura innecesaria;
- renderer registry, plugin system, Canvas abstraction, Three.js, WebGL o scene graph, porque una sola capability real no los justifica.

## 5. Compatibilidad de versiones

### 5.1 Allowlist explícita

PC soportará exactamente:

```ts
type SupportedKnowledgeVersion = "1.0.0" | "1.1.0";
```

No se permiten rangos semver como `>=1.0.0`, `^1.0.0` o `1.x`.

Una futura `1.2.0` debe rechazarse hasta certificación explícita.

### 5.2 Invariantes que NO cambian

Ambas versiones deben exigir:

```text
book_id = cpnc-2025
scope = BOOK
source_manifest_sha256 = 318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c
artifact SHA-256 integrity = required
```

Aceptar 1.1.0 no debilita source identity ni artifact integrity.

### 5.3 Preparación local

`scripts/prepare-knowledge.mjs` debe aceptar ambas versiones soportadas y conservar el flujo actual:

```text
validate Knowledge repo
→ build-book-dist
→ validate manifest identity/version
→ verify artifact hashes
→ atomic install generated/knowledge
```

No existe modo especial para 1.1.0.

## 6. Contrato mínimo de figuras en PC

PC debe tipar solo los campos que consume.

Contrato conceptual:

```ts
interface FigureBundle {
  schema_version?: string;
  knowledge_version?: string;
  book_id?: string;
  scope?: string;
  figures: FigureRecord[];
}

interface FigureRecord {
  figure_id: string;
  page_id: string;
  type: string;
  purpose: string;
  entities: FigureEntity[];
  annotations: FigureAnnotation[];
  layers?: FigureLayer[];
  camera?: FigureCamera;
  reconstruction: FigureReconstruction;
  accessibility?: {
    summary?: string;
  };
}

interface FigureReconstruction {
  render_contract?: string;
}

type FigurePrimitive = "rect" | "line" | "polyline";
```

`layers` y `camera` permanecen opcionales en el tipo general porque una figura legacy puede ser válida sin contrato render-ready. Al optar por `normalized-2d-v1`, esos campos pasan a ser obligatorios por validación.

No se replica `figure.schema.json` completo.

## 7. Extensión del `KnowledgeRepository`

El repositorio existente se amplía a:

```ts
interface KnowledgeRepository {
  manifest: KnowledgeManifest;
  bundle: KnowledgeBundle;
  pagesById: Map<string, PageRecord>;
  contentById: Map<string, ContentRecord>;
  lessons: LessonRecord[];
  lessonsById: Map<string, LessonRecord>;
  figures: FigureRecord[];
  figuresById: Map<string, FigureRecord>;
}
```

No se crea `FigureRepository`, context separado ni service adicional.

## 8. Carga de `figures.bundle.json`

`loadKnowledge()` pasa a cargar:

```text
manifest.json
knowledge.bundle.json
figures.bundle.json
lessons.bundle.json
```

Flujo:

```text
manifest
→ knowledge bundle
→ figures bundle
→ lessons bundle
→ cross-reference validation
→ KnowledgeRepository
```

`figures.bundle.json` debe validarse antes de exponerse a UI.

## 9. Validación mínima consumer-side

Knowledge continúa siendo autoridad de validación profunda. PC valida solo lo necesario para consumir de forma segura.

### 9.1 Identidad

Si `figures.bundle.json` declara `knowledge_version`, `book_id` o `scope`, deben coincidir con `manifest.json`.

### 9.2 Colección

Debe cumplirse:

```text
figures = array
figure_id = string no vacío
figure_id unique
page_id = existing page
```

### 9.3 Integridad lesson → figure

Todo `figure_id` distribuido dentro de una lección debe resolver en `figuresById`.

### 9.4 Legacy figures

Una figura sin:

```text
reconstruction.render_contract = normalized-2d-v1
```

puede permanecer válida.

Resultado:

```text
load = valid
render = skipped
```

PC no infiere renderabilidad por `type`, nombre o presencia parcial de geometría.

### 9.5 `normalized-2d-v1`

Si una figura opta por ese contrato, PC exige:

```text
camera.coordinate_space = normalized_figure
camera.viewport = exactly {x:0,y:0,width:1,height:1}
layers = non-empty
supported primitives only
layer entity/annotation refs resolve locally
visible annotations have placement
```

El renderer nunca recibe un contrato render-ready roto.

## 10. Renderer UI

### 10.1 Componente

Nombre recomendado:

```text
src/features/figures/FigureDiagram.tsx
```

Responsabilidad única:

> Convertir un `FigureRecord` ya validado con `normalized-2d-v1` en SVG React nativo.

### 10.2 Canvas lógico

Usar:

```text
viewBox = 0 0 1000 1000
preserveAspectRatio = xMidYMid meet
```

Mapeo:

```text
normalized 0..1
→ SVG 0..1000
```

### 10.3 Primitivas

MVP4B soporta únicamente:

```text
rect
line
polyline
text annotation
```

Una primitive desconocida dentro de `normalized-2d-v1` es error de contrato; no hay fallback gráfico.

### 10.4 Painter order

Layers se dibujan por `order` ascendente y, en empate, por `id` para mantener orden estable. Dentro de cada layer se conserva el orden de sus arrays.

### 10.5 Texto seguro

Annotations se renderizan como nodos React `<text>`.

Prohibido:

```text
dangerouslySetInnerHTML
raw SVG string injection
HTML dentro del SVG
```

### 10.6 Estilo

La figura es técnica y esquemática, no fotorealista. La UI no debe convertir geometría `approximate` o `unknown` en apariencia de precisión CAD ni agregar cotas o detalles ausentes en Knowledge.

El SVG debe adaptarse al ancho disponible sin cambiar su `viewBox`; el layout de la página controla el tamaño visual, no los datos geométricos.

## 11. Integración en `LessonPage`

### 11.1 Estrategia A1

Los `figure_ids` de todos los pasos se recorren en orden canónico y se crea una lista:

```text
first-seen order
+ deduplicada
+ solo figures renderables
```

`FIG-CPNC-2025-P0113-001` debe mostrarse una sola vez aunque varios steps la referencien.

### 11.2 Ubicación

```text
lesson title
→ support figure section
→ ordered steps
```

No se repite la figura dentro de cada paso en MVP4B.

### 11.3 Sin nueva ruta

MVP4B NO añade `/figuras/:figureId`.

## 12. Interactions siguen siendo metadatos opacos

Metadata como:

```text
highlight
highlight_measurements
identify_parts
guided_sequence
```

NO se ejecuta en MVP4B.

El renderer no resalta entities por step, no oculta layers, no anima secuencias y no interpreta payloads de `interaction`.

## 13. Accessibility

Cada figura renderizada debe exponer:

```text
role = img
```

Nombre accesible determinístico:

```text
1. accessibility.summary si es string no vacío
2. figure.purpose si summary no existe o está vacío
```

Ambos valores provienen de Knowledge; no se inventa texto.

Annotations visibles permanecen como `<text>` SVG y la comprensión no debe depender únicamente del color.

## 14. Error handling

### 14.1 Fail closed

Debe fallar carga ante:

- Knowledge version no soportada;
- manifest inválido;
- artifact hash roto durante prepare;
- `figures` no array;
- duplicate `figure_id`;
- `page_id` inexistente;
- lesson `figure_id` inexistente;
- malformed `normalized-2d-v1`;
- primitive no soportada dentro del contrato;
- broken local layer references.

### 14.2 Legacy válido

No debe fallar por el solo hecho de encontrar una figura legacy no render-ready.

### 14.3 Sin placeholder ruidoso

No mostrar automáticamente “Figura no disponible” para figuras legacy. Se omiten silenciosamente porque no son renderizables bajo el contrato actual.

## 15. Compatibilidad 1.0.0

MVP4B debe demostrar que Knowledge `1.0.0` sigue funcionando.

En 1.0.0:

- `figures.bundle.json` ya existe;
- las figuras pueden ser legacy;
- `normalized-2d-v1` puede no existir;
- la lección sigue cargando;
- texto, búsqueda y ContentPage no degradan;
- si no hay figura render-ready, LessonPage permanece esencialmente como MVP3.

Compatibilidad NO significa reconstruir figuras legacy.

## 16. Compatibilidad 1.1.0

Con el candidato 1.1.0:

- prepare acepta la versión;
- runtime acepta la versión;
- `figures.bundle.json` se carga;
- P0113 resuelve por ID;
- `normalized-2d-v1` se reconoce y valida;
- la figura se muestra una vez;
- flows MVP1/MVP2/MVP3 se mantienen.

## 17. Mensajes de Bootstrap

`src/app/Bootstrap.tsx` actualmente menciona explícitamente “CarpiNova Knowledge 1.0.0” en el mensaje de error.

Con compatibilidad dual, ese texto debe volverse neutral respecto de la versión, por ejemplo conceptualmente:

```text
No se pudo cargar CarpiNova Knowledge. Ejecuta la preparación del conocimiento y vuelve a intentar.
```

La UI no debe afirmar una versión concreta que puede no ser la instalada.

## 18. Archivos que probablemente participarán

La implementación debería poder limitarse aproximadamente a:

```text
scripts/prepare-knowledge.mjs
src/app/Bootstrap.tsx
src/knowledge/types.ts
src/knowledge/loadKnowledge.ts
src/features/figures/FigureDiagram.tsx
src/features/lessons/LessonPage.tsx
src/styles/* existente cuando aplique
tests/* focales
```

Esto es expectativa de alcance, no autorización para modificar todos esos archivos. El plan deberá demostrar necesidad antes de cada cambio.

## 19. Tests obligatorios

La implementación seguirá TDD.

### 19.1 Prepare compatibility

```text
1.0.0 accepted
1.1.0 accepted
1.2.0 rejected
wrong source SHA rejected
broken artifact hash rejected
```

### 19.2 Loader compatibility

```text
1.0.0 accepted
1.1.0 accepted
unknown version rejected
figures bundle loaded
figuresById built
bundle identity mismatch rejected
```

### 19.3 Integrity

```text
duplicate figure_id rejected
missing page_id rejected
lesson missing figure_id rejected
malformed normalized-2d-v1 rejected
legacy figure accepted without render contract
```

### 19.4 Renderer

```text
rect
line
polyline
annotation text
layer ordering
stable output semantics
unknown primitive fail-closed
accessible role/name
summary -> purpose fallback
```

No se exige byte-identidad del DOM React con el renderer Python; sí equivalencia contractual y determinismo estructural.

### 19.5 Lesson integration

```text
P0113 rendered once when referenced multiple times
first-seen figure order preserved
legacy-only lesson creates no empty/noisy figure section
steps and content links unchanged
safe return navigation unchanged
```

### 19.6 Bootstrap

```text
error message remains actionable
error message is version-neutral
```

### 19.7 Regression

Debe pasar:

```text
npm test
npm run typecheck
npm run build
npm audit
```

además del CI existente.

## 20. Gate de integración real con Knowledge

Antes de cerrar MVP4B debe existir evidencia contra bundles reales, no solo fixtures manuales.

### 20.1 Knowledge 1.0.0

```text
CarpiNova-PC MVP4B branch
+
CarpiNova-Knowledge 1.0.0
→ knowledge:prepare PASS
→ runtime load PASS
→ existing lesson/content flows PASS
```

### 20.2 Knowledge 1.1.0 candidate

```text
CarpiNova-PC MVP4B branch
+
CarpiNova-Knowledge candidate 1.1.0
→ knowledge:prepare PASS
→ figures load PASS
→ lesson P0113 render PASS
→ tests/typecheck/build PASS
```

## 21. Release coordination

MVP4B cierra compatibilidad del consumidor, pero no publica Knowledge automáticamente.

Secuencia segura:

```text
MVP4A Knowledge candidate PASS
→ MVP4B PC compatibility PASS
→ coordinated release decision
→ merge/release Knowledge 1.1.0 solo con evidencia
```

Hasta entonces:

```text
Knowledge PR #31 = DRAFT / NOT MERGED
Knowledge public release = 1.0.0
```

La spec no autoriza cambiar ese estado.

## 22. Scope explícitamente fuera

MVP4B NO incluye:

```text
interaction runtime
step-based highlighting
measurement highlighting
identify_parts runtime
guided_sequence runtime
animation
zoom/pan
figure editor
figure search
figure standalone route
all-figure migration
source PDF raster crop rendering
generative rendering
3D
CAD
Three.js
WebGL
Canvas engine
backend
database
accounts
progress tracking
course engine
CarpiNova-cell
```

Agregar cualquiera requiere una decisión posterior explícita.

## 23. Criterios de aceptación

MVP4B puede considerarse funcionalmente completo solo si se demuestra:

1. compatibilidad con Knowledge 1.0.0;
2. compatibilidad explícita con Knowledge 1.1.0 candidate;
3. rechazo de versiones no certificadas;
4. source SHA/book/scope/artifact integrity estrictos;
5. `figures.bundle.json` cargado en runtime;
6. `figures` y `figuresById` expuestos desde el repositorio existente;
7. referencias lesson → figure validadas;
8. legacy figures válidas sin geometría inventada;
9. `normalized-2d-v1` validado antes de render;
10. React SVG limitado a rect/line/polyline/text del contrato;
11. P0113 visible una sola vez en la lección piloto;
12. nombre accesible derivado solo de `accessibility.summary` o `purpose`;
13. ningún metadata `interaction` ejecutado;
14. mensaje de Bootstrap neutral respecto de versión;
15. MVP1/MVP2/MVP3 sin regresión;
16. tests, typecheck, build, audit y CI verdes;
17. integración real 1.0.0 y 1.1.0 evidenciada.

## 24. Definición de éxito de producto

El éxito de MVP4B no es “tener un sistema de diagramas”.

El éxito es demostrar una cadena real y pequeña:

```text
PDF canónico
→ FigureSpec estructurado en Knowledge
→ BOOK 1.1.0
→ preparación íntegra en PC
→ loader/repository existente
→ lección canónica
→ SVG técnico accesible
```

sin duplicar conocimiento y sin añadir arquitectura prematura.

## 25. Estado después de esta spec

Cuando el usuario apruebe esta spec escrita:

```text
NEXT = escribir plan de implementación MVP4B
```

La aprobación de esta spec NO autoriza todavía implementación de producto.

El plan posterior deberá dividir el trabajo en bloques TDD pequeños y conservar la regla operativa:

```text
one short task
→ evidence / CI
→ checkpoint
→ STOP
```
