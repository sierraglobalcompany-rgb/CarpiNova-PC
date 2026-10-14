# CarpiNova-PC — MVP4B Knowledge figures compatibility candidate

Date: 2026-10-14

Status: `MVP4B PC compatibility candidate PASS`

This checkpoint closes MVP4B Task 7 only. It records final candidate evidence and does not authorize merge or publication.

## Final implementation identity

Exact MVP3 base:

```text
a34ac92647be87417d2163bc6824a801deffe778
```

Final product/evidence implementation SHA before this documentation-only checkpoint commit:

```text
f94a05dfbbcc325367ce9e538a204bf10adc27bc
```

This checkpoint commit is intentionally documentation-only. The final branch HEAD after the commit is verified separately by CI and PR state after this file is created.

## Fresh Task 7 QA

A temporary isolated audit branch was created from exact PC SHA `f94a05dfbbcc325367ce9e538a204bf10adc27bc` so the current permanent workflow did not need modification.

Final valid audit run:

```text
workflow = MVP4B Task7 Final QA
run = 38495635918
job = 115630642595
result = SUCCESS
```

The successful run executed:

```text
npm ci
npm test
npm run typecheck
npm run build
npm audit
```

Results:

```text
12 test files PASS
109 tests PASS
0 failed
typecheck PASS
build PASS
56 modules transformed
npm audit = 0 vulnerabilities
```

The final audit workflow was a temporary branch-only file. The temporary audit branch was reset to `f94a05dfbbcc325367ce9e538a204bf10adc27bc` after the run, so no workflow change remains in the candidate tree.

Two earlier temporary audit attempts are historical only. Both already passed npm/test/typecheck/build/audit but their extra diff-proof step was not valid because of shallow/parent topology. They were not accepted as final evidence. The final run above corrected the topology and additionally proved:

```text
PRODUCT_DIFF_FROM_TASK6_HEAD=NONE
```

## Final diff audit against MVP3

Comparison:

```text
base = a34ac92647be87417d2163bc6824a801deffe778
head = f94a05dfbbcc325367ce9e538a204bf10adc27bc
status = ahead
commits = 28
changed files = 21
```

Expected scoped product changes are limited to:

```text
scripts/prepare-knowledge.mjs
src/app/Bootstrap.tsx
src/features/figures/FigureDiagram.tsx
src/features/lessons/LessonPage.tsx
src/knowledge/loadKnowledge.ts
src/knowledge/types.ts
src/styles/app.css
focused tests
MVP4B spec/plan/verification docs
```

Required unchanged files/areas verified absent from the diff:

```text
package.json = unchanged
package-lock.json = unchanged
.github/workflows/* = unchanged
src/app/routes.tsx = unchanged
ContentPage implementation = unchanged
search implementation architecture = unchanged
Knowledge source data = unchanged by PC
CarpiNova-cell = untouched
```

Search-related source architecture was not modified; only direct test fixtures were updated for repository figure fields.

## Architecture guardrail audit

`FigureDiagram.tsx` is a small native React/SVG consumer only:

```text
rect -> <rect>
line -> <line>
polyline -> <polyline>
annotation -> <text>
normalized coordinate * 1000
stable layer ordering
React text escaping
accessible name = summary then purpose
```

`LessonPage.tsx` performs first-seen figure dedupe locally with `Set` + `figuresById`; there is no service or generalized renderer layer.

`loadKnowledge.ts` keeps an explicit version allowlist:

```text
1.0.0
1.1.0
```

and continues to fail closed on exact book/scope/source identity, artifact hashes, bundle identity, duplicate IDs, broken page/content/figure references, and malformed opted-in `normalized-2d-v1` records.

Confirmed absent from the product diff:

```text
Three.js
WebGL
Canvas renderer
renderer registry
plugin architecture
dangerouslySetInnerHTML
raw SVG injection
interaction execution
figure standalone route
backend/state service
new graphics dependency
```

`LessonStep.interaction` remains opaque metadata only; it is not executed by the renderer or lesson page.

Verdict:

```text
KISS = PASS
anti-noise = PASS
no architecture expansion = PASS
```

## Real Knowledge integration evidence

Task 6 evidence file:

`docs/verification/knowledge-figures-mvp4b-local.md`

Exact Knowledge stable revision:

```text
a47119aba3d4711c1ac69f33f7d236d9bc20bb78
```

Exact Knowledge 1.1.0 candidate revision:

```text
1eede2f0521451c011e0d41124fe0313289fa0eb
```

Canonical source identity:

```text
book_id = cpnc-2025
scope = BOOK
source_manifest_sha256 = 318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c
source_page_count = 295
```

Task 6 real compatibility workflow:

```text
run = 38494549380
job = 115627229509
result = SUCCESS
```

Real Knowledge 1.0.0 result:

```text
compatibility = PASS
lesson steps = 5
P0113 exists as legacy
P0113 render_contract = null
support figures rendered = 0
legacy omission = PASS
```

Real Knowledge 1.1.0 candidate result:

```text
compatibility = PASS
P0113 count = 1
P0113 render_contract = normalized-2d-v1
lesson steps = 5
support figures rendered = 1
accessible name from real Knowledge = PASS
```

Full real 1.1.0 verification:

```text
109 tests PASS
typecheck PASS
build PASS
npm audit = 0 vulnerabilities
cleanup = PASS
```

Therefore:

```text
Knowledge 1.0.0 compatibility = PASS
Knowledge 1.1.0 compatibility = PASS
P0113 rendered exactly once = PASS
legacy omission = PASS
```

## Release state

At Task 7 checkpoint creation time:

```text
PC PR #6 = OPEN / DRAFT / NOT MERGED
Knowledge PR #31 = OPEN / DRAFT / NOT MERGED
Knowledge candidate head = 1eede2f0521451c011e0d41124fe0313289fa0eb
Knowledge main/base = a47119aba3d4711c1ac69f33f7d236d9bc20bb78
```

Knowledge `README.md` on stable main still declares:

```text
Current full-book Knowledge version: 1.0.0
```

No GitHub Release object exists for Knowledge at this time, and Knowledge 1.1.0 has not been published or merged.

## Final MVP4B candidate verdict

```text
fresh QA = PASS
109 tests = PASS
typecheck = PASS
build = PASS
npm audit = PASS
final diff audit = PASS
KISS = PASS
anti-noise = PASS
1.0.0 real compatibility = PASS
1.1.0 real compatibility = PASS
P0113 rendered once = PASS
legacy omission = PASS
accessibility = PASS
navigation regression = PASS
package/workflow drift = NONE

MVP4B PC compatibility candidate PASS
```

## Explicit non-actions

Task 7 does NOT:

```text
merge PC PR #6
mark PC PR #6 ready
merge Knowledge PR #31
mark Knowledge PR #31 ready
publish Knowledge 1.1.0
create a GitHub release
start CarpiNova-cell work
```

## Next action

Separate coordinated release decision only.

The next step must explicitly decide sequencing for PC and Knowledge merge/release. No merge/publication is implied by this checkpoint.
