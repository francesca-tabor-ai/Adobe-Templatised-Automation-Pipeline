import type { Metadata } from 'next'
import Link from 'next/link'
import PipelineCard from '@/components/PipelineCard'
import CTABanner from '@/components/CTABanner'

export const metadata: Metadata = {
  title: 'Integrations — CGVIP',
  description:
    'How CGVIP orchestrates Adobe InDesign, Photoshop, and After Effects pipelines with ExtendScript automation, DAM metadata, and full audit traceability.',
}

/* ------------------------------------------------------------------ */
/*  SVG icons for each Adobe app                                      */
/* ------------------------------------------------------------------ */

const InDesignIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <text x="6" y="17" fontSize="12" fontWeight="bold" fill="currentColor">Id</text>
  </svg>
)

const PhotoshopIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <text x="5" y="17" fontSize="12" fontWeight="bold" fill="currentColor">Ps</text>
  </svg>
)

const AfterEffectsIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <text x="5" y="17" fontSize="12" fontWeight="bold" fill="currentColor">Ae</text>
  </svg>
)

/* ------------------------------------------------------------------ */
/*  Pipeline data                                                     */
/* ------------------------------------------------------------------ */

const pipelines = [
  {
    app: 'InDesign — Data Merge Pipeline',
    icon: InDesignIcon,
    description:
      'Multi-language print and static layouts via CSV-driven data merge with per-record PDF export. Preflight validation ensures disclaimer presence, font embedding, and bleed compliance before output.',
    dataSource: 'CSV (UTF-8)',
    output: 'PDF per variant',
    capabilities: [
      'Data Merge with named text frames matching CSV column headers',
      'Locked layers for logo, brand elements, and disclaimer areas',
      'Paragraph and character styles for consistent typography and fallback sizing',
      'Preflight validation: disclaimer presence, missing fonts, bleed checks',
      'Per-record PDF export with configurable export presets',
    ],
    templateReqs: [
      'Master document with merge fields or named text frames matching CSV columns',
      'Locked layers for non-variable brand and legal elements',
      'Defined maximum copy lengths per field per language for overset handling',
      'Document bleed configured; fonts embedded or subsetted',
    ],
  },
  {
    app: 'Photoshop — Smart Object Batch',
    icon: PhotoshopIcon,
    description:
      'Image-driven variant production via JSON-driven Smart Object substitution. Layers are matched by naming convention and replaced programmatically for batch PNG export.',
    dataSource: 'JSON',
    output: 'PNG per variant',
    capabilities: [
      'Smart Object replacement via placedLayerReplaceContents',
      'Case-insensitive layer matching by substring for flexible naming',
      'Multi-variant batch export with per-variant PNG output',
      'Configurable asset maps for product and background images',
      'Supports PSD, TIFF, and JPG source files for Smart Objects',
    ],
    templateReqs: [
      'Smart Object layers for replaceable images (BACKGROUND_SMART, PRODUCT_SMART)',
      'Text layers with naming convention (HEADLINE_TEXT, CTA_TEXT, DISCLAIMER_TEXT)',
      'Consistent, script-friendly layer naming throughout the document',
      'Asset paths resolved from config or assets/{id}.jpg by default',
    ],
  },
  {
    app: 'After Effects — Data-Driven Render',
    icon: AfterEffectsIcon,
    description:
      'Multi-variant motion production via composition duplication and automated render queue. Each variant gets its own comp with text layers set from the data feed, then queued for H.264 MP4 output.',
    dataSource: 'CSV or JSON',
    output: 'MP4 per variant (H.264)',
    capabilities: [
      'Essential Graphics (MOGRT) support and text layer Source Text automation',
      'Composition duplication per variant for isolated rendering',
      'Render queue automation with configurable output module (H.264)',
      'Aspect ratio mapping via channel configuration (16:9, 1:1, 9:16)',
      'Data feed flexibility: CSV or JSON input formats',
    ],
    templateReqs: [
      'Named compositions per aspect ratio (e.g. Comp_16x9, Comp_1x1, Comp_9x16)',
      'Text layers named HEADLINE, CTA, DISCLAIMER for script matching',
      'Modular structure: HOOK / PRODUCT / LEGAL / END CARD sections',
      'Output module template (e.g. H.264) configured in project',
    ],
  },
]

const summaryTable = [
  { app: 'InDesign', dataSource: 'CSV', naming: 'Text frames / merge fields = columns', output: 'PDF per variant' },
  { app: 'Photoshop', dataSource: 'JSON', naming: 'Layer names: *_SMART, *_TEXT', output: 'PNG per variant' },
  { app: 'After Effects', dataSource: 'JSON or CSV', naming: 'Text layer names, comp name by ratio', output: 'MP4 per variant' },
]

