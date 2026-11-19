import { COMPANY_INFO } from '../data/eskData';
import type { AppRoute } from '../types/navigation';
import type { LegalDocType } from './LegalModal';

interface FooterProps {
  onNavigate: (route: AppRoute) => void;
  onOpenLegal: (doc: Exclude<LegalDocType, null>) => void;
}

const FOOTER_LINKS: { label: string; route: AppRoute }[] = [
  { label: 'Overview', route: '/' },
  { label: 'Services & Estimator', route: '/services' },
  { label: 'Fintech Rails & Outcomes', route: '/fintech' },
  { label: 'Operations Map', route: '/map' },
  { label: '3D Rack Inspector', route: '/3d' },
  { label: 'AI Engineering Lab', route: '/ai' },
  { label: 'Client Portal & SLA Desk', route: '/portal' },
];

export function Footer({ onNavigate, onOpenLegal }: FooterProps) {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
          <div className="md:col-span-5 space-y-3">
            <div className="font-display text-lg font-bold text-white">{COMPANY_INFO.brand}</div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Enterprise IT infrastructure, custom software engineering, network operations, and
              fintech payment integration headquartered in Harare, Zimbabwe.
            </p>
            <div className="flex items-center gap-4 pt-1 text-xs font-medium">
              <a
                href={COMPANY_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white underline-offset-4 hover:underline"
              >
                LinkedIn
              </a>
              <span className="text-slate-700" aria-hidden="true">
                ·
              </span>
              <a
                href={COMPANY_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white underline-offset-4 hover:underline"
              >
                GitHub
              </a>
            </div>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-sm">
            <div className="text-xs font-semibold text-slate-400">Platform Pages</div>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((item) => (
                <li key={item.route}>
                  <a
                    href={item.route}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.route);
                    }}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-2.5 text-sm">
            <div className="text-xs font-semibold text-slate-400">Harare Operations Desk</div>
            <p className="text-slate-300">{COMPANY_INFO.city}</p>
            <p>
              <a
                href={COMPANY_INFO.phoneHref}
                className="font-mono text-slate-200 hover:text-white tabular-nums"
              >
                {COMPANY_INFO.phoneDisplay}
              </a>
            </p>
            <p>
              <a href={COMPANY_INFO.emailHref} className="text-slate-200 hover:text-white">
                {COMPANY_INFO.email}
              </a>
            </p>
            <p className="text-xs text-slate-500 pt-1">{COMPANY_INFO.hours}</p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} {COMPANY_INFO.legalName} ({COMPANY_INFO.domain}). All
            rights reserved.
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => onOpenLegal('sla')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Service Level Agreement
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
