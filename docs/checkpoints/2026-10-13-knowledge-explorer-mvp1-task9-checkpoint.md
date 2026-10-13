# CarpiNova-PC MVP 1 — Checkpoint Task 9 before Windows acceptance

Date: 2026-10-13
Branch: `design/knowledge-explorer-mvp1-20261012`

## Certified state

### Tasks 1–8

CLOSED / GREEN.

Task 8 implemented and certified:
- real bootstrap through `KnowledgeProvider` + application routes;
- loading state;
- fail-closed state for missing/invalid/stale Knowledge;
- exact approved user-facing error copy;
- no retry loop, stale cache fallback or GitHub runtime access.

Task 8 certification run:
- GitHub Actions run `38345238103` — SUCCESS.

### Task 9 — documentation and final local acceptance

STATUS: PARTIAL / NOT CLOSED.

Completed in Task 9:
- `README.md` now documents the reproducible local flow and final acceptance gate;
- `package-lock.json` is committed and reproducible;
- CI now uses `npm ci`;
- final CI permissions are `contents: read`;
- dependency security issue found during audit was resolved instead of ignored:
  - `react-router-dom` upgraded to `^7.18.4`;
  - `vitest` upgraded to `^5.0.4`;
  - explicit Node types added to `tsconfig.app.json` for test typechecking;
- npm resolution reported `0 vulnerabilities` after the upgrades;
- final read-only reproducible CI is GREEN.

Final reproducible CI run before this checkpoint:
- run `38346140824` — SUCCESS;
- `npm ci` — PASS;
- tests — PASS (`37/37`);
- typecheck — PASS;
- build — PASS.

## Current branch state before checkpoint commit

HEAD before writing this checkpoint:
`40c2bc272d2136b8ee19de77f87be02d6d357820`

Latest code/documentation state includes:
- Task 8 bootstrap GREEN;
- final `README.md`;
- committed `package-lock.json`;
- final read-only CI using `npm ci`;
- dependency upgrades with zero known npm audit vulnerabilities at the certified resolution.

## Scope / noise audit already performed

Automated tree comparison against `main` found no committed:
- `generated/knowledge/` bundle;
- backend;
- database;
- Docker stack;
- authentication subsystem;
- AI/vector search;
- CAD/3D/Furniture Engine;
- manually duplicated Knowledge taxonomy;
- generated figure regeneration pipeline;
- inferred manufacturing rules from measurements/RuleSpec.

`.gitignore` includes `/generated/`, `/dist/` and `/node_modules/`.

The temporary CI mechanisms used only to materialize and audit the lockfile have been removed from the current workflow. Current CI is read-only.

## Exact remaining work when resuming

Do not claim MVP completion yet. The remaining gate requires a real Windows/local acceptance against canonical `CarpiNova-Knowledge 1.0.0`.

1. On the Windows workstation, use the implementation branch and run:

```bash
npm ci
npm test
npm run typecheck
npm run build
```

2. Prepare the real canonical Knowledge repository:

```bash
npm run knowledge:prepare -- --knowledge-root "<ruta-real-a-CarpiNova-Knowledge>"
```

Expected manifest contract:

```text
knowledge_version = 1.0.0
book_id = cpnc-2025
scope = BOOK
source_manifest_sha256 = 318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c
```

3. Confirm generated Knowledge remains ignored:

```bash
git status --short
git check-ignore generated/knowledge/manifest.json
```

4. Start the real app and perform manual probes against actual Knowledge:

```text
bisagras
correderas
MDF
tapacanto
gabinete
```

For every present term verify:

```text
buscar -> filtrar -> abrir ficha -> leer explicación/fallback -> Ver fuente -> comprobar procedencia
```

If a probe is genuinely absent from Knowledge 1.0.0, record it as absent and replace it with another canonical present term of the same broad class. Never add manual taxonomy to make a probe pass.

5. Run preview and responsive smoke:

```bash
npm run build
npm run preview
```

Check approximately:

```text
1440 px
768 px
390 px
```

Verify no horizontal overflow, readable content, usable filters and visible keyboard focus.

6. Only after those checks actually run, create:

`docs/verification/knowledge-explorer-mvp1-local.md`

Record real date, branch/commit, Knowledge manifest identifiers, commands, actual probe results, responsive checks and any remaining observations. Never record PASS for an unexecuted check.

7. Re-run the final scope/noise audit and commit the verification record.

## Guardrails on resume

- KISS: no backend, DB, Docker, AI, vector search, microservices or parallel taxonomy.
- `CarpiNova-Knowledge` remains the only source of truth.
- Do not commit generated Knowledge.
- Do not infer/reconcile unresolved technical data.
- No direct commits to `main`.
- Do not claim MVP completion until the real Windows Knowledge preparation + visible flow + preview/responsive acceptance are certified.

## Resume point

Resume exactly at **Task 9 real Windows/local acceptance**. Do not reopen Tasks 1–8 unless a real acceptance defect demonstrates a regression.
