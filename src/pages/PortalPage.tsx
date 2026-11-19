import { useEffect, useState, type FormEvent } from 'react';
import { signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import {
  AlertCircle,
  BookmarkCheck,
  CheckCircle2,
  Database,
  LogIn,
  LogOut,
  Plus,
  Trash2,
} from 'lucide-react';
import { ContactSection } from '../components/ContactSection';
import { SLA_TIERS, type SlaTier } from '../data/eskData';
import {
  OperationType,
  auth,
  createTicketInFirestore,
  db,
  deleteNoteInFirestore,
  googleProvider,
  handleFirestoreError,
  saveQuoteToFirestore,
  testConnection,
  updateTicketStatusInFirestore,
  type QuoteDoc,
  type TicketDoc,
  type WorkspaceNoteDoc,
} from '../lib/firebase';

interface PortalPageProps {
  user: User | null;
  authReady: boolean;
  selectedServiceIds: string[];
  onToggleService: (id: string) => void;
  selectedSlaId: SlaTier['id'];
  onSelectSla: (id: SlaTier['id']) => void;
  prefillNote: string;
}

export function PortalPage({
  user,
  authReady,
  selectedServiceIds,
  onToggleService,
  selectedSlaId,
  onSelectSla,
  prefillNote,
}: PortalPageProps) {
  const [authError, setAuthError] = useState<string | null>(null);
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);

  const [quotes, setQuotes] = useState<QuoteDoc[]>([]);
  const [tickets, setTickets] = useState<TicketDoc[]>([]);
  const [notes, setNotes] = useState<WorkspaceNoteDoc[]>([]);
  const [portalError, setPortalError] = useState<string | null>(null);

  // New Support Ticket Form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Network & IT Support');
  const [ticketPriority, setTicketPriority] = useState<'standard' | 'priority' | 'critical'>(
    'standard'
  );
  const [creatingTicket, setCreatingTicket] = useState(false);

  useEffect(() => {
    testConnection().then((ok) => setDbHealthy(ok));
  }, []);

  useEffect(() => {
    if (!user) {
      setQuotes([]);
      setTickets([]);
      setNotes([]);
      return;
    }

    const qQuotes = query(collection(db, 'quotes'), where('ownerId', '==', user.uid));
    const unsubQuotes = onSnapshot(
      qQuotes,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as QuoteDoc);
        setQuotes(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'quotes');
        } catch (wrapped) {
          setPortalError(wrapped instanceof Error ? wrapped.message : String(wrapped));
        }
      }
    );

    const qTickets = query(collection(db, 'tickets'), where('ownerId', '==', user.uid));
    const unsubTickets = onSnapshot(
      qTickets,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as TicketDoc);
        setTickets(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'tickets');
        } catch (wrapped) {
          setPortalError(wrapped instanceof Error ? wrapped.message : String(wrapped));
        }
      }
    );

    const qNotes = query(collection(db, 'notes'), where('ownerId', '==', user.uid));
    const unsubNotes = onSnapshot(
      qNotes,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as WorkspaceNoteDoc);
        setNotes(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'notes');
        } catch (wrapped) {
          setPortalError(wrapped instanceof Error ? wrapped.message : String(wrapped));
        }
      }
    );

    return () => {
      unsubQuotes();
      unsubTickets();
      unsubNotes();
    };
  }, [user]);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Google sign-in popup could not complete.'
      );
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleCreateTicket = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || ticketSubject.trim().length < 4 || creatingTicket) return;
    setPortalError(null);
    setCreatingTicket(true);
    try {
      await createTicketInFirestore({
        ownerId: user.uid,
        subject: ticketSubject.trim(),
        category: ticketCategory,
        priority: ticketPriority,
      });
      setTicketSubject('');
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : 'Could not create ticket.');
    } finally {
      setCreatingTicket(false);
    }
  };

  const handlePersistQuote = async (payload: {
    referenceCode: string;
    clientName: string;
    organization: string;
    email: string;
    phone: string;
    serviceIds: string[];
    slaTier: SlaTier['id'];
    estimatedBaseline: number;
    notes: string;
  }) => {
    if (!user) return;
    await saveQuoteToFirestore({
      ownerId: user.uid,
      ...payload,
    });
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* Page Header & Google Sign-In Bar */}
      <section className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-sky-700 mb-1">
              Firebase Authenticated Workspace &amp; SLA Desk
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Client Portal, Support Dispatch &amp; Quote Intake
            </h1>
            <p className="text-sm text-slate-600 mt-1.5">
              Sign in with Google to sync project quotes, dispatch tickets, and saved AI transcripts
              to Cloud Firestore.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {!authReady ? (
              <span className="text-xs text-slate-500">Checking session...</span>
            ) : user ? (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Client avatar'}
                    className="w-8 h-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="text-xs">
                  <div className="font-semibold text-slate-900">
                    {user.displayName || 'ESK Client'}
                  </div>
                  <div className="text-slate-500">{user.email}</div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer min-h-[44px]"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {authError && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{authError}</span>
          </div>
        )}

        {portalError && (
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-sm text-rose-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{portalError}</span>
          </div>
        )}

        {/* Authenticated Cloud Collections */}
        {user ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Support Dispatch Ticket Queue + Create Ticket */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Your Cloud Support Dispatch Tickets ({tickets.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Persisted per account in Cloud Firestore{' '}
                    {dbHealthy ? '· Connected' : ''}
                  </p>
                </div>
                <Database className="w-4 h-4 text-sky-700" aria-hidden="true" />
              </div>

              <form onSubmit={handleCreateTicket} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <input
                  type="text"
                  required
                  minLength={4}
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Report fault or request engineer (e.g. Msasa WAN failover check)"
                  className="sm:col-span-6 px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                />
                <select
                  aria-label="Ticket category"
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="sm:col-span-3 px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="Network & IT Support">Network &amp; IT</option>
                  <option value="Fintech Infrastructure">Fintech APIs</option>
                  <option value="Computer Repair">Hardware Repair</option>
                  <option value="Web Applications">Web Applications</option>
                </select>
                <select
                  aria-label="Ticket priority"
                  value={ticketPriority}
                  onChange={(e) =>
                    setTicketPriority(e.target.value as 'standard' | 'priority' | 'critical')
                  }
                  className="sm:col-span-3 px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="standard">Standard</option>
                  <option value="priority">Priority (4h)</option>
                  <option value="critical">Critical (15m)</option>
                </select>
                <button
                  type="submit"
                  disabled={creatingTicket || ticketSubject.trim().length < 4}
                  className="sm:col-span-12 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:opacity-50 rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Open Support Dispatch Ticket</span>
                </button>
              </form>

              {tickets.length === 0 ? (
                <div className="p-6 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-500">
                  No support tickets logged under your account yet. Use the form above to dispatch
                  an ESK engineer.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {ticket.referenceCode}
                          </span>
                          <span className="text-xs text-slate-500">· {ticket.category}</span>
                          <span className="text-[11px] font-mono uppercase text-sky-700">
                            {ticket.priority}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-slate-800 mt-0.5">
                          {ticket.subject}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
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
                        {ticket.status !== 'Resolved' && (
                          <button
                            type="button"
                            onClick={() => updateTicketStatusInFirestore(ticket.id, 'Resolved')}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Saved Quotes + Saved AI Studio Notes */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Saved Project Quotes ({quotes.length})
                  </h2>
                  <CheckCircle2 className="w-4 h-4 text-sky-700" aria-hidden="true" />
                </div>
                {quotes.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Submit the consultation form below while signed in to save quote scopes here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {quotes.map((q) => (
                      <div
                        key={q.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-mono font-bold text-slate-900">
                          <span>{q.referenceCode}</span>
                          <span className="text-sky-700">
                            ${Number(q.estimatedBaseline).toLocaleString()} USD
                          </span>
                        </div>
                        <div className="text-slate-700 font-medium">
                          {q.organization || q.clientName} · {q.slaTier.toUpperCase()} SLA
                        </div>
                        <div className="text-slate-500 line-clamp-2">{q.notes}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Saved AI Briefs &amp; Transcripts ({notes.length})
                  </h2>
                  <BookmarkCheck className="w-4 h-4 text-sky-700" aria-hidden="true" />
                </div>
                {notes.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Save any advisor chat, Search briefing, or voice transcript from the AI Lab
                    page.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {notes.map((n) => (
                      <div
                        key={n.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900 truncate">{n.title}</span>
                          <button
                            type="button"
                            aria-label="Delete note"
                            onClick={() => deleteNoteInFirestore(n.id)}
                            className="text-slate-400 hover:text-rose-700 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="text-slate-600 line-clamp-3 whitespace-pre-wrap">
                          {n.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-900">
                Sign in to unlock Cloud Firestore persistence
              </div>
              <p className="text-xs text-slate-600 max-w-2xl">
                Signing in with Google automatically stores your project quotes, lets you track
                active IT support tickets in real time, and archives voice transcripts from the AI
                Lab.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignIn}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shrink-0 cursor-pointer"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>Sign in with Google</span>
            </button>
          </div>
        )}

        {/* SLA Tier Selector Strip */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-slate-900">
              SLA Retainer Tiers
            </h2>
            <p className="text-xs text-slate-600">
              Select a support commitment to attach to your consultation brief below.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SLA_TIERS.map((tier) => {
              const selected = tier.id === selectedSlaId;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => onSelectSla(tier.id)}
                  className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                    selected
                      ? 'bg-sky-50 border-sky-600'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>{tier.uptime} Uptime</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${tier.monthlyUsd}/mo
                    </span>
                  </div>
                  <div className="font-display text-base font-bold text-slate-900">
                    {tier.name}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">{tier.responseTime}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Direct Consultation & Quote Intake Form */}
      <ContactSection
        selectedServiceIds={selectedServiceIds}
        onToggleService={onToggleService}
        selectedSlaId={selectedSlaId}
        onSelectSla={onSelectSla}
        prefillNote={prefillNote}
        onPersistQuote={user ? handlePersistQuote : undefined}
      />
    </div>
  );
}
