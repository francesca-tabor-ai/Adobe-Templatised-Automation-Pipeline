# CIF Architecture — Mapping to Pipeline and CGVIP

This document maps the Creative Intelligence Flywheel (CIF) to the existing Adobe Templatised Automation Pipeline and the Creative Governance & Variant Intelligence Platform (CGVIP). See [CIF_PRD.md](CIF_PRD.md) for product vision and requirements.

---

## Three Layers

| Layer | Role | Components |
|-------|------|------------|
| **CIF (Predictive)** | Behavioral data, prediction, optimization, economic attribution | Feature store, 6 CIF agents, run_pipeline `--phase` / `--optimized-set` / `--with-attribution` |
| **CGVIP (Governance)** | Compliance rules, dataset integrity, template compatibility, human-in-the-loop | [CGVIP_PRODUCT_VISION.md](CGVIP_PRODUCT_VISION.md) agents (Campaign Architect, Compliance Intelligence, Dataset Governance, etc.) |
| **Execution** | Render and export | [run_pipeline.js](../orchestrator/run_pipeline.js), [runner.js](../orchestrator/src/runner.js), InDesign/Photoshop/After Effects .jsx |

CIF does not replace CGVIP or the pipeline. It adds a predictive and economic layer on top.

---

## CIF Agent → Repo Mapping

| CIF Agent | Orchestrator module | Inputs | Outputs |
|-----------|---------------------|--------|---------|
| Behavioral Signal Aggregator | `orchestrator/agents/behavioral_aggregator.js` | Variant dataset, manifests, optional signals file | Writes to `data/feature_store/` (unified creative feature store) |
| Performance Prediction Agent | `orchestrator/agents/performance_prediction.js` | Feature store | Predicted economic score per variant (stub/rule-based in Phase 2) |
| Compliance Risk Prediction Agent | `orchestrator/agents/compliance_risk_prediction.js` | Feature store, [VARIANT_SPEC](VARIANT_SPEC.md), compliance_version | Risk score per variant |
| Variant Optimization Agent | `orchestrator/agents/variant_optimization.js` | Performance + compliance risk scores | Recommended variant mix, suppression list, spend allocation |
| Render & Deployment Orchestrator | Existing [runner.js](../orchestrator/src/runner.js) + run_pipeline | Optional optimized variant set (`--optimized-set`) | Run config; triggers .jsx (manual or via bridge) |
| Economic Value Attribution Agent | `orchestrator/agents/economic_attribution.js` | Manifests, run outcomes, optional analytics export | Writes back to feature store (D(t+1) = D(t) + U(t)) |

---

## Feature Store

- **Location:** `data/feature_store/`
- **Schema:** [data/feature_store/README.md](../data/feature_store/README.md) and optional `data/schema/creative_feature_store_schema.json`
- **Contents:** Variant attributes, template metadata, compliance variables, performance outcomes, temporal fields. Versioned, file-based in v1 (per-run or per-campaign JSON).
- **Populated by:** Behavioral Signal Aggregator (and Economic Value Attribution Agent for feedback).

---

## How run_pipeline Uses CIF

| CLI mode | Behavior |
|----------|----------|
| `--path indesign \| photoshop \| aftereffects` | Current behavior: filter by approval, write run config, print instructions. No CIF agents. |
| `--phase observability` | Run Behavioral Signal Aggregator only: read dataset + manifests, write to feature store. |
| `--phase predict` | Run Performance Prediction + Compliance Risk Prediction agents; write scores (e.g. to `output/cif_scores.json`). Human-in-the-loop. |
| `--optimized-set <path>` | Use precomputed variant list at `<path>`; filter dataset to that set before writing run config so only recommended variants are rendered. |
| `--with-attribution` | After render (or after QA aggregate), run Economic Value Attribution Agent to update feature store. |

Default behavior is unchanged when CIF flags are omitted.

---

## Related Docs

- [VARIANT_SPEC.md](VARIANT_SPEC.md) — Variation contract (locked vs variable, approval, compliance).
- [TEMPLATE_SPEC.md](TEMPLATE_SPEC.md) — Per-app template rules (InDesign, Photoshop, After Effects).
- [DAM_METADATA.md](DAM_METADATA.md) — DAM metadata schema and sidecar generation; intelligence metadata (e.g. hypothesis_id, predicted_score) can be added to DAM payload.
- [CGVIP_PRODUCT_VISION.md](CGVIP_PRODUCT_VISION.md) — Governance layer and agent vision; relationship to CIF in Appendix.
