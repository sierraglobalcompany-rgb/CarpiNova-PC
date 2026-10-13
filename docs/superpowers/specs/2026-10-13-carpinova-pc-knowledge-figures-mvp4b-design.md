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

MVP4A demostró en `CarpiNova-Knowledge` que una figura técnica real puede:

- declarar un contrato de render determinístico;
- preservar trazabilidad a la página fuente;
- describirse con geometría estructurada simple;
- sobrevivir al builder BOOK;
- renderizarse de forma byte-determinística;
- superar una comparación visual contra la fuente canónica.

MVP4B debe cerrar el siguiente hueco con el menor cambio correcto posible:

> CarpiNova-PC debe poder consumir Knowledge `1.1.0`, cargar figuras distribuidas y mostrar la primera figura técnica `normalized-2d-v1` dentro de la lección guiada existente, sin romper compatibilidad con Knowledge `1.0.0` y sin crear todavía un motor gráfico o de interacciones general.

Recorrido objetivo:

```text
abrir CarpiNova
→ cargar Knowledge 1.0.0 o 1.1.0 compatible
→ abrir “Calcular e instalar correderas con X y 2X”
→ ver una única figura técnica de apoyo cuando el bundle 1.1.0 la declara renderizable
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

También verifica los SHA-256 declarados por `manifest.json` antes de instalar `generated/knowledge` de forma atómica.

Por tanto, MVP4B NO necesita:

- nuevo pipeline de distribución;
- nuevo downloader;
- nueva caché;
- nueva copia del Knowledge;
- almacenamiento separado de figuras.

El artifact ya está dentro del flujo canónico de preparación.

### 2.2 Runtime todavía no carga figuras

`src/knowledge/loadKnowledge.ts` actualmente carga:

```text
manifest.json
knowledge.bundle.json
lessons.bundle.json
```

pero no carga:

```text
figures.bundle.json
```

`KnowledgeRepository` tampoco contiene:

```text
figures
figuresById
```

Existe entonces un hueco concreto:

```text
Knowledge construye figures.bundle.json
→ PC verifica su integridad durante prepare
→ runtime todavía no lo consume
```

MVP4B cierra exactamente ese hueco.

### 2.3 PC está fijado a Knowledge 1.0.0

Hay dos locks explícitos actuales:

```text
scripts/prepare-knowledge.mjs
EXPECTED_KNOWLEDGE_VERSION = "1.0.0"
```

```text
src/knowledge/loadKnowledge.ts
knowledge_version esperado = "1.0.0"
```

Además `KnowledgeManifest.knowledge_version` está tipado como literal `"1.0.0"`.

Knowledge MVP4A genera un candidato BOOK:

```text
knowledge_version = 1.1.0
scope = BOOK
book_id = cpnc-2025
source_manifest_sha256 = 318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c
```

Sin MVP4B, PC rechaza correctamente ese candidato.

### 2.4 La lección ya conserva `figure_ids`

`LessonStep` ya contiene:

```ts
figure_ids?: string[];
```

La lección `LESSON-SLIDES-X-2X-PILOT` referencia:

```text
FIG-CPNC-2025-P0113-001
```

varias veces entre sus pasos.

`LessonPage` actualmente ignora esas referencias.

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
viewport = 0 / 0 / 1 / 1
```

Primitivas del contrato MVP4A:

```text
rect
line
polyline
```

La figura contiene además:

- `layers` ordenadas;
- entities con geometría;
- annotations con placement;
- `accessibility.summary`;
- referencias de medidas 009 / 010 / 011;
- geometría marcada como `approximate` o `unknown` cuando corresponde.

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
- sin engine genérico de render prematuro;
- sin duplicar el schema completo de Knowledge en PC.

### 3.2 Anti-ruido

Orden obligatorio de decisión:

```text
REUTILIZAR > SIMPLIFICAR > MEJORAR > CREAR
```

MVP4B debe reutilizar:

- `scripts/prepare-knowledge.mjs`;
- `loadKnowledge()`;
- `KnowledgeRepository`;
- `KnowledgeContext`;
- `LessonPage`;
- React;
- SVG nativo;
- tests y CI existentes.

No se crea infraestructura paralela cuando el flujo actual puede extenderse.

### 3.3 Knowledge sigue siendo la única fuente de verdad

PC no puede inventar:

- geometría;
- layers;
- posiciones;
- annotations;
- medidas;
- asociaciones de figuras con pasos;
- contenido técnico;
- interacción no distribuida.

Si Knowledge no declara un dato, PC no lo reconstruye.

