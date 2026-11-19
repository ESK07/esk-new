import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { AlertTriangle, X } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LegalModal, type LegalDocType } from './components/LegalModal';
import type { SlaTier } from './data/eskData';
import { auth, syncUserProfile } from './lib/firebase';
import { AiStudioPage } from './pages/AiStudioPage';
import { FintechPage } from './pages/FintechPage';
import { HomePage } from './pages/HomePage';
import { MapsPage } from './pages/MapsPage';
import { PortalPage } from './pages/PortalPage';
import { ServicesPage } from './pages/ServicesPage';
import { ThreeRackPage } from './pages/ThreeRackPage';
import { APP_ROUTES, normalizeRoute, type AppRoute } from './types/navigation';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() =>
    normalizeRoute(window.location.pathname)
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['web-apps']);
  const [selectedSlaId, setSelectedSlaId] = useState<SlaTier['id']>('business');
  const [prefillNote, setPrefillNote] = useState('');
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);

  // Firebase Auth user state
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Case A: Google Maps Demo Key quota exceeded banner state
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  const navigate = useCallback((route: AppRoute) => {
    setCurrentRoute(route);
    if (window.location.pathname !== route) {
      window.history.pushState({ route }, '', route);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const meta = APP_ROUTES[currentRoute];
    document.title = `${meta.shortTitle} | ESK Computer Systems`;
  }, [currentRoute]);

  useEffect(() => {
    const onPopState = () => {
      setCurrentRoute(normalizeRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && legalDoc) {
        setLegalDoc(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [legalDoc]);

  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (nextUser && nextUser.emailVerified) {
        syncUserProfile(nextUser).catch((err) => {
          console.error('Could not sync user profile:', err);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleToggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRequestFintechConsult = (railName: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes('web-apps') ? prev : [...prev, 'web-apps']
    );
    setPrefillNote(
      `Requesting ${railName} payment gateway integration, webhook verification, and automated ledger reconciliation.`
    );
    navigate('/portal');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigate}
        selectedServiceCount={selectedServiceIds.length}
      />

      {mapsQuotaExceeded && (
        <div
          role="alert"
          className="bg-amber-50 border-b border-amber-300 px-4 py-2.5 text-xs sm:text-sm text-amber-950"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
              <span>
                Google Maps Demo Key daily quota reached or authentication limit triggered. Map
                routing and autocomplete may pause until quota resets or a billing-enabled project
                key is attached.
              </span>
            </div>
            <button
              type="button"
              aria-label="Dismiss quota notice"
              onClick={() => setMapsQuotaExceeded(false)}
              className="text-amber-800 hover:text-amber-950 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">
        {currentRoute === '/' && (
          <HomePage
            onNavigate={navigate}
            selectedServiceCount={selectedServiceIds.length}
          />
        )}

        {currentRoute === '/services' && (
          <ServicesPage
            selectedIds={selectedServiceIds}
            onToggleService={handleToggleService}
            onClearServices={() => setSelectedServiceIds([])}
            onProceedToQuote={() => navigate('/portal')}
            onNavigate={navigate}
          />
        )}

        {currentRoute === '/fintech' && (
          <FintechPage onRequestFintechConsult={handleRequestFintechConsult} />
        )}

        {currentRoute === '/map' && <MapsPage />}

        {currentRoute === '/3d' && <ThreeRackPage />}

        {currentRoute === '/ai' && <AiStudioPage user={user} onNavigate={navigate} />}

        {currentRoute === '/portal' && (
          <PortalPage
            user={user}
            authReady={authReady}
            selectedServiceIds={selectedServiceIds}
            onToggleService={handleToggleService}
            selectedSlaId={selectedSlaId}
            onSelectSla={setSelectedSlaId}
            prefillNote={prefillNote}
          />
        )}
      </main>

      {currentRoute !== '/3d' && (
        <Footer onNavigate={navigate} onOpenLegal={(doc) => setLegalDoc(doc)} />
      )}

      <LegalModal docType={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
}
