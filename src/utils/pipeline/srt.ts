type TtsWord = {
  word?: unknown;
  text?: unknown;
  wordText?: unknown;
  word_text?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  start_time?: unknown;
  end_time?: unknown;
};

type TtsSentence = {
  text?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  start_time?: unknown;
  end_time?: unknown;
  words?: TtsWord[];
};

type TimedWord = {
  text: string;
  start: number;
  end: number;
};

type TimedChar = {
  char: string;
  wordIndex: number;
};

const END_PUNCT = '\u3002\uff01\uff1f!?；;';
const CLOSING_QUOTES = '\u201d\u2019\u300d\u300f\u300b\uff09)]';
const SOFT_PUNCT = '\uff0c,\u3001\uff1a:';
const OPENING_QUOTES = '\u201c\u2018\u300c\u300e';
const STRIP_TRAILING = '\uff0c,\u3002.!！?？；;';
const MATCH_IGNORED = `${END_PUNCT}${SOFT_PUNCT}${CLOSING_QUOTES}${OPENING_QUOTES}${STRIP_TRAILING}`;

const formatTimestamp = (seconds: number): string => {
  const totalMillis = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(totalMillis / 3600000);
  const minutes = Math.floor((totalMillis % 3600000) / 60000);
  const secs = Math.floor((totalMillis % 60000) / 1000);
  const millis = totalMillis % 1000;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0',
  )}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
};

const chars = (text: string): string[] => Array.from(text);

const visibleLen = (text: string): number => text.replace(/\s+/g, '').length;

const includesChar = (set: string, char: string): boolean => set.includes(char);

const splitByPunctuation = (text: string): string[] => {
  const source = chars(text);
  const parts: string[] = [];
  let start = 0;
  let i = 0;

  while (i < source.length) {
    if (includesChar(END_PUNCT + SOFT_PUNCT, source[i])) {
      let end = i + 1;
      while (end < source.length && includesChar(CLOSING_QUOTES, source[end])) {
        end += 1;
      }

      const part = source.slice(start, end).join('').trim();
      if (part) {
        parts.push(part);
      }
      start = end;
      i = end;
      continue;
    }

    i += 1;
  }

  const tail = source.slice(start).join('').trim();
  if (tail) {
    parts.push(tail);
  }

  return parts;
};

const stripTrailingChars = (text: string, stripChars: string): string => {
  const source = chars(text);
  while (source.length > 0 && includesChar(stripChars, source[source.length - 1])) {
    source.pop();
  }

  return source.join('');
};

const normalizePart = (part: string): string => {
  if (!part) {
    return part;
  }

  const source = chars(part);
  if (includesChar('\uff1a:', source[source.length - 1])) {
    return part;
  }

  if (includesChar(OPENING_QUOTES, source[0])) {
    return part;
  }

  return stripTrailingChars(part, STRIP_TRAILING);
};

const mergeShortLeads = (parts: string[], maxLeadChars = 4): string[] => {
  const merged: string[] = [];
  let i = 0;

  while (i < parts.length) {
    const current = parts[i];
    const currentChars = chars(current);
    if (
      i + 1 < parts.length &&
      visibleLen(stripTrailingChars(current, STRIP_TRAILING)) <= maxLeadChars &&
      includesChar('\uff0c,\u3001', currentChars[currentChars.length - 1] ?? '')
    ) {
      merged.push(current + parts[i + 1]);
      i += 2;
      continue;
    }

    merged.push(current);
    i += 1;
  }

  return merged;
};

const hasClosingQuote = (text: string): boolean =>
  chars(text).some((char) => includesChar(CLOSING_QUOTES, char));

const mergeInsideQuotes = (parts: string[], maxChars: number): string[] => {
  const merged: string[] = [];
  let inQuote = false;
  let i = 0;

  while (i < parts.length) {
    const current = parts[i];

    if (includesChar(OPENING_QUOTES, chars(current)[0] ?? '')) {
      inQuote = !hasClosingQuote(current);
      merged.push(current);
      i += 1;
      continue;
    }

    if (inQuote && i + 1 < parts.length) {
      const candidate = current + parts[i + 1];
      if (visibleLen(candidate) <= maxChars) {
        merged.push(candidate);
        inQuote = !hasClosingQuote(candidate);
        i += 2;
        continue;
      }
    }

    merged.push(current);
    if (hasClosingQuote(current)) {
      inQuote = false;
    }
    i += 1;
  }

  return merged;
};

const mergeOrphanClosers = (parts: string[]): string[] => {
  const merged: string[] = [];

  for (const part of parts) {
    if (
      merged.length > 0 &&
      chars(part).every((char) => includesChar(CLOSING_QUOTES, char))
    ) {
      merged[merged.length - 1] += part;
    } else {
      merged.push(part);
    }
  }

  return merged;
};

const splitSubtitleText = (text: string, maxChars = 34): string[] => {
  let parts = splitByPunctuation(text.replace(/\s+/g, ''));
  parts = mergeShortLeads(parts);
  parts = mergeInsideQuotes(parts, maxChars);
  parts = mergeOrphanClosers(parts);
  return parts.map(normalizePart).filter(Boolean);
};

const valueToNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const wordText = (word: TtsWord): string =>
  String(word.word ?? word.text ?? word.wordText ?? word.word_text ?? '');

const isMatchChar = (char: string): boolean =>
  !/\s/.test(char) && !includesChar(MATCH_IGNORED, char);

const normalizeForMatch = (text: string): string =>
  chars(text).filter(isMatchChar).join('');

const buildTimedChars = (words: TimedWord[]): TimedChar[] =>
  words.flatMap((word, wordIndex) =>
    chars(word.text)
      .filter(isMatchChar)
      .map((char) => ({char, wordIndex})),
  );

const findPartSpan = (
  timedChars: TimedChar[],
  part: string,
  startCharIndex: number,
): {firstWordIndex: number; lastWordIndex: number; nextCharIndex: number} | null => {
  const target = chars(normalizeForMatch(part));
  if (target.length === 0) {
    return null;
  }

  for (let i = startCharIndex; i <= timedChars.length - target.length; i += 1) {
    const matches = target.every(
      (char, offset) => timedChars[i + offset]?.char === char,
    );
    if (matches) {
      return {
        firstWordIndex: timedChars[i].wordIndex,
        lastWordIndex: timedChars[i + target.length - 1].wordIndex,
        nextCharIndex: i + target.length,
      };
    }
  }

  return null;
};

const consumeTimedWordsByLength = (
  words: TimedWord[],
  startIndex: number,
  part: string,
): {start: number; end: number; nextIndex: number} => {
  const targetLength = Math.max(1, normalizeForMatch(part).length);
  let index = startIndex;
  let consumedLength = 0;
  let start = words[startIndex]?.start ?? 0;
  let end = words[startIndex]?.end ?? start;

  while (index < words.length && consumedLength < targetLength) {
    const word = words[index];
    if (consumedLength === 0) {
      start = word.start;
    }
    consumedLength += Math.max(1, normalizeForMatch(word.text).length);
    end = word.end;
    index += 1;
  }

  return {start, end, nextIndex: index};
};

const sentenceToTimedWords = (sentence: TtsSentence): TimedWord[] => {
  const words = Array.isArray(sentence.words) ? sentence.words : [];
  return words
    .map((word) => {
      const start =
        valueToNumber(word.startTime) ?? valueToNumber(word.start_time);
      const end = valueToNumber(word.endTime) ?? valueToNumber(word.end_time);
      return {
        text: wordText(word),
        start,
        end,
      };
    })
    .filter(
      (word): word is TimedWord =>
        Boolean(word.text) &&
        word.start !== undefined &&
        word.end !== undefined &&
        word.end >= word.start,
    );
};

const hasTimedWords = (sentence: TtsSentence): boolean =>
  sentenceToTimedWords(sentence).length > 0;

const sentenceToEntries = (
  sentence: TtsSentence,
  allowSentenceTimingFallback: boolean,
) => {
  const sentenceText = String(sentence.text ?? '');
  const parts = splitSubtitleText(sentenceText);
  const timedWords = sentenceToTimedWords(sentence);
  const timedChars = buildTimedChars(timedWords);
  let wordIndex = 0;
  let charIndex = 0;

  if (parts.length === 0) {
    return [];
  }

  if (timedWords.length === 0) {
    const start =
      valueToNumber(sentence.startTime) ?? valueToNumber(sentence.start_time);
    const end =
      valueToNumber(sentence.endTime) ?? valueToNumber(sentence.end_time);
    if (
      !allowSentenceTimingFallback ||
      start === undefined ||
      end === undefined ||
      end <= start
    ) {
      return [];
    }

    return parts.map((text) => ({text, start, end}));
  }

  return parts.map((text) => {
    const span = findPartSpan(timedChars, text, charIndex);
    if (span) {
      charIndex = span.nextCharIndex;
      wordIndex = span.lastWordIndex + 1;
      return {
        text,
        start: timedWords[span.firstWordIndex].start,
        end: timedWords[span.lastWordIndex].end,
      };
    }

    const timing = consumeTimedWordsByLength(timedWords, wordIndex, text);
    wordIndex = timing.nextIndex;
    charIndex = buildTimedChars(timedWords.slice(0, wordIndex)).length;
    return {text, start: timing.start, end: timing.end};
  });
};

const dedupeEntries = <T extends {text: string; start: number; end: number}>(
  entries: T[],
): T[] => {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = `${entry.text}\u0000${entry.start.toFixed(3)}\u0000${entry.end.toFixed(3)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const sentencesToSrt = (sentences: TtsSentence[]): string => {
  const hasAnyTimedWords = sentences.some(hasTimedWords);
  const usableSentences = hasAnyTimedWords
    ? sentences.filter(hasTimedWords)
    : sentences;
  const entries = dedupeEntries(
    usableSentences.flatMap((sentence) =>
      sentenceToEntries(sentence, !hasAnyTimedWords),
    ),
  );

  return entries
    .filter((entry) => entry.text && entry.end > entry.start)
    .map(
      (entry, index) =>
        `${index + 1}\n${formatTimestamp(entry.start)} --> ${formatTimestamp(
          entry.end,
        )}\n${entry.text}\n`,
    )
    .join('\n');
};
