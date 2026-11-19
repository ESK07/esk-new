import { useState } from 'react';
import { Check, Search } from 'lucide-react';
import {
  DELIVERY_PROCESS,
  INITIAL_TICKETS,
  SLA_TIERS,
  type SlaTier,
  type SupportTicket,
} from '../data/eskData';
import { ResilientImage } from './ResilientImage';

interface ConnectivityAndSlaSectionProps {
  selectedSlaId: SlaTier['id'];
  onSelectSla: (tierId: SlaTier['id']) => void;
  onBookSla: (tierId: SlaTier['id']) => void;
}

export function ConnectivityAndSlaSection({
  selectedSlaId,
  onSelectSla,
  onBookSla,
}: ConnectivityAndSlaSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [ticketQuery, setTicketQuery] = useState('');
  const [tickets] = useState<SupportTicket[]>(INITIAL_TICKETS);

  const normalizedQuery = ticketQuery.trim().toLowerCase();
  const filteredTickets = normalizedQuery
    ? tickets.filter(
        (t) =>
          t.id.toLowerCase().includes(normalizedQuery) ||
          t.client.toLowerCase().includes(normalizedQuery) ||
          t.subject.toLowerCase().includes(normalizedQuery)
      )
    : tickets;

  return (
    <>
      {/* Connectivity & Network Infrastructure Band */}
      <section id="connectivity" className="py-16 lg:py-20 bg-slate-900 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-sm font-semibold text-sky-400 mb-2">
                Connectivity, Networking &amp; Hardware Ops
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4"
                style={{ textWrap: 'balance' }}
              >
                Resilient Fibre, Wireless Failover, and On-Site Engineering
              </h2>
              <p className="text-base text-slate-300 leading-relaxed mb-8">
                Downtime stalls payroll, POS terminals, and warehouse dispatch. We design redundant
                multi-WAN networks, structured office cabling, and proactive workstation fleets so
                your branches stay online.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
                <div>
                  <h3 className="font-display text-base font-semibold text-white mb-1.5">
                    01. Hybrid ISP &amp; BGP Failover
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Automatic routing between primary fibre and secondary wireless links with zero
                    manual router resets.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-white mb-1.5">
                    02. VLAN &amp; Firewall Hardening
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Segmented guest, POS, and executive subnets secured with encrypted site-to-site
                    VPN tunnels.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-white mb-1.5">
                    03. Harare Hardware Repair Lab
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Starting from $10 diagnostics for laptops, servers, power supplies, and NVMe
                    storage recovery.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-white mb-1.5">
                    04. Managed Fleet Patching
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Scheduled OS updates, verified off-site backups, and licensed productivity
                    rollouts.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex">
              <div className="w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 min-h-[300px]">
                <ResilientImage
                  src="/src/assets/images/network_fiber_hardware_1795087095915.jpg"
                  alt="Precision fiber-optic network switch and structured cabling cabinet"
                  className="w-full h-full lg:h-full object-cover"
                  fallbackLabel="ESK Enterprise Network Switching & Structured Fibre Cabling"
                />
              </div>
            </div>
          </div>

          {/* 4-Step Delivery Process */}
          <div className="mt-14 pt-10 border-t border-slate-800">
            <div className="mb-6">
              <h3 className="font-display text-xl font-bold text-white">
                How ESK Systems Delivers Every Engagement
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {DELIVERY_PROCESS.map((stage) => (
                <div key={stage.step} className="bg-slate-800/60 border border-slate-800 rounded-xl p-5">
                  <div className="font-mono text-xs font-semibold text-sky-400 mb-2 tabular-nums">
                    Step {stage.step}
                  </div>
                  <h4 className="font-display text-base font-semibold text-white mb-2">
                    {stage.title}
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{stage.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SLA Plans & Support Desk Section */}
      <section id="sla-plans" className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-sky-700 mb-2">
                Service Level Agreements
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3"
                style={{ textWrap: 'balance' }}
              >
                Measurable Uptime Commitments and Support Retainers
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Choose a response tier aligned with your operational risk. All plans include
                transparent incident tracking and scheduled maintenance windows.
              </p>
            </div>

            {/* Billing Cycle Switch placed cleanly inside section toolbar, never in header */}
            <div
              role="group"
              aria-label="Billing interval"
              className="inline-flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg self-start md:self-auto"
            >
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual (Save 15%)
              </button>
            </div>
          </div>

          {/* 3 SLA Tier Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-14">
            {SLA_TIERS.map((tier) => {
              const isSelected = tier.id === selectedSlaId;
              const price = billingCycle === 'monthly' ? tier.monthlyUsd : tier.annualUsd;
              const periodLabel = billingCycle === 'monthly' ? '/month' : '/year';

              return (
                <article
                  key={tier.id}
                  className={`bg-white rounded-xl p-6 sm:p-8 flex flex-col justify-between transition-colors ${
                    isSelected
                      ? 'border border-sky-600 ring-1 ring-sky-600/20'
                      : 'border border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-3">
                      <span>{tier.supportWindow}</span>
                      {tier.recommended && (
                        <span className="font-semibold text-sky-700">Most Popular</span>
                      )}
                    </div>

                    <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                      {tier.name}
                    </h3>

                    <div className="flex items-baseline gap-1.5 mb-5">
                      <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                        ${price.toLocaleString()}
                      </span>
                      <span className="text-sm text-slate-500">{periodLabel} USD</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3.5 px-4 bg-slate-50 border border-slate-200 rounded-lg mb-6">
                      <div>
                        <div className="text-xs text-slate-500">Uptime Guarantee</div>
                        <div className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                          {tier.uptime}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Initial Response</div>
                        <div className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                          {tier.responseTime}
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-2.5 mb-8">
                      {tier.features.map((feat) => (
                        <li key={feat} className="text-sm text-slate-700 flex items-start gap-2.5">
                          <Check
                            className="w-4 h-4 text-sky-700 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectSla(tier.id);
                      onBookSla(tier.id);
                    }}
                    className={`w-full py-2.5 px-4 text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                      isSelected || tier.recommended
                        ? 'bg-sky-700 text-white hover:bg-sky-800'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isSelected ? `Selected: ${tier.name}` : `Choose ${tier.name}`}
                  </button>
                </article>
              );
            })}
          </div>

          {/* Interactive Client Support Ticket Status Lookup */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Active Support &amp; Field Dispatch Queue
                </h3>
                <p className="text-sm text-slate-600">
                  Search by reference code (e.g. ESK-2041) or client name to check live status.
                </p>
              </div>

              <div className="relative w-full md:w-72">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={ticketQuery}
                  onChange={(e) => setTicketQuery(e.target.value)}
                  placeholder="Filter tickets (ESK-2048...)"
                  aria-label="Filter active support tickets"
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 min-h-[40px]"
                />
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-lg">
                No matching ticket found for &ldquo;{ticketQuery}&rdquo;. Use the consultation form
                below to open a new support request.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                      <th className="py-3 pr-4">Ticket ID</th>
                      <th className="py-3 pr-4">Client / Site</th>
                      <th className="py-3 pr-4">Scope</th>
                      <th className="py-3 pr-4">Assigned</th>
                      <th className="py-3 pr-4">Updated</th>
                      <th className="py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 pr-4 font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                          {ticket.id}
                        </td>
                        <td className="py-3.5 pr-4 font-medium text-slate-900 whitespace-nowrap">
                          {ticket.client}
                        </td>
                        <td className="py-3.5 pr-4 text-slate-600 min-w-[240px]">
                          {ticket.subject}
                        </td>
                        <td className="py-3.5 pr-4 text-slate-600 whitespace-nowrap">
                          {ticket.engineer}
                        </td>
                        <td className="py-3.5 pr-4 text-slate-500 tabular-nums whitespace-nowrap">
                          {ticket.updatedAt}
                        </td>
                        <td className="py-3.5 text-right whitespace-nowrap">
                          <span
                            className={`text-xs font-semibold ${
                              ticket.status === 'Resolved'
                                ? 'text-emerald-700'
                                : ticket.status === 'In Progress'
                                  ? 'text-sky-700'
                                  : 'text-amber-700'
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
