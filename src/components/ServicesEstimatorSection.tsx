import { useState } from 'react';
import { Check, Plus, Trash2, ArrowRight } from 'lucide-react';
import { SERVICES, type ServiceCategory, type ServiceItem } from '../data/eskData';
import { ResilientImage } from './ResilientImage';

interface ServicesEstimatorSectionProps {
  selectedIds: string[];
  onToggleService: (id: string) => void;
  onClearServices: () => void;
  onProceedToQuote: () => void;
}

const FILTER_TABS: { id: ServiceCategory; label: string }[] = [
  { id: 'all', label: 'All Services (8)' },
  { id: 'software', label: 'Software & Automation' },
  { id: 'infrastructure', label: 'Network & Hardware' },
  { id: 'advisory', label: 'Branding & Strategy' },
];

export function ServicesEstimatorSection({
  selectedIds,
  onToggleService,
  onClearServices,
  onProceedToQuote,
}: ServicesEstimatorSectionProps) {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('all');

  const filteredServices =
    activeCategory === 'all'
      ? SERVICES
      : SERVICES.filter((service) => service.category === activeCategory);

  const selectedServices: ServiceItem[] = SERVICES.filter((s) => selectedIds.includes(s.id));
  const baselineTotal = selectedServices.reduce((acc, s) => acc + s.startingPrice, 0);

  return (
    <section id="services" className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header & Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-sky-700 mb-2">
              Service Catalog &amp; Scope Estimator
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3"
              style={{ textWrap: 'balance' }}
            >
              Eight Core IT Services Engineered for Commercial Reliability
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Select individual services below to build a transparent project scope and baseline USD
              estimate before requesting your tailored Harare or remote consultation.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter services by practice area"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-200/80 rounded-lg self-start lg:self-auto"
          >
            {FILTER_TABS.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Asymmetric Grid: Featured Visual Context + Service Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
            <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden">
              <ResilientImage
                src="/src/assets/images/software_workstation_1795087094488.jpg"
                alt="Software engineering workstation running enterprise analytics and code"
                className="w-full h-full object-cover"
                fallbackLabel="ESK Custom Software & Automation Practice"
              />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">
                  Harare Engineering &amp; Hardware Lab · Transparent USD Pricing
                </p>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                  From $10 PC Diagnostics to Custom Multi-Branch Systems
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every engagement begins with clear deliverables, fixed starting benchmarks, and
                  direct engineering accountability. Combine hardware maintenance, network support,
                  and software delivery under one roof.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Typical Diagnostics Turnaround</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  24 – 48 Hours
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredServices.slice(0, 4).map((service) => {
              const isSelected = selectedIds.includes(service.id);
              return (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isSelected={isSelected}
                  onToggle={() => onToggleService(service.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Remaining Filtered Services */}
        {filteredServices.length > 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {filteredServices.slice(4).map((service) => {
              const isSelected = selectedIds.includes(service.id);
              return (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isSelected={isSelected}
                  onToggle={() => onToggleService(service.id)}
                />
              );
            })}
          </div>
        )}

        {/* Interactive Scope Estimate Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500">
              Interactive Scope Builder ·{' '}
              <span className="tabular-nums">
                {selectedServices.length} {selectedServices.length === 1 ? 'service' : 'services'}{' '}
                selected
              </span>
            </div>
            {selectedServices.length > 0 ? (
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-display text-lg font-bold text-slate-900">
                  Estimated Baseline:{' '}
                  <span className="font-mono text-sky-700 tabular-nums">
                    ${baselineTotal.toLocaleString()} USD
                  </span>
                </span>
                <span className="text-xs text-slate-500">
                  ({selectedServices.map((s) => s.title).join(', ')})
                </span>
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-700">
                Click &ldquo;Add to Scope&rdquo; on any service card above to assemble a project
                estimate.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
            {selectedServices.length > 0 && (
              <button
                type="button"
                onClick={onClearServices}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[40px]"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={onProceedToQuote}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
            >
              <span>
                {selectedServices.length > 0
                  ? 'Continue with Selected Scope'
                  : 'Request Custom Quote'}
              </span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ServiceCardProps {
  service: ServiceItem;
  isSelected: boolean;
  onToggle: () => void;
}

function ServiceCard({ service, isSelected, onToggle }: ServiceCardProps) {
  return (
    <article
      className={`bg-white rounded-xl p-6 flex flex-col justify-between transition-colors ${
        isSelected
          ? 'border border-sky-600 ring-1 ring-sky-600/20'
          : 'border border-slate-200 hover:border-slate-300'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-3">
          <span>
            {service.categoryLabel} · {service.turnaround}
          </span>
          <span className="font-mono font-semibold text-slate-900 tabular-nums">
            {service.priceNote}
          </span>
        </div>

        <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
          {service.index}. {service.title}
        </h3>

        <p className="text-sm text-slate-600 leading-relaxed mb-4">{service.summary}</p>

        <ul className="space-y-1.5 mb-6">
          {service.deliverables.map((item) => (
            <li key={item} className="text-xs text-slate-600 flex items-start gap-2">
              <span className="text-sky-700 font-semibold mt-px" aria-hidden="true">
                —
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={isSelected}
        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
          isSelected
            ? 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
            : 'bg-slate-900 text-white hover:bg-slate-800'
        }`}
      >
        {isSelected ? (
          <>
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>Added to Scope</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add to Scope</span>
          </>
        )}
      </button>
    </article>
  );
}
