export type ServiceCategory = 'all' | 'software' | 'infrastructure' | 'advisory';

export interface ServiceItem {
  id: string;
  index: string;
  title: string;
  category: Exclude<ServiceCategory, 'all'>;
  categoryLabel: string;
  startingPrice: number;
  priceNote: string;
  turnaround: string;
  summary: string;
  deliverables: string[];
  featured?: boolean;
}

export interface PaymentRail {
  id: 'paynow' | 'ecocash' | 'onemoney' | 'stripe';
  name: string;
  region: string;
  currencies: string[];
  settlement: string;
  protocol: string;
  uptime: string;
  summary: string;
  useCases: string[];
  sampleEndpoint: string;
  samplePayload: string;
}

export interface FintechCapability {
  index: string;
  title: string;
  description: string;
  spec: string;
}

export interface SlaTier {
  id: 'basic' | 'business' | 'enterprise';
  name: string;
  uptime: string;
  responseTime: string;
  resolutionTarget: string;
  monthlyUsd: number;
  annualUsd: number;
  supportWindow: string;
  features: string[];
  recommended?: boolean;
}

export interface CaseOutcome {
  client: string;
  sector: string;
  location: string;
  metric: string;
  summary: string;
}

export interface SupportTicket {
  id: string;
  client: string;
  subject: string;
  category: string;
  status: 'Resolved' | 'In Progress' | 'Scheduled';
  updatedAt: string;
  engineer: string;
}

export const COMPANY_INFO = {
  brand: 'ESK Systems',
  legalName: 'ESK Computer Systems',
  domain: 'eskcomputersystems.co.zw',
  city: 'Harare, Zimbabwe',
  regionNote: 'Harare Headquarters · Nationwide & Cross-Border Remote',
  phoneDisplay: '+263 715 866 071',
  phoneHref: 'tel:+263715866071',
  email: 'eskdivine@gmail.com',
  emailHref: 'mailto:eskdivine@gmail.com',
  hours: 'Mon – Fri: 08:00 – 17:30 CAT · 24/7 SLA On-Call',
  linkedin: 'https://www.linkedin.com/in/ephraim-s-kunaka-0b2610213/',
  github: 'https://github.com/ESK007',
};

