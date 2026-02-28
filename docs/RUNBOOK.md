# Runbook: running the pipeline and troubleshooting

Step-by-step instructions to prepare data, run the orchestrator, execute the Adobe scripts, and check QA.

---

## 1. Prerequisites

- **Adobe apps**: InDesign, Photoshop, and/or After Effects installed (depending on which path you use).
- **Node.js**: v16+ (for the orchestrator CLI).
- **Repo**: Clone or open `Adobe-Templatised-Automation-Pipeline` and ensure paths below are relative to the repo root.

---

## 2. Prepare data

1. **Variant dataset**
   - **InDesign / AE (CSV)**: Place `variants.csv` in `data/sample/`. Headers must match the [variant schema](../data/schema/variant_schema.json) (e.g. `variant_id`, `market`, `language`, `channel`, `headline`, `cta`, `legal_disclaimer_id`, `approved`, etc.).
   - **Photoshop / AE (JSON)**: Place `variants.json` in `data/sample/` as an array of objects with the same field names.
2. **Approval**
   - Set `approved` to `true` or `false` per row. When using `--approved-only`, only `approved === true` variants are processed.
3. **Assets (Photoshop)**
   - Resolve `product_image_id` and `background_image_id` to file paths. Either put images in `assets/` as `{id}.jpg` (or configure `config/defaults.json` with `productImageMap` and `backgroundImageMap`).

---

## 3. Prepare templates

- **InDesign**: Create a master document with Data Merge fields or named text frames matching CSV columns. Save as `templates/indesign/master.indd`.
- **Photoshop**: Create a PSD with layers named as in [TEMPLATE_SPEC.md](TEMPLATE_SPEC.md) (e.g. `HEADLINE_TEXT`, `PRODUCT_SMART`). Save as `templates/photoshop/master.psd`.
- **After Effects**: Create a project with at least one composition; name text layers (e.g. `HEADLINE`, `CTA`). Save as `templates/aftereffects/master.aep`.

---

## 4. Run the orchestrator (optional)

From the repo root:

```bash
cd orchestrator
node run_pipeline.js --path indesign [--approved-only]
```

Replace `indesign` with `photoshop` or `aftereffects` as needed. This will:

- If `--approved-only`: filter the dataset to approved rows and write a staged file under `output/{app}/`.
- Write a run config and **print instructions** for running the corresponding .jsx from the Adobe app.

You do not need Node to run the Adobe scripts; the orchestrator only filters data and tells you what to run.

---

## 5. Run the Adobe script

1. Open the correct Adobe application (InDesign, Photoshop, or After Effects).
2. **File > Scripts > Run Script...**
3. Select the entry script:
   - InDesign: `scripts/indesign/run_merge.jsx`
   - Photoshop: `scripts/photoshop/run_batch.jsx`
   - After Effects: `scripts/aftereffects/run_render.jsx`
4. If the script prompts for arguments, provide:
   - Data file path (e.g. `…/data/sample/variants.csv` or `…/output/indesign/variants_filtered.csv` if you used `--approved-only`).
   - Template path (e.g. `…/templates/indesign/master.indd`).
   - Output folder (e.g. `…/output/indesign`).
   - Approved-only: true/false (if prompted).
5. Wait for the script to finish. Exported files and `manifest.json` appear under `output/{app}/`.

---

## 6. Check output and QA

- **Outputs**: Look in `output/indesign/`, `output/photoshop/`, or `output/aftereffects/` for PDFs, PNGs, or MP4s and `manifest.json`.
- **Aggregate QA report** (if you have Node):
  ```bash
  node run_pipeline.js --qa-only
  ```
  This reads all `output/{app}/manifest.json` files and writes:
  - `output/qa_report.json`
  - `output/qa_failures.txt` (list of failed variant_id and reasons).

---

## 7. DAM metadata (optional)

To generate sidecar metadata for DAM import:

```bash
cd orchestrator
node scripts/generate_dam_metadata.js
```

This creates `output/{app}/{variant_id}.metadata.json` per entry in the manifest. See [DAM_METADATA.md](DAM_METADATA.md) for the schema.

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| **Script says “CSV/JSON not found”** | Paths are built from the script’s location (repo root = two levels up from `scripts/indesign`). Ensure you’re running from the repo and that `data/sample/variants.csv` or `variants.json` exists. |
| **InDesign: “Template not found”** | Create `templates/indesign/master.indd` or pass the correct template path when prompted. |
| **InDesign: No merge fields** | Template must have either Data Merge fields matching CSV headers or named text frames. Run Data Merge from the UI once to confirm the CSV links. |
| **Photoshop: “Missing product image”** | Add images to `assets/` named as `{product_image_id}.jpg` or set `config/defaults.json` → `productImageMap` / `backgroundImageMap`. |
| **Photoshop: Layer not found** | Layer names must contain (case-insensitive) e.g. `headline`, `product`, `background`, `cta`, `disclaimer`. See TEMPLATE_SPEC. |
| **After Effects: “No composition found”** | Project must contain at least one comp. Script picks by name from `config/channels.json` or the first comp. |
| **After Effects: Text not updating** | Text layers must be named so the script can find them (e.g. HEADLINE, CTA). Source Text is set via scripting; check layer names. |
| **Manifest shows “fail”** | Open `output/{app}/manifest.json` and read the `errors` array for that `variant_id`. Fix data or template and re-run. |

---

## Quick reference

- **Data**: `data/sample/variants.csv` (InDesign, AE), `data/sample/variants.json` (Photoshop, AE).
- **Config**: `config/defaults.json`, `config/channels.json`.
- **Scripts**: `scripts/indesign/run_merge.jsx`, `scripts/photoshop/run_batch.jsx`, `scripts/aftereffects/run_render.jsx`.
- **Output**: `output/{app}/` (assets + `manifest.json`).
- **QA**: `node orchestrator/run_pipeline.js --qa-only` → `output/qa_report.json`, `output/qa_failures.txt`.