### 3.4 `UNRESOLVED > INVENTED`

Una figura legacy válida pero no render-ready debe seguir siendo válida y simplemente no dibujarse.

Una figura que declara `normalized-2d-v1` pero viola el contrato mínimo de consumo debe fallar cerrada durante carga, no renderizarse parcialmente.

## 4. Decisión arquitectónica aprobada

Se selecciona:

```text
A — compatibilidad aditiva en el loader existente
+
A1 — figura única deduplicada por lección
```

Se rechaza:

### 4.1 Corte directo a 1.1.0

Cambiar PC de `1.0.0` a `1.1.0` como reemplazo único sería más corto, pero rompería el release Knowledge `1.0.0` durante la transición coordinada.

### 4.2 Adapters/loaders separados por versión

Crear `KnowledgeV1Adapter`, `KnowledgeV11Adapter` o un router de versiones añade arquitectura sin necesidad demostrada. Los contratos son suficientemente aditivos para un único loader con allowlist explícita.

### 4.3 Motor gráfico genérico

No se crea:

- renderer registry;
- plugin system;
- Canvas abstraction;
- Three.js;
- WebGL;
- scene graph;
- parser SVG arbitrario.

Una sola figura real no justifica esas capas.

## 5. Compatibilidad de versiones

### 5.1 Allowlist explícita

PC soportará exactamente:

```ts
type SupportedKnowledgeVersion = "1.0.0" | "1.1.0";
```

La validación debe seguir siendo fail-closed.

No se permiten rangos tipo:

```text
>=1.0.0
^1.0.0
1.x
```

Una versión futura como `1.2.0` debe rechazarse hasta que PC la certifique explícitamente.

### 5.2 Invariantes que NO cambian

Tanto 1.0.0 como 1.1.0 deben exigir:

```text
book_id = cpnc-2025
scope = BOOK
source_manifest_sha256 = 318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c
artifact SHA-256 integrity = required
```

La compatibilidad de versión no debilita source identity ni artifact integrity.

### 5.3 Preparación local

`scripts/prepare-knowledge.mjs` debe aceptar ambas versiones soportadas.

El flujo sigue siendo:

```text
validate Knowledge repo
→ build-book-dist
→ validate manifest identity/version
→ verify artifact hashes
→ atomic install generated/knowledge
```

No se introduce modo especial para 1.1.0.

## 6. Contrato mínimo de figuras en PC

PC debe tipar solo lo que consume.

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
  layers: FigureLayer[];
  camera?: FigureCamera;
  reconstruction: FigureReconstruction;
  accessibility?: {
    summary?: string;
  };
}

