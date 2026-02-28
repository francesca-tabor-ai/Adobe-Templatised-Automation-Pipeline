# Creative Feature Store (CIF)

Unified store for variant-level and run-level signals used by the Creative Intelligence Flywheel. Populated by the **Behavioral Signal Aggregator** and updated by the **Economic Value Attribution Agent**.

## Layout

- **Naming convention:** Per-run snapshot: `run_{runId}.json`. Per-campaign: `campaign_{campaignId}_{YYYYMMDD}.json`. Optional: `latest.json` (last aggregation).
- **Schema:** [../schema/creative_feature_store_schema.json](../schema/creative_feature_store_schema.json) — variant attributes, template metadata, compliance variables, performance outcomes, temporal fields.
- **Contents:** Array of creative feature store records. Each record extends variant data with optional `campaign_id`, `engagement_metrics`, `spend_allocation`, `approval_cycle_time`, `revision_frequency`, `compliance_exceptions`, `template_version`, `dataset_version`, `run_id`, `ingested_at`.

## Usage

- Run **observability** phase: `node orchestrator/run_pipeline.js --phase observability` — aggregator reads variant dataset + manifests and writes here.
- Prediction and optimization agents read from this store (or from a path supplied by the CLI).
