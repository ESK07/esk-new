import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  CASE_OUTCOMES,
  FINTECH_CAPABILITIES,
  PAYMENT_RAILS,
  type PaymentRail,
} from '../data/eskData';
import { ResilientImage } from './ResilientImage';

interface FintechHubSectionProps {
  onRequestFintechConsult: (railName: string) => void;
}

export function FintechHubSection({ onRequestFintechConsult }: FintechHubSectionProps) {
  const [selectedRailId, setSelectedRailId] = useState<PaymentRail['id']>('paynow');
  const activeRail = PAYMENT_RAILS.find((r) => r.id === selectedRailId) ?? PAYMENT_RAILS[0];

  return (
    <section id="fintech" className="py-16 lg:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <p className="text-sm font-semibold text-sky-700 mb-2">
            Fintech &amp; Payment Integration
          </p>
          <h2
            className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3"
            style={{ textWrap: 'balance' }}
          >
            Production Payment Infrastructure for Zimbabwe and Cross-Border Commerce
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            ESK Systems engineers audited payment gateways uniting local mobile money wallets,
            Zimswitch card rails, and international Stripe checkout with automated reconciliation.
          </p>
        </div>

        {/* Interactive Payment Rail Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-14">
          <div className="lg:col-span-5 flex flex-col bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
            <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden">
              <ResilientImage
                src="/src/assets/images/fintech_payment_terminal_1795087094576.jpg"
                alt="Contactless POS terminal and mobile payment receipt on stone surface"
                className="w-full h-full object-cover"
                fallbackLabel="ESK Fintech Payment Terminal & Mobile Money Integration"
              />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
                  Dual-Currency USD &amp; ZiG Settlement
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Built for Zimbabwean retail, agribusiness, logistics, and SaaS billing with
                  idempotent webhook processing and zero manual spreadsheet matching.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                    4 Rails
                  </div>
                  <div className="text-xs text-slate-500">Paynow, EcoCash, OneMoney, Stripe</div>
                </div>
                <div>
                  <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                    PCI SAQ-A
                  </div>
                  <div className="text-xs text-slate-500">Tokenized card security</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Segmented Rail Selector */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div
                  role="tablist"
                  aria-label="Select payment rail specification"
                  className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-200/80 rounded-lg"
                >
                  {PAYMENT_RAILS.map((rail) => {
                    const isActive = rail.id === selectedRailId;
                    return (
                      <button
                        key={rail.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setSelectedRailId(rail.id)}
                        className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                          isActive
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {rail.name}
                      </button>
                    );
                  })}
                </div>

                <span className="text-xs font-medium text-slate-500">
                  {activeRail.region} · Target Availability{' '}
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {activeRail.uptime}
                  </span>
                </span>
              </div>

              {/* Active Rail Detail */}
              <div className="pt-6 space-y-5">
                <div>
                  <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">
                    {activeRail.name} Integration Architecture
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {activeRail.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-slate-200">
                  <div>
                    <div className="text-xs text-slate-500">Supported Currencies</div>
                    <div className="font-mono text-sm font-semibold text-slate-900 mt-0.5">
                      {activeRail.currencies.join(' / ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Settlement Cycle</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">
                      {activeRail.settlement}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Transport Protocol</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">
                      {activeRail.protocol}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 mb-2.5">
                      Primary Commercial Use Cases
                    </h4>
                    <ul className="space-y-2">
                      {activeRail.useCases.map((uc) => (
                        <li key={uc} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-sky-700 font-semibold" aria-hidden="true">
                            —
                          </span>
                          <span>{uc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
                    <div className="font-mono text-xs text-sky-300 mb-2">
                      {activeRail.sampleEndpoint}
                    </div>
                    <pre className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre">
                      {activeRail.samplePayload}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Includes sandbox validation, webhook signing, and live reconciliation testing.
              </span>
              <button
                type="button"
                onClick={() => onRequestFintechConsult(activeRail.name)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
              >
                <span>Integrate {activeRail.name}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* 6 Fintech Engineering Capabilities */}
        <div className="mb-14">
          <h3 className="font-display text-xl font-bold text-slate-900 mb-6">
            Financial Systems Engineering Capabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FINTECH_CAPABILITIES.map((cap) => (
              <div
                key={cap.index}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-2">
                    {cap.spec}
                  </div>
                  <h4 className="font-display text-base font-bold text-slate-900 mb-2">
                    {cap.index}. {cap.title}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{cap.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Claim-to-Proof Adjacent Client Outcomes */}
        <div className="pt-10 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold text-sky-700 mb-1">Verified Delivery</p>
              <h3 className="font-display text-2xl font-bold text-slate-900">
                Measured Outcomes Across Zimbabwean Enterprises
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Harare &amp; Bulawayo commercial deployments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CASE_OUTCOMES.map((item) => (
              <div
                key={item.client}
                className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-2">
                    {item.sector} · {item.location}
                  </div>
                  <div className="font-display text-lg font-bold text-slate-900 mb-1">
                    {item.client}
                  </div>
                  <div className="font-mono text-sm font-semibold text-sky-700 mb-3 tabular-nums">
                    {item.metric}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
