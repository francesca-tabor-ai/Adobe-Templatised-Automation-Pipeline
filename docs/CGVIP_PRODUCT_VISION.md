# Creative Governance & Variant Intelligence Platform (CGVIP)

**Multi-Agent AI Layer for Regulated Enterprise Creative Automation**

This document defines the product vision for transforming the Adobe Templatised Automation Pipeline into a governed, AI-orchestrated creative operating system. The platform sits *on top of* Adobe execution tools; it does not replace them.

---

## 1. Product Vision

To transform enterprise creative production into a governed, AI-orchestrated system that:

- **Generates** compliant multi-market creative variants  
- **Validates** legal and regulatory constraints  
- **Optimizes** performance-driven variation  
- **Maintains** full audit traceability  
- **Integrates** natively with Adobe production pipelines  

The system acts as an **AI Creative Operating System** on top of Adobe execution tools.

---

## 2. Problem Statement

Enterprise brands operating across markets face:

| Problem | Description |
|--------|-------------|
| **Variant explosion** | Scale of variants outstrips manual production capacity. |
| **Manual legal bottlenecks** | File-by-file legal review slows time-to-market. |
| **Inconsistent disclaimer application** | Risk of wrong or missing disclaimers per market. |
| **Poor test discipline** | A/B tests not structured; performance data disconnected. |
| **Fragmented data → asset traceability** | Hard to reconstruct which dataset/template/compliance set produced an asset. |
| **High cost per asset** | Low reuse, repeated manual work. |
| **Low creative reuse rates** | Templates underutilized; one-off builds dominate. |

**Current Adobe automation** handles rendering. **What is missing:**

- Intelligent orchestration  
- Compliance reasoning  
- Dataset governance  
- Variant planning intelligence  
- Performance feedback loop integration  

---

## 3. Product Scope

The platform sits **between**:

```
Marketing Teams  ←→  Legal & Compliance  ←→  Adobe Creative Templates
                            ↑
Enterprise DAM  ←→  Performance Analytics
```

**It does not replace Adobe. It orchestrates and governs it.**

---

## 4. Multi-Agent Architecture

**Core design principle:** Each agent has a defined mandate, authority boundary, and explainable reasoning trail. No single monolithic AI.

### Agent 1 — Campaign Architect Agent

| Aspect | Description |
|--------|-------------|
| **Role** | Translates campaign briefs into structured variant models. |
| **Inputs** | Campaign brief, target markets, approved claim library, channel requirements. |
| **Outputs** | Variation schema, hypothesis structure, required fields per market, template compatibility validation. |
| **Authority** | Cannot create claims. Must use approved libraries. |

### Agent 2 — Compliance Intelligence Agent

| Aspect | Description |
|--------|-------------|
| **Role** | Encodes and validates regulatory rules. |
| **Capabilities** | Market-claim validation, disclaimer matching, expiry rule enforcement, mandatory health warning logic, age-restriction formatting validation. |
| **Outputs** | Compliance approval flags, exception report, audit trail log. |
| **Impact** | Reduces file-by-file legal review. |

### Agent 3 — Dataset Governance Agent

| Aspect | Description |
|--------|-------------|
| **Role** | Maintains structured dataset integrity. |
| **Capabilities** | Detect missing fields, prevent conflicting claim combinations, version-lock datasets, track template-version compatibility, enforce naming conventions. |
| **Impact** | Protects deterministic output. |

### Agent 4 — Creative Template Compatibility Agent

| Aspect | Description |
|--------|-------------|
| **Role** | Ensures dataset works with Adobe templates. |
| **Capabilities** | Character limit validation, overset prediction (InDesign), safe-zone analysis, motion timing risk detection (After Effects), language expansion modeling. |
| **Impact** | Prevents broken renders before they happen. |

### Agent 5 — Render Orchestration Agent

| Aspect | Description |
|--------|-------------|
| **Role** | Triggers Adobe production workflows. |
| **Capabilities** | Send dataset to InDesign merge pipeline, Photoshop automation scripts, After Effects render queue; monitor job status; capture output metadata; retry failed jobs. |
| **Outputs** | Outputs pushed to DAM with structured metadata. |

### Agent 6 — QA & Risk Agent

| Aspect | Description |
|--------|-------------|
| **Role** | Post-render validation. |
| **Checks** | Disclaimer presence, safe area compliance, missing asset detection, brand layer integrity, version alignment. |
| **Impact** | Flags exceptions before publication. |

