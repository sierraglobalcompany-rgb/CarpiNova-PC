# CarpiNova Knowledge F0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and validate the first reusable CarpiNova Knowledge pipeline: audit the 2025 book, map physical/printed pages, freeze the JSON schemas, extract one technically representative pilot batch, validate it, and produce a consumable pilot bundle before any mass extraction begins.

**Architecture:** `CarpiNova-Knowledge` is the canonical private repository. A small Python toolchain audits the source PDF and validates JSON/Markdown knowledge records; the source PDF itself is not committed. Human/agent semantic extraction produces traceable page records, FigureSpec objects, measurements and rule candidates. Only after the pilot passes coverage and reconstruction checks will F1 mass extraction receive its own implementation plan.

**Tech Stack:** Python 3.12; uv; PyMuPDF 1.26.x; JSON Schema Draft 2020-12 via jsonschema 4.x; pytest 8.x; Ruff 0.14.x; Markdown + JSON as canonical content formats.

**Spec:** `docs/superpowers/specs/2026-10-09-carpinova-knowledge-f0-f1-design.md`

## Global Constraints

- The canonical knowledge repository is `sierraglobalcompany-rgb/CarpiNova-Knowledge` and starts private.
- Do not commit the source PDF or bulk copied third-party imagery to the knowledge repository.
- `pdf_page` is 1-based and identifies the physical page in the PDF; `printed_page` is nullable and must never be inferred as equal to `pdf_page` by default.
- Preserve three text layers: `source_transcription`, `normalized_text`, and `learning_text`; improvements must never overwrite source-derived content.
- All source regions use normalized coordinates in the range `[0,1]`.
- Technical numbers are not `VALIDATED` solely from OCR/text extraction; visual verification is required before validation.
- Figures are first-class `FigureSpec` objects; technical diagrams must not be reduced to free-form image prompts.
- External enrichment is excluded from source-derived text and must be explicitly marked and sourced if introduced later.
- Rules affecting fabrication remain candidates in F0; no pilot rule becomes `EXECUTABLE`.
- F0 pilot target is printed pages **88–95**, resolved to physical PDF pages through `page-map.json` before extraction.
- F1 mass extraction does not start until the F0 pilot acceptance report is green.

## Review Focus

1. **Physical page vs printed page mismatch:** a missing/duplicate printed page must remain explicit and must not shift later source citations silently. Covered in Task 4.
2. **Numeric OCR/extraction error:** a technical value may be extracted but cannot reach `VALIDATED` without visual verification evidence. Covered in Tasks 2 and 6.
3. **Figure with incomplete geometry:** `FigureSpec` must permit `unknown`/`approximate` geometry instead of inventing precision, while retaining the source region. Covered in Tasks 2 and 7.
4. **Improved prose drifting beyond the source:** `learning.md` must link back to source content IDs and external additions must fail validation unless marked `external_enrichment`. Covered in Tasks 2 and 7.
5. **Broken cross-references after consolidation/export:** every figure, measurement, rule, concept and lesson reference in the pilot bundle must resolve deterministically. Covered in Tasks 6 and 8.

---

## Execution Prerequisite

Before Task 1 begins, create the private repository `sierraglobalcompany-rgb/CarpiNova-Knowledge` with default branch `main`. Do not upload the source PDF to it. The approved spec and this implementation plan may then be copied into that repository under the same `docs/superpowers/...` paths so the knowledge repository is self-describing.

---

### Task 1: Bootstrap the canonical knowledge repository and validation CLI

**Files:**
- Create: `README.md`
- Create: `.gitignore`
- Create: `pyproject.toml`
- Create: `src/carpinova_knowledge/__init__.py`
- Create: `src/carpinova_knowledge/__main__.py`
- Create: `src/carpinova_knowledge/cli.py`
- Create: `tests/test_cli.py`
- Copy: `docs/superpowers/specs/2026-10-09-carpinova-knowledge-f0-f1-design.md`
- Copy: `docs/superpowers/plans/2026-10-09-carpinova-knowledge-f0-implementation.md`

**Interfaces:**
- Consumes: none.
- Produces: `python -m carpinova_knowledge <command>` CLI entrypoint used by later tasks.

- [ ] **Step 1: Write the failing CLI smoke test**

`tests/test_cli.py` must assert that `python -m carpinova_knowledge --help` exits `0` and lists commands `audit-book`, `build-page-map`, `scaffold-batch`, `validate`, and `build-dist`.

