# CarpiNova Knowledge F0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and validate the first reusable CarpiNova Knowledge pipeline: audit the 2025 book, map physical/printed pages, create a structural index, freeze the JSON schemas, extract one technically representative pilot batch, validate it, and produce a consumable pilot bundle before mass extraction begins.

**Architecture:** `CarpiNova-Knowledge` is the canonical private repository. JSON records are the machine-readable source of truth; Markdown files are generated human-review views. A small Python toolchain audits the PDF, maps pages, scaffolds batches, renders review documents, validates provenance/references and builds deterministic distributions. The source PDF remains external to Git. Human/agent semantic extraction produces traceable content, FigureSpec objects, measurements, rule candidates and pilot LessonSpecs.

**Tech Stack:** Python 3.12; uv; PyMuPDF 1.26.x; JSON Schema Draft 2020-12 via jsonschema 4.x; pytest 8.x; Ruff 0.14.x; JSON as canonical structured content; generated Markdown for review.

**Spec:** `docs/superpowers/specs/2026-10-09-carpinova-knowledge-f0-f1-design.md`

## Global Constraints

- Canonical repository: `sierraglobalcompany-rgb/CarpiNova-Knowledge`, initially private.
- Never commit the source PDF or bulk copied third-party imagery.
- `pdf_page` is 1-based physical position; `printed_page` is nullable and never assumed equal to `pdf_page`.
- Preserve three distinct text layers per content block: `source_transcription`, `normalized_text`, `learning_text`.
- `content.json` is canonical; `source.md`, `normalized.md` and `learning.md` are generated review views and must not be edited as independent sources of truth.
- Source regions use normalized coordinates `[0,1]`.
- No technical number becomes `VALIDATED` from text/OCR alone; visual-verification evidence is required.
- Figures are first-class `FigureSpec` records; technical diagrams are never reduced to free-form image prompts.
- External enrichment must be explicitly typed and sourced; it cannot silently enter source-derived text.
- F0 rules remain `CANDIDATE`/`REVIEWED`; none becomes `EXECUTABLE`.
- F0 pilot target: printed pages **88–95**, resolved through the verified page map.
- F1 mass extraction starts only after F0 acceptance reports `GO`.

## Review Focus

1. **Physical/printed page mismatch:** missing or duplicate printed numbering must remain explicit instead of silently shifting citations. Test owner: Task 4.
2. **Technical numeric extraction error:** a dimension may be stored as extracted but cannot become authoritative without visual verification. Test owner: Tasks 2 and 7.
3. **Incomplete figure geometry:** FigureSpec must preserve `approximate`/`unknown` rather than fabricate exact geometry while keeping enough semantic detail to revisit/reconstruct. Test owner: Tasks 2 and 8.
4. **Pedagogical rewrite drift:** every `learning_text` block must derive from explicit source block IDs or be marked `external_enrichment` with its own source. Test owner: Tasks 2 and 7.
5. **Broken references in consumer exports:** figures, measurements, rules, concepts and lessons must resolve after bundling. Test owner: Tasks 7 and 9.

---

## Execution Prerequisite

Create the private repository `sierraglobalcompany-rgb/CarpiNova-Knowledge` with default branch `main` before Task 1. Copy the approved spec and this plan into that repository under the same paths. Do not upload the source PDF.

---

### Task 1: Bootstrap CarpiNova-Knowledge and the CLI shell

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
- Produces: `main(argv: Sequence[str] | None = None) -> int`; command shell for `audit-book`, `build-page-map`, `scaffold-batch`, `render-docs`, `validate`, `build-dist`, `report-pilot`.

- [ ] **Step 1: Write failing CLI smoke test**

Assert `python -m carpinova_knowledge --help` exits `0` and lists all seven command names above.

- [ ] **Step 2: Run RED**

Run: `uv run pytest tests/test_cli.py -v`

Expected: FAIL because the package does not exist.

- [ ] **Step 3: Implement minimal package/CLI and project metadata**

Pin Python `>=3.12,<3.13`; runtime dependencies `PyMuPDF>=1.26,<2`, `jsonschema>=4.25,<5`; dev dependencies `pytest>=8,<9`, `ruff>=0.14,<1`. `.gitignore` excludes `source-books/`, `*.pdf`, `.venv/`, caches and `work/` preview/render output.

- [ ] **Step 4: Run GREEN**