interface FigureReconstruction {
  render_contract?: string;
}
```

Para `normalized-2d-v1`, PC además necesita geometría mínima:

```ts
type FigurePrimitive = "rect" | "line" | "polyline";
```

No se replica el `figure.schema.json` completo.

## 7. Extensión del `KnowledgeRepository`

El repositorio existente se amplía conceptualmente a:

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

`loadKnowledge()` pasa a cargar cuatro documentos runtime:

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

`figures.bundle.json` debe validarse antes de exponerlo a UI.

## 9. Validación mínima consumer-side

Knowledge continúa siendo autoridad de validación profunda.

PC valida únicamente lo que necesita para consumir de forma segura.

### 9.1 Identidad de bundle

Si `figures.bundle.json` declara cualquiera de estos campos:

```text
knowledge_version
book_id
scope
```

deben coincidir con `manifest.json`.

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

PC no tolera referencias rotas.

### 9.4 Legacy figures

Una figura que no declara:

```text
reconstruction.render_contract = normalized-2d-v1
```

puede permanecer válida.

Resultado:

```text
load = valid
render = skipped
```

PC no debe inferir renderabilidad a partir de `type`, `entities` o nombres.

### 9.5 `normalized-2d-v1`

Si una figura opta explícitamente por ese contrato, PC debe exigir al menos:

```text
camera.coordinate_space = normalized_figure
viewport = valid 0..1 full viewport
layers = non-empty
supported primitives only
layer references resolve locally
rendered annotations have placement
```

La validación PC no necesita duplicar todas las reglas editoriales de Knowledge, pero sí debe impedir que el renderer reciba un contrato roto.

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

Esto replica conceptualmente el renderer QA de Knowledge sin copiar infraestructura Python.

### 10.3 Primitivas

MVP4B soporta únicamente:

```text
rect
line
polyline
text annotation
```

No existe fallback para primitive desconocida.

Una primitive desconocida en una figura `normalized-2d-v1` es error de contrato.

### 10.4 Painter order

Layers se dibujan por:

```text
order ascendente
```

En empate, usar criterio estable por `id` para evitar nondeterminismo.

Dentro de cada layer se conserva el orden de sus arrays.

### 10.5 Texto

Annotations se renderizan como nodos React `<text>`.

No usar:

```text
dangerouslySetInnerHTML
raw SVG string injection
HTML dentro del SVG
```

React se encarga del escaping de texto.

### 10.6 Estilo

MVP4B utiliza estilo técnico simple y consistente con la app.

La geometría es semántica, no fotorealista.

No debe presentar geometría `approximate` o `unknown` como precisión CAD.

No se agregan cotas, flechas ni detalles que Knowledge no distribuye.

## 11. Integración en `LessonPage`

### 11.1 Estrategia A1

Los `figure_ids` de todos los pasos se recorren en orden canónico.

Se construye una lista:

```text
first-seen order
+ deduplicada
+ solo figures renderables
```

Para la lección piloto, `FIG-CPNC-2025-P0113-001` aparece una sola vez aunque varios steps la referencien.

### 11.2 Ubicación

Las figuras renderables se muestran:

```text
lesson title
→ support figure section
→ ordered steps
```

No se insertan repetidamente dentro de cada paso en MVP4B.

### 11.3 Razón

Esta ubicación:

- evita ruido visual;
- no finge que `interaction` ya se ejecuta;
- mantiene la figura disponible como referencia mientras se lee la lección;
- conserva la secuencia pedagógica textual existente.

### 11.4 Sin nueva ruta

MVP4B NO añade:

```text
/figuras/:figureId
```

No existe necesidad actual de navegación standalone de figuras.

## 12. Interactions siguen siendo metadatos opacos

La lección contiene metadata como:

```text
highlight
highlight_measurements
identify_parts
guided_sequence
```

MVP4B NO la ejecuta.

El renderer no debe:

- resaltar entities según step;
- ocultar layers;
- animar secuencias;
- cambiar estado por step;
- interpretar payloads de interaction.

La existencia de esos metadatos no autoriza comportamiento runtime.

Eso requiere otro MVP explícito.

## 13. Accessibility

Cada figura renderizada debe exponer significado suficiente sin depender del dibujo.

Contrato mínimo:

```text
role = img
aria-label = accessibility.summary
```

Si una figura `normalized-2d-v1` no contiene un summary usable, el plan de implementación debe decidir un fallback seguro basado únicamente en campos canónicos (`purpose`), nunca en texto inventado.

Annotations visibles permanecen como texto SVG.

No depender solo de color para distinguir estructura.

## 14. Error handling

### 14.1 Fail closed

Debe fallar carga ante:

- Knowledge version no soportada;
- manifest inválido;
- artifact hash roto en prepare;
- `figures` no array;
- duplicate `figure_id`;
- `page_id` inexistente;
- lesson `figure_id` inexistente;
- malformed `normalized-2d-v1`;
- primitive no soportada dentro de contrato renderizable;
- broken local layer references.

### 14.2 Legacy válido

No debe fallar por el solo hecho de encontrar una figura legacy no render-ready.

```text
legacy figure
→ valid data
→ no FigureDiagram
```

### 14.3 No placeholder engañoso

No mostrar mensajes tipo:

```text
“Figura no disponible”
```

para cada figura legacy de todo el libro.

Eso convertiría ausencia de capability en ruido UI.

MVP4B simplemente omite figuras no renderables.

## 15. Compatibilidad 1.0.0

MVP4B debe demostrar explícitamente que Knowledge `1.0.0` sigue funcionando.

En 1.0.0:

- `figures.bundle.json` ya existe;
- muchas figuras son legacy;
- `normalized-2d-v1` puede no existir;
- la lección debe seguir cargando;
- texto, búsqueda y ContentPage no deben degradarse;
- si no hay figura render-ready, LessonPage permanece esencialmente como MVP3.

La compatibilidad no significa intentar reconstruir legacy figures.

## 16. Compatibilidad 1.1.0

Con el candidato 1.1.0:

- prepare debe aceptar versión;
- runtime debe aceptar versión;
- `figures.bundle.json` debe cargarse;
- P0113 debe resolver por ID;
- debe reconocerse `normalized-2d-v1`;
- la figura debe mostrarse una sola vez en la lección;
- el resto de flows MVP1/MVP2/MVP3 debe mantenerse.

## 17. Archivos que probablemente participarán

La implementación debería poder limitarse aproximadamente a:

```text
scripts/prepare-knowledge.mjs
src/knowledge/types.ts
src/knowledge/loadKnowledge.ts
src/features/figures/FigureDiagram.tsx
src/features/lessons/LessonPage.tsx
src/styles/* existente cuando aplique
tests/* focales
```

Esto es una expectativa de alcance, no autorización para tocar todos esos archivos.

El plan debe demostrar necesidad antes de cada cambio.

## 18. Tests obligatorios

La implementación seguirá TDD.

### 18.1 Prepare compatibility

Probar:

```text
1.0.0 accepted
1.1.0 accepted
1.2.0 rejected
wrong source SHA rejected
broken artifact hash rejected
```

### 18.2 Loader compatibility

Probar:

```text
1.0.0 accepted
1.1.0 accepted
unknown version rejected
figures bundle loaded
figuresById built
bundle identity mismatch rejected
```

### 18.3 Integrity

Probar:

```text
duplicate figure_id rejected
missing page_id rejected
lesson missing figure_id rejected
malformed normalized-2d-v1 rejected
legacy figure accepted without render contract
```

### 18.4 Renderer

Probar:

```text
rect
line
polyline
annotation text
layer ordering
stable output semantics
unknown primitive fail-closed
accessible role/name
```

No se exige byte-identidad DOM con Python; sí equivalencia contractual y determinismo de estructura.

### 18.5 Lesson integration

Probar:

```text
P0113 rendered once when referenced multiple times
first-seen figure order preserved
legacy-only lesson does not create empty noisy figure section
steps and content links remain unchanged
safe return navigation remains unchanged
```

### 18.6 Regression

Debe pasar:

```text
npm test
npm run typecheck
npm run build
npm audit
```

además del CI existente.

## 19. Gate de integración real con Knowledge

Antes de cerrar MVP4B debe existir evidencia usando el candidato real de Knowledge 1.1.0, no solo fixtures construidos a mano.

Gate mínimo:

```text
CarpiNova-PC branch
+
CarpiNova-Knowledge candidate 1.1.0
→ knowledge:prepare PASS
→ runtime bundles PASS
→ lesson P0113 render PASS
→ tests/typecheck/build PASS
```

También debe ejecutarse una comprobación separada con Knowledge 1.0.0.

## 20. Release coordination

MVP4B cierra compatibilidad del consumidor, pero no debe publicar Knowledge automáticamente.

Secuencia segura:

```text
MVP4A Knowledge candidate PASS
→ MVP4B PC compatibility PASS
→ coordinated release decision
→ merge/release Knowledge 1.1.0 only after evidence
```

Hasta entonces:

```text
Knowledge PR #31 = DRAFT / NOT MERGED
Knowledge public release = 1.0.0
```

La spec no autoriza cambiar ese estado.

## 21. Scope explícitamente fuera

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

## 22. Criterios de aceptación

MVP4B puede considerarse funcionalmente completo solo si se demuestra todo lo siguiente:

1. PC conserva compatibilidad con Knowledge 1.0.0.
2. PC acepta explícitamente Knowledge 1.1.0 candidate.
3. Versiones no certificadas siguen rechazándose.
4. Source SHA/book/scope/artifact integrity permanecen estrictos.
5. `figures.bundle.json` se carga en runtime.
6. `figures` y `figuresById` se exponen desde el repositorio existente.
7. Las referencias lesson → figure se validan.
8. Legacy figures siguen válidas y no se inventan.
9. `normalized-2d-v1` se valida antes de render.
10. React SVG soporta únicamente rect/line/polyline/text del contrato actual.
11. P0113 se muestra una sola vez en la lección piloto.
12. `accessibility.summary` se usa para nombre accesible cuando existe.
13. No se ejecuta ningún metadata `interaction`.
14. MVP1/MVP2/MVP3 no regresan.
15. Tests, typecheck, build, audit y CI pasan.
16. Integración real 1.0.0 y 1.1.0 queda evidenciada.

## 23. Definición de éxito de producto

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

sin duplicar conocimiento y sin añadir una arquitectura que todavía no necesitamos.

## 24. Estado después de esta spec

Cuando el usuario apruebe esta spec escrita:

```text
NEXT = escribir plan de implementación MVP4B
```

La aprobación de esta spec NO autoriza todavía implementación de producto.

El plan posterior deberá dividir el trabajo en bloques TDD pequeños y conservar la regla operativa del proyecto:

```text
one short task
→ evidence / CI
→ checkpoint
→ STOP
```
