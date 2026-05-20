import type {SubtitleCue} from '../types';

const TIME_LINE =
  /(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})\s*-->\s*(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})/;

const toMs = (
  h: string,
  m: string,
  s: string,
  ms: string,
): number => {
  const hours = Number(h);
  const minutes = Number(m);
  const seconds = Number(s);
  let millis = Number(ms);
  if (ms.length === 2) {
    millis *= 10;
  } else if (ms.length === 1) {
    millis *= 100;
  }

  return (
    hours * 3600000 + minutes * 60000 + seconds * 1000 + millis
  );
};

const normalizeNewlines = (content: string): string =>
  content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

/**
 * 容错解析 SRT 字幕文件内容
 */
export const parseSrt = (content: string): SubtitleCue[] => {
  const normalized = normalizeNewlines(content);
  if (!normalized) {
    return [];
  }

  const blocks = normalized.split(/\n\n+/);
  const cues: SubtitleCue[] = [];

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      continue;
    }

    let indexLine = 0;
    let id = cues.length + 1;

    if (/^\d+$/.test(lines[0])) {
      id = Number(lines[0]) || id;
      indexLine = 1;
    }

    const timeLine = lines[indexLine];
    const match = timeLine.match(TIME_LINE);

    if (!match) {
      continue;
    }

    const startMs = toMs(match[1], match[2], match[3], match[4]);
    const endMs = toMs(match[5], match[6], match[7], match[8]);

    if (endMs <= startMs) {
      continue;
    }

    const text = lines.slice(indexLine + 1).join('\n').trim();
    if (!text) {
      continue;
    }

    cues.push({id, startMs, endMs, text});
  }

  return cues.sort((a, b) => a.startMs - b.startMs);
};

export const parseSrtFile = (content: string): SubtitleCue[] =>
  parseSrt(content);
