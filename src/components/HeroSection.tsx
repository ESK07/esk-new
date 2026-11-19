import { ArrowRight } from 'lucide-react';
import { COMPANY_INFO } from '../data/eskData';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  onScheduleConsultation: () => void;
  onExploreServices: () => void;
}

const HERO_METRICS = [
  {
    value: '99.99%',
    label: 'Enterprise SLA Uptime',
    detail: 'Backed by service-credit guarantees',
  },
  {
    value: '14 ms',
    label: 'Harare Core Latency',
    detail: 'Fibre & multi-WAN routing',
  },
  {
    value: '8 Areas',
    label: 'Full-Stack IT Practice',
    detail: 'Software, hardware, networking & fintech',
  },
  {
    value: '$10',
    label: 'Hardware Diagnostics',
    detail: 'Transparent starting assessment rate',
  },
];

export function HeroSection({ onScheduleConsultation, onExploreServices }: HeroSectionProps) {
  return (
    <section id="top" className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
        {/* 2-Column Split with items-stretch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center py-2">
            <p className="text-sm font-medium text-slate-600 mb-4">
              {COMPANY_INFO.regionNote}
            </p>

            <h1
              className="font-display font-bold tracking-tight text-slate-900 leading-[1.08] mb-5 max-w-xl"
              style={{
                fontSize: 'clamp(2.25rem, 3.8vw, 3.5rem)',
                textWrap: 'balance',
              }}
            >
              Enterprise IT, Connectivity, and Payment Systems Built for Zimbabwe
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mb-8">
              {COMPANY_INFO.brand} engineers custom business software, resilient fibre and wireless
              networks, Paynow and EcoCash payment infrastructure, and responsive workstation repair
              from our operations desk in Harare.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onScheduleConsultation}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 min-h-[44px]"
              >
                <span>Schedule Consultation</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onExploreServices}
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 bg-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 min-h-[44px]"
              >
                Explore 8 Services
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex">
            <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative min-h-[280px] lg:min-h-[400px]">
              <ResilientImage
                src="/src/assets/images/hero_enterprise_datacenter_1795087095752.jpg"
                alt="ESK Systems network operations center and enterprise server infrastructure"
                className="w-full h-full lg:h-full object-cover"
                fallbackLabel="ESK Systems Enterprise Infrastructure — Harare, Zimbabwe"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-transparent p-6">
                <p className="text-sm font-medium text-white">
                  Harare Network Operations &amp; Software Engineering
                </p>
                <p className="text-xs text-slate-200 mt-1">
                  Custom web platforms · Fibre &amp; BGP failover · EcoCash, OneMoney &amp; Stripe rails
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column KPI Strip directly below hero split */}
        <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {HERO_METRICS.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-slate-900 tabular-nums tracking-tight">
                {metric.value}
              </div>
              <div className="text-sm font-semibold text-slate-800">{metric.label}</div>
              <div className="text-xs text-slate-500">{metric.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
