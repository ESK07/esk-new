import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Copy, Mail, MapPin, Phone, Clock } from 'lucide-react';
import { COMPANY_INFO, SERVICES, SLA_TIERS, type SlaTier } from '../data/eskData';

interface ContactSectionProps {
  selectedServiceIds: string[];
  onToggleService: (id: string) => void;
  selectedSlaId: SlaTier['id'];
  onSelectSla: (id: SlaTier['id']) => void;
  prefillNote: string;
  onPersistQuote?: (payload: {
    referenceCode: string;
    clientName: string;
    organization: string;
    email: string;
    phone: string;
    serviceIds: string[];
    slaTier: SlaTier['id'];
    estimatedBaseline: number;
    notes: string;
  }) => Promise<void>;
}

interface SubmissionReceipt {
  referenceId: string;
  submittedAt: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  serviceTitles: string[];
  slaName: string;
  estimatedBaseline: number;
  message: string;
  savedToCloud?: boolean;
}

export function ContactSection({
  selectedServiceIds,
  onToggleService,
  selectedSlaId,
  onSelectSla,
  prefillNote,
  onPersistQuote,
}: ContactSectionProps) {
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(prefillNote);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (prefillNote) {
      setReceipt(null);
      setMessage(prefillNote);
    }
  }, [prefillNote]);

  const selectedServices = SERVICES.filter((s) => selectedServiceIds.includes(s.id));
  const baselineTotal = selectedServices.reduce((sum, s) => sum + s.startingPrice, 0);
  const activeSla = SLA_TIERS.find((t) => t.id === selectedSlaId) ?? SLA_TIERS[1];

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) {
      nextErrors.name = 'Enter your full name.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid business or personal email address.';
    }
    if (phone.trim() && !/^\+?[\d\s\-()]{7,20}$/.test(phone.trim())) {
      nextErrors.phone = 'Enter a valid phone number (e.g. +263 715 866 071).';
    }
    if (message.trim().length < 10) {
      nextErrors.message = 'Provide at least a short summary of your requirements (10+ characters).';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const refNum = `ESK-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmitting(true);
    let savedToCloud = false;

    try {
      if (onPersistQuote) {
        await onPersistQuote({
          referenceCode: refNum,
          clientName: name.trim(),
          organization: organization.trim(),
          email: email.trim(),
          phone: phone.trim(),
          serviceIds: selectedServices.length > 0 ? selectedServices.map((s) => s.id) : ['web-apps'],
          slaTier: selectedSlaId,
          estimatedBaseline: baselineTotal,
          notes: message.trim(),
        });
        savedToCloud = true;
      }
    } catch (err) {
      setErrors({
        submit:
          err instanceof Error
            ? err.message
            : 'Could not sync quote to cloud workspace.',
      });
    } finally {
      setSubmitting(false);
    }

    setReceipt({
      referenceId: refNum,
      submittedAt: new Date().toLocaleString('en-ZW', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || 'Not provided',
      organization: organization.trim() || 'Independent / Direct Client',
      serviceTitles:
        selectedServices.length > 0
          ? selectedServices.map((s) => s.title)
          : ['General IT Consultation'],
      slaName: activeSla.name,
      estimatedBaseline: baselineTotal,
      message: message.trim(),
      savedToCloud,
    });
  };

  const handleCopyBrief = async () => {
    if (!receipt) return;
    const summaryText = [
      `ESK Systems Project Brief (${receipt.referenceId})`,
      `Client: ${receipt.name} (${receipt.organization})`,
      `Email: ${receipt.email} | Phone: ${receipt.phone}`,
      `Selected Services: ${receipt.serviceTitles.join(', ')}`,
      `SLA Tier: ${receipt.slaName}`,
      `Baseline Estimate: $${receipt.estimatedBaseline} USD`,
      `Notes: ${receipt.message}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2500);
    } catch {
      setCopiedReceipt(false);
    }
  };

  return (
    <section id="contact" className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Direct Harare Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-sm font-semibold text-sky-700 mb-2">
                Consultation &amp; Project Intake
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3"
                style={{ textWrap: 'balance' }}
              >
                Speak Directly with Our Harare Engineering Desk
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Send your technical scope, hardware diagnostic request, or fintech integration brief.
                We respond to every commercial inquiry within one business day.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-5">
              <div className="flex items-start gap-3.5">
                <Phone className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-medium text-slate-500">Direct Phone &amp; WhatsApp</div>
                  <a
                    href={COMPANY_INFO.phoneHref}
                    className="font-mono text-base font-semibold text-slate-900 hover:text-sky-700 transition-colors tabular-nums"
                  >
                    {COMPANY_INFO.phoneDisplay}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Mail className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-medium text-slate-500">Engineering &amp; Sales Email</div>
                  <a
                    href={COMPANY_INFO.emailHref}
                    className="text-base font-semibold text-slate-900 hover:text-sky-700 transition-colors"
                  >
                    {COMPANY_INFO.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-medium text-slate-500">Operations Coverage</div>
                  <div className="text-base font-semibold text-slate-900">
                    Harare, Zimbabwe / Remote SADC
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-medium text-slate-500">Operating Hours</div>
                  <div className="text-sm font-medium text-slate-800">{COMPANY_INFO.hours}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Validated Scope & Lead Form */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8">
            {receipt ? (
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-900">
                      Consultation Scope Recorded
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Reference <span className="font-mono font-semibold">{receipt.referenceId}</span>{' '}
                      logged on {receipt.submittedAt}. Our engineering lead will reach out via{' '}
                      <span className="font-medium text-slate-900">{receipt.email}</span>.
                    </p>
                    {receipt.savedToCloud && (
                      <p className="text-xs font-semibold text-emerald-700 mt-1">
                        Synced to your Cloud Firestore Saved Quotes list above.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Client</span>
                    <span className="font-medium text-slate-900 text-right">
                      {receipt.name} · {receipt.organization}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Selected SLA Tier</span>
                    <span className="font-medium text-slate-900 text-right">{receipt.slaName}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Scope Items</span>
                    <span className="font-medium text-slate-900 text-right">
                      {receipt.serviceTitles.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Estimated Baseline</span>
                    <span className="font-mono font-bold text-sky-700 tabular-nums">
                      {receipt.estimatedBaseline > 0
                        ? `$${receipt.estimatedBaseline.toLocaleString()} USD`
                        : 'Custom Quote'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyBrief}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer min-h-[40px]"
                  >
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    <span>{copiedReceipt ? 'Scope Copied' : 'Copy Scope Summary'}</span>
                  </button>

                  <a
                    href={`mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent(
                      `Project Scope ${receipt.referenceId} — ${receipt.organization}`
                    )}&body=${encodeURIComponent(
                      `Reference: ${receipt.referenceId}\nServices: ${receipt.serviceTitles.join(
                        ', '
                      )}\nSLA: ${receipt.slaName}\nPhone: ${receipt.phone}\n\n${receipt.message}`
                    )}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors min-h-[40px]"
                  >
                    <Mail className="w-4 h-4" aria-hidden="true" />
                    <span>Open in Email Client</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setReceipt(null)}
                    className="px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-sm font-medium text-slate-800 mb-1.5"
                    >
                      Full Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      placeholder="Tendai Moyo"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 min-h-[42px]"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-rose-700 font-medium">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-org"
                      className="block text-sm font-medium text-slate-800 mb-1.5"
                    >
                      Company / Organization
                    </label>
                    <input
                      id="contact-org"
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Harare Logistics Ltd"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 min-h-[42px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-sm font-medium text-slate-800 mb-1.5"
                    >
                      Email Address <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder="name@company.co.zw"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 min-h-[42px]"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-rose-700 font-medium">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-sm font-medium text-slate-800 mb-1.5"
                    >
                      Phone / WhatsApp Number
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      placeholder="+263 77..."
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 min-h-[42px]"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-rose-700 font-medium">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Service Scope Multi-Select Checkboxes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-800">
                      Services Needed ({selectedServices.length} selected)
                    </span>
                    {baselineTotal > 0 && (
                      <span className="font-mono text-xs font-semibold text-sky-700 tabular-nums">
                        Est. Baseline: ${baselineTotal.toLocaleString()} USD
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SERVICES.map((srv) => {
                      const checked = selectedServiceIds.includes(srv.id);
                      return (
                        <label
                          key={srv.id}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                            checked
                              ? 'bg-sky-50 border-sky-600 text-slate-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => onToggleService(srv.id)}
                              className="rounded border-slate-300 text-sky-700 focus:ring-sky-600"
                            />
                            <span className="truncate">{srv.title}</span>
                          </span>
                          <span className="font-mono text-slate-500 shrink-0 tabular-nums">
                            ${srv.startingPrice}+
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred SLA Tier */}
                <div>
                  <label
                    htmlFor="contact-sla"
                    className="block text-sm font-medium text-slate-800 mb-1.5"
                  >
                    Preferred Support &amp; SLA Tier
                  </label>
                  <select
                    id="contact-sla"
                    value={selectedSlaId}
                    onChange={(e) => onSelectSla(e.target.value as SlaTier['id'])}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 min-h-[42px]"
                  >
                    {SLA_TIERS.map((tier) => (
                      <option key={tier.id} value={tier.id}>
                        {tier.name} — {tier.uptime} Uptime ({tier.responseTime}, ${tier.monthlyUsd}
                        /mo)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project Brief */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-medium text-slate-800 mb-1.5"
                  >
                    Project Requirements or Fault Details <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) setErrors((prev) => ({ ...prev, message: '' }));
                    }}
                    placeholder="Describe your branch setup, payment integration goals, or hardware/software issue..."
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-rose-700 font-medium">{errors.message}</p>
                  )}
                </div>

                {errors.submit && (
                  <p className="text-xs text-rose-700 font-medium">{errors.submit}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                >
                  {submitting ? 'Submitting Brief...' : 'Submit Consultation Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