export const SERVICES: ServiceItem[] = [
  {
    id: 'web-apps',
    index: '01',
    title: 'Web Applications & Custom Systems',
    category: 'software',
    categoryLabel: 'Software Engineering',
    startingPrice: 500,
    priceNote: 'Starting from $500',
    turnaround: '3–8 weeks',
    summary:
      'Bespoke internal portals, inventory platforms, and cloud-backed web software engineered to match your operational workflows.',
    deliverables: [
      'Custom business applications & client portals',
      'Relational database design and migration',
      'REST & GraphQL API development',
      'Cloud deployment & third-party integrations',
    ],
    featured: true,
  },
  {
    id: 'website-dev',
    index: '02',
    title: 'Website Design & Development',
    category: 'software',
    categoryLabel: 'Web Engineering',
    startingPrice: 250,
    priceNote: 'Starting from $250',
    turnaround: '1–3 weeks',
    summary:
      'Fast, responsive corporate websites engineered with modern frameworks, technical SEO, and measurable lead conversion.',
    deliverables: [
      'Responsive UI architecture across desktop and mobile',
      'Search engine optimization & structured metadata',
      'Performance optimization for regional bandwidth',
      'Content management & editorial handoff',
    ],
  },
  {
    id: 'business-automation',
    index: '03',
    title: 'Business Systems & Automation',
    category: 'software',
    categoryLabel: 'Workflow Automation',
    startingPrice: 300,
    priceNote: 'Starting from $300',
    turnaround: '2–5 weeks',
    summary:
      'Eliminate manual spreadsheet reconciliation with automated invoicing, approval pipelines, and real-time operational reporting.',
    deliverables: [
      'End-to-end workflow automation',
      'ERP, accounting & CRM synchronization',
      'Structured data pipelines & validation',
      'Executive reporting and audit dashboards',
    ],
    featured: true,
  },
  {
    id: 'network-support',
    index: '04',
    title: 'Network & IT Support',
    category: 'infrastructure',
    categoryLabel: 'Connectivity & Ops',
    startingPrice: 50,
    priceNote: 'Starting from $50',
    turnaround: 'Same-day dispatch',
    summary:
      'Fibre, wireless, and multi-WAN failover networking with proactive firewall security and dependable ongoing IT support.',
    deliverables: [
      'LAN, VLAN, and enterprise Wi-Fi configuration',
      'Fibre & hybrid ISP failover routing',
      'Firewall, VPN & endpoint security hardening',
      'Remote troubleshooting & 24/7 SLA coverage',
    ],
  },
  {
    id: 'computer-repair',
    index: '05',
    title: 'Computer Repair & Maintenance',
    category: 'infrastructure',
    categoryLabel: 'Hardware Lab',
    startingPrice: 10,
    priceNote: 'Diagnostics from $10',
    turnaround: '24–48 hours',
    summary:
      'Component-level workstation and server diagnostics, SSD/memory upgrades, thermal servicing, and structured data recovery.',
    deliverables: [
      'Comprehensive hardware fault diagnostics',
      'Laptop, desktop & workstation repair',
      'NVMe SSD & RAM performance upgrades',
      'Data recovery & preventive fleet servicing',
    ],
  },
  {
    id: 'software-support',
    index: '06',
    title: 'Software Installation & Troubleshooting',
    category: 'infrastructure',
    categoryLabel: 'Systems Support',
    startingPrice: 25,
    priceNote: 'Starting from $25',
    turnaround: 'Same-day',
    summary:
      'Clean operating system provisioning, licensed enterprise software rollouts, driver stability, and patch management.',
    deliverables: [
      'Windows, macOS & Linux workstation setup',
      'Enterprise productivity & accounting suites',
      'Dependency & registry fault resolution',
      'Security patch & backup verification',
    ],
  },
  {
    id: 'branding-digital',
    index: '07',
    title: 'Branding & Digital Solutions',
    category: 'advisory',
    categoryLabel: 'Brand & Identity',
    startingPrice: 100,
    priceNote: 'Starting from $100',
    turnaround: '1–2 weeks',
    summary:
      'Cohesive corporate identity systems, technical proposals, print collateral, and digital assets built for commercial credibility.',
    deliverables: [
      'Logo marks & typography systems',
      'Corporate stationery & print templates',
      'Campaign graphics & pitch decks',
      'Digital brand guidelines',
    ],
  },
  {
    id: 'digital-transformation',
    index: '08',
    title: 'Digital Transformation Advisory',
    category: 'advisory',
    categoryLabel: 'IT Strategy',
    startingPrice: 75,
    priceNote: 'Consultation from $75',
    turnaround: '1 week roadmap',
    summary:
      'Practical technology audits, cloud migration planning, vendor selection, and staff enablement tailored to Zimbabwean enterprises.',
    deliverables: [
      'Infrastructure & cost-efficiency audit',
      'Phased modernization roadmap',
      'Change management & team training',
      'Technical documentation & SOPs',
    ],
  },
];

