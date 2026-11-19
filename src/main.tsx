import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Tier 1 Global Listener: Google Maps Demo Key quota / failure guard
declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

const origConsoleError = console.error;
console.error = (...args: unknown[]) => {
  origConsoleError(...args);
  const text = args.map((a) => String(a)).join(' ');
  if (
    text.includes('OVER_QUERY_LIMIT') ||
    text.includes('Quota exceeded') ||
    text.includes('OverQuotaMapError')
  ) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
};

window.gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
