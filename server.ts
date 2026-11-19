import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality, type Content } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const ALLOWED_CHAT_MODELS = new Set([
  'gemini-4-carbon',
  'gemini-4-neon',
  'gemini-4-hydrogen',
  'gemini-3.1-flash-lite',
]);
const ALLOWED_MUSIC_MODELS = new Set([
  'lyria-3-clip-preview',
  'lyria-3-pro-preview',
]);

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function sendGeminiError(res: Response, err: unknown, modelName?: string) {
  const message =
    err instanceof Error ? err.message : 'Unexpected server error calling Gemini API.';
  const rawStatus =
    typeof err === 'object' && err !== null && 'status' in err
      ? Number((err as { status?: unknown }).status)
      : 0;

  let httpStatus = rawStatus >= 400 && rawStatus < 600 ? rawStatus : 500;
  if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
    httpStatus = 429;
  } else if (message.includes('403') || message.includes('PERMISSION_DENIED')) {
    httpStatus = 403;
  } else if (message.includes('GEMINI_API_KEY is not configured')) {
    httpStatus = 503;
  }

  const needsPaidKey =
    httpStatus === 429 ||
    httpStatus === 403 ||
    /quota|billing|paid|permission/i.test(message);

  res.status(httpStatus).json({
    error: message,
    model: modelName ?? null,
    needsPaidKey,
    guidance: needsPaidKey
      ? 'This model requires a billing-enabled GEMINI_API_KEY configured in AI Studio Settings > Secrets.'
      : undefined,
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '35mb' }));

  // Public runtime configuration (Google Maps JS API key if injected via environment)
  app.get('/api/config/public', (_req: Request, res: Response) => {
    const mapsApiKey =
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      '';
    res.json({ mapsApiKey });
  });

  // 1. Multi-turn Gemini Chatbot
  app.post('/api/gemini/chat', async (req: Request, res: Response) => {
    const model =
      typeof req.body?.model === 'string' && ALLOWED_CHAT_MODELS.has(req.body.model)
        ? req.body.model
        : 'gemini-4-hydrogen';
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    const systemInstruction =
      typeof req.body?.systemInstruction === 'string' && req.body.systemInstruction.trim()
        ? req.body.systemInstruction.trim()
        : 'You are ESK Systems Senior Engineering Advisor in Harare, Zimbabwe. Answer clearly, accurately, and concisely on enterprise IT infrastructure, Zimbabwe fintech rails (Paynow, EcoCash, OneMoney, Stripe), fiber networking, hardware diagnostics, and software architecture.';

    if (!message) {
      res.status(400).json({ error: 'Message text is required.' });
      return;
    }

    const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];
    const history: Content[] = rawHistory
      .filter(
        (turn: unknown): turn is { role: 'user' | 'model'; text: string } =>
          typeof turn === 'object' &&
          turn !== null &&
          ('role' in turn ? turn.role === 'user' || turn.role === 'model' : false) &&
          'text' in turn &&
          typeof turn.text === 'string' &&
          turn.text.trim().length > 0
      )
      .map((turn: { role: 'user' | 'model'; text: string }) => ({
        role: turn.role,
        parts: [{ text: turn.text }],
      }));

    try {
      const ai = getAiClient();
      const chat = ai.chats.create({
        model,
        history,
        config: {
          systemInstruction,
        },
      });
      const response = await chat.sendMessage({ message });
      res.json({
        text: response.text ?? '',
        model,
      });
    } catch (err) {
      sendGeminiError(res, err, model);
    }
  });

  // 2. Google Search Grounded Intelligence
  app.post('/api/gemini/search', async (req: Request, res: Response) => {
    const query = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
    if (!query) {
      res.status(400).json({ error: 'Search query is required.' });
      return;
    }

    const model = 'gemini-4-hydrogen';
    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model,
        contents: query,
        config: {
          systemInstruction:
            'Provide accurate, well-structured answers grounded in current web search results for IT engineers and business leaders in Zimbabwe and SADC.',
          tools: [{ googleSearch: {} }],
        },
      });

      const metadata = response.candidates?.[0]?.groundingMetadata;
      const rawChunks = metadata?.groundingChunks ?? [];
      const sources = rawChunks
        .map((chunk) => ({
          title: chunk.web?.title || chunk.web?.uri || 'Web Source',
          uri: chunk.web?.uri || '',
        }))
        .filter((s) => Boolean(s.uri));

      res.json({
        text: response.text ?? '',
        sources,
        webSearchQueries: metadata?.webSearchQueries ?? [],
        model,
      });
    } catch (err) {
      sendGeminiError(res, err, model);
    }
  });

  // 3. Audio Transcription (Microphone or Uploaded File)
  app.post('/api/gemini/transcribe', async (req: Request, res: Response) => {
    const audioBase64 =
      typeof req.body?.audioBase64 === 'string' ? req.body.audioBase64.trim() : '';
    const mimeType =
      typeof req.body?.mimeType === 'string' && req.body.mimeType.startsWith('audio/')
        ? req.body.mimeType
        : 'audio/webm';
    const prompt =
      typeof req.body?.prompt === 'string' && req.body.prompt.trim()
        ? req.body.prompt.trim()
        : 'Transcribe this audio accurately with clear punctuation.';

    if (!audioBase64) {
      res.status(400).json({ error: 'Audio data is required for transcription.' });
      return;
    }

    const model = 'gemini-3.5-transcribe';
    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
            { text: prompt },
          ],
        },
      });
      res.json({
        text: response.text ?? '',
        model,
      });
    } catch (err) {
      sendGeminiError(res, err, model);
    }
  });

  // 4. Music Generation (Lyria Clip & Lyria Pro)
  app.post('/api/gemini/music', async (req: Request, res: Response) => {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    const model =
      typeof req.body?.model === 'string' && ALLOWED_MUSIC_MODELS.has(req.body.model)
        ? req.body.model
        : 'lyria-3-clip-preview';
    const imageBase64 =
      typeof req.body?.imageBase64 === 'string' ? req.body.imageBase64.trim() : '';
    const imageMimeType =
      typeof req.body?.imageMimeType === 'string' && req.body.imageMimeType.startsWith('image/')
        ? req.body.imageMimeType
        : 'image/jpeg';

    if (!prompt) {
      res.status(400).json({ error: 'Music prompt is required.' });
      return;
    }

    try {
      const ai = getAiClient();
      const contents = imageBase64
        ? {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: imageBase64,
                  mimeType: imageMimeType,
                },
              },
            ],
          }
        : prompt;

      const stream = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          responseModalities: [Modality.AUDIO],
        },
      });

      let audioBase64 = '';
      let lyrics = '';
      let mimeType = 'audio/wav';

      for await (const chunk of stream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyrics) {
            lyrics = part.text;
          }
        }
      }

      if (!audioBase64) {
        res.status(502).json({
          error: 'No audio data returned by Lyria.',
          model,
        });
        return;
      }

      res.json({
        audioBase64,
        mimeType,
        lyrics,
        model,
      });
    } catch (err) {
      sendGeminiError(res, err, model);
    }
  });

  // 5. Text-to-Video & Image-to-Video (Gemini Omni Flash)
  app.post('/api/gemini/video', async (req: Request, res: Response) => {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    const aspectRatio = req.body?.aspectRatio === '9:16' ? '9:16' : '16:9';
    const rawDuration = typeof req.body?.duration === 'string' ? req.body.duration : '5s';
    const allowedDurations = new Set([
      '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', '11s', '12s', '13s', '14s', '15s',
    ]);
    const duration = allowedDurations.has(rawDuration) ? rawDuration : '5s';
    const resolution =
      req.body?.resolution === '360p' ||
      req.body?.resolution === '1080p' ||
      req.body?.resolution === '720p'
        ? req.body.resolution
        : '720p';

    const imageBase64 =
      typeof req.body?.imageBase64 === 'string' ? req.body.imageBase64.trim() : '';
    const imageMimeType =
      typeof req.body?.imageMimeType === 'string' && req.body.imageMimeType.startsWith('image/')
        ? req.body.imageMimeType
        : 'image/png';

    if (!prompt) {
      res.status(400).json({ error: 'Video motion or scene prompt is required.' });
      return;
    }

    const model = 'gemini-omni-1.2-flash';
    try {
      const ai = getAiClient();
      const input = imageBase64
        ? [
            {
              type: 'image' as const,
              mime_type: imageMimeType,
              data: imageBase64,
            },
            {
              type: 'text' as const,
              text: prompt,
            },
          ]
        : prompt;

      const interaction = await ai.interactions.create(
        {
          model,
          input,
          background: false,
          store: false,
          stream: false,
          response_format: {
            type: 'video',
            aspect_ratio: aspectRatio,
            duration,
            resolution,
          },
        },
        { timeout: 300000 }
      );

      const videoPart = interaction.output_video;
      if (!videoPart?.data) {
        res.status(502).json({
          error: 'Video generation completed without returning video bytes.',
          model,
        });
        return;
      }

      res.json({
        videoBase64: videoPart.data,
        mimeType: videoPart.mime_type || 'video/mp4',
        model,
      });
    } catch (err) {
      sendGeminiError(res, err, model);
    }
  });

  // Frontend serving (Vite middleware in dev, static dist in production)
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ESK Systems server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ESK Systems server:', err);
  process.exit(1);
});