Run: `uv run pytest tests/test_cli.py -v && uv run ruff check .`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: bootstrap CarpiNova Knowledge"
```

---

### Task 2: Freeze F0 schemas, canonical IDs and text provenance

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
- Consumes: package from Task 1.
- Produces: `load_schema(name: str) -> dict[str, Any]`, `validate_instance(schema_name: str, instance: Mapping[str, Any]) -> list[str]`, canonical ID helpers.

- [ ] **Step 1: Write schema meta-validation and known-good fixture tests**

Every schema must pass `Draft202012Validator.check_schema(...)` and one valid fixture must pass for SourceSpec, PageSpec, ContentSpec, FigureSpec, MeasurementSpec, RuleSpec, ConceptSpec, LessonSpec and BatchSpec.

- [ ] **Step 2: Write required negative tests**

Reject: `pdf_page=0`; source coordinates outside `[0,1]`; `VALIDATED` measurement without visual verification; F0 `EXECUTABLE` rule; `learning_text` without `derived_from_content_ids` unless type is `external_enrichment` with external source; FigureSpec exact dimensions when geometry precision is `unknown`; malformed canonical IDs.

- [ ] **Step 3: Run RED**

Run: `uv run pytest tests/test_schemas.py tests/test_ids.py -v`

Expected: FAIL.

- [ ] **Step 4: Implement schemas and helpers**

Canonical IDs derive from physical PDF page:

- `PAGE-{BOOK_ID}-P{pdf_page:04d}`
- `CONTENT-{BOOK_ID}-P{pdf_page:04d}-{sequence:03d}`
- `FIG-{BOOK_ID}-P{pdf_page:04d}-{sequence:03d}`
- `MEAS-{BOOK_ID}-P{pdf_page:04d}-{sequence:03d}`
- `RULE-{BOOK_ID}-P{pdf_page:04d}-{sequence:03d}`

ContentSpec stores the three text layers together with provenance; Markdown is not canonical. Figure geometry supports `precision: exact|approximate|unknown`, with dimensions optional for non-exact geometry.

- [ ] **Step 5: Run GREEN**

Run: `uv run pytest tests/test_schemas.py tests/test_ids.py -v && uv run ruff check src tests`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add schemas src tests
git commit -m "feat: define CarpiNova Knowledge schemas"
```

---

### Task 3: Audit the source book without committing it

**Files:**
- Create: `src/carpinova_knowledge/audit_book.py`
- Create: `tests/test_audit_book.py`
- Runtime output: `books/cpnc-2025/manifest.json`
- Runtime output: `books/cpnc-2025/audits/raw-page-audit.json`

**Interfaces:**
- Consumes: source/Page schema conventions.
- Produces: `audit_book(pdf_path: Path, book_id: str, output_dir: Path) -> BookAudit`; CLI `audit-book`.

- [ ] **Step 1: Write synthetic-PDF audit test**

Generate a 3-page PDF at test time: text-only, text+embedded image, vector drawing. Assert 1-based pages, dimensions, text length, image/drawing counts, source SHA-256 and total page count.

- [ ] **Step 2: Run RED**

Run: `uv run pytest tests/test_audit_book.py -v`

- [ ] **Step 3: Implement objective scanner**

Collect per page: physical page, width/height, extracted text length, text blocks, embedded-image count, vector-drawing count. Manifest records book ID, source filename, SHA-256 and page count. Do not OCR or assign topics here.

- [ ] **Step 4: Run GREEN**

Run: `uv run pytest tests/test_audit_book.py -v`

- [ ] **Step 5: Audit the real 2025 PDF locally**

Run `audit-book --pdf <local-book-path> --book-id cpnc-2025 --out books/cpnc-2025` and verify page count/SHA are stable while the PDF remains untracked.

- [ ] **Step 6: Commit metadata/tooling**

Commit message: `feat: audit 2025 source book`.

---

### Task 4: Map physical PDF pages to printed book pages

**Files:**
- Create: `src/carpinova_knowledge/page_map.py`
- Create: `tests/test_page_map.py`
- Create: `books/cpnc-2025/page-map-overrides.json`
- Runtime output: `books/cpnc-2025/page-map.json`

**Interfaces:**
- Consumes: raw page audit.
- Produces: `build_page_map(audit: BookAudit, overrides: Mapping[int, int | None]) -> PageMap`; CLI `build-page-map`.

- [ ] **Step 1: Write page-map tests**

Cover no printed number, normal sequence, duplicate candidate number, front matter, explicit override and guarantee that no physical page disappears.

- [ ] **Step 2: Run RED**

