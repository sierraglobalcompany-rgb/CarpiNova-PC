# CarpiNova Guided Lesson MVP3 — aceptación local e integración real

- **Fecha:** 2026-10-13
- **Repositorio:** `sierraglobalcompany-rgb/CarpiNova-PC`
- **Branch observado:** `design/guided-lesson-mvp3-20261013`
- **PR:** `#4 — feat: guided lesson MVP3`
- **PC_SHA_PRODUCT_TESTED:** `e1988ded413921c4e9d008fd9b770eddccdba26b`
- **README_UPDATE_COMMIT:** `1df9c20d96456e9bb16e43c5deb18173dd55e18d`
- **Knowledge SHA canónico:** `a47119aba3d4711c1ac69f33f7d236d9bc20bb78`
- **Knowledge version:** `1.0.0`
- **book_id:** `cpnc-2025`
- **scope:** `BOOK`
- **source_manifest_sha256:** `318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c`
- **Lección canónica:** `LESSON-SLIDES-X-2X-PILOT`

## Alcance certificado por este documento

Este registro consolida únicamente los gates locales/integrados de cierre previo a merge para MVP3:

- **Task 5A — KISS / cero ruido**
- **Task 5B — Knowledge real + regresión completa**
- **Task 5C — aceptación visual responsive real**

No declara merge, CI post-merge ni cierre definitivo de MVP3. Al momento de elaborar este registro el PR #4 permanece **OPEN + DRAFT + NOT MERGED**.

El producto probado permanece fijado en `e1988ded413921c4e9d008fd9b770eddccdba26b`. Los cambios documentales posteriores no modifican código de producto y, conforme a la spec de MVP3, no reabren el gate visual ligado a ese SHA.

---

## Task 5A — auditoría KISS y cero ruido

**Resultado:** `PASS / CLOSED`

Se auditó el diff de producto desde el `main` estable anterior al MVP3:

```text
base = 27cb3e3346db041084898e633724861f9f8501c6
head = e1988ded413921c4e9d008fd9b770eddccdba26b
status = ahead
ahead_by = 12
behind_by = 0
```

El diff queda limitado a la funcionalidad MVP3, sus pruebas y los documentos de diseño/plan. Los archivos funcionales tocados son:

```text
src/app/routes.tsx
src/features/content/ContentPage.tsx
src/features/lessons/LessonPage.tsx
src/features/search/HomePage.tsx
src/knowledge/loadKnowledge.ts
src/knowledge/types.ts
src/styles/app.css
```

Las pruebas modificadas/añadidas cubren loader, Home, lección, contenido, accesibilidad y bootstrap.

Hallazgos KISS/anti-ruido:

- se reutiliza `KnowledgeRepository`; no se creó un segundo contexto React;
- se añadió una sola ruta de lección: `/lecciones/:lessonId`;
- `LessonPage` es un renderer pequeño de datos canónicos;
- Home descubre las lecciones desde `repository.lessons`; no hardcodea el ID piloto;
- `ContentPage` extiende únicamente la allowlist local de retorno;
- `interaction` permanece opaco; no existe motor de interacción;
- no se carga/renderiza `figures.bundle.json` en runtime para fingir soporte visual no implementado;
- no se añadieron backend, DB, auth, cuentas, progreso, favoritos, Cell, CAD/3D, IA/RAG, vector DB ni motor de cursos;
- no se añadieron dependencias nuevas ni cambios en `package.json`/`package-lock.json` dentro del diff de producto;
- no se duplicó contenido pedagógico de Knowledge dentro de PC.

Conclusión 5A: el cambio sigue la estrategia `REUSE > SIMPLIFY > IMPROVE > ADD` y mantiene la arquitectura existente sin una capa paralela.

---

## Task 5B — Knowledge real y regresión completa

**Resultado:** `PASS / CLOSED`

Para evitar certificar MVP3 solo con fixtures sintéticos se ejecutó una integración temporal contra `CarpiNova-Knowledge` real.

### Workflow de integración

Repositorio ejecutor:
`sierraglobalcompany-rgb/CarpiNova-Knowledge`

Workflow temporal:
`MVP3 PC Integration Audit`

Run:
`38428307447`

Job:
`115403460321`

Resultado:
`SUCCESS`

El workflow temporal realizó:

1. checkout del Knowledge canónico;
2. checkout exacto de CarpiNova-PC en `e1988ded413921c4e9d008fd9b770eddccdba26b`;
3. instalación reproducible de dependencias;
4. `npm run knowledge:prepare -- --knowledge-root ../CarpiNova-Knowledge`;
5. lectura del `manifest.json` generado;
6. lectura de `lessons.bundle.json` generado;
7. validación explícita de la lección piloto;
8. `npm test` completo;
9. `npm run typecheck`;
10. `npm run build`.

### Knowledge generado y validado

Resultado real:

```text
knowledge_version = 1.0.0
book_id = cpnc-2025
scope = BOOK
source_manifest_sha256 = 318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c
lesson_id = LESSON-SLIDES-X-2X-PILOT
title = Calcular e instalar correderas con X y 2X
steps = [1, 2, 3, 4, 5]
```

La preparación terminó con:

```text
CarpiNova Knowledge 1.0.0 prepared
```

### Suite completa

Vitest:

```text
Test Files  10 passed (10)
Tests       73 passed (73)
```

