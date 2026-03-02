import type { Metadata } from 'next'
import Link from 'next/link'
import AgentCard from '@/components/AgentCard'
import CTABanner from '@/components/CTABanner'

export const metadata: Metadata = {
  title: 'Architecture — CGVIP',
  description:
    'Platform architecture: CGVIP governance layer, CIF predictive intelligence, Adobe execution pipelines, lakehouse data architecture, and full audit traceability.',
}

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

const platformLayers = [
  {
    label: 'Intelligence',
    name: 'CIF — Creative Intelligence Flywheel',
    desc: 'Behavioral data, performance prediction, compliance risk scoring, variant optimization, and economic attribution. Predictive layer on top of governance.',
  },
  {
    label: 'Governance',
    name: 'CGVIP — Creative Governance & Variant Intelligence Platform',
    desc: 'Compliance rules, dataset integrity, template compatibility, human-in-the-loop approvals, and full audit traceability. Governance before execution.',
  },
  {
    label: 'Execution',
    name: 'Adobe Pipelines',
    desc: 'InDesign data merge, Photoshop Smart Object batch, After Effects data-driven render. ExtendScript automation with structured manifest and DAM output.',
  },
]

const cgvipAgents = [
  {
    name: 'Campaign Architect Agent',
    role: 'Translates campaign briefs into structured variant models. Uses approved claim libraries only.',
    impact: 'Variation schema, hypothesis structure, required fields per market, template compatibility validation.',
  },
  {
    name: 'Compliance Intelligence Agent',
    role: 'Encodes and validates regulatory rules: market-claim validation, disclaimer matching, expiry rules, health warnings.',
    impact: 'Reduces file-by-file legal review; compliance approval flags and audit trail.',
  },
  {
    name: 'Dataset Governance Agent',
    role: 'Maintains structured dataset integrity: missing fields, conflicting claims, version-lock, naming conventions.',
    impact: 'Protects deterministic output and template-version compatibility.',
  },
  {
    name: 'Creative Template Compatibility Agent',
    role: 'Ensures dataset works with Adobe templates: character limits, overset prediction (InDesign), safe-zone and motion timing (After Effects).',
    impact: 'Prevents broken renders before they happen.',
  },
  {
    name: 'Render Orchestration Agent',
    role: 'Triggers Adobe production workflows: InDesign merge, Photoshop batch, After Effects render queue; job status and retries.',
    impact: 'Outputs pushed to DAM with structured metadata.',
  },
  {
    name: 'QA & Risk Agent',
    role: 'Post-render validation: disclaimer presence, safe area, missing assets, brand layer integrity, version alignment.',
    impact: 'Flags exceptions before publication.',
  },
  {
    name: 'Performance Intelligence Agent',
    role: 'Closes the loop: ingests channel performance and variant metadata; insights, next-test suggestions, fatigue alerts.',
    impact: 'Turns creative production into a learning system.',
  },
]

const cifAgents = [
  {
    name: 'Behavioral Signal Aggregator',
    role: 'Collects variant data, render manifests, and optional performance signals. Normalizes everything into a unified creative feature store.',
    impact: 'Versioned feature store per run; foundation for all downstream CIF predictions.',
  },
  {
    name: 'Performance Prediction Agent',
    role: 'Predicts conversion probability, engagement lift, creative fatigue, and CTR per variant by placement and market.',
    impact: 'Expected economic score per variant; enables informed variant selection before rendering.',
  },
  {
    name: 'Compliance Risk Prediction Agent',
    role: 'Predicts legal rejection probability, regulatory conflict score, and disclaimer risk per variant.',
    impact: 'Risk score per variant; flags high-risk variants before they reach legal review.',
  },
  {
    name: 'Variant Optimization Agent',
    role: 'Recommends variant mix, suppression list, test set, and spend allocation — all with compliance guardrails.',
    impact: 'Optimized variant set that balances performance, diversity, and risk constraints.',
  },
  {
    name: 'Render & Deployment Orchestrator',
    role: 'Existing pipeline runner extended to accept optimized variant sets from CIF. Filters dataset to recommended variants before writing run config.',
    impact: 'Only recommended variants are rendered; reduces waste and focuses on high-value output.',
  },
  {
    name: 'Economic Value Attribution Agent',
    role: 'Calculates ROAS uplift, cost per asset reduction, compliance review time savings, and creative reuse metrics. Feeds back into the feature store.',
    impact: 'Closes the flywheel loop — each campaign informs the next cycle of predictions.',
  },
]