Run: `uv run pytest tests/test_page_map.py -v`

- [ ] **Step 3: Implement candidate detection + override layer**

Every entry has `mapping_status: candidate|verified|unresolved|not_printed`. Candidates may use text near margins but are never silently trusted; overrides are keyed by physical `pdf_page`.

- [ ] **Step 4: Run GREEN**

Run: `uv run pytest tests/test_page_map.py -v`

- [ ] **Step 5: Resolve actual-book ambiguities visually**

Require every physical page exactly once; printed page either verified integer or null; printed pages 88–95 must map unambiguously.

- [ ] **Step 6: Commit**

Commit message: `feat: map physical and printed book pages`.

---

### Task 5: Build the book structural index and seed taxonomy

**Files:**
- Create: `books/cpnc-2025/index.json`
- Create: `taxonomy/materials.json`
- Create: `taxonomy/hardware.json`
- Create: `taxonomy/furniture.json`
- Create: `taxonomy/construction-systems.json`
- Create: `taxonomy/procedures.json`
- Create: `taxonomy/glossary.json`
- Create: `tests/test_book_index.py`

**Interfaces:**
- Consumes: verified page map and source PDF.
- Produces: structural book index with chapter/section page ranges and initial canonical taxonomy IDs used by pilot extraction.

- [ ] **Step 1: Write index-integrity tests**

Assert every index range points to existing physical pages; no chapter range is inverted; known pilot printed page 91 resolves into exactly one section; taxonomy IDs are unique and aliases cannot point to missing canonical terms.

- [ ] **Step 2: Run RED**

Run: `uv run pytest tests/test_book_index.py -v`

- [ ] **Step 3: Inspect the book index/separators and encode structure**

Create chapter/section records with both physical page ranges and printed ranges when available. Do not infer topics page-by-page beyond what the book structure supports.

- [ ] **Step 4: Seed only vocabulary required by the book structure + pilot**

Create initial IDs for materials, hardware, furniture families, construction systems, procedures and glossary aliases. Do not attempt full ontology completion in F0.

- [ ] **Step 5: Run GREEN and commit**

Run: `uv run pytest tests/test_book_index.py -v`

Commit message: `knowledge: map book structure and seed taxonomy`.

---

### Task 6: Scaffold the pilot and generate review Markdown from canonical JSON

**Files:**
- Create: `src/carpinova_knowledge/scaffold_batch.py`
- Create: `src/carpinova_knowledge/render_docs.py`
- Create: `tests/test_scaffold_batch.py`
- Create: `tests/test_render_docs.py`
- Create: `books/cpnc-2025/batches/batch-000-pilot.json`
- Runtime page folders: `books/cpnc-2025/pages/pXXXX/`

**Interfaces:**
- Consumes: PageMap, BatchSpec and ContentSpec.
- Produces: `scaffold_batch(...) -> list[Path]`; `render_page_docs(page_dir: Path) -> None`; CLI `scaffold-batch`, `render-docs`.

- [ ] **Step 1: Write scaffold tests**

Printed pages 88–95 must resolve to exactly eight physical page folders. Each folder contains `page.json`, `content.json`, `measurements.json`, `rules.json`, `figures/` plus generated `source.md`, `normalized.md`, `learning.md`. Rerun must not overwrite non-empty canonical JSON.

- [ ] **Step 2: Write render-doc tests**

Given ContentSpec records, generated Markdown must reproduce each corresponding text layer in canonical content-ID order and contain a generated-file warning. Editing/deleting Markdown and rerunning must recreate it from JSON.

- [ ] **Step 3: Run RED**

Run: `uv run pytest tests/test_scaffold_batch.py tests/test_render_docs.py -v`

- [ ] **Step 4: Implement scaffolding/rendering**

`batch-000-pilot.json`: printed pages 88–95; purpose `schema-and-reconstruction-pilot`. Missing/ambiguous mappings cause hard failure.

- [ ] **Step 5: Run GREEN, scaffold real pilot and commit**

Run tests, scaffold pilot, render docs and commit message `feat: scaffold knowledge pilot workflow`.

---

### Task 7: Implement repository-wide integrity validation

**Files:**
- Create: `src/carpinova_knowledge/validate_repo.py`
- Create: `tests/test_validate_repo.py`
- Create: `tests/fixtures/repo-valid/`
- Create: `tests/fixtures/repo-invalid/`

**Interfaces:**
- Consumes: all schemas, IDs, page map, index and canonical JSON records.
- Produces: `validate_repository(root: Path) -> ValidationReport`; CLI `validate`.

