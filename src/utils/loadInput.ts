import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {RenderInternals} from '@remotion/renderer';
import type {
  FitMode,
  ResolvedVideoInput,
  TemplateId,
  TtsConfig,
  VideoInputConfig,
} from '../types';
import {parseSrtFile} from './parseSrt';
import {synthesizeWithSrt} from './pipeline/tts';

const DEFAULT_FPS = 30;
const DEFAULT_WIDTH = 1440;
const DEFAULT_HEIGHT = 1080;
const DEFAULT_FIT_MODE: FitMode = 'cover';
const DEFAULT_TEMPLATE: TemplateId = 'classic-player';

const getAudioDuration = (audioPath: string): number => {
  const ffprobe = RenderInternals.getExecutablePath({
    type: 'ffprobe',
    indent: false,
    logLevel: 'error',
    binariesDirectory: null,
  });
  RenderInternals.makeFileExecutableIfItIsNot(ffprobe);
  const binaryDir = path.dirname(ffprobe);

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
      env: {
        ...process.env,
        PATH: `${binaryDir}${path.delimiter}${process.env.PATH ?? ''}`,
        DYLD_LIBRARY_PATH: `${binaryDir}${path.delimiter}${process.env.DYLD_LIBRARY_PATH ?? ''}`,
        LD_LIBRARY_PATH: `${binaryDir}${path.delimiter}${process.env.LD_LIBRARY_PATH ?? ''}`,
      },
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

export const getProjectRoot = (): string => {
  const fromModule = path.resolve(__dirname, '..', '..');
  if (fs.existsSync(path.join(fromModule, 'package.json'))) {
    return fromModule;
  }

  return process.cwd();
};

const assertFileExists = (filePath: string, label: string): void => {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `${label} file does not exist: ${filePath}\nCheck the path in your JSON input.`,
    );
  }
};

const assertDirectoryExists = (dirPath: string, label: string): void => {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    throw new Error(`${label} directory does not exist: ${dirPath}`);
  }
};

const resolveProjectPath = (projectRoot: string, inputPath: string): string => {
  if (path.isAbsolute(inputPath)) {
    return path.normalize(inputPath);
  }

  return path.resolve(projectRoot, inputPath);
};

const IMAGE_EXTENSIONS = new Set([
  '.apng',
  '.avif',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.webp',
]);

const listImageFiles = (dirPath: string): string[] =>
  fs
    .readdirSync(dirPath, {withFileTypes: true})
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(dirPath, entry.name))
    .filter((filePath) =>
      IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase()),
    )
    .sort((a, b) => a.localeCompare(b));

const readTranscript = (
  transcript: VideoInputConfig['transcript'],
  projectRoot: string,
): {text: string; source: string} => {
  const inlineText = transcript.text?.trim();
  if (inlineText) {
    return {text: inlineText, source: 'inline'};
  }

  const file = transcript.file?.trim();
  if (!file) {
    throw new Error('Configuration is missing transcript.text or transcript.file.');
  }

  const transcriptPath = resolveProjectPath(projectRoot, file);
  assertFileExists(transcriptPath, 'transcript.file');
  const text = fs.readFileSync(transcriptPath, 'utf-8').trim();
  if (!text) {
    throw new Error(`Transcript file is empty: ${transcriptPath}`);
  }

  return {text, source: transcriptPath};
};

const ttsCacheKey = (text: string, tts?: TtsConfig): string =>
  crypto
    .createHash('sha1')
    .update(
      JSON.stringify({
        text,
        apiKey: tts?.apiKey ? 'provided' : undefined,
        resourceId: tts?.resourceId,
        speaker: tts?.speaker,
        audioFormat: tts?.audioFormat,
        sampleRate: tts?.sampleRate,
        subtitleSplit: 'punctuation-v3',
      }),
    )
    .digest('hex')
    .slice(0, 16);

const synthesizeCachedTranscript = async (
  text: string,
  tts: TtsConfig | undefined,
  projectRoot: string,
): Promise<{audioPath: string; srtPath: string; srtContent: string}> => {
  const generatedDir = path.join(projectRoot, 'assets', 'generated');
  const hash = ttsCacheKey(text, tts);
  const audioFormat = tts?.audioFormat || 'mp3';
  const audioPath = path.join(generatedDir, `tts_${hash}.${audioFormat}`);
  const srtPath = path.join(generatedDir, `tts_${hash}.srt`);

  if (
    fs.existsSync(audioPath) &&
    fs.statSync(audioPath).size > 1024 &&
    fs.existsSync(srtPath) &&
    fs.statSync(srtPath).size > 0
  ) {
    return {
      audioPath,
      srtPath,
      srtContent: fs.readFileSync(srtPath, 'utf-8'),
    };
  }

  console.log(`[tts] synthesize transcript (${text.length} chars)`);
  const {audioBuffer, srtContent} = await synthesizeWithSrt(text, tts);
  if (!srtContent.trim()) {
    throw new Error('TTS response did not include usable sentence timestamps.');
  }

  fs.mkdirSync(generatedDir, {recursive: true});
  fs.writeFileSync(audioPath, audioBuffer);
  fs.writeFileSync(srtPath, srtContent, 'utf-8');

  return {audioPath, srtPath, srtContent};
};

