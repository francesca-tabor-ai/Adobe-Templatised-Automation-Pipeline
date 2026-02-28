# Enterprise Creative Production Modernization Program  
## Realistic Project Plan & Operating Model for Global, Regulated Organizations

**Program positioning:** Enterprise Creative Production Modernization — *not* a design initiative.  
**Target context:** Global brand organizations · Regulated industries · Multi-market governance · High compliance · Matrixed stakeholders  
**Emphasis:** How templated creative automation **operates within the wider enterprise system**.

---

# I. Strategic Context: Why This Is Critical for PMI-Type Enterprises

## 1.1 Operating Reality

Organizations like **Philip Morris International (PMI)** operate across:

| Dimension | Reality |
|-----------|---------|
| **Markets** | 150+ markets |
| **Advertising** | Strict advertising restrictions by jurisdiction |
| **Legal** | Market-specific legal disclaimers; highly controlled claim libraries |
| **Refresh cycles** | Rapid retail & trade marketing refresh cycles |
| **Digital** | Increasing digital performance pressure |

## 1.2 The Core Challenge

**Scale variants without increasing compliance risk.**

Creative volume and format fragmentation are growing. Manual, file-by-file production and legal review do not scale. The enterprise must:

- Produce more variants, faster, across more markets and channels.
- Keep every asset within approved claims, disclaimers, and market rules.
- Maintain full audit traceability for regulators and internal control.

## 1.3 How This Program Is Positioned

| Not this | This |
|----------|------|
| A design or creative initiative | **Enterprise Creative Production Modernization Program** |
| A tool rollout | A **governed production system** with Legal, Brand, and Compliance at the centre |
| Optional efficiency project | **Strategic capability** for risk-managed scale |

**Without executive alignment and cross-functional buy-in, the system will fail politically.** Phase 0 is non-negotiable.

---

# II. 12-Month Enterprise Deployment Roadmap

## Phase 0 — Executive Alignment  
**Duration: 4–6 weeks**

### Objective

Secure **cross-functional buy-in before touching templates or data**. No technical build starts until Phase 0 is signed off.

### Stakeholders (Must Engage)

| Stakeholder | Role in program |
|-------------|-----------------|
| Global Brand Director | Template and brand grammar ownership; scope of variation |
| Regional Marketing Leads | Demand signal; pilot markets; adoption |
| Legal / Regulatory Affairs | Claim libraries; disclaimer rules; structural approval |
| Compliance | Market-claim matrix; audit requirements |
| IT / Digital Infrastructure | DAM, version control, render, APIs |
| DAM owner | Metadata standard; ingestion; access control |
| Procurement (agencies) | Shift from per-asset to system-based engagement |

### Deliverables

| Deliverable | Owner | Purpose |
|-------------|--------|---------|
| **Business case** | Program lead | Cost reduction + speed + risk reduction; board-ready |
| **Governance charter** | Legal + Program lead | What may vary; what is locked; who approves what |
| **RACI matrix** | Program lead | Template, claim, disclaimer, variant approval ownership |
| **Executive sponsor assignment** | CMO / COO | Named sponsor; steering cadence |
| **Defined KPIs** | Program lead + Performance | Baseline and targets (see Section VII) |

### Defined KPIs (Agreed in Phase 0)

- Asset production time (brief → approved asset)
- Variant approval cycle time
- Compliance incident reduction
- Cost per asset
- Reuse rate of templates

**Exit criterion:** Charter and RACI signed; executive sponsor assigned; KPIs baselined. *Without this phase, the system will fail politically.*

---

## Phase 1 — Diagnostic & Template Audit  
**Duration: 8 weeks**

### 1.1 Asset Landscape Mapping

**Inventory (by campaign type, format, market, language, claim type):**

| Category | Examples |
|----------|----------|
| Campaign types | Retail, trade, digital, OOH |
| Formats | Print, static digital, video |
| Languages | Per market |
| Markets | Tier 1 / Tier 2 / pilot list |
| Claim types | Approved claim categories |

**Classification:**

