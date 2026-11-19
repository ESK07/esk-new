import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { COMPANY_INFO } from '../data/eskData';
import type { AppRoute } from '../types/navigation';

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  selectedServiceCount: number;
}

const NAV_ITEMS: { label: string; route: AppRoute }[] = [
  { label: 'Services', route: '/services' },
  { label: 'Fintech', route: '/fintech' },
  { label: 'Map', route: '/map' },
  { label: '3D Rack', route: '/3d' },
  { label: 'AI Lab', route: '/ai' },
];

export function Navbar({
  currentRoute,
  onNavigate,
  selectedServiceCount,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (route: AppRoute) => {
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single-element Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNav('/');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded-sm"
        >
          {COMPANY_INFO.brand}
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          {NAV_ITEMS.map((item) => {
            const active = currentRoute === item.route;
            return (
              <a
                key={item.route}
                href={item.route}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.route);
                }}
                aria-current={active ? 'page' : undefined}
                className={`transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded-sm py-1 ${
                  active
                    ? 'text-sky-700 font-semibold underline underline-offset-8 decoration-2'
                    : 'hover:text-slate-900 underline-offset-8 hover:underline'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNav('/portal')}
            className={`hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 min-h-[40px] ${
              currentRoute === '/portal'
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-sky-700 text-white hover:bg-sky-800'
            }`}
          >
            {selectedServiceCount > 0
              ? `Client Portal (${selectedServiceCount})`
              : 'Client Portal'}
          </button>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/');
            }}
            className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${
              currentRoute === '/'
                ? 'bg-sky-50 text-sky-800 font-semibold'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home Overview
          </a>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.route}
              href={item.route}
              onClick={(e) => {
                e.preventDefault();
                handleNav(item.route);
              }}
              className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${
                currentRoute === item.route
                  ? 'bg-sky-50 text-sky-800 font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => handleNav('/portal')}
            className="w-full mt-2 px-4 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer min-h-[44px]"
          >
            {selectedServiceCount > 0
              ? `Client Portal (${selectedServiceCount})`
              : 'Client Portal'}
          </button>
        </div>
      )}
    </header>
  );
}