- [ ] **Step 1: Write failing integrity tests**

Fail on unresolved refs, duplicate IDs, learning content without source derivation, unsourced external enrichment, validated technical number without visual verification, out-of-page figure region, deterministic figure configured only for generative image output, page ID/pdf_page mismatch, and generated Markdown that is stale relative to canonical JSON.

- [ ] **Step 2: Run RED**

Run: `uv run pytest tests/test_validate_repo.py -v`

- [ ] **Step 3: Implement validation order**

Schema → ID uniqueness → source/page consistency → page-map/index consistency → cross-reference resolution → measurement/rule states → figure reconstruction constraints → text provenance → rendered-doc freshness.

Return structured errors with error code, file, object ID and field/JSON pointer when available.

- [ ] **Step 4: Run GREEN + full suite**

Run: `uv run pytest -q && uv run ruff check .`

- [ ] **Step 5: Commit**

Commit message: `feat: validate knowledge repository integrity`.

---

### Task 8: Extract and verify the eight-page pilot

**Files:**
- Modify: eight resolved pilot page folders under `books/cpnc-2025/pages/`
- Create: one FigureSpec JSON per meaningful visible figure under page `figures/`
- Create: `lessons/pilot/*.json`
- Modify as required: `taxonomy/*.json`
- Create: `docs/editorial-policy.md`
- Create: `docs/visual-spec-policy.md`
- Create: `docs/validation-policy.md`

**Interfaces:**
- Consumes: source PDF, verified page map/index, schemas, taxonomy and validator.
- Produces: first complete, source-derived CarpiNova knowledge batch plus at least one LessonSpec demonstrating Cell reuse.

- [ ] **Step 1: Visually inventory each pilot page before rewriting**

Record actual topics/content types. Every meaningful diagram/photo/table/form gets a source region and FigureSpec; graphics are not skipped because text extraction cannot see them.

- [ ] **Step 2: Populate canonical ContentSpec records**

For each source block store faithful `source_transcription`, editorial `normalized_text`, beginner-friendly `learning_text`, source region and provenance links. Do not add outside knowledge. If the source is unclear, preserve the uncertainty.

- [ ] **Step 3: Extract technical MeasurementSpec records**

Capture every technically relevant dimension, diameter, spacing, quantity, weight, angle or tolerance. Visually inspect before setting `VISUALLY_VERIFIED`; keep all pilot measurements below `VALIDATED` unless the validation policy explicitly requires a separate later technical-review gate.

- [ ] **Step 4: Extract RuleSpec candidates**

Create `CANDIDATE` rules only from statements the source actually supports. Record applicability/exceptions only when present; never infer missing conditions.

- [ ] **Step 5: Build detailed FigureSpec records**

For each meaningful visual record purpose, source box, entities, labels, relationships, measurements/annotations, geometry precision, preferred renderer, deterministic requirement, generative-image allowance, educational sequence where relevant and accessibility summary. Dimensioned/technical drawings must prefer deterministic SVG/3D/hybrid reconstruction.

- [ ] **Step 6: Create at least one pilot LessonSpec**

Choose a process/mechanism actually present in pages 88–95 (e.g. a hinge/slide topic if supported). The lesson references ContentSpec/FigureSpec IDs rather than duplicating source facts. It must demonstrate how Cell/tutorial modules can sequence explanation + figure + interaction without reopening the PDF.

- [ ] **Step 7: Render review Markdown and validate after each page**

Run `render-docs` then `validate`. Zero errors are required before advancing to the next page.

- [ ] **Step 8: Run complete regression suite**

Run: `uv run pytest -q && uv run ruff check . && uv run python -m carpinova_knowledge validate --root .`

Expected: PASS / zero validation errors.

- [ ] **Step 9: Commit**

Commit message: `knowledge: extract pilot pages 88-95`.

---

### Task 9: Build deterministic consumer bundles

**Files:**
- Create: `src/carpinova_knowledge/build_dist.py`
- Create: `tests/test_build_dist.py`
- Runtime outputs: `dist/pilot/knowledge.bundle.json`, `figures.bundle.json`, `lessons.bundle.json`, `manifest.json`

**Interfaces:**
- Consumes: validated pilot data.
- Produces: `build_distribution(root: Path, batch_id: str, out_dir: Path) -> DistributionManifest`; CLI `build-dist`.

- [ ] **Step 1: Write distribution tests**

