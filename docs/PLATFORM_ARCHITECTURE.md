# CGVIP Platform Architecture

Data, ML, and infrastructure architecture for the Creative Governance & Variant Intelligence Platform. This document defines how the system is built at platform level (lakehouse, feature store, ML, decisioning, orchestration, observability) and implementation sequencing. It complements [CGVIP_PRODUCT_VISION.md](CGVIP_PRODUCT_VISION.md), which describes product scope, agents, and requirements.

---

## 1. High-level architecture

### Flow

- **Sources** — Adobe templates, DAM, project mgmt, compliance systems, media/ad platforms, analytics
- **Ingest + Identity** — Event streaming + batch loads; canonical IDs: campaign_id, variant_id, template_version, compliance_version
- **Lakehouse + Feature Store** — Immutable raw + curated + features
- **ML Platform** — Training, evaluation, registry, deployment
- **Decisioning/Optimization** — Variant selection + experiment design + budget recommendations
- **Orchestration** — Render jobs → Adobe pipelines → outputs to DAM
- **Observability + Audit** — Lineage, logs, approvals, reconstruction

---

## 2. Data architecture

### 2.1 Source systems

**Creative & Ops**

- Adobe source repositories (template files + versions)
- DAM (assets + metadata)
- Work management (Jira/Workfront), approvals, tickets
- Compliance/RA systems (claim/disclaimer libraries, rule sets, approvals)

**Activation & Measurement**

- Ad platforms (Meta/Google/DV360/etc) + trafficking systems
- Web/app analytics + conversion systems
- Retail/trade systems where applicable (sell-in/sell-out, CRM signals)

### 2.2 Canonical identity & schemas (non-negotiable)

**Key IDs**

- campaign_id, variant_id, market, language, channel, placement, aspect_ratio
- template_id, template_version (semantic + hash)
- dataset_id, dataset_version
- compliance_rule_set_id, compliance_version
- approval_record_id

**Core tables (curated layer)**

- **variants** — The “single source of truth” row per variant
- **templates** — Template metadata, constraints, compatibility
- **render_jobs** — Job requests, status, artifacts
- **approvals** — Who approved what, when, why
- **compliance_rules** — Market/claim/disclaimer constraints
- **performance_events** — Impressions, clicks, conversions, spend, etc.
- **qa_findings** — Overset, safe zone, missing layers, etc.

### 2.3 Storage pattern: Lakehouse with lineage

**Zones**

- **Raw / Bronze** — Immutable source extracts + events
- **Curated / Silver** — Conformed schemas, deduped, joined
- **Products / Gold** — “Variant performance,” “compliance risk,” “creative fatigue,” “test outcomes”

**Lineage requirement**

Every asset in DAM must be reconstructable from:

- template_version + dataset_version + compliance_version + render settings

Use object-store immutability + hashed manifests for non-repudiation.

### 2.4 Ingestion & processing

**Event streaming (near-real-time)**

- Render job events, approvals, QA results, ad delivery stats (where possible)
- Use Kafka / Confluent or cloud-native equivalents

**Batch ELT**

- DAM metadata snapshots, campaign reports, compliance library updates
- Use dbt for transformations + tests

### 2.5 Data quality & governance

- Contract tests on inbound datasets (Great Expectations / Deequ)
- Row-level access by market/region
- PII minimization (usually no PII needed; keep aggregated where possible)
- Data catalog + glossary (Collibra / DataHub / Purview)

---

## 3. Feature store design (creative intelligence)

### 3.1 Offline features (training)

**Variant features**

- **Text:** Length, language, readability proxies, token counts (store derived, not raw if policy-sensitive)
- **Visual:** Template type, layout family, color theme tags, product category tags (from metadata)
- **Compliance:** Claim class, disclaimer class, restriction flags, rejection history
- **Ops:** Time-to-approve, revision count, agency/creator, market complexity index
- **Context:** Seasonality, channel norms, placement, audience segment labels (if allowed)

### 3.2 Online features (serving)

- Latest fatigue signals (recent frequency, decay-weighted performance)
- Current spend pacing, delivery metrics
- Real-time QA risk flags

**Implementation**

- Feast / Tecton / SageMaker Feature Store / Vertex Feature Store
- Keep “online store” low-latency (Redis/DynamoDB/Bigtable)

---

## 4. ML architecture

### 4.1 Model families (minimum viable set)

- **Performance prediction** — Predict expected CTR/CVR/CPA/ROAS per variant_id × placement × market. Start with gradient boosting + hierarchical calibration; evolve to multi-task learning.
- **Compliance risk prediction** — Predict probability of rejection / revision + reason class. Uses structured rule signals + historical outcomes (do not “invent” claims).
- **Template breakage prediction** — Predict overset/safe-zone violations before rendering. Inputs: language, char counts, template constraints, aspect ratio.
- **Creative fatigue / decay** — Time-series decay models; survival / hazard style signals.

### 4.2 Training pipelines

- Orchestrate with Airflow / Dagster / Prefect
- Compute on Spark / Ray / Kubernetes jobs
- Track experiments with MLflow / Vertex Experiments / SageMaker Experiments
- Evaluate with: backtesting windows by market/channel; bias / drift checks by segment; calibration curves (critical for decisioning)

### 4.3 Model registry & promotion gates