export const PAYMENT_RAILS: PaymentRail[] = [
  {
    id: 'paynow',
    name: 'Paynow',
    region: 'Zimbabwe Nationwide',
    currencies: ['USD', 'ZiG'],
    settlement: 'T+1 Business Day',
    protocol: 'Signed Hash REST Webhook',
    uptime: '99.94%',
    summary:
      'Unified Zimbabwean checkout orchestration connecting Visa/Mastercard, Zimswitch, and mobile wallets through audited server-side callbacks.',
    useCases: [
      'E-commerce checkout & recurring invoice links',
      'Automated student fee & utility billing portals',
      'Instant polling & cryptographic hash verification',
    ],
    sampleEndpoint: 'POST /api/payments/paynow/initiate',
    samplePayload: `{
  "reference": "INV-2026-0842",
  "currency": "USD",
  "amount": 245.00,
  "channel": "paynow_express",
  "webhookVerified": true
}`,
  },
  {
    id: 'ecocash',
    name: 'EcoCash',
    region: 'Zimbabwe Mobile Money',
    currencies: ['USD', 'ZiG'],
    settlement: 'Instant Merchant Wallet',
    protocol: 'USSD Push & Merchant API',
    uptime: '99.91%',
    summary:
      'Direct mobile wallet collection with automated USSD prompt triggers, duplicate-payment guards, and real-time ledger reconciliation.',
    useCases: [
      'Retail POS & delivery-on-payment confirmation',
      'Micro-subscription and field agent collections',
      'Automated SMS receipt & ERP posting',
    ],
    sampleEndpoint: 'POST /api/payments/ecocash/ussd-push',
    samplePayload: `{
  "msisdn": "+26377XXXXXXX",
  "merchantCode": "ESK-MERCH-01",
  "currency": "USD",
  "amount": 85.00,
  "idempotencyKey": "ec_98341a0f"
}`,
  },
  {
    id: 'onemoney',
    name: 'OneMoney',
    region: 'Zimbabwe Mobile Money',
    currencies: ['USD', 'ZiG'],
    settlement: 'Same-Day Clearing',
    protocol: 'Merchant Gateway REST',
    uptime: '99.89%',
    summary:
      'Resilient NetOne OneMoney acceptance engineered with idempotent retry queues so intermittent mobile networks never create double charges.',
    useCases: [
      'Multi-wallet checkout fallback beside EcoCash',
      'Bulk disbursement & supplier settlement',
      'Unified multi-wallet treasury reporting',
    ],
    sampleEndpoint: 'POST /api/payments/onemoney/charge',
    samplePayload: `{
  "walletNumber": "0715866071",
  "reference": "OM-44021",
  "currency": "ZiG",
  "status": "CONFIRMED",
  "reconciled": true
}`,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    region: 'Global & Cross-Border',
    currencies: ['USD', 'ZAR', 'EUR', 'GBP'],
    settlement: 'T+2 International Payout',
    protocol: 'PaymentIntents & Connect',
    uptime: '99.99%',
    summary:
      'International card acceptance, SaaS billing, and diaspora checkout architecture compliant with PCI-DSS SAQ-A and 3D Secure 2.',
    useCases: [
      'Diaspora remittances & international B2B billing',
      'Subscription SaaS seat management',
      'Multi-currency treasury & FX reporting',
    ],
    sampleEndpoint: 'POST /api/payments/stripe/intent',
    samplePayload: `{
  "paymentIntentId": "pi_3Qx8L2K9a",
  "currency": "usd",
  "amountCents": 50000,
  "threeDSecure": "authenticated",
  "payoutAccount": "ESK-TREASURY-USD"
}`,
  },
];

export const FINTECH_CAPABILITIES: FintechCapability[] = [
  {
    index: '01',
    title: 'Mobile Money Integration',
    description:
      'Production-hardened EcoCash, OneMoney, and Paynow integrations with idempotent transaction keys and instant USSD status polling.',
    spec: 'USD & ZiG Dual-Currency',
  },
  {
    index: '02',
    title: 'Cross-Border Payouts',
    description:
      'Multi-corridor settlement workflows linking international card gateways with regional treasury accounts and automated compliance logs.',
    spec: 'Stripe & Card Corridors',
  },
  {
    index: '03',
    title: 'PCI-DSS Hardening',
    description:
      'Zero raw card storage, tokenized checkout flows, TLS 1.3 enforcement, and strict webhook signature verification.',
    spec: 'SAQ-A Tokenized Architecture',
  },
  {
    index: '04',
    title: 'Treasury Dashboards',
    description:
      'Single-pane cashflow visibility consolidating EcoCash, bank transfers, and international card settlements with exportable CSV/PDF audits.',
    spec: 'Real-Time Settlement Feed',
  },
  {
    index: '05',
    title: 'Automated Reconciliation',
    description:
      'Scheduled ledger matching that flags discrepancies, retries failed callbacks, and closes daily books without manual spreadsheets.',
    spec: 'Zero-Gap Audit Trail',
  },
  {
    index: '06',
    title: 'Bespoke Payment APIs',
    description:
      'Clean internal payment microservices with rate limiting, role-based access control, and full OpenAPI documentation.',
    spec: '99.99% Target Availability',
  },
];