- [ ] **Step 2: Run the test and verify RED**

Run: `uv run pytest tests/test_cli.py -v`

Expected: FAIL because the package/CLI does not exist.

- [ ] **Step 3: Add the minimal package and argparse CLI**

Implement `main(argv: Sequence[str] | None = None) -> int` in `src/carpinova_knowledge/cli.py`; `__main__.py` calls it. Register command names only; later tasks attach implementations.

`pyproject.toml` pins Python `>=3.12,<3.13` and declares runtime dependencies `PyMuPDF>=1.26,<2` and `jsonschema>=4.25,<5`; dev dependencies include `pytest>=8,<9` and `ruff>=0.14,<1`.

`.gitignore` must exclude at minimum `source-books/`, `*.pdf`, `.venv/`, `__pycache__/`, `.pytest_cache/`, `.ruff_cache/`, and local rendered previews under `work/`.

- [ ] **Step 4: Run checks and verify GREEN**

Run: `uv run pytest tests/test_cli.py -v && uv run ruff check .`

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add README.md .gitignore pyproject.toml src tests docs
git commit -m "chore: bootstrap CarpiNova Knowledge"
```

---

### Task 2: Freeze F0 JSON Schemas and canonical IDs

**Files:**
- Create: `schemas/common.schema.json`
- Create: `schemas/source.schema.json`
- Create: `schemas/page.schema.json`
- Create: `schemas/content.schema.json`
- Create: `schemas/figure.schema.json`
- Create: `schemas/measurement.schema.json`
- Create: `schemas/rule.schema.json`
- Create: `schemas/concept.schema.json`
- Create: `schemas/lesson.schema.json`
- Create: `schemas/batch.schema.json`
- Create: `src/carpinova_knowledge/schema_loader.py`
- Create: `src/carpinova_knowledge/ids.py`
- Create: `tests/fixtures/schemas/valid/`
- Create: `tests/test_schemas.py`
- Create: `tests/test_ids.py`

**Interfaces:**
- Consumes: CLI/package from Task 1.
- Produces: `load_schema(name: str) -> dict[str, Any]`, `validate_instance(schema_name: str, instance: Mapping[str, Any]) -> list[str]`, and deterministic ID helpers such as `page_id(book_id: str, pdf_page: int) -> str`, `figure_id(book_id: str, pdf_page: int, sequence: int) -> str`.

- [ ] **Step 1: Write schema meta-validation tests**

`tests/test_schemas.py` must load every schema with `Draft202012Validator.check_schema(...)` and validate one known-good fixture for SourceSpec, PageSpec, ContentSpec, FigureSpec, MeasurementSpec, RuleSpec, ConceptSpec, LessonSpec and BatchSpec.

- [ ] **Step 2: Add failure-mode tests from the spec**

Tests must assert validation failure for:

- `pdf_page = 0`;
- source-region coordinates outside `[0,1]`;
- a measurement with `status="VALIDATED"` but without visual-verification evidence;
- a rule with `status="EXECUTABLE"` during F0;
- a `learning_text` record that has neither source-content links nor an explicit `external_enrichment` source;
- a `FigureSpec` that invents exact dimensions while geometry confidence is `unknown`;
- duplicate-style IDs that do not match the canonical ID regex.

- [ ] **Step 3: Run tests and verify RED**

Run: `uv run pytest tests/test_schemas.py tests/test_ids.py -v`

Expected: FAIL because schemas/loaders do not exist.

- [ ] **Step 4: Implement schemas, loader and ID helpers**

Use JSON Schema Draft 2020-12. Canonical IDs must be derived from physical PDF page, never printed page. Required patterns:

- page: `PAGE-{BOOK_ID}-P{pdf_page:04d}`;
- figure: `FIG-{BOOK_ID}-P{pdf_page:04d}-{sequence:03d}`;
- measurement: `MEAS-{BOOK_ID}-P{pdf_page:04d}-{sequence:03d}`;
- rule candidate: `RULE-{BOOK_ID}-P{pdf_page:04d}-{sequence:03d}`.

Figure geometry must support `precision: exact|approximate|unknown` and allow omitted dimensions for unknown geometry.

- [ ] **Step 5: Run complete schema tests and lint**

Run: `uv run pytest tests/test_schemas.py tests/test_ids.py -v && uv run ruff check src tests`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add schemas src/carpinova_knowledge tests
git commit -m "feat: define CarpiNova Knowledge schemas"
```

---

### Task 3: Audit the book without committing the PDF