### Agent 7 — Performance Intelligence Agent

| Aspect | Description |
|--------|-------------|
| **Role** | Closes the loop. |
| **Inputs** | Channel performance data, variant metadata, hypothesis_id tags. |
| **Outputs** | Variant performance insights, suggested next test variations, underperforming variant suppression, creative fatigue alerts. |
| **Impact** | Turns creative production into a learning system. |

---

## 5. System Architecture (Flow)

```
User Input  →  Campaign Architect Agent
                      ↓
              Dataset Governance Agent
                      ↓
           Compliance Intelligence Agent
                      ↓
        Template Compatibility Agent
                      ↓
           Render Orchestration Agent
                      ↓
                QA & Risk Agent
                      ↓
                 DAM Archive
                      ↓
        Performance Intelligence Agent
                      ↓
         Optimization Feedback Loop
```

**Every step generates:** Timestamp, Version ID, Agent reasoning log, Approval state.

---

## 6. Functional Requirements

### 6.1 Dataset Creation & Validation

- Structured dataset creation UI  
- Versioning system  
- Market-specific field validation  
- Claim & disclaimer auto-assignment  
- Manual override with reason logging  

### 6.2 Compliance Rules Engine

- Claim–market matrix  
- Disclaimer library  
- Expiry tracking  
- Warning hierarchy rules  
- Localization compliance mapping  
- **Must be configurable by Legal team without engineering dependency.**  

### 6.3 Adobe Integration Layer

- API or script trigger support  
- Template version mapping  
- Render job monitoring  
- Failure logging  
- Automatic metadata injection  

### 6.4 DAM Integration

**Required metadata fields:**

- `variant_id`, `campaign_id`, `market`, `language`  
- `template_version`, `dataset_version`, `compliance_version`  
- `approval_timestamp`, `automation_agent_signature`  

Searchable and immutable.

### 6.5 Audit & Traceability

For any published asset, the system must reconstruct:

- Original dataset record  
- Template version used  
- Compliance rule set active  
- Approval authority  
- Agent reasoning trail  

*Critical for regulated brands.*

---

## 7. Non-Functional Requirements

| Area | Requirement |
|------|--------------|
| **Security** | Role-based access, immutable audit logs, market-level permissions, compliance edit restrictions. |
| **Performance** | Handle 10,000+ variant runs per campaign; concurrent render orchestration; real-time validation feedback (&lt;3 seconds per record). |
| **Scalability** | Multi-brand support, multi-region expansion, modular agent updates, cloud-based compute for render orchestration. |

---

## 8. Governance Model: Human-in-the-Loop

| Stage | Human Role |
|-------|------------|
| Campaign modeling | Marketing Lead |
| Compliance rules | Legal Architect |
| Template design | Creative Systems Lead |
| Final approval override | Compliance Officer |

**AI proposes. Humans authorize.**

---

## 9. MVP Scope (First 6 Months)

| Phase | Focus |
|-------|--------|
| **Phase 1** | Dataset governance agent, compliance validation agent, basic render orchestration. |
| **Phase 2** | Template compatibility prediction, QA automation, DAM metadata automation. |
| **Phase 3** | Performance intelligence loop, predictive variation recommendations. |

---

## 10. KPIs for Success

- 40% reduction in approval cycle time  
- 50% reduction in manual compliance review  
- 30% lower cost per asset  
- Zero compliance violations in automated runs  
- 80% of campaign variants generated through the system  
- Increased structured A/B test volume  

---

## 11. Cultural Impact (PMI-Type Enterprise)

| Before | After |
|--------|-------|
| Legal reviews files. | Legal encodes rules. |
| Regions request edits. | Regions select controlled variants. |
| Designers manually adjust layouts. | Designers engineer templates. |
| Performance data disconnected from production. | AI orchestrates production; performance feeds back into dataset design. |

**Creative becomes:** Governed, Intelligent, Measurable, Industrialized.

---

## 12. Strategic Positioning

This system is **not** a design automation tool. It is:

- A **compliance defense infrastructure**  
- A **creative industrialization engine**  
- A **structured experimentation platform**  
- A **global brand governance system**  

For regulated enterprises (e.g. Philip Morris International), it reduces regulatory exposure while increasing operational velocity.

---

## Relationship to CIF