const damFields = [
  { field: 'variant_id', type: 'string', description: 'Unique variant identifier' },
  { field: 'market', type: 'string', description: 'Market code (e.g. US, DE, FR)' },
  { field: 'language', type: 'string', description: 'Language code (e.g. en, de, fr)' },
  { field: 'channel', type: 'string', description: 'Delivery channel (e.g. print_a4, social_1_1)' },
  { field: 'template_version', type: 'string', description: 'Version of the template used' },
  { field: 'dataset_version', type: 'string', description: 'Version or timestamp of the variant dataset' },
  { field: 'compliance_version', type: 'string', description: 'Legal/compliance rule-set version' },
  { field: 'campaign_id', type: 'string', description: 'Campaign identifier for traceability' },
  { field: 'approval_timestamp', type: 'string', description: 'ISO 8601 timestamp of approval' },
  { field: 'automation_agent_signature', type: 'string', description: 'Run ID linking asset to audit log' },
]

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function IntegrationsPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        {/* Hero */}
        <h1 className="text-4xl font-bold text-ink">Adobe integrations</h1>
        <p className="mt-5 max-w-3xl text-lg text-ink-muted leading-relaxed">
          CGVIP orchestrates Adobe — it does not replace it. ExtendScript pipelines drive InDesign,
          Photoshop, and After Effects to produce governed, compliant creative assets at scale. Every
          output carries structured metadata and a full audit trail.
        </p>

        {/* Pipeline cards */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-ink">Render pipelines</h2>
          <p className="mt-2 text-ink-muted leading-relaxed">
            Three execution paths, each purpose-built for its Adobe application. Data in, governed assets out.
          </p>
          <div className="mt-10 space-y-8">
            {pipelines.map((p) => (
              <PipelineCard key={p.app} {...p} />
            ))}
          </div>
        </section>

        {/* Summary table */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-ink">At a glance</h2>
          <div className="mt-6 overflow-hidden rounded-card border border-paper-border">
            <table className="min-w-full divide-y divide-paper-border">
              <thead className="bg-paper-subdued">
                <tr>
                  <th scope="col" className="px-5 py-3.5 text-left text-sm font-semibold text-ink">App</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-sm font-semibold text-ink">Data source</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-sm font-semibold text-ink">Key naming</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-sm font-semibold text-ink">Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border bg-paper">
                {summaryTable.map(({ app, dataSource, naming, output }) => (
                  <tr key={app}>
                    <td className="px-5 py-3.5 text-sm font-medium text-ink">{app}</td>
                    <td className="px-5 py-3.5 text-sm text-ink-muted">{dataSource}</td>
                    <td className="px-5 py-3.5 text-sm text-ink-muted font-mono text-xs">{naming}</td>
                    <td className="px-5 py-3.5 text-sm text-ink-muted">{output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DAM integration */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-ink">DAM integration &amp; asset lifecycle</h2>
          <p className="mt-2 max-w-3xl text-ink-muted leading-relaxed">
            Every rendered asset is pushed to DAM with a structured metadata sidecar for full
            traceability. Each asset can be reconstructed from its template version, dataset version,
            and compliance version. Auto-archival rules handle expiry.
          </p>

          <div className="mt-8 overflow-hidden rounded-card border border-paper-border">
            <table className="min-w-full divide-y divide-paper-border">
              <thead className="bg-paper-subdued">
                <tr>
                  <th scope="col" className="px-5 py-3.5 text-left text-sm font-semibold text-ink">Field</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-sm font-semibold text-ink">Type</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-sm font-semibold text-ink">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border bg-paper">
                {damFields.map(({ field, type, description }) => (
                  <tr key={field}>
                    <td className="px-5 py-3.5 text-sm font-mono text-xs font-medium text-ink">{field}</td>
                    <td className="px-5 py-3.5 text-sm text-ink-muted">{type}</td>
                    <td className="px-5 py-3.5 text-sm text-ink-muted leading-relaxed">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { title: 'Publish', desc: 'Assets with structured metadata are pushed to DAM with "Approved for Publish" status.' },
              { title: 'Expire', desc: 'Compliance-version expiry rules flag assets past their valid date range.' },
              { title: 'Archive', desc: 'Auto-archival rules move expired assets out of active distribution channels.' },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-card border border-paper-border bg-paper-subdued p-5">
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-ink-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-16">
          <Link
            href="/architecture"
            className="inline-flex items-center justify-center rounded-ui bg-ink px-6 py-3.5 text-base font-semibold text-paper shadow-soft hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted"
          >
            See the platform architecture
          </Link>
        </div>
      </div>

      <CTABanner
        title="Ready to integrate with your Adobe stack?"
        description="CGVIP orchestrates InDesign, Photoshop, and After Effects with full governance, compliance validation, and audit traceability."
        primaryHref="/contact"
        primaryLabel="Get in touch"
        secondaryHref="/architecture"
        secondaryLabel="Platform architecture"
      />
    </>
  )
}