**Files:**
- Create: `src/carpinova_knowledge/audit_book.py`
- Create: `tests/test_audit_book.py`
- Create at runtime: `books/cpnc-2025/manifest.json`
- Create at runtime: `books/cpnc-2025/audits/raw-page-audit.json`

**Interfaces:**
- Consumes: Source/Page schema conventions from Task 2.
- Produces: `audit_book(pdf_path: Path, book_id: str, output_dir: Path) -> BookAudit`; CLI `audit-book --pdf PATH --book-id cpnc-2025 --out books/cpnc-2025`.

- [ ] **Step 1: Write a synthetic-PDF audit test**

The test creates a 3-page PDF with PyMuPDF at runtime: page 1 has text only, page 2 has text plus one embedded image, page 3 has vector drawing content. Assert output uses 1-based `pdf_page`, reports page size, text length, image count, vector-drawing presence, SHA-256 of the source file, and total page count `3`.

- [ ] **Step 2: Run the test and verify RED**

Run: `uv run pytest tests/test_audit_book.py -v`

Expected: FAIL because `audit_book` does not exist.

- [ ] **Step 3: Implement the audit scanner**

For every physical PDF page collect only objective baseline metadata: `pdf_page`, width/height, extracted text length, embedded image count, vector drawing count, and text blocks. `manifest.json` records book ID, source filename, SHA-256, audit timestamp and PDF page count. Do not run OCR and do not assign semantic topics in this task.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `uv run pytest tests/test_audit_book.py -v`

Expected: PASS.

- [ ] **Step 5: Run against the 2025 source PDF locally**

Run:

```bash
uv run python -m carpinova_knowledge audit-book \
  --pdf /absolute/path/to/libros_1751553390342_Carpinteria_para_no_Carpinteros_Version_2025.pdf \
  --book-id cpnc-2025 \
  --out books/cpnc-2025
```

Expected: `manifest.json` and `audits/raw-page-audit.json` exist; the manifest page count matches the actual PDF; the PDF itself remains outside Git tracking.

- [ ] **Step 6: Commit metadata only**

```bash
git add books/cpnc-2025/manifest.json books/cpnc-2025/audits/raw-page-audit.json src tests
git commit -m "feat: audit 2025 source book"
```

---

### Task 4: Build and verify the physical-to-printed page map

**Files:**
- Create: `src/carpinova_knowledge/page_map.py`
- Create: `tests/test_page_map.py`
- Create: `books/cpnc-2025/page-map-overrides.json`
- Create at runtime: `books/cpnc-2025/page-map.json`

**Interfaces:**
- Consumes: `raw-page-audit.json` from Task 3.
- Produces: `build_page_map(audit: BookAudit, overrides: Mapping[int, int | None]) -> PageMap`; CLI `build-page-map`.

- [ ] **Step 1: Write page-map tests for normal and hostile inputs**

Tests must cover:

- physical pages with no printed number;
- a normal consecutive printed sequence;
- duplicate candidate printed numbers;
- intentionally repeated/non-numbered front matter;
- a wrong auto-candidate corrected by an explicit physical-page override;
- no physical page ever disappears from the map.

- [ ] **Step 2: Run tests and verify RED**

Run: `uv run pytest tests/test_page_map.py -v`

Expected: FAIL.

- [ ] **Step 3: Implement candidate detection plus explicit overrides**

Candidate printed page detection may inspect text blocks near page margins, but candidate values are never silently trusted. Every entry has `mapping_status: candidate|verified|unresolved|not_printed`. `page-map-overrides.json` is keyed by physical `pdf_page`.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `uv run pytest tests/test_page_map.py -v`

Expected: PASS.

- [ ] **Step 5: Resolve the actual book map by visual inspection where needed**

Run the mapper, inspect unresolved/duplicate candidates in the source PDF, add only verified overrides, rerun, and require:

- every physical page is represented exactly once;
- `printed_page` is either a verified integer or `null`;
- the printed pages needed for pilot 88–95 resolve unambiguously to physical pages.

- [ ] **Step 6: Commit the verified page map**

```bash
git add books/cpnc-2025/page-map.json books/cpnc-2025/page-map-overrides.json src tests
git commit -m "feat: map physical and printed book pages"
```

---

### Task 5: Scaffold a batch without losing traceability

**Files:**
- Create: `src/carpinova_knowledge/scaffold_batch.py`
- Create: `tests/test_scaffold_batch.py`
- Create: `books/cpnc-2025/batches/batch-000-pilot.json`
- Create at runtime: `books/cpnc-2025/pages/pXXXX/` for the pilot physical pages