The **Creative Intelligence Flywheel (CIF)** sits on top of CGVIP and the execution pipeline. CGVIP provides **governance**: compliance rules (Compliance Intelligence Agent), dataset integrity (Dataset Governance Agent), template compatibility, and human-in-the-loop approval. CIF adds a **predictive and economic layer**: behavioral data aggregation (feature store), performance and compliance risk prediction, variant optimization (variant mix, spend allocation), and economic value attribution. CIF consumes governance outputs (e.g. compliance rules, variant schema) and feeds optimization back into the pipeline. See [CIF_PRD.md](CIF_PRD.md) and [CIF_ARCHITECTURE.md](CIF_ARCHITECTURE.md).

---

## Appendix A: Current Repo vs. CGVIP Vision

*How this repository aligns with the CGVIP product vision.*

| CGVIP element | Current state in this repo | Gap / next step |
|---------------|----------------------------|------------------|
| **Campaign Architect Agent** | None. | Add agent that consumes briefs and outputs variation schema; integrate with approved claim library. |
| **Compliance Intelligence Agent** | Approval filter (`--approved-only`), `compliance_version` in data and DAM metadata, [VARIANT_SPEC](VARIANT_SPEC.md), `qaRules` in config. No policy engine. | Encode claim–market matrix, disclaimer library, expiry rules; configurable by Legal; emit approval flags and audit log. |
| **Dataset Governance Agent** | [Variant schema](../data/schema/variant_schema.json), sample data in `data/sample/`. No versioning or conflict detection. | Add dataset versioning, missing-field and conflict checks, template-version compatibility tracking. |
| **Template Compatibility Agent** | InDesign preflight (overset, disclaimer) in ExtendScript; [TEMPLATE_SPEC](TEMPLATE_SPEC.md). No predictive checks before render. | Character limits, safe-zone and motion-timing checks, language expansion model; run before orchestration. |
| **Render Orchestration Agent** | Node CLI prepares paths and run config; user runs ExtendScript manually in each Adobe app. No job queue or headless control. | Trigger scripts (API/ESTK/CEP or headless), job queue, status monitoring, retries, metadata capture. |
| **QA & Risk Agent** | Per-run manifests, [generate_dam_metadata](../orchestrator/scripts/generate_dam_metadata.js), aggregated `qa_report.json` / `qa_failures.txt`. | Extend to disclaimer presence, safe area, brand layer, version alignment; gate before DAM publish. |
| **Performance Intelligence Agent** | None. | Ingest channel performance + variant/hypothesis metadata; insights, next-test suggestions, fatigue alerts. |
| **DAM / Audit** | [DAM_METADATA](DAM_METADATA.md) schema and sidecar generation. No DAM API; no immutable audit store. | Add `campaign_id`, `approval_timestamp`, `automation_agent_signature`; optional DAM API; immutable audit log. |

**Summary:** This repo is the **execution foundation** (InDesign, Photoshop, After Effects paths, variant contract, approval filter, QA aggregation, DAM-oriented metadata). The CGVIP vision adds a **multi-agent layer** for orchestration, compliance reasoning, dataset governance, and performance intelligence on top of that foundation.

---

## Appendix B: Doc Map

| Document | Purpose |
|----------|---------|
| [CGVIP_PRODUCT_VISION.md](CGVIP_PRODUCT_VISION.md) | Product vision, agents, requirements, roadmap (this file). |
| [PLATFORM_ARCHITECTURE.md](PLATFORM_ARCHITECTURE.md) | Platform, data, and ML architecture (lakehouse, feature store, decisioning, orchestration); implementation sequencing. |
| [CIF_PRD.md](CIF_PRD.md) | Creative Intelligence Flywheel: predictive layer, economic model, six agents. |
| [CIF_ARCHITECTURE.md](CIF_ARCHITECTURE.md) | CIF mapping to pipeline and CGVIP; feature store; CLI. |
| [VARIANT_SPEC.md](VARIANT_SPEC.md) | Variation contract: locked vs variable elements, approval, compliance. |
| [TEMPLATE_SPEC.md](TEMPLATE_SPEC.md) | Per-app template rules (InDesign, Photoshop, After Effects). |
| [DAM_METADATA.md](DAM_METADATA.md) | DAM metadata schema and sidecar generation. |
| [RUNBOOK.md](RUNBOOK.md) | How to run the pipeline and troubleshoot. |
