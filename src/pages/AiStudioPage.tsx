import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import type { User } from 'firebase/auth';
import {
  AlertCircle,
  BookmarkPlus,
  Check,
  ExternalLink,
  Film,
  Globe,
  Loader2,
  MessageSquare,
  Mic,
  Music,
  Send,
  Square,
  Upload,
} from 'lucide-react';
import { saveNoteToFirestore } from '../lib/firebase';
import type { AppRoute } from '../types/navigation';

type AiTab = 'chat' | 'search' | 'transcribe' | 'video' | 'music';
type ChatModel =
  | 'gemini-4-hydrogen'
  | 'gemini-4-carbon'
  | 'gemini-4-neon'
  | 'gemini-3.1-flash-lite';

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
  model?: string;
}

interface SearchSource {
  title: string;
  uri: string;
}

interface AiStudioPageProps {
  user: User | null;
  onNavigate: (route: AppRoute) => void;
}

const CHAT_MODEL_OPTIONS: { id: ChatModel; label: string; note: string }[] = [
  { id: 'gemini-4-hydrogen', label: 'Gemini 4 Hydrogen', note: 'Balanced general reasoning' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', note: 'Ultra-low latency' },
  { id: 'gemini-4-neon', label: 'Gemini 4 Neon', note: 'Complex coding & math' },
  { id: 'gemini-4-carbon', label: 'Gemini 4 Carbon', note: 'Deep root-cause architecture' },
];

const SYSTEM_PRESETS = [
  {
    label: 'ESK Harare Solutions Architect',
    instruction:
      'You are ESK Systems Senior Solutions Architect in Harare, Zimbabwe. Give crisp, practical enterprise advice covering fibre redundancy, Paynow/EcoCash/Stripe integrations, hardware diagnostics, and SLA planning.',
  },
  {
    label: 'Fintech Compliance & Webhook Engineer',
    instruction:
      'You specialize in Paynow Express, EcoCash USSD Push, OneMoney merchant settlement, Stripe PaymentIntents, idempotency keys, and PCI-DSS SAQ-A architecture.',
  },
  {
    label: 'Network & Hardware Diagnostics Lead',
    instruction:
      'You diagnose dual-WAN BGP failover issues, MikroTik/Cisco VLAN routing, workstation NVMe/RAM faults, and structured office cabling problems.',
  },
];

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve({
        base64: comma >= 0 ? result.slice(comma + 1) : result,
        mimeType: file.type || 'application/octet-stream',
      });
    };
    reader.onerror = () => reject(new Error('Failed to read selected file.'));
    reader.readAsDataURL(file);
  });
}

