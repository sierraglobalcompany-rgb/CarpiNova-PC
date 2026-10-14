# MVP4B — real Knowledge compatibility verification

Date: 2026-10-14

Status: `PASS`

This document records the real-bundle compatibility gate for MVP4B Task 6. It is evidence only; no product behavior is changed by this file.

## Exact inputs

CarpiNova-PC implementation under test:

```text
repo = sierraglobalcompany-rgb/CarpiNova-PC
sha = 65d5178d8f4b71333d83a2c6f82541a5de27ad79
```

Published/stable Knowledge 1.0.0:

```text
repo = sierraglobalcompany-rgb/CarpiNova-Knowledge
sha = a47119aba3d4711c1ac69f33f7d236d9bc20bb78
```

Knowledge 1.1.0 candidate:

```text
repo = sierraglobalcompany-rgb/CarpiNova-Knowledge
sha = 1eede2f0521451c011e0d41124fe0313289fa0eb
```

Canonical source identity used by both BOOK builds:

```text
book_id = cpnc-2025
scope = BOOK
source_manifest_sha256 = 318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c
source_page_count = 295
```

## Isolated real-bundle audit

Because CarpiNova-Knowledge is private while CarpiNova-PC is public, the compatibility run was executed from a temporary Knowledge audit branch. That topology allowed the workflow token to read the private Knowledge repository while checking out the exact public PC SHA. The temporary audit branch was reset back to the candidate SHA after the run; no audit workflow remains in the candidate tree.

Final audit:

```text
workflow = MVP4B Task6 Real Knowledge Compatibility
run = 38494549380
job = 115627229509
result = SUCCESS
```

The workflow checked out all three exact SHAs above and used the real PC `knowledge:prepare` command for both Knowledge versions.

## Real Knowledge 1.0.0

`npm run knowledge:prepare -- --knowledge-root ../knowledge-1.0.0` succeeded.

Observed manifest:

```text
knowledge_version = 1.0.0
book_id = cpnc-2025
scope = BOOK
source_manifest_sha256 = 318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c
pages = 252
content = 976
measurements = 643
rules = 250
figures = 138
lessons = 1
excluded_page_count = 43
```

Observed artifact hashes:

```text
figures.bundle.json = b25bf55d983c7e7db06c76302da254840fd6c1260c0da6d91acf0b674844936a
knowledge.bundle.json = 043b8efe9b9dad7d42dc6c67a1565fe2dddd25490f456c82fdce0ac736a7c2ca
lessons.bundle.json = bbdb935ea225603996a6a55af62a72b0227c0653fc401acfd03b6c7c9f41f1f6
```

PC regression on the real prepared 1.0.0 BOOK:

```text
12 test files PASS
109 tests PASS
0 failed
typecheck PASS
build PASS
56 modules transformed
```

Real lesson smoke:

```text
lesson_id = LESSON-SLIDES-X-2X-PILOT
lesson_steps = 5
P0113 exists
P0113 render_contract = null
support_figures = 0
```

Observed smoke record:

```text
REAL_SMOKE_1_0_0 {"lesson_steps":5,"p0113_contract":null,"support_figures":0}
```

This proves the published 1.0.0 BOOK remains supported and legacy P0113 is not falsely rendered.

## Real Knowledge 1.1.0 candidate

`npm run knowledge:prepare -- --knowledge-root ../knowledge-1.1.0` succeeded on the same exact PC implementation SHA.

Observed manifest:

```text
knowledge_version = 1.1.0
book_id = cpnc-2025
scope = BOOK
source_manifest_sha256 = 318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c
```

Observed candidate artifact hashes:

```text
figures.bundle.json = 46dd840fccd6757c56f5a55f9a57c87693f5d0de6f1cf9f1a745b5eaccc0a29a
knowledge.bundle.json = 68872af855f7eb3a7739f6da18a283978567a5e7153d8f3c7f2bb2b1e4742026
lessons.bundle.json = d6de0f0d9b654dd6122395be16ee372be043c21b5ba6652d358b9fab64df9a1e
```

Real P0113 distribution/runtime assertions:

```text
figure_id = FIG-CPNC-2025-P0113-001
count in figures bundle = 1
render_contract = normalized-2d-v1
lesson_steps = 5
rendered support figures = 1
```

Accessible name rendered from real Knowledge:

```text
Render de una corredera telescópica con un esquema de sección del cajón y notas manuscritas de holgura lateral por tipo de riel.
```

Observed smoke record:

```text
REAL_SMOKE_1_1_0 {"lesson_steps":5,"p0113_count":1,"p0113_contract":"normalized-2d-v1","support_figures":1,"accessible_name":"Render de una corredera telescópica con un esquema de sección del cajón y notas manuscritas de holgura lateral por tipo de riel."}
```

Full PC verification after the real 1.1.0 candidate was prepared:

```text
12 test files PASS
109 tests PASS
0 failed
typecheck PASS
build PASS
56 modules transformed
npm audit = 0 vulnerabilities
```

This proves that the candidate figure reaches the actual PC repository, real guided lesson, `LessonPage`, and native `FigureDiagram` without fixtures substituting for Knowledge.

## Audit hygiene

An earlier audit attempt passed every substantive 1.0.0/1.1.0 compatibility gate but failed only at the final cleanliness assertion. The rerun diagnosed the residue as TypeScript build metadata:

```text
?? tsconfig.app.tsbuildinfo
?? tsconfig.node.tsbuildinfo
```

The final audit removed generated Knowledge/build output and those build metadata files. Final proof:

```text
STATUS_AFTER_CLEANUP
TEMP_AUDIT_FILES_CLEAN=YES
```

No disposable smoke test, generated BOOK, dist output, or audit workflow was committed into CarpiNova-PC or the Knowledge candidate tree.

## Release/merge guardrails

At the time of this verification:

```text
Knowledge PR #31 = OPEN / DRAFT / NOT MERGED
PC PR #6 = OPEN / DRAFT / NOT MERGED
Knowledge 1.1.0 published release = NOT AUTHORIZED BY TASK 6
```

Task 6 certifies consumer compatibility only. Final branch audit/release handoff remains owned by MVP4B Task 7.

## Verdict

```text
PC + published Knowledge 1.0.0 = PASS
PC + candidate Knowledge 1.1.0 = PASS
real P0113 ingestion = PASS
real P0113 rendering = PASS
legacy non-render behavior = PASS
canonical guided lesson = PASS
accessibility = PASS
full regression = PASS
typecheck = PASS
build = PASS
npm audit = PASS
cleanup = PASS

MVP4B_TASK6_REAL_COMPATIBILITY = PASS
```