**Interfaces:**
- Consumes: PageMap and JSON schemas.
- Produces: `scaffold_batch(batch: BatchSpec, page_map: PageMap, root: Path) -> list[Path]`; CLI `scaffold-batch`.

- [ ] **Step 1: Write scaffold tests**

Given a batch containing printed pages 88–95, assert the function resolves them to physical page IDs, creates exactly eight page folders and creates in each folder:

- `page.json`
- `source.md`
- `normalized.md`
- `learning.md`
- `content.json`
- `measurements.json`
- `rules.json`
- `figures/`

Also assert rerunning is idempotent and never overwrites non-empty human/agent content.

- [ ] **Step 2: Run and verify RED**

Run: `uv run pytest tests/test_scaffold_batch.py -v`

Expected: FAIL.

- [ ] **Step 3: Implement scaffolding**

`batch-000-pilot.json` is fixed to printed pages `88` through `95`, with `purpose="schema-and-reconstruction-pilot"`. Resolve to physical pages only through `page-map.json`; fail loudly if any printed page is ambiguous or missing.

- [ ] **Step 4: Run and verify GREEN**

Run: `uv run pytest tests/test_scaffold_batch.py -v`

Expected: PASS.

- [ ] **Step 5: Scaffold the actual pilot and commit**

Run:

```bash
uv run python -m carpinova_knowledge scaffold-batch \
  --batch books/cpnc-2025/batches/batch-000-pilot.json \
  --page-map books/cpnc-2025/page-map.json \
  --root books/cpnc-2025/pages
```

Commit the batch definition, scaffolding code/tests and empty structural files.

---

### Task 6: Implement repository-wide semantic and referential validation

**Files:**
- Create: `src/carpinova_knowledge/validate_repo.py`
- Create: `tests/test_validate_repo.py`
- Create: `tests/fixtures/repo-valid/`
- Create: `tests/fixtures/repo-invalid/`

**Interfaces:**
- Consumes: all schemas and canonical IDs from Task 2.
- Produces: `validate_repository(root: Path) -> ValidationReport`; CLI `validate --root .`.

- [ ] **Step 1: Write failing integrity tests**

Tests must fail on:

- unresolved cross-reference IDs;
- duplicate IDs;
- `learning.md` content with no mapped source content record;
- `external_enrichment` without a non-book source;
- a technical measurement set to `VALIDATED` without visual-verification metadata;
- a FigureSpec source region outside the page;
- a FigureSpec with `deterministic_required=true` but `generative_image_allowed=true` and no deterministic renderer;
- a page folder whose `page.json.pdf_page` disagrees with its canonical page ID.

The valid fixture must pass with zero errors.

- [ ] **Step 2: Run and verify RED**

Run: `uv run pytest tests/test_validate_repo.py -v`

Expected: FAIL.

- [ ] **Step 3: Implement deterministic validation**

Validation order: schema validity → ID uniqueness → source/page consistency → cross-reference resolution → technical-state constraints → figure reconstruction constraints → editorial provenance constraints. Return structured errors with code, file, object ID and JSON pointer/field where possible.

- [ ] **Step 4: Run and verify GREEN**

Run: `uv run pytest tests/test_validate_repo.py -v`

Expected: PASS.

- [ ] **Step 5: Run all tests and commit**

Run: `uv run pytest -q && uv run ruff check .`

Expected: all PASS.

Commit message: `feat: validate knowledge repository integrity`.

---

### Task 7: Extract the eight-page pilot with text, figures, measurements and rule candidates

**Files:**
- Modify: the eight physical page folders resolved from printed pages 88–95 under `books/cpnc-2025/pages/`
- Create: one `fig-XXX.json` per visible meaningful figure under each page's `figures/`
- Create/modify: `taxonomy/hardware.json`
- Create/modify: `taxonomy/materials.json`
- Create/modify: `taxonomy/furniture.json`
- Create/modify: `taxonomy/construction-systems.json`
- Create/modify: `taxonomy/glossary.json`
- Create: `docs/editorial-policy.md`
- Create: `docs/visual-spec-policy.md`
- Create: `docs/validation-policy.md`

**Interfaces:**
- Consumes: source PDF, verified page map, schemas and validator.
- Produces: the first complete source-derived CarpiNova knowledge batch.

- [ ] **Step 1: Inspect each pilot page visually and inventory its content before rewriting**

