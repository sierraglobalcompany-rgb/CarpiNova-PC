# CarpiNova-PC MVP 1 — Checkpoint Task 9 before local visual acceptance

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
- `README.md` documents the reproducible local flow and final acceptance gate;
- `package-lock.json` is committed and reproducible;
- CI uses `npm ci`;
- final CI permissions are `contents: read`;
- dependency security issue found during audit was resolved instead of ignored:
  - `react-router-dom` upgraded to `^7.18.4`;
  - `vitest` upgraded to `^5.0.4`;
  - explicit Node types added to `tsconfig.app.json` for test typechecking;
- npm resolution reported `0 vulnerabilities` after the upgrades;
- final read-only reproducible PC CI is GREEN.

PC CI run:
- run `38346140824` — SUCCESS;
- `npm ci` — PASS;
- tests — PASS (`37/37`);
- typecheck — PASS;
- build — PASS.

## Cross-repository Windows verification — CERTIFIED

A temporary verification branch was created from `CarpiNova-Knowledge/main` only to execute a real Windows cross-repository gate. It was not merged into Knowledge main and did not modify CarpiNova-PC application code.

Verified CarpiNova-PC commit:
`0ba91c59379d6f859892971aa325f37630e1c65d`

Canonical Knowledge was checked out from the private repository and consumed through the real `knowledge:prepare` command on a GitHub Actions Windows Server 2025 runner.

Final successful integration run:
- repository: `sierraglobalcompany-rgb/CarpiNova-Knowledge`;
- temporary branch: `verify/pc-mvp1-windows-20261013`;
- workflow run: `38347622078` — SUCCESS;
- workflow verification commit: `98009c778c0ceaa312fcc23029fcda4a21ac9639`.

The successful Windows run freshly verified:
- canonical Knowledge validator — PASS (`valid=true`, `error_count=0`);
- exact PC checkpoint SHA — PASS;
- `npm ci` — PASS;
- npm audit result during install — `0 vulnerabilities`;
- tests — PASS (`37/37`);
- typecheck — PASS;
- build — PASS;
- real `npm run knowledge:prepare` against the private canonical Knowledge checkout — PASS;
- generated manifest contract — PASS;
- artifact SHA-256 values independently rechecked against the manifest — PASS;
- `generated/knowledge/manifest.json` ignored by Git — PASS;
- production build contains `dist/knowledge/manifest.json` — PASS;
- programmatic Vite preview served `/` and `/knowledge/manifest.json` — PASS;
- served preview reported `knowledge_version = 1.0.0` — PASS.

Manifest identifiers certified in the Windows gate:

```text
knowledge_version = 1.0.0
book_id = cpnc-2025
scope = BOOK
source_manifest_sha256 = 318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c
```

Actual distributed search-field probes on real Knowledge 1.0.0:

```text
bisagras   = 25 matching content records
correderas = 16 matching content records
MDF        = 7 matching content records
tapacanto  = 28 matching content records
gabinete   = 15 matching content records
```

Therefore no fallback/replacement term is required for the five planned acceptance probes.

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

The temporary CI mechanisms used only to materialize and audit the PC lockfile have been removed from the current PC workflow. Current PC CI is read-only.

## Exact remaining work

Do not claim MVP completion yet. The technical Windows integration is certified, but the accepted MVP gate still requires a **human-visible local acceptance on the user's PC**.

The remaining checks are only:

1. Open the app locally against the prepared canonical Knowledge and verify the visible path with the real probes:

```text
bisagras
correderas
MDF
tapacanto
gabinete
```

For the visible flow confirm:

```text
buscar -> filtrar -> abrir ficha -> leer explicación/fallback -> Ver fuente -> comprobar procedencia
```

2. Perform the manual responsive/browser smoke approximately at:

```text
1440 px
768 px
390 px
```

Confirm:
- no horizontal overflow;
- readable content;
- usable filters;
- visible keyboard focus;
- navigation/back behavior remains usable.

3. Only after the visible checks actually run, create:

`docs/verification/knowledge-explorer-mvp1-local.md`

Record real date, branch/commit, Knowledge manifest identifiers, automated Windows evidence, actual visible probe results, responsive checks and any remaining observations. Never record PASS for an unexecuted check.

4. Re-run the final scope/noise audit and commit the verification record.

## Guardrails on resume

- KISS: no backend, DB, Docker, AI, vector search, microservices or parallel taxonomy.
- `CarpiNova-Knowledge` remains the only source of truth.
- Do not commit generated Knowledge.
- Do not infer/reconcile unresolved technical data.
- No direct commits to `main`.
- Do not claim MVP completion until the visible local flow + responsive acceptance are certified.

## Resume point

Resume exactly at **Task 9 human-visible local acceptance**. The technical Windows + canonical Knowledge gate is already GREEN; do not rerun it unless a real defect or code change invalidates the evidence.
