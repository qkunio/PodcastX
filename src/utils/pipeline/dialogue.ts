import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
import {RenderInternals} from '@remotion/renderer';
import type {SubtitleCue, TtsConfig} from '../../types';
import {parseSrt} from '../parseSrt';
import {synthesizeWithSrt} from './tts';

export type DialogueTurn = {
  speaker: string;
  text: string;
};

const SPEAKER_LINE = /^\s*\[([a-zA-Z0-9_-]+)\]\s*(.*)$/;

export const parseDialogueTranscript = (text: string): DialogueTurn[] => {
  const turns: DialogueTurn[] = [];
  let current: DialogueTurn | null = null;

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(SPEAKER_LINE);
    if (match) {
      if (current?.text.trim()) {
        turns.push({speaker: current.speaker, text: current.text.trim()});
      }

      current = {
        speaker: match[1],
        text: match[2].trim(),
      };
      continue;
    }

    if (current && line.trim()) {
      current.text = `${current.text}\n${line.trim()}`.trim();
    }
  }

  if (current?.text.trim()) {
    turns.push({speaker: current.speaker, text: current.text.trim()});
  }

  return turns;
};

const formatTimestamp = (ms: number): string => {
  const totalMillis = Math.max(0, Math.round(ms));
  const hours = Math.floor(totalMillis / 3600000);
  const minutes = Math.floor((totalMillis % 3600000) / 60000);
  const seconds = Math.floor((totalMillis % 60000) / 1000);
  const millis = totalMillis % 1000;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0',
  )}:${String(seconds).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
};

export const cuesToSrt = (cues: SubtitleCue[]): string =>
  cues
    .map(
      (cue, index) =>
        `${index + 1}\n${formatTimestamp(cue.startMs)} --> ${formatTimestamp(
          cue.endMs,
        )}\n${cue.text}\n`,
    )
    .join('\n');

const executableEnv = (binaryPath: string) => {
  const binaryDir = path.dirname(binaryPath);

  return {
    ...process.env,
    PATH: `${binaryDir}${path.delimiter}${process.env.PATH ?? ''}`,
    DYLD_LIBRARY_PATH: `${binaryDir}${path.delimiter}${process.env.DYLD_LIBRARY_PATH ?? ''}`,
    LD_LIBRARY_PATH: `${binaryDir}${path.delimiter}${process.env.LD_LIBRARY_PATH ?? ''}`,
  };
};

export const getMediaDuration = (audioPath: string): number => {
  const ffprobe = RenderInternals.getExecutablePath({
    type: 'ffprobe',
    indent: false,
    logLevel: 'error',
    binariesDirectory: null,
  });
  RenderInternals.makeFileExecutableIfItIsNot(ffprobe);

  const result = spawnSync(
    ffprobe,
    [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      audioPath,
    ],
    {
      encoding: 'utf-8',
      env: executableEnv(ffprobe),
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `Unable to read audio duration: ${audioPath}\n${result.stderr || result.stdout}`,
    );
  }

  const duration = Number.parseFloat(result.stdout.trim());
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Invalid audio duration: ${audioPath}`);
  }

  return duration;
};

const concatAudio = (segmentPaths: string[], outputPath: string): void => {
  const ffmpeg = RenderInternals.getExecutablePath({
    type: 'ffmpeg',
    indent: false,
    logLevel: 'error',
    binariesDirectory: null,
  });
  RenderInternals.makeFileExecutableIfItIsNot(ffmpeg);

  const concatPath = `${outputPath}.concat.txt`;
  const concatContent = segmentPaths
    .map((segmentPath) => {
      const normalized = path.resolve(segmentPath).replace(/\\/g, '/');
      return `file '${normalized.replace(/'/g, "'\\''")}'`;
    })
    .join('\n');

  fs.writeFileSync(concatPath, `${concatContent}\n`, 'utf-8');

  const result = spawnSync(
    ffmpeg,
    [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      concatPath,
      '-c',
      'copy',
      outputPath,
    ],
    {
      encoding: 'utf-8',
      env: executableEnv(ffmpeg),
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `Unable to concatenate dialogue audio.\n${result.stderr || result.stdout}`,
    );
  }
};