function base64ToBlobUrl(base64: string, mimeType: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

export function AiStudioPage({ user, onNavigate }: AiStudioPageProps) {
  const [activeTab, setActiveTab] = useState<AiTab>('chat');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // 1. Multi-turn Chat state
  const [chatModel, setChatModel] = useState<ChatModel>('gemini-4-hydrogen');
  const [systemInstruction, setSystemInstruction] = useState(SYSTEM_PRESETS[0].instruction);
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // 2. Google Search Grounding state
  const [searchQuery, setSearchQuery] = useState(
    'Latest Reserve Bank of Zimbabwe ZiG & Paynow payment gateway settlement updates'
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    text: string;
    sources: SearchSource[];
    webSearchQueries: string[];
  } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 3. Audio Transcription state
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [transcribePrompt, setTranscribePrompt] = useState(
    'Transcribe this field inspection note or client meeting accurately with clear punctuation.'
  );
  const [transcriptText, setTranscriptText] = useState('');
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  // 4. Video Generation (Text & Image-to-Video) state
  const [videoMode, setVideoMode] = useState<'text' | 'image'>('text');
  const [videoPrompt, setVideoPrompt] = useState(
    'Smooth architectural dolly camera glide through a clean modern server operations center with subtle cool blue rack lighting.'
  );
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16'>('16:9');
  const [videoDuration, setVideoDuration] = useState<'5s' | '10s'>('5s');
  const [videoRefImage, setVideoRefImage] = useState<{
    name: string;
    base64: string;
    mimeType: string;
    previewUrl: string;
  } | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // 5. Music Generation (Lyria) state
  const [musicModel, setMusicModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>(
    'lyria-3-clip-preview'
  );
  const [musicPrompt, setMusicPrompt] = useState(
    'Warm Rhodes electric piano, understated marimba accents, clean modern electronic pulse for a Zimbabwe tech showcase.'
  );
  const [musicRefImage, setMusicRefImage] = useState<{
    name: string;
    base64: string;
    mimeType: string;
  } | null>(null);
  const [musicLoading, setMusicLoading] = useState(false);
  const [musicAudioUrl, setMusicAudioUrl] = useState<string | null>(null);
  const [musicLyrics, setMusicLyrics] = useState('');
  const [musicError, setMusicError] = useState<string | null>(null);

  const handleSaveToPortal = async (
    sourceType: 'chat' | 'search' | 'transcription',
    title: string,
    content: string
  ) => {
    if (!user) {
      setSaveNotice('Sign in on the Client Portal page to persist notes to Firestore.');
      return;
    }
    try {
      await saveNoteToFirestore({
        ownerId: user.uid,
        sourceType,
        title,
        content,
      });
      setSaveNotice(`Saved "${title}" to your Firestore Client Portal archive.`);
    } catch (err) {
      setSaveNotice(err instanceof Error ? err.message : 'Could not save note.');
    }
  };

  // Handler: Multi-Turn Chat
  const handleSendChat = async (e: FormEvent) => {
    e.preventDefault();
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;

    setChatError(null);
    const nextHistory = [...chatHistory, { role: 'user' as const, text: msg }];
    setChatHistory(nextHistory);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: chatModel,
          systemInstruction,
          history: chatHistory,
          message: msg,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.guidance ? `${data.error} — ${data.guidance}` : data.error);
      }
      setChatHistory((prev) => [
        ...prev,
        { role: 'model', text: data.text || '(Empty response)', model: data.model },
      ]);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Chat request failed.');
    } finally {
      setChatLoading(false);
    }
  };

  // Handler: Search Grounding
  const handleRunSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchLoading) return;
    setSearchError(null);
    setSearchLoading(true);
    try {
      const res = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.guidance ? `${data.error} — ${data.guidance}` : data.error);
      }
      setSearchResult({
        text: data.text || '',
        sources: Array.isArray(data.sources) ? data.sources : [],
        webSearchQueries: Array.isArray(data.webSearchQueries) ? data.webSearchQueries : [],
      });
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search grounding failed.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Handler: Audio Recording + File Transcription
  const transcribePayload = async (audioBase64: string, mimeType: string) => {
    setTranscribeError(null);
    setTranscribeLoading(true);
    try {
      const res = await fetch('/api/gemini/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType,
          prompt: transcribePrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.guidance ? `${data.error} — ${data.guidance}` : data.error);
      }
      setTranscriptText(data.text || '');
    } catch (err) {
      setTranscribeError(err instanceof Error ? err.message : 'Audio transcription failed.');
    } finally {
      setTranscribeLoading(false);
    }
  };

  const handleToggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    setTranscribeError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        const preview = URL.createObjectURL(blob);
        setAudioPreviewUrl(preview);
        setAudioFileName('Live Microphone Recording');
        const file = new File([blob], 'mic-recording.webm', { type: mime });
        const { base64 } = await fileToBase64(file);
        await transcribePayload(base64, mime.split(';')[0] || 'audio/webm');
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setTranscribeError(
        'Microphone access was denied or unavailable. Upload an audio file below instead.'
      );
    }
  };

  const handleAudioFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFileName(file.name);
    setAudioPreviewUrl(URL.createObjectURL(file));
    const { base64, mimeType } = await fileToBase64(file);
    await transcribePayload(base64, mimeType);
  };

  // Handler: Video Generation
  const handleVideoImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { base64, mimeType } = await fileToBase64(file);
    setVideoRefImage({
      name: file.name,
      base64,
      mimeType,
      previewUrl: URL.createObjectURL(file),
    });
  };

  const handleGenerateVideo = async (e: FormEvent) => {
    e.preventDefault();
    if (!videoPrompt.trim() || videoLoading) return;
    if (videoMode === 'image' && !videoRefImage) {
      setVideoError('Upload a starting photo to animate into video.');
      return;
    }

    setVideoError(null);
    setVideoLoading(true);
    try {
      const res = await fetch('/api/gemini/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt.trim(),
          aspectRatio: videoAspect,
          duration: videoDuration,
          resolution: '720p',
          imageBase64: videoMode === 'image' ? videoRefImage?.base64 : undefined,
          imageMimeType: videoMode === 'image' ? videoRefImage?.mimeType : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.guidance ? `${data.error} — ${data.guidance}` : data.error);
      }
      const url = base64ToBlobUrl(data.videoBase64, data.mimeType || 'video/mp4');
      setVideoUrl(url);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : 'Video generation failed.');
    } finally {
      setVideoLoading(false);
    }
  };

  // Handler: Music Generation
  const handleMusicImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { base64, mimeType } = await fileToBase64(file);
    setMusicRefImage({ name: file.name, base64, mimeType });
  };

  const handleGenerateMusic = async (e: FormEvent) => {
    e.preventDefault();
    if (!musicPrompt.trim() || musicLoading) return;

    setMusicError(null);
    setMusicLoading(true);
    try {
      const res = await fetch('/api/gemini/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: musicModel,
          prompt: musicPrompt.trim(),
          imageBase64: musicRefImage?.base64,
          imageMimeType: musicRefImage?.mimeType,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.guidance ? `${data.error} — ${data.guidance}` : data.error);
      }
      const url = base64ToBlobUrl(data.audioBase64, data.mimeType || 'audio/wav');
      setMusicAudioUrl(url);
      setMusicLyrics(data.lyrics || '');
    } catch (err) {
      setMusicError(err instanceof Error ? err.message : 'Music generation failed.');
    } finally {
      setMusicLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* Header Band */}
      <section className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-sky-700 mb-1">
              ESK Gemini Engineering &amp; Media Studio
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              AI Advisory, Search, Transcription, Video &amp; Audio
            </h1>
          </div>

          <div
            role="tablist"
            aria-label="AI Studio capabilities"
            className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200"
          >
            {(
              [
                ['chat', 'Advisor Chat', MessageSquare],
                ['search', 'Search Intel', Globe],
                ['transcribe', 'Transcribe Audio', Mic],
                ['video', 'Video Studio', Film],
                ['music', 'Lyria Music', Music],
              ] as [AiTab, string, typeof MessageSquare][]
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                role="tab"
                aria-selected={activeTab === id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 text-sky-700" aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {saveNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg px-4 py-3 text-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{saveNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/portal')}
              className="text-xs font-semibold underline cursor-pointer shrink-0"
            >
              Open Client Portal
            </button>
          </div>
        )}

        {/* TAB 1: MULTI-TURN GEMINI CHATBOT */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 mb-1">
                  Reasoning Model &amp; Persona
                </h2>
                <p className="text-xs text-slate-600">
                  Switch between low-latency Flash, balanced Hydrogen, or deep reasoning Carbon/Neon
                  tiers.
                </p>
              </div>

              <div>
                <label
                  htmlFor="chat-model-select"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Gemini Model
                </label>
                <select
                  id="chat-model-select"
                  value={chatModel}
                  onChange={(e) => setChatModel(e.target.value as ChatModel)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                >
                  {CHAT_MODEL_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} — {m.note}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-semibold text-slate-700">Role Presets</span>
                <div className="space-y-1.5">
                  {SYSTEM_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSystemInstruction(preset.instruction)}
                      className="w-full text-left px-3 py-2 text-xs font-medium bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-lg transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="system-instruction"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  System Instruction
                </label>
                <textarea
                  id="system-instruction"
                  rows={4}
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setChatHistory([]);
                  setChatError(null);
                }}
                className="w-full py-2 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                Reset Conversation Thread
              </button>
            </div>

            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl flex flex-col h-[560px]">
              <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4">
                <div className="text-sm font-bold text-slate-900">
                  Multi-Turn Engineering Session ({chatModel})
                </div>
                {chatHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveToPortal(
                        'chat',
                        `Advisor Session (${chatModel})`,
                        chatHistory
                          .map((t) => `${t.role.toUpperCase()}: ${t.text}`)
                          .join('\n\n')
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-lg cursor-pointer"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Save Session to Portal</span>
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-2 text-slate-500">
                    <MessageSquare className="w-8 h-8 text-sky-700" aria-hidden="true" />
                    <p className="text-sm font-semibold text-slate-800">
                      Ask about Zimbabwe payment architecture, network failover, or project scopes
                    </p>
                    <p className="text-xs leading-relaxed">
                      Example: &ldquo;Design a Paynow + EcoCash webhook handler with PostgreSQL
                      idempotency and T+1 reconciliation.&rdquo;
                    </p>
                  </div>
                ) : (
                  chatHistory.map((turn, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                        turn.role === 'user'
                          ? 'bg-sky-50 border border-sky-200 text-slate-900 ml-8'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 mr-8'
                      }`}
                    >
                      <div className="text-[11px] font-mono font-semibold text-slate-500 mb-1">
                        {turn.role === 'user' ? 'Client Engineer' : turn.model || chatModel}
                      </div>
                      {turn.text}
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
                    <Loader2 className="w-4 h-4 animate-spin text-sky-700" aria-hidden="true" />
                    <span>Generating response via {chatModel}...</span>
                  </div>
                )}
                {chatError && (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{chatError}</span>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSendChat}
                className="p-4 border-t border-slate-200 flex items-center gap-3"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Enter technical question or architecture brief..."
                  className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:opacity-50 rounded-lg cursor-pointer"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE SEARCH GROUNDED INTELLIGENCE */}
        {activeTab === 'search' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Real-Time Google Search Grounding (Gemini 4 Hydrogen)
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Verify regional ISP updates, Zimbabwe fintech regulations, and current software CVEs
                with live web citations.
              </p>
            </div>

            <form onSubmit={handleRunSearch} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask any question needing live web search grounding..."
                className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
              <button
                type="submit"
                disabled={searchLoading || !searchQuery.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:opacity-50 rounded-lg cursor-pointer shrink-0"
              >
                {searchLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Globe className="w-4 h-4" aria-hidden="true" />
                )}
                <span>Search &amp; Ground</span>
              </button>
            </form>

            {searchError && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-sm text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{searchError}</span>
              </div>
            )}

            {searchResult && (
              <div className="space-y-5 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-mono text-slate-500">
                    Grounded Web Intelligence · {searchResult.sources.length} cited source(s)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveToPortal(
                        'search',
                        `Search Brief: ${searchQuery.slice(0, 80)}`,
                        searchResult.text
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-lg cursor-pointer"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Save Brief to Portal</span>
                  </button>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {searchResult.text}
                </div>

                {searchResult.sources.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-700">Verified Web Sources</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {searchResult.sources.map((src, i) => (
                        <a
                          key={`${src.uri}-${i}`}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-3 p-3 bg-white border border-slate-200 hover:border-sky-500 rounded-lg text-xs transition-colors"
                        >
                          <span className="font-medium text-slate-900 truncate">{src.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDIO TRANSCRIPTION */}
        {activeTab === 'transcribe' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Field Audio Transcription (Gemini 3.5 Transcribe)
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Record a live technician voice note from your microphone or upload an `.mp3`,
                `.wav`, or `.webm` client briefing to extract clean text.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-5 space-y-4">
                <div>
                  <label
                    htmlFor="transcribe-prompt"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Transcription Guidance
                  </label>
                  <input
                    id="transcribe-prompt"
                    type="text"
                    value={transcribePrompt}
                    onChange={(e) => setTranscribePrompt(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleToggleRecording}
                    disabled={transcribeLoading}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg cursor-pointer ${
                      recording
                        ? 'bg-rose-700 hover:bg-rose-800 text-white'
                        : 'bg-sky-700 hover:bg-sky-800 text-white'
                    }`}
                  >
                    {recording ? (
                      <>
                        <Square className="w-4 h-4" aria-hidden="true" />
                        <span>Stop &amp; Transcribe</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" aria-hidden="true" />
                        <span>Record Microphone</span>
                      </>
                    )}
                  </button>

                  <label className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer">
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    <span>Upload Audio File</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {audioFileName && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <div className="text-xs font-medium text-slate-700">{audioFileName}</div>
                    {audioPreviewUrl && (
                      <audio controls src={audioPreviewUrl} className="w-full h-9" />
                    )}
                  </div>
                )}
              </div>

              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Transcript Output
                  </span>
                  {transcriptText && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSaveToPortal(
                          'transcription',
                          `Audio Transcript (${audioFileName || 'Field Note'})`,
                          transcriptText
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-lg cursor-pointer"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Save Transcript to Portal</span>
                    </button>
                  )}
                </div>

                {transcribeError && (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{transcribeError}</span>
                  </div>
                )}

                <div className="min-h-[220px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {transcribeLoading ? (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-sky-700" aria-hidden="true" />
                      <span>Transcribing audio with gemini-3.5-transcribe...</span>
                    </div>
                  ) : transcriptText ? (
                    transcriptText
                  ) : (
                    <span className="text-slate-400">
                      Record from your microphone or upload an audio clip to see the full verbatim
                      transcript here.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TEXT-TO-VIDEO & IMAGE-TO-VIDEO */}
        {activeTab === 'video' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Video Generation &amp; Photo Animation (Gemini Omni 1.2 Flash)
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Generate new technical showcase clips from text prompts or animate uploaded hardware
                  and branch photos.
                </p>
              </div>

              <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start">
                <button
                  type="button"
                  onClick={() => setVideoMode('text')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                    videoMode === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Text to Video
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMode('image')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                    videoMode === 'image' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Animate Photo
                </button>
              </div>
            </div>

            <form onSubmit={handleGenerateVideo} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                {videoMode === 'image' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Starting Photo Frame
                    </label>
                    <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-slate-300 hover:border-sky-600 rounded-xl bg-slate-50 cursor-pointer text-xs font-medium text-slate-600">
                      <Upload className="w-4 h-4 text-sky-700" aria-hidden="true" />
                      <span>
                        {videoRefImage ? videoRefImage.name : 'Upload PNG or JPEG starting photo'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleVideoImageSelect}
                        className="hidden"
                      />
                    </label>
                    {videoRefImage && (
                      <img
                        src={videoRefImage.previewUrl}
                        alt="Uploaded starting frame"
                        className="w-full h-36 object-cover rounded-lg border border-slate-200"
                      />
                    )}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="video-prompt"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    {videoMode === 'image' ? 'Motion & Camera Instruction' : 'Scene Prompt'}
                  </label>
                  <textarea
                    id="video-prompt"
                    rows={4}
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="video-aspect"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Aspect Ratio
                    </label>
                    <select
                      id="video-aspect"
                      value={videoAspect}
                      onChange={(e) => setVideoAspect(e.target.value as '16:9' | '9:16')}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                    >
                      <option value="16:9">16:9 Landscape</option>
                      <option value="9:16">9:16 Vertical</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="video-duration"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Clip Duration
                    </label>
                    <select
                      id="video-duration"
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(e.target.value as '5s' | '10s')}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                    >
                      <option value="5s">5 seconds</option>
                      <option value="10s">10 seconds</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={videoLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:opacity-50 rounded-lg cursor-pointer"
                >
                  {videoLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Rendering MP4 (up to 60–120s)...</span>
                    </>
                  ) : (
                    <>
                      <Film className="w-4 h-4" aria-hidden="true" />
                      <span>
                        {videoMode === 'image' ? 'Animate Photo into Video' : 'Generate Video'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              <div className="lg:col-span-7 space-y-3">
                {videoError && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{videoError}</span>
                  </div>
                )}

                <div className="aspect-video bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center text-slate-400 text-sm">
                  {videoUrl ? (
                    <video controls src={videoUrl} className="w-full h-full object-contain" />
                  ) : (
                    <span>Generated 720p MP4 output will render here</span>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: LYRIA MUSIC STUDIO */}
        {activeTab === 'music' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Corporate Audio &amp; Music Composition (Lyria 3)
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Compose original 30-second product launch clips or full-length background tracks from
                text descriptions and optional moodboard images.
              </p>
            </div>

            <form onSubmit={handleGenerateMusic} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <label
                    htmlFor="music-model"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Lyria Model
                  </label>
                  <select
                    id="music-model"
                    value={musicModel}
                    onChange={(e) =>
                      setMusicModel(
                        e.target.value as 'lyria-3-clip-preview' | 'lyria-3-pro-preview'
                      )
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="lyria-3-clip-preview">Lyria 3 Clip (30s Preview Track)</option>
                    <option value="lyria-3-pro-preview">Lyria 3 Pro (Full-Length Track)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="music-prompt"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Style, Instrumentation &amp; Mood Prompt
                  </label>
                  <textarea
                    id="music-prompt"
                    rows={4}
                    value={musicPrompt}
                    onChange={(e) => setMusicPrompt(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer">
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {musicRefImage
                        ? `Reference: ${musicRefImage.name}`
                        : 'Optional Cover / Mood Image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMusicImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={musicLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:opacity-50 rounded-lg cursor-pointer"
                >
                  {musicLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Streaming Audio Composition...</span>
                    </>
                  ) : (
                    <>
                      <Music className="w-4 h-4" aria-hidden="true" />
                      <span>Generate Music Track</span>
                    </>
                  )}
                </button>
              </div>

              <div className="lg:col-span-7 space-y-4">
                {musicError && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{musicError}</span>
                  </div>
                )}

                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="text-xs font-semibold text-slate-700">Master Audio Output</div>
                  {musicAudioUrl ? (
                    <div className="space-y-3">
                      <audio controls src={musicAudioUrl} className="w-full" />
                      <a
                        href={musicAudioUrl}
                        download={`esk-track-${musicModel}.wav`}
                        className="inline-block text-xs font-semibold text-sky-700 hover:underline"
                      >
                        Download Generated Audio File
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Submit a composition prompt to stream and play generated audio directly in
                      your browser.
                    </p>
                  )}

                  {musicLyrics && (
                    <div className="pt-3 border-t border-slate-200">
                      <div className="text-xs font-semibold text-slate-700 mb-1">
                        Generated Track Notes / Lyrics
                      </div>
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                        {musicLyrics}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
