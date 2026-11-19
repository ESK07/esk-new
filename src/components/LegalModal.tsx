import { X } from 'lucide-react';
import { COMPANY_INFO } from '../data/eskData';

export type LegalDocType = 'sla' | 'terms' | null;

interface LegalModalProps {
  docType: LegalDocType;
  onClose: () => void;
}

export function LegalModal({ docType, onClose }: LegalModalProps) {
  if (!docType) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">
              {COMPANY_INFO.legalName} · {COMPANY_INFO.city}
            </p>
            <h2 id="legal-modal-title" className="font-display text-2xl font-bold text-slate-900">
              {docType === 'sla' ? 'Service Level Agreement (SLA)' : 'Terms & Conditions'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close document"
            className="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {docType === 'sla' ? (
          <div className="space-y-5 text-sm text-slate-700 leading-relaxed">
            <section>
              <h3 className="font-display font-bold text-slate-900 mb-1.5">
                01. Scope of Services &amp; Uptime Guarantees
              </h3>
              <p>
                {COMPANY_INFO.brand} commits to monthly availability targets of 99.9% (Basic),
                99.95% (Business Operations), and 99.99% (Enterprise Mission-Critical) across
                managed production hosting, API gateways, and configured network endpoints.
              </p>
            </section>
            <section>
              <h3 className="font-display font-bold text-slate-900 mb-1.5">
                02. Incident Management &amp; Response Targets
              </h3>
              <p>
                Critical outage incidents under Enterprise retainers receive engineering triage
                within 15 minutes, Business Operations within 4 hours, and Basic Support within 48
                hours. Status updates are logged against your ticket reference until resolution.
              </p>
            </section>
            <section>
              <h3 className="font-display font-bold text-slate-900 mb-1.5">
                03. Scheduled Maintenance &amp; Service Credits
              </h3>
              <p>
                Planned maintenance windows are scheduled outside peak commercial hours in Central
                Africa Time (CAT) with prior notice. Verified SLA breaches qualify for proportional
                monthly service credits applied to the following billing cycle.
              </p>
            </section>
            <section>
              <h3 className="font-display font-bold text-slate-900 mb-1.5">
                04. Customer Responsibilities
              </h3>
              <p>
                Clients maintain authorized administrative contacts, timely access for on-site
                Harare hardware dispatch, and intact backup credentials for third-party registries.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-5 text-sm text-slate-700 leading-relaxed">
            <section>
              <h3 className="font-display font-bold text-slate-900 mb-1.5">
                01. Definitions &amp; Acceptance
              </h3>
              <p>
                &ldquo;{COMPANY_INFO.brand}&rdquo; refers to {COMPANY_INFO.legalName}, a technology
                engineering and IT services provider registered and operating in Harare, Zimbabwe.
                Commissioning any software, connectivity, or repair work constitutes acceptance of
                these transparent terms.
              </p>
            </section>
            <section>
              <h3 className="font-display font-bold text-slate-900 mb-1.5">
                02. Scope, Diagnostics &amp; Billing
              </h3>
              <p>
                Hardware diagnostics begin at $10 USD prior to parts replacement approval. Custom
                software and fintech integrations follow milestone-based invoicing in USD or
                agreed equivalent settlement rails.
              </p>
            </section>
            <section>
              <h3 className="font-display font-bold text-slate-900 mb-1.5">
                03. Intellectual Property &amp; Acceptable Use
              </h3>
              <p>
                Upon final milestone settlement, bespoke client codebases and brand assets transfer
                to the client as specified in the project statement of work. Hosted infrastructure
                must comply with applicable Zimbabwean and international telecommunications laws.
              </p>
            </section>
            <section>
              <h3 className="font-display font-bold text-slate-900 mb-1.5">
                04. Governing Law
              </h3>
              <p>
                These terms are governed by the laws of the Republic of Zimbabwe, with direct
                escalation available through {COMPANY_INFO.email} or {COMPANY_INFO.phoneDisplay}.
              </p>
            </section>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer min-h-[40px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