For every printed page 88–95, record in `page.json` the topics and content types actually present. Every meaningful diagram/photo/table/form receives a FigureSpec source region; do not skip graphics merely because text extraction cannot see them.

- [ ] **Step 2: Populate `source.md` and structured source content**

Transcribe only what the page supports. Correct extraction artifacts only when visually verified. Create stable content IDs in `content.json` and link each content record to the exact source region when practical.

- [ ] **Step 3: Populate `normalized.md`**

Correct spelling, punctuation, units and paragraph structure without adding external knowledge. Keep terminology aligned with the source unless a glossary alias is recorded.

- [ ] **Step 4: Populate `learning.md`**

Rewrite for a beginner using shorter explanations, explicit terminology and clearer sequencing. Every pedagogical block references the source content IDs it derives from. If the source does not explain a point, say so instead of filling the gap from general knowledge.

- [ ] **Step 5: Extract all technical measurements**

Create `MeasurementSpec` records for every dimension, diameter, spacing, quantity, weight, angle or tolerance that matters technically. Inspect the page visually before assigning `VISUALLY_VERIFIED`; do not set any pilot measurement to `VALIDATED` in this task.

- [ ] **Step 6: Extract rule candidates**

Move source statements that could later govern design/fabrication into `rules.json` with `status="CANDIDATE"`. Record applicability and exceptions only when supported by the page. Do not infer missing conditions.

- [ ] **Step 7: Build detailed FigureSpec objects**

For every figure record:

- semantic purpose;
- source bounding box;
- entities and labels;
- relationships;
- visible measurements/annotations;
- geometry precision (`exact|approximate|unknown`);
- preferred renderer (`svg|html|3d|image|hybrid`);
- whether deterministic reconstruction is mandatory;
- whether generative imagery is allowed;
- an educational sequence when the source depicts a process or mechanism;
- accessibility summary.

For technical drawings and dimensioned diagrams, prefer deterministic SVG/3D/hybrid reconstruction and prohibit purely generative reconstruction.

- [ ] **Step 8: Run validation after each physical page**

Run: `uv run python -m carpinova_knowledge validate --root .`

Expected: zero errors before proceeding to the next page. Warnings for unresolved semantic consolidation are allowed only if explicitly recorded.

- [ ] **Step 9: Run complete regression suite**

Run: `uv run pytest -q && uv run ruff check . && uv run python -m carpinova_knowledge validate --root .`

Expected: all tests PASS and repository validation reports zero errors.

- [ ] **Step 10: Commit the pilot extraction**

```bash
git add books/cpnc-2025 taxonomy docs
git commit -m "knowledge: extract pilot pages 88-95"
```

---

### Task 8: Build a consumer bundle and prove cross-app reuse

**Files:**
- Create: `src/carpinova_knowledge/build_dist.py`
- Create: `tests/test_build_dist.py`
- Create at runtime: `dist/pilot/knowledge.bundle.json`
- Create at runtime: `dist/pilot/figures.bundle.json`
- Create at runtime: `dist/pilot/lessons.bundle.json`

**Interfaces:**
- Consumes: validated pilot page data.
- Produces: `build_distribution(root: Path, batch_id: str, out_dir: Path) -> DistributionManifest`; CLI `build-dist`.

- [ ] **Step 1: Write distribution tests**

Assert bundles:

- are deterministic byte-for-byte for unchanged source data;
- contain only records belonging to the requested batch plus referenced consolidated taxonomy entries;
- preserve source citations by book ID + physical/printed page + region;
- contain no unresolved references;
- exclude source PDF bytes and local preview paths;
- do not promote `CANDIDATE` rules to executable rules;
- expose `normalized` and `learning` content separately;
- preserve FigureSpec renderer/reconstruction metadata.

- [ ] **Step 2: Run and verify RED**

Run: `uv run pytest tests/test_build_dist.py -v`

Expected: FAIL.

- [ ] **Step 3: Implement deterministic bundle generation**

Sort all arrays by canonical ID and serialize JSON with stable key ordering/UTF-8 output. Build a manifest containing schema version, knowledge version, book ID, batch ID and source manifest SHA-256.

- [ ] **Step 4: Run and verify GREEN**

Run: `uv run pytest tests/test_build_dist.py -v`

Expected: PASS.

- [ ] **Step 5: Build the real pilot bundle and validate twice**

Run the same `build-dist` command twice and compare SHA-256 hashes of outputs; they must match.

- [ ] **Step 6: Commit**

