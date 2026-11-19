import { ArrowRight } from 'lucide-react';
import { ServicesEstimatorSection } from '../components/ServicesEstimatorSection';
import type { AppRoute } from '../types/navigation';

interface ServicesPageProps {
  selectedIds: string[];
  onToggleService: (id: string) => void;
  onClearServices: () => void;
  onProceedToQuote: () => void;
  onNavigate: (route: AppRoute) => void;
}

export function ServicesPage({
  selectedIds,
  onToggleService,
  onClearServices,
  onProceedToQuote,
  onNavigate,
}: ServicesPageProps) {
  return (
    <div>
      <section className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-sky-700 mb-1.5">
              ESK Computer Systems · Harare Engineering Practice
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              IT Services Catalog &amp; Scope Estimator
            </h1>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/3d')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors self-start cursor-pointer"
          >
            <span>Inspect 3D Rack Hardware</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </section>

      <ServicesEstimatorSection
        selectedIds={selectedIds}
        onToggleService={onToggleService}
        onClearServices={onClearServices}
        onProceedToQuote={onProceedToQuote}
      />
    </div>
  );
}
