# CarpiNova-PC — Checkpoint 2026-10-13

## Rama activa

`design/knowledge-explorer-mvp1-20261012`

No se ha fusionado esta rama a `main`.

## Estado general

- Task 1: GREEN y cerrada.
- Task 2: GREEN y cerrada. Preparación determinística de Knowledge validada en CI.
- Task 3: GREEN y cerrada. Loader runtime fail-closed, validación mínima del contrato e índices `page_id` / `content_id`.
- Task 4: GREEN y cerrada. Búsqueda determinística + categorías canónicas por `content_type`, sin IA, fuzzy, embeddings ni `source_transcription`.
- Task 5: implementación GREEN escrita y subida, pero **CI todavía estaba en ejecución al crear este checkpoint**. No debe darse por cerrada hasta verificar ese run.

## Último commit funcional antes del checkpoint

`810b015bbd1f8dc838aea4d6da8e48b3bac1661d` — `feat: add Knowledge search experience`

Incluye:

- `src/app/routes.tsx`
- `src/features/search/HomePage.tsx`
- `src/features/search/SearchPage.tsx`
- `src/features/search/SearchForm.tsx`
- `src/features/search/CategoryFilter.tsx`
- `src/features/search/SearchResultCard.tsx`
- `tests/search-ui.test.tsx`

## CI pendiente en el momento del checkpoint

Workflow run: `38343555431`

Estado observado al detener:

- job `test`: `in_progress`
- checkout: PASS
- setup-node: PASS
- install dependencies: en ejecución
- tests: pendiente
- typecheck: pendiente
- build: pendiente

Por tanto, **Task 5 NO está certificada todavía**.

## Secuencia TDD ya confirmada

- Task 3 RED: fallo por ausencia de `src/knowledge/loadKnowledge`.
- Task 3 GREEN: CI PASS completo.
- Task 4 RED: fallo por ausencia de `src/knowledge/contentTypes` / `searchKnowledge`.
- Task 4 GREEN: CI PASS completo.
- Task 5 RED: fallo por ausencia de `src/app/routes`.
- Task 5 GREEN: implementación commit `810b015...`; falta confirmar CI.

## Decisiones que no deben cambiar al reanudar

- React + Vite + TypeScript.
- SPA estática.
- Sin backend, DB, microservicios, IA, embeddings ni vector DB.
- Knowledge es la única fuente de verdad.
- El bundle privado no se comitea al repositorio público de CarpiNova-PC.
- Búsqueda local/determinística sobre `learning_text`, `normalized_text`, `tags` y `content_type`.
- `source_transcription` no participa en búsqueda.
- Categorías iniciales = `content_type` canónico, no taxonomía paralela.
- UI principiante primero.
- URL mantiene estado de búsqueda/filtro.
- Parámetros `type` desconocidos se ignoran en UI y nunca crean categorías ficticias.
- No conectar todavía `main.tsx` directamente al loader; la unión fail-closed corresponde a Task 8 mediante `Bootstrap`.
- No inferir reglas, medidas ni recomendaciones técnicas desde registros no explícitos.

## Próximo paso exacto al reanudar

1. Verificar el resultado final del run `38343555431`.
2. Si PASS completo: cerrar Task 5 y abrir Task 6 con RED primero.
3. Si FAIL: leer logs y corregir solo la causa raíz; no abrir Task 6.
4. Task 6 prevista: detalle de contenido + fallback de texto + procedencia, sin unir automáticamente medidas/reglas/figuras.

## Deuda conocida no bloqueante

`package-lock.json` fue generado por CI pero aún no se materializó en el repositorio debido a las limitaciones del conector para ese artefacto. La validación local final en Windows debe materializarlo y permitir migrar CI de `npm install` a `npm ci` antes del cierre del MVP.

## Regla de parada

Este checkpoint se creó por solicitud explícita del usuario. No continuar implementación, auditoría ni CI adicional hasta una nueva orden de continuar.