export const SLA_TIERS: SlaTier[] = [
  {
    id: 'basic',
    name: 'Basic Support',
    uptime: '99.9%',
    responseTime: '48-hour SLA',
    resolutionTarget: '3 business days',
    monthlyUsd: 75,
    annualUsd: 765,
    supportWindow: 'Business Hours (Mon–Fri)',
    features: [
      '48-hour initial response SLA',
      'Knowledge base & remote ticket portal',
      'Monthly infrastructure health report',
      '99.9% uptime commitment',
      'Quarterly software patch verification',
    ],
  },
  {
    id: 'business',
    name: 'Business Operations',
    uptime: '99.95%',
    responseTime: '4-hour SLA',
    resolutionTarget: 'Same business day',
    monthlyUsd: 240,
    annualUsd: 2448,
    supportWindow: 'Extended Hours (07:00 – 21:00 CAT)',
    recommended: true,
    features: [
      '4-hour response SLA via phone & email',
      'Dedicated account engineer',
      'Priority ticket queue & weekly status brief',
      '99.95% uptime commitment',
      'Quarterly technical business review',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Mission-Critical',
    uptime: '99.99%',
    responseTime: '15-min critical SLA',
    resolutionTarget: '4-hour emergency target',
    monthlyUsd: 650,
    annualUsd: 6630,
    supportWindow: '24/7/365 Phone, Email & On-Site',
    features: [
      '15-minute critical incident response SLA',
      'Named senior systems architect',
      'Custom escalation & multi-WAN failover checks',
      '99.99% uptime guarantee with service credits',
      'On-site Harare dispatch included',
    ],
  },
];

export const CASE_OUTCOMES: CaseOutcome[] = [
  {
    client: 'AgriTech Distribution',
    sector: 'Agribusiness',
    location: 'Harare',
    metric: '42% faster order-to-settlement cycle',
    summary:
      'Replaced manual WhatsApp order sheets with a custom web portal integrated directly with EcoCash and Paynow reconciliation.',
  },
  {
    client: 'ZimFoods Logistics',
    sector: 'Cold-Chain & FMCG',
    location: 'Harare & Bulawayo',
    metric: '99.96% branch uptime across 6 depots',
    summary:
      'Deployed dual-WAN fibre and wireless failover routing with centralized firewall policy management across regional warehouses.',
  },
  {
    client: 'PharmaZ Supply',
    sector: 'Healthcare Retail',
    location: 'Harare',
    metric: 'Zero unlogged stock discrepancies in 12 months',
    summary:
      'Engineered an inventory and POS synchronization layer backed by automated daily cloud backups and preventive workstation maintenance.',
  },
];

export const DELIVERY_PROCESS = [
  {
    step: '01',
    title: 'Consultation & Discovery',
    description:
      'We audit your current hardware, network topology, or software bottlenecks and define measurable commercial goals.',
  },
  {
    step: '02',
    title: 'Architecture & Planning',
    description:
      'You receive a transparent milestone roadmap, fixed-scope estimate, and security specification before any build begins.',
  },
  {
    step: '03',
    title: 'Engineering & Deployment',
    description:
      'Our team implements software, payment APIs, or structured cabling with staged testing and zero disruption to live operations.',
  },
  {
    step: '04',
    title: 'SLA Support & Maintenance',
    description:
      'Ongoing monitoring, preventive diagnostics, and rapid engineering response keep your infrastructure dependable year-round.',
  },
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'ESK-2041',
    client: 'ZimFoods Depot #3',
    subject: 'Dual-WAN fibre failover verification & VLAN segmentation',
    category: 'Network & IT Support',
    status: 'Resolved',
    updatedAt: 'Today, 09:40 CAT',
    engineer: 'E. Kunaka',
  },
  {
    id: 'ESK-2048',
    client: 'AgriTech Harare',
    subject: 'Paynow USD/ZiG webhook reconciliation ledger update',
    category: 'Fintech Infrastructure',
    status: 'In Progress',
    updatedAt: 'Today, 11:15 CAT',
    engineer: 'Systems Team',
  },
  {
    id: 'ESK-2053',
    client: 'PharmaZ Head Office',
    subject: 'Workstation NVMe upgrade & preventative thermal service (4 units)',
    category: 'Computer Repair & Maintenance',
    status: 'Scheduled',
    updatedAt: 'Tomorrow, 08:30 CAT',
    engineer: 'Hardware Lab',
  },
];