Assert deterministic byte output; only requested batch + referenced taxonomy records; preserved source citations; no unresolved refs; no PDF bytes/local preview paths; candidate rules remain non-executable; normalized/learning text remain distinct; FigureSpec reconstruction metadata preserved; LessonSpec references resolve.

- [ ] **Step 2: Run RED**

Run: `uv run pytest tests/test_build_dist.py -v`

- [ ] **Step 3: Implement stable bundle generation**

Sort arrays by canonical ID; stable JSON serialization; manifest includes schema version, knowledge version, book ID, batch ID and source manifest SHA-256.

- [ ] **Step 4: Run GREEN and build twice**

Build twice and compare SHA-256 hashes; unchanged source must produce identical outputs.

- [ ] **Step 5: Commit**

Commit message: `feat: build reusable knowledge pilot bundle`.

---

### Task 10: Acceptance audit and F0 freeze

**Files:**
- Create: `src/carpinova_knowledge/report_pilot.py`
- Create: `tests/test_report_pilot.py`
- Create: `audits/f0-pilot-acceptance.md`
- Modify if pilot proves gaps: `schemas/*.schema.json`, policy docs
- Create: `CHANGELOG.md`

**Interfaces:**
- Consumes: validated pilot + distribution.
- Produces: `build_pilot_report(root: Path, batch_id: str) -> PilotAcceptanceReport`; CLI `report-pilot`; final `GO|NO_GO`.

- [ ] **Step 1: Write acceptance tests**

Acceptance must be `NO_GO` when any required page file/record is missing, a meaningful visual lacks FigureSpec, technical measurements lack source location, cross-refs break, validation errors exist, pedagogical blocks lack provenance, pilot page mapping is ambiguous, or generated Markdown is stale.

- [ ] **Step 2: Run RED**

Run: `uv run pytest tests/test_report_pilot.py -v`

- [ ] **Step 3: Implement report**

Report counts: pages, figures by type, measurements by status, rule candidates, concepts, lessons, warnings/conflicts and validation errors. Result exactly `GO` or `NO_GO`.

- [ ] **Step 4: Perform reconstruction audit**

For every pilot FigureSpec answer in the report: can a future renderer identify important entities without reopening the page; distinguish exact/approximate/unknown geometry; bind labels/cotas to entities; know preferred reconstruction mode; and build a tutorial sequence where a process exists? Any `no` => `NO_GO` until fixed.

- [ ] **Step 5: Run complete checks**

```bash
uv run pytest -q
uv run ruff check .
uv run python -m carpinova_knowledge validate --root .
uv run python -m carpinova_knowledge build-dist --batch batch-000-pilot --out dist/pilot
uv run python -m carpinova_knowledge report-pilot --batch batch-000-pilot
```

Expected: all PASS and report `GO`.

- [ ] **Step 6: Freeze knowledge version `0.1.0`**

Update distribution manifest and `CHANGELOG.md`. Do not begin remaining-book extraction in this task.

- [ ] **Step 7: Commit F0 completion**

Commit message: `chore: freeze CarpiNova Knowledge F0 pilot`.

---

## F0 Definition of Done

F0 is complete only when:

- private canonical repository exists with spec + plan;
- source PDF is not committed;
- full physical-page audit and reproducible source manifest exist;
- physical/printed page map is explicit;
- book chapter/section index exists;
- pilot printed pages 88–95 map unambiguously;
- all schemas validate;
- canonical text provenance, numeric states, FigureSpec constraints and cross-references are automatically checked;
- all eight pilot pages have source, normalized and beginner-friendly text layers in canonical ContentSpec records;
- generated Markdown review views match canonical JSON;
- every meaningful pilot visual has FigureSpec;
- technical numbers are visually checked before `VISUALLY_VERIFIED` and are not silently promoted to fabrication authority;
- rule candidates remain non-executable;
- at least one LessonSpec proves reuse for Cell/tutorials;
- deterministic pilot bundles can be consumed later by Designer/Cell;
- `audits/f0-pilot-acceptance.md` reports `GO`;
- knowledge version `0.1.0` is frozen.

## Explicitly Deferred to F1

After F0 reports `GO`, create a separate F1 plan for the rest of the book. F1 will define adaptive batch boundaries (normally 5–6 pages; 3–4 for highly technical spreads; up to 8 for simple pages), chapter checkpoints, consolidation approximately every five batches, conflict review, coverage metrics and the path to Knowledge `1.0`. Do not fold mass extraction into F0.