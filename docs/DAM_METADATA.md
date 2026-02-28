# DAM metadata schema

Minimum metadata for assets produced by the pipeline, for traceability and DAM import.

## Required fields (per asset)

| Field | Type | Description |
|-------|------|-------------|
| variant_id | string | Unique variant identifier |
| market | string | Market code (e.g. US, DE, FR) |
| language | string | Language code (e.g. en, de, fr) |
| channel | string | Delivery channel (e.g. print_a4, social_1_1) |
| size | string | Output size or dimensions |
| template_version | string | Version of the template used |
| dataset_version | string | Version or timestamp of the variant dataset |
| compliance_version | string | Legal/compliance version |
| created_by | string | e.g. "automation" |
| created_at | string | ISO 8601 timestamp |

## Optional

- **path**: Relative or absolute path to the exported file
- **app**: indesign | photoshop | aftereffects
- **preflight_ok**: boolean (InDesign)
- **status**: ok | warning | fail

## Sidecar files

The orchestrator can write a `.metadata.json` sidecar next to each asset (e.g. `V001.pdf` and `V001.pdf.metadata.json`) or a single manifest that DAM import uses. Schema for one asset:

```json
{
  "variant_id": "V001",
  "market": "US",
  "language": "en",
  "channel": "social_1_1",
  "size": "1080x1080",
  "template_version": "1.0",
  "dataset_version": "2025-02-28",
  "compliance_version": "v1",
  "created_by": "automation",
  "created_at": "2025-02-28T12:00:00Z"
}
```

## Generating metadata

Use the optional script `orchestrator/scripts/generate_dam_metadata.js` (or run from orchestrator) to produce sidecar metadata from the last run's manifest(s) and config.
