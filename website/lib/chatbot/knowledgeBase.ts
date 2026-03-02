import { KnowledgeEntry } from './types'

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: 'what-is-cgvip',
    topic: 'What is CGVIP',
    phrases: ['what is cgvip', 'what does cgvip do', 'tell me about cgvip', 'explain cgvip', 'cgvip overview'],
    keywords: ['what', 'cgvip', 'about', 'overview', 'explain', 'introduction', 'platform', 'tell me'],
    response:
      'CGVIP (Creative Governance & Variant Intelligence Platform) is an AI-orchestrated creative automation system for regulated enterprises. It sits on top of Adobe — it doesn\'t replace InDesign, Photoshop, or After Effects, it orchestrates and governs them.\n\nIt generates compliant multi-market variants, validates legal constraints, and maintains full audit traceability. Think of it as the AI Creative Operating System for enterprise brands.',
    quickActions: ['How does it work?', 'What agents exist?', 'Use cases'],
    link: { label: 'Learn more', href: '/product' },
  },
  {
    id: 'how-it-works',
    topic: 'How it works',
    phrases: ['how does it work', 'how does cgvip work', 'system flow', 'what is the process', 'walk me through'],
    keywords: ['how', 'work', 'process', 'flow', 'steps', 'pipeline', 'system', 'walk'],
    response:
      'CGVIP follows a 10-step system flow. Every step generates a timestamp, version ID, agent reasoning log, and approval state:\n\n1. User Input\n2. Campaign Architect Agent\n3. Dataset Governance Agent\n4. Compliance Intelligence Agent\n5. Template Compatibility Agent\n6. Render Orchestration Agent\n7. QA & Risk Agent\n8. DAM Archive\n9. Performance Intelligence Agent\n10. Optimization Feedback Loop\n\nEach agent has a defined mandate and authority boundary — no single monolithic AI.',
    quickActions: ['What agents exist?', 'What is CGVIP?', 'Use cases'],
    link: { label: 'See the product', href: '/product' },
  },
  {
    id: 'agents-overview',
    topic: 'Agents overview',
    phrases: ['what agents exist', 'list the agents', 'agent architecture', 'multi agent', 'how many agents'],
    keywords: ['agents', 'architecture', 'multi', 'seven', '7', 'list'],
    response:
      'CGVIP uses 7 specialized agents, each with a defined mandate:\n\n1. Campaign Architect — Translates briefs into variant models\n2. Compliance Intelligence — Encodes and validates regulatory rules\n3. Dataset Governance — Maintains dataset integrity and version-lock\n4. Creative Template Compatibility — Ensures datasets work with Adobe templates\n5. Render Orchestration — Triggers Adobe production workflows\n6. QA & Risk — Post-render validation before publication\n7. Performance Intelligence — Closes the loop with channel performance insights\n\nWant to know more about a specific agent? Just ask!',
    quickActions: ['Campaign Architect', 'Compliance agent', 'How to deploy?'],
  },
  {
    id: 'agent-campaign-architect',
    topic: 'Campaign Architect Agent',
    phrases: ['campaign architect', 'campaign agent', 'translates briefs'],
    keywords: ['campaign', 'architect', 'brief', 'variant model', 'schema'],
    response:
      'The Campaign Architect Agent translates campaign briefs into structured variant models using approved claim libraries only.\n\nIt outputs: variation schema, hypothesis structure, required fields per market, and template compatibility validation. This is the entry point of the pipeline — it turns marketing intent into structured, governed data.',
    quickActions: ['Compliance agent', 'How does it work?', 'What agents exist?'],
  },
  {
    id: 'agent-compliance',
    topic: 'Compliance Intelligence Agent',
    phrases: ['compliance agent', 'compliance intelligence', 'legal validation', 'regulatory rules'],
    keywords: ['compliance', 'legal', 'regulatory', 'disclaimer', 'rules', 'validation', 'regulation'],
    response:
      'The Compliance Intelligence Agent encodes and validates regulatory rules: market-claim validation, disclaimer matching, expiry rules, and health warnings.\n\nIt reduces file-by-file legal review by automating compliance checks, providing approval flags and a full audit trail. Before CGVIP, legal reviewed files manually — now legal encodes rules, and the system enforces them.',
    quickActions: ['QA & Risk agent', 'Use cases', 'How to deploy?'],
  },
  {
    id: 'agent-dataset',
    topic: 'Dataset Governance Agent',
    phrases: ['dataset governance', 'dataset agent', 'data integrity'],
    keywords: ['dataset', 'governance', 'integrity', 'missing fields', 'version', 'naming'],
    response:
      'The Dataset Governance Agent maintains structured dataset integrity: it catches missing fields, conflicting claims, version-lock issues, and naming convention violations.\n\nThis protects deterministic output and template-version compatibility — ensuring what you put in is clean before it reaches the rendering stage.',
    quickActions: ['Template agent', 'What agents exist?', 'How does it work?'],
  },
  {
    id: 'agent-template',
    topic: 'Creative Template Compatibility Agent',
    phrases: ['template compatibility', 'template agent', 'creative template'],
    keywords: ['template', 'compatibility', 'character', 'overset', 'indesign', 'safe zone', 'motion'],
    response:
      'The Creative Template Compatibility Agent ensures datasets work with Adobe templates: character limits, overset prediction for InDesign, safe-zone validation, and motion timing for After Effects.\n\nIt prevents broken renders before they happen — catching issues that would otherwise surface as production failures late in the pipeline.',
    quickActions: ['Render agent', 'What agents exist?', 'How does it work?'],
  },
  {
    id: 'agent-render',
    topic: 'Render Orchestration Agent',
    phrases: ['render orchestration', 'render agent', 'production workflow'],
    keywords: ['render', 'orchestration', 'production', 'indesign merge', 'photoshop batch', 'after effects render', 'dam'],
    response:
      'The Render Orchestration Agent triggers Adobe production workflows: InDesign merge, Photoshop batch processing, and After Effects render queue — with job status tracking and retries.\n\nOutputs are pushed to DAM (Digital Asset Management) with structured metadata, ready for downstream distribution.',
    quickActions: ['QA & Risk agent', 'What agents exist?', 'How does it work?'],
  },
  {
    id: 'agent-qa',
    topic: 'QA & Risk Agent',
    phrases: ['qa agent', 'qa risk', 'quality assurance', 'post render validation'],
    keywords: ['qa', 'risk', 'quality', 'validation', 'disclaimer presence', 'safe area', 'brand layer'],
    response:
      'The QA & Risk Agent performs post-render validation: disclaimer presence, safe area compliance, missing assets, brand layer integrity, and version alignment.\n\nIt flags exceptions before publication — acting as the final quality gate before any asset goes live.',
    quickActions: ['Performance agent', 'What agents exist?', 'How does it work?'],
  },
  {
    id: 'agent-performance',
    topic: 'Performance Intelligence Agent',
    phrases: ['performance intelligence', 'performance agent', 'feedback loop', 'learning system'],
    keywords: ['performance', 'intelligence', 'feedback', 'loop', 'insights', 'fatigue', 'optimization', 'learning'],
    response:
      'The Performance Intelligence Agent closes the loop: it ingests channel performance data and variant metadata to generate insights, next-test suggestions, and fatigue alerts.\n\nThis turns creative production from a one-shot process into a learning system — each campaign informs the next.',
    quickActions: ['What is CGVIP?', 'Use cases', 'How to deploy?'],
  },
  {
    id: 'use-cases',
    topic: 'Use cases',
    phrases: ['use cases', 'what problems', 'what does it solve', 'who is it for'],
    keywords: ['use', 'case', 'problem', 'solve', 'benefit', 'help', 'who', 'enterprise'],
    response:
      'CGVIP addresses 7 key problems for regulated enterprises:\n\n• Variant explosion outstripping manual capacity\n• Manual legal bottlenecks slowing time-to-market\n• Inconsistent disclaimer application across markets\n• Poor test discipline and disconnected performance data\n• Fragmented asset traceability\n• High cost per asset\n• Low creative reuse\n\nThe cultural shift: Legal goes from reviewing files to encoding rules. Regions select controlled variants instead of requesting edits. Designers engineer templates instead of manually adjusting layouts.',
    quickActions: ['KPI targets', 'How does it work?', 'Contact team'],
    link: { label: 'See use cases', href: '/use-cases' },
  },
  {
    id: 'kpis',
    topic: 'KPIs',
    phrases: ['kpi', 'key performance', 'metrics', 'success metrics', 'what results'],
    keywords: ['kpi', 'metric', 'result', 'reduction', 'improvement', 'performance', 'measure', 'target'],
    response:
      'CGVIP targets these KPIs:\n\n• 40% reduction in approval cycle time\n• 50% reduction in manual compliance review\n• 30% lower cost per asset\n• Zero compliance violations in automated runs\n• 80% of campaign variants generated through the system\n• Increased structured A/B test volume\n\nThese are measurable from Phase 0 baselines through pilot and rollout.',
    quickActions: ['How to deploy?', 'Use cases', 'Contact team'],
  },
  {
    id: 'deployment',
    topic: 'Deployment phases',
    phrases: ['how to deploy', 'deployment plan', 'implementation plan', 'project phases', 'timeline'],
    keywords: ['deploy', 'phase', 'implementation', 'timeline', 'rollout', 'pilot', 'project', 'plan', 'board'],
    response:
      'CGVIP deploys in 7 phases:\n\n• Phase 0: Executive alignment (4–6 weeks) — Business case, governance charter, RACI, KPI baselines\n• Phase 1: Diagnostic & template audit (8 weeks) — Asset landscape, classification, variation mapping\n• Phase 2: System architecture & data (8–10 weeks) — Variant schema, claim library, legal rule encoding\n• Phase 3: Template engineering (~12 weeks) — InDesign, Photoshop, After Effects template systems\n• Phase 4: Compliance gating (~8 weeks) — Two-layer approval, audit trail\n• Phase 5: DAM & workflow (~8 weeks) — DAM integration, publish pipeline\n• Phase 6: Pilot & rollout (~12 weeks) — Pilot markets, metrics, global waves\n\nYou can track progress on our project board.',
    quickActions: ['What is CGVIP?', 'Use cases', 'Contact team'],
    link: { label: 'View project board', href: '/project-board' },
  },
  {
    id: 'adobe-integration',
    topic: 'Adobe integration',
    phrases: ['adobe integration', 'works with adobe', 'indesign photoshop after effects'],
    keywords: ['adobe', 'indesign', 'photoshop', 'after effects', 'creative cloud', 'extendscript', 'integrate'],
    response:
      'CGVIP orchestrates Adobe — it doesn\'t replace it. It works with:\n\n• InDesign — Template merge, locked disclaimers, preflight validation\n• Photoshop — Smart Object automation, JSON-driven export\n• After Effects — Modular templates (HOOK / PRODUCT / LEGAL / END CARD), render queue\n\nExecution pipelines use ExtendScript to drive Adobe apps. Designers continue working in their familiar tools — CGVIP adds the governance, compliance, and orchestration layer on top.',
    quickActions: ['What agents exist?', 'How does it work?', 'Template agent'],
  },
  {
    id: 'human-in-the-loop',
    topic: 'Human-in-the-loop',
    phrases: ['human in the loop', 'human oversight', 'who approves', 'ai proposes humans authorize'],
    keywords: ['human', 'loop', 'approve', 'authorize', 'oversight', 'control', 'decision', 'review', 'authority'],
    response:
      'AI proposes. Humans authorize. Every agent has a defined mandate and explainable reasoning trail.\n\nKey ownership:\n• Campaign modeling → Marketing Lead\n• Compliance rules → Legal Architect\n• Template design → Creative Systems Lead\n• Final approval override → Compliance Officer\n\nNo autonomous decision-making on compliance or brand-critical matters. The system provides recommendations with full transparency — humans make the final call.',
    quickActions: ['Compliance agent', 'How does it work?', 'What is CGVIP?'],
  },
  {
    id: 'getting-started',
    topic: 'Getting started',
    phrases: ['get started', 'how to start', 'how do i begin', 'next steps', 'how to use'],
    keywords: ['start', 'begin', 'setup', 'onboard', 'implement', 'first', 'next'],
    response:
      'To get started with CGVIP:\n\n1. Explore the Product page to understand the 7-agent architecture\n2. Review Use Cases to see the problems it solves and target KPIs\n3. Check the Project Board for the 7-phase deployment plan\n4. Browse Resources for documentation\n5. Contact the team to discuss your specific pipeline and compliance needs\n\nPhase 0 (Executive Alignment) is the natural starting point — establishing the business case, governance charter, and KPI baselines.',
    quickActions: ['What is CGVIP?', 'How to deploy?', 'Contact team'],
    link: { label: 'Contact us', href: '/contact' },
  },
  {
    id: 'contact',
    topic: 'Contact',
    phrases: ['contact', 'get in touch', 'email', 'reach out', 'talk to someone'],
    keywords: ['contact', 'email', 'reach', 'touch', 'talk', 'demo', 'meeting', 'call', 'inquiry'],
    response:
      'You can reach the CGVIP team for enterprise inquiries — to discuss your pipeline, compliance requirements, and Adobe/DAM integration.\n\nVisit the Contact page to send an email or schedule a conversation.',
    quickActions: ['What is CGVIP?', 'How to deploy?', 'Use cases'],
    link: { label: 'Go to Contact', href: '/contact' },
  },
  {
    id: 'resources',
    topic: 'Resources & documentation',
    phrases: ['resources', 'documentation', 'docs', 'learn more', 'read more'],
    keywords: ['resource', 'documentation', 'docs', 'learn', 'read', 'guide', 'reference', 'material'],
    response:
      'Visit the Resources page for documentation and reference materials about CGVIP, including architecture guides, deployment plans, and compliance frameworks.',
    quickActions: ['What is CGVIP?', 'How does it work?', 'Contact team'],
    link: { label: 'Browse resources', href: '/resources' },
  },
  {
    id: 'pillars',
    topic: 'Four pillars',
    phrases: ['four pillars', 'positioning pillars', 'what kind of platform'],
    keywords: ['pillar', 'defense', 'industrialization', 'experimentation', 'brand governance'],
    response:
      'CGVIP is not a design tool — it\'s an enterprise platform built on 4 pillars:\n\n1. Compliance defense — Encode and validate regulatory rules; reduce file-by-file legal review\n2. Creative industrialization — Scale variants with governed templates and datasets\n3. Structured experimentation — A/B tests with hypothesis tracking and performance feedback\n4. Global brand governance — Market-level control, audit trail, and human-in-the-loop approval\n\nFor regulated enterprises, it reduces regulatory exposure while increasing operational velocity.',
    quickActions: ['How does it work?', 'Use cases', 'What agents exist?'],
  },
  {
    id: 'greeting',
    topic: 'Greeting',
    phrases: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'],
    keywords: ['hello', 'hi', 'hey', 'morning', 'afternoon', 'evening', 'howdy', 'greetings'],
    response:
      'Hello! I\'m the CGVIP Assistant. I can help you understand our platform — from the 7-agent architecture and compliance features to deployment phases and use cases.\n\nWhat would you like to know?',
    quickActions: ['What is CGVIP?', 'How does it work?', 'Use cases'],
  },
  {
    id: 'thanks',
    topic: 'Thanks',
    phrases: ['thank you', 'thanks', 'thx', 'appreciate it', 'cheers'],
    keywords: ['thank', 'thanks', 'thx', 'appreciate', 'cheers', 'helpful'],
    response:
      'You\'re welcome! If you have more questions about CGVIP, feel free to ask. You can also explore the site or get in touch with the team directly.',
    quickActions: ['What is CGVIP?', 'Contact team', 'How to deploy?'],
  },
]

export const fallbackResponse: Pick<KnowledgeEntry, 'response' | 'quickActions'> = {
  response:
    'I\'m not sure I understood that. I can help with questions about CGVIP — what it is, how it works, the 7-agent architecture, compliance features, use cases, deployment phases, and more.\n\nTry one of the suggestions below, or rephrase your question!',
  quickActions: ['What is CGVIP?', 'How does it work?', 'What agents exist?', 'Use cases'],
}

export const welcomeMessage: Pick<KnowledgeEntry, 'response' | 'quickActions'> = {
  response:
    'Welcome! I\'m the CGVIP Assistant — here to help you navigate the Creative Governance & Variant Intelligence Platform.\n\nI can answer questions about our 7-agent architecture, compliance features, deployment phases, use cases, and more. What would you like to know?',
  quickActions: ['What is CGVIP?', 'How does it work?', 'What agents exist?', 'Use cases', 'How to deploy?', 'Contact team'],
}