const flowSteps = [
  'User Input',
  'Campaign Architect Agent',
  'Dataset Governance Agent',
  'Compliance Intelligence Agent',
  'Template Compatibility Agent',
  'Render Orchestration Agent',
  'QA & Risk Agent',
  'DAM Archive',
  'Performance Intelligence Agent',
  'Optimization Feedback Loop',
]

const lakehouseTiers = [
  {
    tier: 'Raw / Bronze',
    desc: 'Immutable source extracts and events. Adobe templates, DAM snapshots, compliance library updates, ad delivery stats.',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    tier: 'Curated / Silver',
    desc: 'Conformed schemas, de-duplicated, joined. Variants, templates, render jobs, approvals, compliance rules, QA findings.',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  {
    tier: 'Products / Gold',
    desc: 'Analytical products: variant performance, compliance risk, creative fatigue, test outcomes, economic attribution.',
    color: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  },
]

const canonicalIds = [
  { id: 'campaign_id', purpose: 'Links all assets to their originating campaign' },
  { id: 'variant_id', purpose: 'Unique identifier for each creative variant' },
  { id: 'template_version', purpose: 'Semantic version + hash of the Adobe template used' },
  { id: 'dataset_version', purpose: 'Version or timestamp of the variant dataset' },
  { id: 'compliance_version', purpose: 'Version of the legal/compliance rule-set applied' },
  { id: 'approval_record_id', purpose: 'Links to the approval event in the audit ledger' },
]

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function ArchitecturePage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        {/* Hero */}
        <h1 className="text-4xl font-bold text-ink">Platform architecture</h1>
        <p className="mt-5 max-w-3xl text-lg text-ink-muted leading-relaxed">
          CGVIP is a two-layer platform: a governance layer for compliance, dataset integrity, and
          human-in-the-loop approvals, and a predictive intelligence layer for performance modeling,
          variant optimization, and economic attribution. Adobe apps execute the rendering. Every
          decision and output carries a full audit trail.
        </p>

        {/* Three-layer overview */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-ink">Three platform layers</h2>
          <p className="mt-2 text-ink-muted leading-relaxed">
            CIF does not replace CGVIP or the pipeline. It adds a predictive and economic layer on top.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {platformLayers.map(({ label, name, desc }) => (
              <div key={label} className="rounded-card border border-paper-border bg-paper p-6 shadow-soft">
                <span className="inline-block rounded-pill bg-paper-subdued px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                  {label}
                </span>
                <h3 className="mt-3 font-semibold text-ink">{name}</h3>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CGVIP governance agents */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-ink">Governance layer — 7 CGVIP agents</h2>
          <p className="mt-2 text-ink-muted leading-relaxed">
            Each agent has a defined mandate, authority boundary, and explainable reasoning trail. No single monolithic AI.
          </p>

          {/* System flow */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-ink">System flow</h3>
            <div className="mt-4 flex flex-col gap-2">
              {flowSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ui border border-paper-border bg-paper-subdued text-sm font-medium text-ink-muted tabular-nums">
                    {i + 1}
                  </div>
                  <span className="text-ink">{step}</span>
                  {i < flowSteps.length - 1 && (
                    <span className="text-ink-subtle" aria-hidden>↓</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cgvipAgents.map((agent, index) => (
              <AgentCard
                key={agent.name}
                name={agent.name}
                role={agent.role}
                impact={agent.impact}
                index={index + 1}
              />
            ))}
          </div>
        </section>

        {/* CIF intelligence agents */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-ink">Intelligence layer — 6 CIF agents</h2>
          <p className="mt-2 max-w-3xl text-ink-muted leading-relaxed">
            The Creative Intelligence Flywheel adds predictive modeling and economic optimization on top
            of the governance layer. It ingests behavioral data, predicts performance and compliance risk,
            optimizes variant selection, and attributes economic value — creating a learning system that
            compounds with every campaign cycle.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cifAgents.map((agent, index) => (
              <AgentCard
                key={agent.name}
                name={agent.name}
                role={agent.role}
                impact={agent.impact}
                index={index + 1}
              />
            ))}
          </div>
        </section>

        {/* Data architecture */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-ink">Data architecture</h2>
          <p className="mt-2 max-w-3xl text-ink-muted leading-relaxed">
            A lakehouse pattern with immutable lineage. Every asset in DAM is reconstructable from its
            template version, dataset version, and compliance version.
          </p>

          {/* Lakehouse tiers */}
          <div className="mt-8 space-y-4">
            {lakehouseTiers.map(({ tier, desc, color }) => (
              <div key={tier} className={`rounded-card border p-5 ${color}`}>
                <h3 className="font-semibold">{tier}</h3>
                <p className="mt-1 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Canonical IDs */}
          <h3 className="mt-10 text-lg font-semibold text-ink">Canonical identity</h3>
          <p className="mt-1 text-sm text-ink-muted leading-relaxed">
            Non-negotiable identifiers that thread every asset through the entire system.
          </p>
          <div className="mt-4 overflow-hidden rounded-card border border-paper-border">
            <table className="min-w-full divide-y divide-paper-border">
              <thead className="bg-paper-subdued">
                <tr>
                  <th scope="col" className="px-5 py-3.5 text-left text-sm font-semibold text-ink">ID</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-sm font-semibold text-ink">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border bg-paper">
                {canonicalIds.map(({ id, purpose }) => (
                  <tr key={id}>
                    <td className="px-5 py-3.5 text-sm font-mono text-xs font-medium text-ink">{id}</td>
                    <td className="px-5 py-3.5 text-sm text-ink-muted leading-relaxed">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Audit & observability */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-ink">Governance, audit &amp; observability</h2>
          <p className="mt-2 max-w-3xl text-ink-muted leading-relaxed">
            Enterprise-grade traceability from recommendation through rendering to publication.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              {
                title: 'Append-only audit ledger',
                desc: 'Every dataset edit, approval, model promotion, render job submission, and publishing event is logged in an immutable append-only store with WORM storage.',
              },
              {
                title: 'Role-based access (RBAC/ABAC)',
                desc: 'Attribute-based controls by market, region, and brand. Roles: Marketing, Legal, Ops, Agency, Admin.',
              },
              {
                title: 'End-to-end tracing',
                desc: 'Correlated trace IDs (OpenTelemetry) from recommendation through rendering to publish. Metrics: throughput, render failure rate, queue latency.',
              },
              {
                title: 'ML observability',
                desc: 'Data drift, prediction drift, outcome drift, calibration monitoring, and human override rate tracking across all CIF models.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-card border border-paper-border bg-paper p-6 shadow-soft">
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-16 flex flex-wrap gap-4">
          <Link
            href="/integrations"
            className="inline-flex items-center justify-center rounded-ui bg-ink px-6 py-3.5 text-base font-semibold text-paper shadow-soft hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted"
          >
            Adobe integrations
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-ui border border-paper-border bg-paper px-6 py-3.5 text-base font-semibold text-ink hover:bg-paper-subdued focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted"
          >
            Get in touch
          </Link>
        </div>
      </div>

      <CTABanner
        title="See how CGVIP orchestrates at enterprise scale"
        description="From predictive intelligence to governed rendering — a full platform for regulated creative production."
        primaryHref="/contact"
        primaryLabel="Get in touch"
        secondaryHref="/integrations"
        secondaryLabel="Adobe integrations"
      />
    </>
  )
}