- **Registry:** MLflow Model Registry / SageMaker Model Registry / Vertex Model Registry
- **Promotion requires:** Metrics thresholds; drift checks; explainability artifact; approval record (audit)

### 4.4 Serving patterns

- **Batch scoring:** Nightly/hourly scoring of candidate variants
- **Online scoring:** Synchronous API for “should we render this?” / “what should we run next?”
- Use canary deployments + shadow testing

---

## 5. Decisioning & optimization layer

This is where the “flywheel” compounds.

### 5.1 Decision services (APIs)

- **RecommendVariantSet(campaign_id, markets, constraints)**
- **ValidateCompliance(variant_id | dataset_row)**
- **RecommendBudgetSplit(variant_set, objective, constraints)**
- **ProposeNextTest(hypothesis_space, priors, guardrails)**
- **SuppressVariants(criteria: fatigue, risk, low EV)**

### 5.2 Optimization approaches

- **Start:** Constrained ranking (expected value – penalties)
- **Next:** Constrained optimization (linear / integer programming)
- **Mature:** Contextual bandits with guardrails (strict compliance constraints, exploration budgets)

**Guardrails**

- **Hard constraints:** Compliance rules, brand locks, mandatory disclaimers
- **Soft constraints:** Diversity of variants, exploration caps, regional fairness thresholds

---

## 6. Render & deployment orchestration (Adobe execution stack)

### 6.1 Render orchestration service

- Accepts dataset rows → creates deterministic render job manifests
- Produces: job spec (template, assets, text fields, compliance overlays); expected outputs (formats, sizes, codecs); trace IDs

### 6.2 Execution backends

- **InDesign** — Data Merge + scripting runners (ExtendScript where needed); export automation + preflight
- **Photoshop** — Smart Object substitution via UXP/ExtendScript automation; batch export presets
- **After Effects** — Essential Graphics controls + data-driven substitution; render queue / aerender / farm scheduler

### 6.3 Render farm / compute

- Kubernetes jobs or dedicated render nodes (GPU not always required; AE may benefit depending on effects)
- Queue manager (e.g., Celery/Temporal queues, or cloud batch services)
- Retry policies + idempotency (same manifest → same outputs)

### 6.4 Output to DAM

- Upload assets + attach immutable metadata: variant_id, template_version, dataset_version, compliance_version, model_version, job_hash
- Store manifest + checksums in audit archive

---

## 7. Governance, security, and auditability

### 7.1 Zero-trust + RBAC/ABAC

- Roles: Marketing, Legal, Ops, Agency, Admin
- Attribute-based controls by market/region/brand

### 7.2 Audit ledger

Append-only log for: dataset edits; approvals; model promotions; render job submissions; publishing events.

Implement with: immutable database tables + WORM storage; optional ledger tech (QLDB-style) if required.

### 7.3 Secret management & compliance

- Vault / KMS
- Signed artifacts (hash + signature)
- Retention policies (legal hold)

---

## 8. Observability & reliability

### 8.1 System observability

- **Metrics:** Throughput, render failure rate, queue latency, API latency
- **Logs:** Correlated by trace_id (OpenTelemetry)
- **Traces:** End-to-end from “recommend” → “render” → “publish”

### 8.2 ML observability

- Data drift (feature distributions)
- Prediction drift (score shifts)
- Outcome drift (performance deltas)
- Calibration monitoring
- Human override rate (leading indicator of trust issues)

---

## 9. Reference stack options (choose one “lane”)

**Option A — AWS-heavy**

- S3 + Glue + Athena/Redshift or Databricks
- MSK (Kafka) + Lambda/ECS/EKS
- SageMaker (training/registry/hosting) + MLflow if desired
- DynamoDB/Redis for online features
- OpenSearch + CloudWatch
- IAM + KMS + Secrets Manager

**Option B — GCP-heavy**

- GCS + BigQuery + Dataflow
- Pub/Sub
- Vertex AI (pipelines, registry, endpoints)
- Bigtable/Redis for online store
- Cloud Logging/Monitoring
- IAM + KMS + Secret Manager

**Option C — Azure-heavy**

- ADLS + Synapse/Fabric + Databricks
- Event Hubs
- Azure ML (pipelines, registry, endpoints)
- CosmosDB/Redis
- Monitor + Sentinel
- Entra ID + Key Vault

**Common cross-cloud:** dbt, Airflow/Dagster, MLflow, Feast, Temporal, OpenTelemetry.

---

## 10. Implementation sequencing (practical)

1. **Identity + schemas + DAM metadata discipline** — variant_id, template_version, compliance_version
2. **Lakehouse + curated tables + lineage**
3. **Render orchestration service + job manifests + audit archive**
4. **Feature store (offline first)**
5. **Batch performance & compliance risk models**
6. **Decision ranking service (human-in-loop)**
7. **Online features + near-real-time fatigue**
8. **Optimization + exploration (bandits) with strict guardrails**

---

## Doc map

| Document | Purpose |
|----------|---------|
| [CGVIP_PRODUCT_VISION.md](CGVIP_PRODUCT_VISION.md) | Product vision, agents, requirements, MVP roadmap. |
| [PLATFORM_ARCHITECTURE.md](PLATFORM_ARCHITECTURE.md) | Platform, data, and ML architecture; implementation order (this file). |