const dialogueCacheKey = (turns: DialogueTurn[], tts: TtsConfig): string =>
  crypto
    .createHash('sha1')
    .update(
      JSON.stringify({
        turns,
        apiKey: tts.apiKey ? 'provided' : undefined,
        resourceId: tts.resourceId,
        speaker: tts.speaker,
        speakers: tts.speakers,
        audioFormat: tts.audioFormat,
        sampleRate: tts.sampleRate,
        subtitleSplit: 'punctuation-v3',
        mode: 'dialogue-v1',
      }),
    )
    .digest('hex')
    .slice(0, 16);

export const synthesizeCachedDialogue = async (
  turns: DialogueTurn[],
  tts: TtsConfig,
  projectRoot: string,
): Promise<{
  audioPath: string;
  srtPath: string;
  srtContent: string;
  subtitles: SubtitleCue[];
}> => {
  const generatedDir = path.join(projectRoot, 'assets', 'generated');
  const hash = dialogueCacheKey(turns, tts);
  const audioFormat = tts.audioFormat || 'mp3';
  const audioPath = path.join(generatedDir, `dialogue_${hash}.${audioFormat}`);
  const srtPath = path.join(generatedDir, `dialogue_${hash}.srt`);
  const subtitlesPath = path.join(generatedDir, `dialogue_${hash}.subtitles.json`);

  if (
    fs.existsSync(audioPath) &&
    fs.statSync(audioPath).size > 1024 &&
    fs.existsSync(srtPath) &&
    fs.statSync(srtPath).size > 0 &&
    fs.existsSync(subtitlesPath) &&
    fs.statSync(subtitlesPath).size > 0
  ) {
    return {
      audioPath,
      srtPath,
      srtContent: fs.readFileSync(srtPath, 'utf-8'),
      subtitles: JSON.parse(
        fs.readFileSync(subtitlesPath, 'utf-8'),
      ) as SubtitleCue[],
    };
  }

  fs.mkdirSync(generatedDir, {recursive: true});

  const segmentPaths: string[] = [];
  const cues: SubtitleCue[] = [];
  let offsetMs = 0;

  for (const [index, turn] of turns.entries()) {
    const speaker = tts.speakers?.[turn.speaker] ?? tts.speaker;
    if (!speaker?.trim()) {
      throw new Error(
        `Missing TTS speaker for [${turn.speaker}]. Add tts.speakers.${turn.speaker} in the input JSON.`,
      );
    }

    console.log(
      `[tts] synthesize dialogue turn ${index + 1}/${turns.length} [${turn.speaker}] (${turn.text.length} chars)`,
    );

    const {audioBuffer, srtContent} = await synthesizeWithSrt(turn.text, {
      ...tts,
      speaker,
    });
    if (!srtContent.trim()) {
      throw new Error(
        `TTS response did not include usable sentence timestamps for [${turn.speaker}].`,
      );
    }

    const segmentPath = path.join(
      generatedDir,
      `dialogue_${hash}_${String(index + 1).padStart(3, '0')}.${audioFormat}`,
    );
    fs.writeFileSync(segmentPath, audioBuffer);
    segmentPaths.push(segmentPath);

    for (const cue of parseSrt(srtContent)) {
      cues.push({
        ...cue,
        id: cues.length + 1,
        startMs: cue.startMs + offsetMs,
        endMs: cue.endMs + offsetMs,
        speaker: turn.speaker,
      });
    }

    offsetMs += Math.round(getMediaDuration(segmentPath) * 1000);
  }

  concatAudio(segmentPaths, audioPath);
  const srtContent = cuesToSrt(cues);
  fs.writeFileSync(srtPath, srtContent, 'utf-8');
  fs.writeFileSync(subtitlesPath, `${JSON.stringify(cues, null, 2)}\n`, 'utf-8');

  return {audioPath, srtPath, srtContent, subtitles: cues};
};
