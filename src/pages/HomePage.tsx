import {
  ArrowRight,
  Box,
  Cpu,
  CreditCard,
  Layers,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { HeroSection } from '../components/HeroSection';
import { DELIVERY_PROCESS } from '../data/eskData';
import type { AppRoute } from '../types/navigation';

interface HomePageProps {
  onNavigate: (route: AppRoute) => void;
  selectedServiceCount: number;
}

const WORKSPACE_MODULES: {
  route: AppRoute;
  code: string;
  title: string;
  description: string;
  action: string;
  icon: typeof Layers;
}[] = [
  {
    route: '/services',
    code: '01',
    title: 'Services Catalog & USD Scope Estimator',
    description:
      'Browse all 8 ESK engineering services from $10 hardware diagnostics to $500+ custom enterprise applications.',
    action: 'Configure Scope',
    icon: Layers,
  },
  {
    route: '/fintech',
    code: '02',
    title: 'Fintech Rails & Client Case Outcomes',
    description:
      'Inspect Paynow, EcoCash, OneMoney, and Stripe architectures alongside AgriTech, ZimFoods, and PharmaZ results.',
    action: 'Inspect Payment Rails',
    icon: CreditCard,
  },
  {
    route: '/map',
    code: '03',
    title: 'Zimbabwe Field Coverage & Dispatch Map',
    description:
      'Interactive Google Maps branch locator across Harare, Bulawayo, Mutare, and Gweru with Places search and route ETAs.',
    action: 'Open Coverage Map',
    icon: MapPin,
  },
  {
    route: '/3d',
    code: '04',
    title: 'Interactive 3D Core Rack Inspector',
    description:
      'Explore a physically lit Three.js 42U server & fibre cabinet with exploded hardware layers and optical patching.',
    action: 'Launch 3D Viewport',
    icon: Box,
  },
  {
    route: '/ai',
    code: '05',
    title: 'ESK Gemini AI & Media Engineering Lab',
    description:
      'Consult the multi-turn engineering chatbot, run grounded web searches, transcribe audio, and generate video or music.',
    action: 'Open AI Studio',
    icon: Cpu,
  },
  {
    route: '/portal',
    code: '06',
    title: 'Client Workspace, Quotes & SLA Dispatch',
    description:
      'Sign in with Google to save project quotes, log support dispatch tickets, and archive AI briefs in Firestore.',
    action: 'Enter Client Portal',
    icon: ShieldCheck,
  },
];

export function HomePage({ onNavigate, selectedServiceCount }: HomePageProps) {
  return (
    <div>
      <HeroSection
        onScheduleConsultation={() => onNavigate('/portal')}
        onExploreServices={() => onNavigate('/services')}
      />

      {/* Dedicated Workspace Directory (Cleanly links to each standalone page) */}
      <section className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-sky-700 mb-2">
                Modular Engineering Platform
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3"
                style={{ textWrap: 'balance' }}
              >
                Six Focused Workspaces for Infrastructure, Software, and Operations
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Every capability operates on its own dedicated page—move directly between service
                scoping, geospatial dispatch, 3D hardware modeling, AI tooling, and authenticated
                ticket management.
              </p>
            </div>

            {selectedServiceCount > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('/portal')}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-800 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-lg transition-colors self-start cursor-pointer"
              >
                <span>Resume Quote ({selectedServiceCount} selected)</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORKSPACE_MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <article
                  key={mod.route}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-6 flex flex-col justify-between transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums">
                        {mod.code}
                      </span>
                      <Icon className="w-5 h-5 text-sky-700" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
                      {mod.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6">
                      {mod.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate(mod.route)}
                    className="inline-flex items-center justify-between w-full px-4 py-2.5 text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-sky-700 hover:text-white border border-slate-200 hover:border-sky-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>{mod.action}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Delivery Lifecycle Band */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold text-sky-700 mb-1">Delivery Standard</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                How ESK Systems Delivers Every Engagement
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/services')}
              className="text-sm font-semibold text-sky-700 hover:text-sky-800 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Full Service Catalog</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DELIVERY_PROCESS.map((stage) => (
              <div
                key={stage.step}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5"
              >
                <div className="font-mono text-xs font-semibold text-sky-700 mb-2 tabular-nums">
                  Step {stage.step}
                </div>
                <h3 className="font-display text-base font-bold text-slate-900 mb-2">
                  {stage.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{stage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
