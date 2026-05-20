import crypto from 'node:crypto';
import {sentencesToSrt} from './srt';

const TTS_URL = 'https://openspeech.bytedance.com/api/v3/tts/unidirectional';
const CODE_AUDIO_CHUNK = 0;
const CODE_SUCCESS = 20000000;

type TtsStreamResponse = {
  code?: number;
  message?: string;
  data?: string | null;
  sentence?: Record<string, unknown>;
};

type SynthesizeOptions = {
  apiKey?: string;
  resourceId?: string;
  speaker?: string;
  audioFormat?: string;
  sampleRate?: number;
};

const requireOption = (
  options: SynthesizeOptions,
  name: keyof SynthesizeOptions,
): string => {
  const value = options[name];
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  throw new Error(`tts.${name} is required in the input JSON.`);
};

const ttsConfig = (options: SynthesizeOptions) => ({
  apiKey: requireOption(options, 'apiKey'),
  resourceId: options.resourceId?.trim() || 'seed-tts-2.0',
  speaker: options.speaker?.trim() || 'zh_male_xuanyijieshuo_uranus_bigtts',
});

const parseJsonLines = (text: string): TtsStreamResponse[] =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as TtsStreamResponse);

const parseChunkedJson = async (
  response: Response,
): Promise<TtsStreamResponse[]> => {
  const text = await response.text();
  return parseJsonLines(text);
};

export const synthesizeWithSrt = async (
  text: string,
  options: SynthesizeOptions = {},
): Promise<{audioBuffer: Buffer; srtContent: string}> => {
  const config = ttsConfig(options);
  const requestId = crypto.randomUUID();

  const response = await fetch(TTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': config.apiKey,
      'X-Api-Resource-Id': config.resourceId,
      'X-Api-Request-Id': requestId,
    },
    body: JSON.stringify({
      user: {uid: 'xpodcast'},
      namespace: 'BidirectionalTTS',
      req_params: {
        text,
        speaker: config.speaker,
        audio_params: {
          format: options.audioFormat || 'mp3',
          sample_rate: options.sampleRate ?? 24000,
          enable_subtitle: true,
        },
      },
    }),
  });

  const logId = response.headers.get('X-Tt-Logid');
  if (!response.ok) {
    throw new Error(
      `TTS request failed: HTTP ${response.status}${
        logId ? `, logid ${logId}` : ''
      }\n${await response.text()}`,
    );
  }

  const chunks = await parseChunkedJson(response);
  const audioParts: Buffer[] = [];
  const sentences: Record<string, unknown>[] = [];

  for (const chunk of chunks) {
    if (chunk.code === CODE_AUDIO_CHUNK && chunk.data) {
      audioParts.push(Buffer.from(chunk.data, 'base64'));
      continue;
    }

    if (chunk.sentence) {
      sentences.push(chunk.sentence);
      continue;
    }

    if (chunk.code === CODE_SUCCESS) {
      continue;
    }

    throw new Error(
      `TTS stream failed${logId ? `, logid ${logId}` : ''}: ${JSON.stringify(
        chunk,
      )}`,
    );
  }

  const audioBuffer = Buffer.concat(audioParts);
  if (audioBuffer.length === 0) {
    throw new Error(`TTS response did not include audio${logId ? `, logid ${logId}` : ''}.`);
  }

  return {
    audioBuffer,
    srtContent: sentencesToSrt(sentences),
  };
};