| Segment | Action |
|---------|--------|
| **High-variance, high-volume** | Primary automation candidates |
| **High-risk, compliance-heavy** | Automation with strict gating; early legal encoding |
| **Low-volume bespoke** | Exclude from automation; keep as exceptions |

Output: **Asset landscape report** — what we automate first, what we defer, what we never automate.

### 1.2 Variation Mapping

Define clearly:

- **What changes per market?** (disclaimers, claims, copy, imagery where allowed)
- **What is globally locked?** (logo, brand blocks, mandatory health warnings, layout rules)
- **Which disclaimers are mandatory** (per market/channel)
- **Which claims are approved per region** (claim-to-market eligibility)

**Deliverable: Variation Contract Document (VCD)**  
Signed by Brand + Legal. This is the **contract** for what automation is allowed to change. No variable field exists without VCD approval.

---

## Phase 2 — System Architecture & Data Model  
**Duration: 8–10 weeks**

*This is the most important phase. Get the data model and rules right; everything else follows.*

### 2.1 Variant Schema (Single Source of Truth)

The dataset that drives all automated output. Core fields:

| Field | Purpose |
|-------|---------|
| `variant_id` | Unique identifier |
| `campaign_id` | Campaign or initiative |
| `market` | Target market |
| `language` | Language code |
| `channel` | print, OOH, social, display, video |
| `aspect_ratio` | Format |
| `headline` | (from approved copy or library) |
| `subheadline` | (from approved copy or library) |
| `CTA` | Call-to-action (approved options) |
| `legal_disclaimer_id` | Reference to disclaimer library |
| `claim_id` | Reference to claim library |
| `compliance_version` | Rule set version in effect |
| `template_version` | Template version used |
| `approval_status` | e.g. draft / pending / approved / expired |

This schema becomes the **single source of truth** for variant production. All Adobe execution (InDesign, Photoshop, After Effects) consumes this dataset; no ad-hoc content.

### 2.2 Legal Rule Encoding

For PMI-type regulation, encode into **validation rules** (not policy documents only):

| Rule type | Examples |
|-----------|----------|
| Claim-to-market matrix | Which claims are eligible in which markets |
| Disclaimer mapping | Which disclaimer(s) attach to which claim/channel/market |
| Expiry logic | Claim and disclaimer expiration; automatic exclusion |
| Age-restriction requirements | Channel/market-specific |
| Mandatory health warning placement | Position, size, non-removability |

**Shift:** Legal moves from **reviewer of hundreds of files** → **architect of rule sets and claim libraries**. One-time rule design; repeated automated enforcement.

### 2.3 DAM Integration Model

Every output pushed to enterprise DAM must carry **minimum metadata** for audit defensibility:

- `variant_id`
- `market`
- `language`
- `compliance_version`
- `approval` record reference
- `export` timestamp

Plus template_version, dataset_version, and automation_run_id where applicable. This ensures **audit defensibility** and reconstruction capability.

---

# III. Adobe Execution Layer Design

Execution is the **last mile**; governance and data come first. Three tracks.

## Static Print & Regulatory Materials  
**→ InDesign templated system**

**Use for:** Trade marketing, retail POS, regulatory documentation, multi-language print kits.

**Governance built in:**

- Locked disclaimer zones (non-editable)
- Non-editable brand layers
- Preflight automation
- Overset detection script

**Output:** Scripted export per variant_id; preflight pass/fail; automatic disclaimer placement.

---

## Static Digital & Social  
**→ Photoshop Smart Object automation**

**Use for:** Product visuals, channel-specific sizes, background swaps, CTA testing.

**Mechanism:** JSON-driven data substitution; Smart Object swapping; controlled text layers.  
**Governance:** Layer validation; disclaimer presence check; channel-specific export presets.

**Output:** Batch export from single dataset; metadata written to file and DAM.

---

## Motion & Multi-Market Video  
**→ After Effects modular templates**

**Structure:** Precomp architecture, e.g.:

- **HOOK** — Opening (duration/language-safe)
- **PRODUCT** — Product block (swappable)
- **LEGAL** — Disclaimer / mandatory frames (locked)
- **END CARD** — CTA / sign-off

**Constraint:** Safe text lengths and durations per language must be engineered so that legal and CTA never overflow or get cut.