export const parseCliInputPath = (argv: string[]): string | null => {
  const inputIndex = argv.findIndex((arg) => arg === '--input');
  if (inputIndex !== -1 && argv[inputIndex + 1]) {
    return argv[inputIndex + 1];
  }

  const inline = argv.find((arg) => arg.startsWith('--input='));
  if (inline) {
    return inline.slice('--input='.length);
  }

  return argv
    .slice(2)
    .find((arg) => !arg.startsWith('-')) ?? null;
};

export const loadInputFromFile = async (
  configPath: string,
  projectRoot: string = getProjectRoot(),
): Promise<ResolvedVideoInput> => {
  const absoluteConfigPath = resolveProjectPath(projectRoot, configPath);

  if (!fs.existsSync(absoluteConfigPath)) {
    throw new Error(`Config file does not exist: ${absoluteConfigPath}`);
  }

  const raw = fs.readFileSync(absoluteConfigPath, 'utf-8');
  let config: VideoInputConfig;

  try {
    config = JSON.parse(raw) as VideoInputConfig;
  } catch {
    throw new Error(`Config file is not valid JSON: ${absoluteConfigPath}`);
  }

  return resolveInput(config, projectRoot);
};

export const resolveInput = async (
  config: VideoInputConfig,
  projectRoot: string = getProjectRoot(),
): Promise<ResolvedVideoInput> => {
  const template = config.template ?? DEFAULT_TEMPLATE;
  const fps = config.render?.fps ?? DEFAULT_FPS;
  const width = config.render?.width ?? DEFAULT_WIDTH;
  const height = config.render?.height ?? DEFAULT_HEIGHT;
  const output = config.render?.output;
  const fitMode = config.templateConfig?.fitMode ?? DEFAULT_FIT_MODE;

  if (!output) {
    throw new Error('Configuration is missing render.output.');
  }

  if (!config.content?.title) {
    throw new Error('Configuration is missing content.title.');
  }

  if (!config.assets?.images) {
    throw new Error('Configuration is missing assets.images.');
  }

  if (!config.transcript) {
    throw new Error('Configuration is missing transcript.');
  }

  if (!config.tts?.apiKey?.trim()) {
    throw new Error('Configuration is missing tts.apiKey.');
  }

  const imagesPath = resolveProjectPath(projectRoot, config.assets.images);
  assertDirectoryExists(imagesPath, 'assets.images');
  const imageFiles = listImageFiles(imagesPath);
  if (imageFiles.length === 0) {
    throw new Error(`assets.images directory has no images: ${imagesPath}`);
  }

  const bgmPath = config.assets.bgm
    ? resolveProjectPath(projectRoot, config.assets.bgm)
    : '';
  if (bgmPath) {
    assertFileExists(bgmPath, 'assets.bgm');
  }

  const {text} = readTranscript(config.transcript, projectRoot);
  const generated = await synthesizeCachedTranscript(text, config.tts, projectRoot);
  const audioDuration = getAudioDuration(generated.audioPath);
  const subtitles = parseSrtFile(generated.srtContent);
  const duration = audioDuration;

  const assetsRoot = path.join(projectRoot, 'assets');
  const toPublicPath = (absolutePath: string) =>
    path.relative(assetsRoot, absolutePath).replace(/\\/g, '/');

  return {
    ...config,
    template,
    fps,
    width,
    height,
    output,
    duration,
    audioDuration,
    fitMode,
    subtitles,
    imagePaths: imageFiles.map(toPublicPath),
    backgroundImagePath: toPublicPath(imageFiles[0]),
    audioPath: toPublicPath(generated.audioPath),
    srtPath: generated.srtPath,
    bgmPath: bgmPath ? toPublicPath(bgmPath) : undefined,
  };
};

export const loadInput = (argv: string[]): Promise<ResolvedVideoInput> => {
  const projectRoot = getProjectRoot();
  const cliPath = parseCliInputPath(argv);
  const configPath = cliPath ?? 'inputs/blue-book-record-player.example.json';
  return loadInputFromFile(configPath, projectRoot);
};