```bash
git add src tests dist/pilot
git commit -m "feat: build reusable knowledge pilot bundle"
```

---

### Task 9: Produce the F0 acceptance audit and freeze the schema for F1 planning

**Files:**
- Create: `src/carpinova_knowledge/report_pilot.py`
- Create: `tests/test_report_pilot.py`
- Create: `audits/f0-pilot-acceptance.md`
- Modify as needed: `schemas/*.schema.json`
- Modify as needed: `docs/editorial-policy.md`
- Modify as needed: `docs/visual-spec-policy.md`
- Modify as needed: `docs/validation-policy.md`
- Create: `CHANGELOG.md`

**Interfaces:**
- Consumes: validation report and pilot bundles from Tasks 7–8.
- Produces: `build_pilot_report(root: Path, batch_id: str) -> PilotAcceptanceReport`; F0 go/no-go decision for F1.

- [ ] **Step 1: Write report tests**

The report must fail acceptance if any of these are non-zero:

- pilot pages missing required files;
- meaningful figures without FigureSpec;
- technical measurements lacking source locations;
- broken cross-references;
- validation errors;
- source-derived learning blocks without provenance;
- ambiguous printed-to-physical mapping for pilot pages.

It must also report counts of pages, figures by type, measurements by status, rule candidates, concepts, warnings and unresolved conflicts.

- [ ] **Step 2: Run and verify RED**

Run: `uv run pytest tests/test_report_pilot.py -v`

Expected: FAIL.

- [ ] **Step 3: Implement the acceptance report**

Acceptance result is exactly `GO` or `NO_GO`. `GO` means the format is adequate to start a separate F1 mass-extraction plan; it does not validate technical rules for fabrication.

- [ ] **Step 4: Run the pilot report and perform spec-to-pilot reconstruction review**

For each FigureSpec, answer in `audits/f0-pilot-acceptance.md`:

1. Can a future renderer identify every important entity without reopening the source page?
2. Can it identify which geometry is exact vs approximate/unknown?
3. Are every technical labels/cotas linked to the proper element?
4. Is the preferred reconstruction mode explicit?
5. Could Cell build a reasonable tutorial sequence from the stored data when a process exists?

Any `no` produces `NO_GO` until the schema/content is corrected.

- [ ] **Step 5: Self-review schema changes and rerun everything**

Run:

```bash
uv run pytest -q
uv run ruff check .
uv run python -m carpinova_knowledge validate --root .
uv run python -m carpinova_knowledge build-dist --batch batch-000-pilot --out dist/pilot
```

Expected: all PASS and acceptance report `GO`.

- [ ] **Step 6: Freeze F0 as knowledge version `0.1.0`**

Update `CHANGELOG.md` with schema/content changes and set the distribution manifest knowledge version to `0.1.0`. Do not start extracting the rest of the book in this task.

- [ ] **Step 7: Commit F0 completion**

```bash
git add schemas docs audits src tests dist CHANGELOG.md
git commit -m "chore: freeze CarpiNova Knowledge F0 pilot"
```

---

## F0 Definition of Done

F0 is complete only when all of the following are true:

- the private canonical knowledge repository exists and contains the spec + plan;
- the source PDF is not committed;
- the 2025 book has a reproducible manifest and full physical-page audit;
- physical and printed page identities are mapped explicitly;
- the pilot printed pages 88–95 resolve unambiguously;
- all F0 schemas pass JSON Schema validation;
- repository validation catches provenance, numeric-state, FigureSpec and cross-reference failures;
- all eight pilot pages contain faithful source transcription, normalized prose and beginner-friendly pedagogical prose;
- every meaningful visual on the pilot pages has a FigureSpec;
- technical numbers are visually checked before receiving `VISUALLY_VERIFIED` and none is promoted to fabrication authority merely from extraction;
- rule candidates remain non-executable;
- the pilot can be bundled deterministically for future Designer/Cell consumers;
- `audits/f0-pilot-acceptance.md` reports `GO`;
- knowledge version `0.1.0` is frozen.

## Explicitly Deferred to the F1 Plan

After F0 reports `GO`, write a separate F1 implementation plan for the remaining book. That plan will define adaptive batch boundaries (normally 5–6 pages; 3–4 for highly technical spreads; up to 8 for simple pages), chapter-level checkpoints, periodic consolidation every ~5 batches, conflict review, coverage tracking and the route to Knowledge `1.0`. Mass extraction must not be folded into this F0 execution plan.