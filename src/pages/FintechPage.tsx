import { FintechHubSection } from '../components/FintechHubSection';

interface FintechPageProps {
  onRequestFintechConsult: (railName: string) => void;
}

export function FintechPage({ onRequestFintechConsult }: FintechPageProps) {
  return (
    <div>
      <section className="bg-slate-950 text-white py-10 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-sky-400 mb-1.5">
            Zimbabwe &amp; Cross-Border Payment Architecture
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Fintech Payment Rails &amp; Client Outcomes
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl">
            Production Paynow, EcoCash, OneMoney, and Stripe gateway orchestration backed by
            PCI-DSS SAQ-A hardening and verified client case outcomes.
          </p>
        </div>
      </section>

      <FintechHubSection onRequestFintechConsult={onRequestFintechConsult} />
    </div>
  );
}