Distribución por archivos observada en el run:

```text
knowledge-loader.test.ts          30
search-ui.test.tsx                11
content-page.test.tsx              9
search-knowledge.test.ts           7
accessibility-ui.test.tsx          4
lesson-page.test.tsx               2
bootstrap.test.tsx                 3
prepare-knowledge.test.ts          5
lesson-accessibility.test.tsx      1
app-shell.test.tsx                 1
```

Además:

```text
npm run typecheck  PASS
npm run build      PASS
```

El workflow de integración temporal vivió fuera de CarpiNova-PC y no se fusionó al repositorio canónico. El PR temporal de Knowledge usado para esa auditoría se cerró sin merge.

El CI normal de CarpiNova-PC también registró `CarpiNova PC CI` run `38425783446` como `SUCCESS` sobre el mismo SHA de producto `e1988ded413921c4e9d008fd9b770eddccdba26b`.

---

## Task 5C — aceptación visual responsive real

**Resultado:** `PASS / CLOSED`

El navegador interactivo no estaba disponible en el entorno de trabajo, por lo que se usó un harness temporal de GitHub Actions con Chromium real y Playwright. El harness se mantuvo fuera de CarpiNova-PC y no añadió dependencias al producto.

### Workflow visual

Repositorio ejecutor:
`sierraglobalcompany-rgb/CarpiNova-Knowledge`

PR temporal:
`#30 — test: MVP3 responsive visual audit`

Branch temporal:
`audit/mvp3-visual-20261013`

Estado final del PR temporal:

```text
CLOSED
NOT MERGED
```

Run final válido:
`38430191761`

Job:
`115410039066`

Resultado:
`SUCCESS`

### Viewports

```text
Desktop  1440 × 1000
Tablet    768 × 1024
Mobile    390 × 844
```

### Checks renderizados

En los tres viewports:

- descubrimiento de la lección desde Home: PASS;
- título canónico renderizado: PASS;
- exactamente un `h1` en LessonPage: PASS;
- 5 pasos en DOM: PASS;
- orden canónico de los pasos: PASS;
- sin overflow horizontal en Home: PASS;
- sin overflow horizontal en LessonPage: PASS;
- sin overflow horizontal en ContentPage: PASS;
- navegación lección → contenido: PASS;
- navegación contenido → lección: PASS;
- errores de consola/página: ninguno.

### Teclado real

La comprobación final usó `Tab`, no `element.focus()`:

```text
primer Tab  -> Volver al inicio
segundo Tab -> Ver contenido
```

Outline observado sobre el enlace enfocado:

```text
outline-style: solid
outline-width: 3px
outline-color: rgb(31, 95, 102)
```

### Evidencia visual

Artifact:
`carpinova-mvp3-visual-audit`

Artifact ID:
`11830641300`

Digest:
`sha256:cd77ca5e745024a92d91376735505e81789928085b28ab442c3c1efd8e11332e`

El artifact contiene `audit.json` y nueve capturas:

```text
desktop-1440-home.png
desktop-1440-lesson-focus.png
desktop-1440-content.png
tablet-768-home.png
tablet-768-lesson-focus.png
tablet-768-content.png
mobile-390-home.png
mobile-390-lesson-focus.png
mobile-390-content.png
```

Las nueve capturas fueron inspeccionadas manualmente. No se observaron recortes, solapamientos, overflow horizontal ni pérdida de jerarquía visual. El foco es visible y los enlaces esenciales permanecen utilizables.

### Falsos fallos del harness documentados

Antes del run final hubo dos fallos del harness, no del producto:

1. se esperaba únicamente el cambio de URL y se leía el DOM antes del render posterior de React Router;
2. se usó `element.focus()` para validar CSS basado en `:focus-visible`, en vez de modalidad de teclado real.

Ambos se corrigieron exclusivamente en el workflow temporal. CarpiNova-PC no cambió durante Task 5C.

### Guardrails visuales

PASS:

- no aparece UI falsa de figuras;
- no se ejecuta `highlight`;
- no se ejecuta `highlight_measurements`;
- no se ejecuta `identify_parts`;
- no se ejecuta `guided_sequence`;
- no aparece un stepper/progreso inventado;
- no hay acciones esenciales dependientes solo de hover.

---

## Resultado consolidado previo a merge

```text
Task 5A — KISS / cero ruido                     PASS / CLOSED
Task 5B — Knowledge real + regresión completa  PASS / CLOSED
Task 5C — aceptación visual responsive real    PASS / CLOSED
```

El flujo demostrado con Knowledge real es:

```text
Home
-> Aprende paso a paso
-> Calcular e instalar correderas con X y 2X
-> pasos 1..5
-> Ver contenido
-> comprobar contenido/procedencia
-> Volver a la lección
```

La fuente de verdad continúa siendo `CarpiNova-Knowledge`. CarpiNova-PC consume la relación pedagógica distribuida; no la vuelve a autorar.

## Lo que este PASS no autoriza por sí solo

Este documento no declara ni ejecuta:

- ready del PR #4;
- merge del PR #4;
- CI post-merge de `main`;
- cierre definitivo de `CARPINOVA-PC MVP3`.

Esos gates pertenecen al siguiente bloque separado.

MVP3_GUIDED_LESSON_LOCAL_ACCEPTANCE_PASS
