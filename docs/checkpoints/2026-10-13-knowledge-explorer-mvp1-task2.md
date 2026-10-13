# CHECKPOINT — CarpiNova-PC Knowledge Explorer MVP 1

Fecha: 2026-10-13
Estado: PAUSA SOLICITADA POR EL USUARIO

## Repositorio y rama

- Repositorio: `sierraglobalcompany-rgb/CarpiNova-PC`
- Rama de trabajo: `design/knowledge-explorer-mvp1-20261012`
- HEAD previo al checkpoint: `55b1de7a13009445ae857b4e6d8688cfbf8980a2`
- Commit previo: `feat: prepare validated Knowledge bundle`
- `main` no fue modificado durante esta ejecución.

## Diseño y plan aprobados

- Spec: `docs/superpowers/specs/2026-10-12-carpinova-pc-knowledge-explorer-mvp1-design.md`
- Plan: `docs/superpowers/plans/2026-10-12-carpinova-pc-knowledge-explorer-mvp1-implementation.md`
- Dirección aprobada: Knowledge Explorer educativo, KISS, local-first, sin backend/DB/IA/CAD/3D/Furniture Engine.

## Task 1 — Foundation

Estado: GREEN CERRADO funcionalmente.

Implementado:
- React + Vite + TypeScript + Vitest + Testing Library.
- `AppShell` con banner y `<main>`.
- `src/main.tsx`.
- CSS base.
- `.gitignore` protege `/generated/`, `/dist/`, `/node_modules/`.
- GitHub Actions ejecuta test completo, typecheck y build.

Evidencia TDD:
- RED válido: run `38340990074`, fallo esperado porque `src/app/AppShell` no existía.
- GREEN focal/completo: run `38341069331`, test 1/1 PASS, typecheck PASS, build PASS.
- CI completo posterior: run `38341325073`, test PASS, typecheck PASS, build PASS.

Ruling pendiente no bloqueante para cierre final:
- `package-lock.json` todavía no está versionado porque este conector no puede trasladar directamente al repo el artefacto generado por CI sin ampliar permisos del workflow.
- El lockfile exacto se debe materializar y versionar durante la verificación local final en Windows; hasta entonces CI usa `npm install`.

## Task 2 — Preparación determinística de Knowledge

Estado: GREEN IMPLEMENTADO, VERIFICACIÓN CI EN CURSO AL MOMENTO DE PAUSAR.

RED confirmado:
- Commit RED: `2c63c26e70bfd018770c13e516fdee4254393856`
- Run RED: `38341425947`
- Resultado: FAIL esperado en `tests/prepare-knowledge.test.ts` porque `scripts/prepare-knowledge.mjs` no existía.
- `tests/app-shell.test.tsx` siguió pasando.

GREEN implementado en:
- Commit: `55b1de7a13009445ae857b4e6d8688cfbf8980a2`
- Archivo: `scripts/prepare-knowledge.mjs`
- Modificado: `package.json` con script `knowledge:prepare`.

Contrato implementado:
- `knowledge_version = 1.0.0`
- `book_id = cpnc-2025`
- `scope = BOOK`
- SHA-256 canónico esperado: `318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c`
- Requiere y verifica hashes de:
  - `knowledge.bundle.json`
  - `figures.bundle.json`
  - `lessons.bundle.json`
- Usa solo built-ins de Node.
- Ejecuta validación/build del repo Knowledge mediante `uv`.
- Construye en temporal bajo `generated/`.
- Reemplaza `generated/knowledge/` solo después de validar manifest + hashes.
- En fallo conserva la instalación anterior y limpia el temporal.

Pruebas nuevas de Task 2:
- contrato exacto del manifest;
- rechazo de versión/book/scope/SHA incorrectos;
- hashes obligatorios;
- detección de hash alterado;
- detección de artefacto faltante;
- preservación atómica del directorio instalado ante fallo.

CI al momento de este checkpoint:
- Run GREEN: `38341682023`
- Estado observado justo antes de pausar: `in_progress`.
- No declarar Task 2 cerrada hasta consultar el resultado de ese run y revisar logs si falla.

## Siguiente paso exacto al retomar

1. Consultar el resultado de GitHub Actions run `38341682023` asociado a `55b1de7a13009445ae857b4e6d8688cfbf8980a2`.
2. Si PASS: revisar brevemente logs y marcar Task 2 GREEN; no modificar código adicional.
3. Si FAIL: aplicar `systematic-debugging`, identificar causa raíz y corregir solo esa causa.
4. Después iniciar Task 3 con TDD: primero pruebas RED de `src/knowledge/loadKnowledge.ts`, IDs duplicados y referencias `page_id` colgantes; no escribir el loader antes del RED.

## Guardrails de continuidad

- No modificar `main` directamente.
- No hacer merge sin revisión/cierre del plan.
- No inventar datos, procedencia, reglas técnicas ni seguridad.
- `CarpiNova-Knowledge` sigue siendo la única fuente de verdad.
- No duplicar manualmente Knowledge dentro de CarpiNova-PC.
- No añadir backend, DB, API propia, Docker, auth, IA, embeddings, vector DB, PWA, móvil, CAD/3D o Furniture Engine en este MVP.
- Mantener búsqueda determinística y fail-closed.
- No convertir mediciones/RuleSpec en instrucciones por proximidad de página.
- Mantener el flujo TDD: RED observado -> GREEN mínimo -> verificación completa -> commit.

## Estado de pausa

Checkpoint creado por solicitud explícita del usuario. No continuar implementación después de este archivo hasta una nueva instrucción explícita de continuar.