**Output:** JSON-driven render queue; standardized presets; caption/subtitle compliance handling.

---

# IV. Enterprise Operating Model

## 1. Organizational Structure

Create a **Creative Automation Pod** inside **Global Marketing Ops** (or equivalent).

**This is not a design team. It is a production systems team.**

| Role | Responsibility |
|------|----------------|
| **Creative Systems Lead** | Owns template grammar; template approval (Level 1) |
| **Template Engineers** | Build and maintain Adobe systems (InDesign, Photoshop, After Effects) |
| **Legal Systems Architect** | Encodes compliance rules; maintains claim/disclaimer libraries |
| **Marketing Ops Lead** | Owns dataset; variant approval workflow; campaign coordination |
| **DAM Manager** | Metadata governance; ingestion; access control; archival |
| **Performance Analytics Lead** | Variant measurement; tagging results back to variant_id; test framework |

Reporting line: Pod reports into Global Marketing Ops / CMO office; dotted line to Legal for rule design and to IT for infrastructure.

## 2. Day-to-Day Operating Workflow: Campaign Launch Flow

| Step | Owner | Action |
|------|--------|--------|
| 1 | Brand / Campaign | Campaign concept approved globally |
| 2 | Automation Pod | Create template master; lock variable fields per VCD |
| 3 | Legal Systems Architect | Encode claim set and disclaimer rules for campaign/markets |
| 4 | Marketing Ops | Dataset populated per market (within rules) |
| 5 | Template Engineers / QA | Validation run; overset, disclaimer, claim checks |
| 6 | Regional / Brand | Approved variants flagged in dataset (Level 3 approval) |
| 7 | Automation Pod | Automated export (only approved variant_ids) |
| 8 | DAM Manager | Push to DAM; metadata attached; “Approved for Publish” state |
| 9 | Regional teams | Pull approved assets from DAM for activation |
| 10 | Performance | Tag results back to variant_id; closed loop for learning |

**Outcome:** Closed loop from brief → approved variant → DAM → activation → measurement. No manual file editing in the middle.

## 3. Governance Model: Three Gating Levels

| Level | What | Who | When |
|-------|------|-----|------|
| **Level 1 — Template approval** | Template structure; variable fields; brand lock | Creative Systems Lead + Brand | Once per campaign / template version |
| **Level 2 — Claim & disclaimer approval** | Claim sets; disclaimer combinations; market eligibility | Legal / Compliance | Per market / campaign |
| **Level 3 — Variant approval** | Dataset row marked approved; allowed for export | Marketing Ops + Regional (per process) | Per variant or batch |

**No manual file-level review** unless an exception is triggered (e.g. one-off market exception, escalation). This **dramatically reduces review time** while keeping control.

---

# V. Integration With Wider Enterprise Functions

## 1. Legal & Regulatory Affairs

| Before | After |
|--------|--------|
| Reviewing hundreds of files per campaign | Approving **rule sets** and **claim libraries** |
| Bottleneck at file level | Efficiency gain: design rules once, enforce automatically |

**Integration:** Legal Systems Architect role; regular rule-review cadence; claim/disclaimer library versioning; expiry and market-eligibility maintained in system.

## 2. Regional Marketing Teams

**They do not edit files.**

They:

- Request variant changes **via dataset** (e.g. new rows or field updates within rules)
- Select **approved** claim combinations only
- **Cannot** violate compliance rules (system blocks invalid combinations)
- Pull **approved** assets from DAM for local activation

**Integration:** Training on dataset and approval workflow; no local creative file editing for automated asset types; clear escalation path for exceptions.

## 3. Procurement & Agencies

| Before | After |
|--------|--------|
| Agencies deliver hundreds of final files | Agencies deliver **template masters** and **design grammar rules** |
| Per-asset billing | **System-based** engagement (templates, rules, training) |

**Integration:** Contract and SOW shift to template and system delivery; acceptance criteria tied to template approval and rule encoding, not volume of final files.

## 4. IT & Infrastructure

**Requirements:**

