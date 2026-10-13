# CarpiNova-PC MVP 1 — Checkpoint before Task 8

Date: 2026-10-13
Branch: `design/knowledge-explorer-mvp1-20261012`

## Certified state

### Task 1 — Scaffold React/Vite/TypeScript
CLOSED / GREEN.

### Task 2 — Knowledge preparation contract
CLOSED / GREEN.

### Task 3 — Runtime Knowledge boundary / fail-closed loader
CLOSED / GREEN.

### Task 4 — Deterministic search and content-type categories
CLOSED / GREEN.

### Task 5 — Home, search results and category navigation
CLOSED / GREEN.

Task 5 was certified by the later checkpoint commit CI run `38343775406`, which completed successfully with the same application code plus documentation.

### Task 6 — Traceable content detail
CLOSED / GREEN.

Implemented:
- `/contenido/:contentId`
- primary text fallback order: `learning_text` -> `normalized_text` -> `source_transcription`
- explicit source/provenance disclosure
- unknown-content handling
- no implicit join of measurements/rules merely by shared `page_id`

Final certification run: `38344151195` — SUCCESS.
- tests: PASS
- typecheck: PASS
- build: PASS

### Task 7 — Taller moderno / responsive / accessibility baseline
AUTOMATED PORTION CLOSED / GREEN.

Implemented:
- selected category exposes `aria-current="page"`
- responsive search layout
- visible focus style
- labelled search
- keyboard Enter search behavior
- native `<details>/<summary>` provenance disclosure
- responsive Workshop-style CSS without a component framework

Certification run: `38344441591` — SUCCESS.
- tests: PASS
- typecheck: PASS
- build: PASS

Manual visual smoke at desktop/tablet/mobile sizes is NOT yet certified and remains for the final Windows/local acceptance.

## Current branch head before Task 8 work

Application implementation head when Task 7 closed:
`775bafb24161af74daacecfc1f6a8e796fdc50e8`

After that, no Task 8 implementation or RED test was written before this checkpoint request.

## Task 8 — Bootstrap fail-closed and user-visible load error

STATUS: NOT STARTED.

Only read-only inspection was performed before stopping:
- `src/knowledge/loadKnowledge.ts`
- `src/main.tsx`

Observed current situation:
- `loadKnowledge()` already exists and validates the runtime Knowledge repository.
- `main.tsx` still renders the temporary placeholder `AppShell` message.
- The real application routes are not yet bootstrapped from `main.tsx` with `KnowledgeProvider`.
- No user-visible bootstrap error state exists yet for missing/invalid Knowledge.

## Exact next step when resuming

1. Write Task 8 RED tests first.
2. RED must cover at minimum:
   - successful bootstrap renders the real application under `KnowledgeProvider`;
   - missing/invalid Knowledge fails closed;
   - the user sees the approved clear error message rather than a blank screen or partial app;
   - technical detail may be logged for development, but must not replace the user-facing message.
3. Confirm RED fails for the missing bootstrap/error implementation, not for harness defects.
4. Implement the minimum GREEN in bootstrap/main wiring.
5. Run complete CI: tests + typecheck + build.
6. Do not open Task 9 until Task 8 is fully GREEN.

## Known pending items not to misrepresent as complete

- `package-lock.json` still needs to be materialized during the final local Windows validation; current CI uses `npm install`, not `npm ci`.
- Manual responsive visual smoke is still pending for final local Windows validation.
- Final real Knowledge 1.0.0 acceptance on Windows is still pending and belongs to the final validation phase / Task 9.
- Do not claim MVP completion until those checks have actually run.

## Guardrails

- KISS: no backend, DB, Docker, AI, vector search, microservices or parallel taxonomy.
- CarpiNova-PC remains a consumer of `CarpiNova-Knowledge`; no manual Knowledge duplication.
- Do not infer or reconcile unresolved technical data.
- No direct commits to `main`.
- Continue TDD: RED -> minimal GREEN -> full verification.
