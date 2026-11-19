export type AppRoute =
  | '/'
  | '/services'
  | '/fintech'
  | '/map'
  | '/3d'
  | '/ai'
  | '/portal';

export interface RouteMeta {
  path: AppRoute;
  label: string;
  shortTitle: string;
  description: string;
}

export const APP_ROUTES: Record<AppRoute, RouteMeta> = {
  '/': {
    path: '/',
    label: 'Overview',
    shortTitle: 'ESK Systems Harare',
    description:
      'Enterprise IT infrastructure, resilient connectivity, custom web platforms, and fintech engineering in Zimbabwe.',
  },
  '/services': {
    path: '/services',
    label: 'Services',
    shortTitle: 'Services & Scope Estimator',
    description:
      'Explore all 8 ESK engineering practices with live USD baseline scoping from $10 diagnostics to enterprise applications.',
  },
  '/fintech': {
    path: '/fintech',
    label: 'Fintech',
    shortTitle: 'Payment Rails & Outcomes',
    description:
      'Paynow, EcoCash, OneMoney, and Stripe payment orchestration, security hardening, and verified Zimbabwe client deployments.',
  },
  '/map': {
    path: '/map',
    label: 'Coverage Map',
    shortTitle: 'Zimbabwe Operations Map',
    description:
      'Interactive Google Maps branch locator, Places search, and technician dispatch routing from Harare HQ.',
  },
  '/3d': {
    path: '/3d',
    label: '3D Rack',
    shortTitle: 'Interactive 3D Core Rack',
    description:
      'Real-time Three.js 42U server & fiber optic core rack visualizer with exploded architecture inspection.',
  },
  '/ai': {
    path: '/ai',
    label: 'AI Lab',
    shortTitle: 'ESK Gemini Engineering Studio',
    description:
      'Multi-turn AI advisor, Google Search intelligence, microphone audio transcription, video generation, and Lyria audio composition.',
  },
  '/portal': {
    path: '/portal',
    label: 'Client Portal',
    shortTitle: 'Client Workspace & SLA Desk',
    description:
      'Google-authenticated Firestore workspace for saved quotes, live support dispatch tickets, and AI brief archives.',
  },
};

export function normalizeRoute(pathname: string): AppRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean in APP_ROUTES) {
    return clean as AppRoute;
  }
  return '/';
}
