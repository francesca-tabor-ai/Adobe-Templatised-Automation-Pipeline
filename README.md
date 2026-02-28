# Adobe Templatised Automation Pipeline

Enterprise creative automation for templatized, localized, multi-variant advertising using Adobe Creative Cloud (InDesign, Photoshop, After Effects). Produces high volumes of variant and localized assets while maintaining brand consistency, legal compliance, and production quality.

## Prerequisites

- **Adobe applications**: InDesign, Photoshop, and/or After Effects (depending on which path you use)
- **ExtendScript host**: Scripts run from within each Adobe app (File > Scripts > Run Script), or via ESTK/CEP if available
- **Node.js** (for orchestrator): v16+ for the CLI runner, approval filtering, and QA aggregation

## Repository structure

| Path | Purpose |
|------|--------|
| [docs/VARIANT_SPEC.md](docs/VARIANT_SPEC.md) | Variation contract: locked vs variable elements, max lengths, boundaries |
| [docs/TEMPLATE_SPEC.md](docs/TEMPLATE_SPEC.md) | Per-app template engineering rules (InDesign, Photoshop, After Effects) |
| [docs/RUNBOOK.md](docs/RUNBOOK.md) | How to run each path and troubleshoot |
| [docs/DAM_METADATA.md](docs/DAM_METADATA.md) | DAM metadata schema and sidecar generation |
| [config/](config/) | Default paths, export presets, channels, QA rules |
| [data/](data/) | Schema, sample CSV/JSON variant datasets |
| [scripts/](scripts/) | ExtendScript (.jsx) for InDesign, Photoshop, After Effects + shared lib |
| [orchestrator/](orchestrator/) | Node CLI: filter by approval, run pipeline step, aggregate QA |
| [templates/](templates/) | Placeholder dirs for master .indd, .psd, .aep (add your templates here) |
| [output/](output/) | Generated assets and manifests (gitignored) |

## Running the pipeline

1. **Prepare data**: Place your variant dataset in `data/sample/` (CSV for InDesign/AE, JSON for Photoshop) or use the sample files. Ensure `variant_id`, `approved`, and required copy/asset fields are present.
2. **Run orchestrator** (optional): From repo root, `node orchestrator/run_pipeline.js --path indesign|photoshop|aftereffects [--approved-only]`. This filters the dataset and prepares paths; it may also print instructions to run the .jsx from the Adobe app.
3. **Run ExtendScript**: Open the relevant Adobe app, choose File > Scripts > Run Script, and select the entry script (`scripts/indesign/run_merge.jsx`, `scripts/photoshop/run_batch.jsx`, or `scripts/aftereffects/run_render.jsx`). When prompted (or via a config file), provide paths to the data file, template, and output folder.
4. **Check output**: Exported assets and a `manifest.json` appear under `output/{app}/`. Use the orchestrator’s QA aggregate step to get a single failure report.

See [docs/RUNBOOK.md](docs/RUNBOOK.md) for step-by-step and troubleshooting.

## Three rendering paths

- **InDesign (Data Merge)**: Multi-language print/static layouts; CSV-driven merge, per-record PDF/PNG export, preflight checks.
- **Photoshop (Smart Objects)**: Image-driven variants; JSON-driven layer substitution and batch export.
- **After Effects (data-driven)**: Multi-variant motion; data feed drives Essential Graphics and render queue.

## License

See repository license file.
