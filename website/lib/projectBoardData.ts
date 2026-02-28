/**
 * Enterprise Creative Production Modernization Program — Project board data.
 * Aligned with ENTERPRISE_DEPLOYMENT_AND_OPERATING_MODEL.md and ENTERPRISE_IMPLEMENTATION_PLAN.md.
 */

export type CardStatus = 'not_started' | 'in_progress' | 'review' | 'done'

export interface BoardCard {
  id: string
  title: string
  description?: string
  owner?: string
  status: CardStatus
  duration?: string
}

export interface BoardPhase {
  id: string
  title: string
  subtitle: string
  duration: string
  cards: BoardCard[]
}

export const projectBoardPhases: BoardPhase[] = [
  {
    id: 'phase-0',
    title: 'Phase 0',
    subtitle: 'Executive alignment',
    duration: '4–6 weeks',
    cards: [
      { id: '0-1', title: 'Business case', description: 'Cost, speed, risk reduction', owner: 'Program lead', status: 'not_started' },
      { id: '0-2', title: 'Governance charter', description: 'What may vary; what is locked', owner: 'Legal + Program', status: 'not_started' },
      { id: '0-3', title: 'RACI matrix', description: 'Template, claim, variant approval', owner: 'Program lead', status: 'not_started' },
      { id: '0-4', title: 'Executive sponsor', description: 'Named sponsor; steering cadence', owner: 'CMO / COO', status: 'not_started' },
      { id: '0-5', title: 'KPI baselines', description: 'Production time, approval cycle, cost', owner: 'Program + Performance', status: 'not_started' },
    ],
  },
  {
    id: 'phase-1',
    title: 'Phase 1',
    subtitle: 'Diagnostic & template audit',
    duration: '8 weeks',
    cards: [
      { id: '1-1', title: 'Asset landscape mapping', description: 'Campaign types, formats, markets', owner: 'Marketing Ops', status: 'not_started' },
      { id: '1-2', title: 'Classification report', description: 'High-variance vs high-risk vs exclude', owner: 'Program lead', status: 'not_started' },
      { id: '1-3', title: 'Variation mapping', description: 'What changes per market; globally locked', owner: 'Brand + Legal', status: 'not_started' },
      { id: '1-4', title: 'Variation Contract Document (VCD)', description: 'Signed by Brand + Legal', owner: 'Legal', status: 'not_started' },
    ],
  },
  {
    id: 'phase-2',
    title: 'Phase 2',
    subtitle: 'System architecture & data',
    duration: '8–10 weeks',
    cards: [
      { id: '2-1', title: 'Variant schema', description: 'variant_id, market, claim_id, approval_status', owner: 'Automation + Legal', status: 'not_started' },
      { id: '2-2', title: 'Claim library v1.0', description: 'Legal-approved claim set', owner: 'Legal Systems Architect', status: 'not_started' },
      { id: '2-3', title: 'Disclaimer library v1.0', description: 'Market-disclaimer mapping', owner: 'Legal', status: 'not_started' },
      { id: '2-4', title: 'Legal rule encoding', description: 'Claim-to-market; expiry; validation', owner: 'Legal Systems Architect', status: 'not_started' },
      { id: '2-5', title: 'DAM metadata model', description: 'Minimum metadata for audit', owner: 'DAM Manager', status: 'not_started' },
    ],
  },
  {
    id: 'phase-3',
    title: 'Phase 3',
    subtitle: 'Template engineering',
    duration: '~12 weeks',
    cards: [
      { id: '3-1', title: 'InDesign template system', description: 'Print; locked disclaimers; preflight', owner: 'Template Engineers', status: 'not_started' },
      { id: '3-2', title: 'Photoshop Smart Object automation', description: 'Digital/social; JSON-driven export', owner: 'Template Engineers', status: 'not_started' },
      { id: '3-3', title: 'After Effects modular templates', description: 'HOOK / PRODUCT / LEGAL / END CARD', owner: 'Template Engineers', status: 'not_started' },
      { id: '3-4', title: 'QA & validation scripts', description: 'Overset, disclaimer check, layer validation', owner: 'Automation', status: 'not_started' },
    ],
  },
  {
    id: 'phase-4',
    title: 'Phase 4',
    subtitle: 'Compliance gating',
    duration: '~8 weeks',
    cards: [
      { id: '4-1', title: 'Two-layer approval model', description: 'Structural + variant approval', owner: 'Legal + Marketing Ops', status: 'not_started' },
      { id: '4-2', title: 'Approval dashboard', description: 'Review variants; flag approved IDs', owner: 'Marketing Ops', status: 'not_started' },
      { id: '4-3', title: 'Audit trail', description: 'Dataset, template, claim version, timestamp', owner: 'Automation + Compliance', status: 'not_started' },
      { id: '4-4', title: 'Compliance Traceability Framework', description: 'Process and tooling doc', owner: 'Program lead', status: 'not_started' },
    ],
  },
  {
    id: 'phase-5',
    title: 'Phase 5',
    subtitle: 'DAM & workflow',
    duration: '~8 weeks',
    cards: [
      { id: '5-1', title: 'DAM integration', description: 'Ingest, metadata, version history', owner: 'DAM Manager + IT', status: 'not_started' },
      { id: '5-2', title: 'Approved for Publish state', description: 'Status and access control', owner: 'DAM Manager', status: 'not_started' },
      { id: '5-3', title: 'Expired asset archival', description: 'Auto-archival rules', owner: 'DAM Manager', status: 'not_started' },
      { id: '5-4', title: 'End-to-end publish pipeline', description: 'Export → DAM → publish-ready', owner: 'Automation', status: 'not_started' },
    ],
  },
  {
    id: 'phase-6',
    title: 'Phase 6',
    subtitle: 'Pilot & rollout',
    duration: '~12 weeks',
    cards: [
      { id: '6-1', title: 'Pilot markets', description: '1 EU + 1 APAC + 1 LATAM', owner: 'Regional + Program', status: 'not_started' },
      { id: '6-2', title: 'Pilot metrics', description: 'Production time, compliance, traceability', owner: 'Performance', status: 'not_started' },
      { id: '6-3', title: 'Global rollout waves', description: 'Core → secondary markets', owner: 'Program lead', status: 'not_started' },
      { id: '6-4', title: 'Template governance council', description: 'Ownership; version cadence', owner: 'Creative Systems Lead', status: 'not_started' },
      { id: '6-5', title: 'Quarterly claim library audit', description: 'Legal-led review', owner: 'Legal', status: 'not_started' },
    ],
  },
]

export const statusLabels: Record<CardStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  review: 'Review',
  done: 'Done',
}

export const statusStyles: Record<CardStatus, string> = {
  not_started: 'bg-paper-subdued text-ink-muted border-paper-border',
  in_progress: 'bg-blue-50 text-blue-800 border-blue-200',
  review: 'bg-amber-50 text-amber-800 border-amber-200',
  done: 'bg-emerald-50 text-emerald-800 border-emerald-200',
}