- Version control for **datasets** (and template files)
- Automated QA scripts in CI or pipeline
- Secure **render nodes** for video (After Effects)
- **DAM integration API** (ingest, metadata, status)
- **Audit archive** storage (datasets, runs, approval records; retention per legal)

**Integration:** IT in Phase 0 for DAM and infra; ongoing for access control, backup, and compliance retention.

---

# VI. Risk Mitigation for PMI-Type Organizations

## 1. Compliance Risk

| Mitigation |
|------------|
| Hard-coded disclaimer zones; non-removable legal layers in templates |
| Market-claim **validation rules**; invalid combinations blocked at dataset level |
| **Expiry enforcement** in rule engine; expired claims/disclaimers excluded from export |
| Full **audit trail**: variant_id → dataset → template → compliance version → approval |

## 2. Brand Dilution Risk

| Mitigation |
|------------|
| **Limited variable fields** (only those in VCD) |
| **Strict typography and layout constraints** in template grammar |
| **Design grammar** enforcement via locked layers and controlled placeholders |

## 3. Operational Resistance

| Mitigation |
|------------|
| **Pilot in 2–3 markets**; prove value before global rollout |
| Demonstrate **30–50% production time reduction** and **compliance improvement** in pilot |
| Show **clear metrics** (cycle time, error rate, cost per variant) to regional and legal stakeholders |
| Train and support; position Pod as **enabler**, not replacement of regional ownership |

---

# VII. KPI Framework

**Executive-level KPIs (agreed in Phase 0; reported to sponsor and board):**

| KPI | Description |
|-----|-------------|
| **Production cycle time** | Reduction from brief to approved asset (target: 30–50%) |
| **Asset error rate** | Compliance and creative errors per batch (target: reduction) |
| **Compliance revision frequency** | Post-approval revisions due to compliance (target: decrease) |
| **Cost per variant** | Cost per approved, publish-ready asset (target: reduction) |
| **Template reuse rate** | % of assets generated from approved templates (target: increase) |
| **Time-to-market per campaign** | Days from campaign approval to first approved assets (target: reduction) |
| **% of assets via automation** | Share of campaign assets generated through the system (target: increase over 12 months) |

Baseline in Phase 0; track monthly; review at steering.

---

# VIII. 12-Month Maturity Model

| Stage | Timeline | Capability |
|-------|----------|------------|
| **Pilot templates** | Month 0–3 | Phase 0–1–2 complete; first templates live; 2–3 pilot markets; limited channels |
| **Regional rollout** | Month 4–6 | More markets; more campaigns; dataset and approval workflow standard |
| **DAM-integrated automation** | Month 7–9 | Full ingest; metadata; “Approved for Publish”; archival rules |
| **Full compliance gating + analytics loop** | Month 10–12 | Three-level gating standard; performance tagged to variant_id; quarterly claim library audit |

**End state:** Creative behaves like a **governed manufacturing system**: predictable, auditable, scalable, with Legal and Brand in control.

---

# IX. What Changes Culturally

Inside a company like **Philip Morris International**:

| Function | Before | After |
|----------|--------|--------|
| **Creative** | Artisanal production; many one-off files | **System architects**; template grammar; controlled variation |
| **Legal** | Bottleneck; file-by-file review | **Rule designers**; claim libraries; structural approval |
| **Regions** | File editors; local adaptations | **Controlled variant selectors**; dataset and approval only |
| **Agencies** | File factories; volume-based delivery | **Grammar engineers**; template masters; system-based engagement |

The shift is from **craft at scale** to **governed production at scale** — without giving up quality or control.

---

# Document Control

| Attribute | Value |
|-----------|--------|
| **Document** | Enterprise Deployment & Operating Model |
| **Program** | Enterprise Creative Production Modernization |
| **Version** | 1.0 |
| **Owner** | Program Lead / Global Marketing Ops |
| **Related** | [ENTERPRISE_IMPLEMENTATION_PLAN.md](ENTERPRISE_IMPLEMENTATION_PLAN.md) (technical phases); [PLATFORM_ARCHITECTURE.md](PLATFORM_ARCHITECTURE.md) (data & platform) |

*Next review: After Phase 0 sign-off.*
