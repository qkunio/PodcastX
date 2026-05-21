export type FitMode = 'cover' | 'contain' | 'fill';

export type TemplateId =
  | 'blue-book-record-player'
  | 'classic-player'
  | 'dialogue-podcast';

export type SubtitleStyleConfig = {
  bottom?: number;
  fontSize?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  maxWidth?: number;
  fontWeight?: number;
};

export type SubtitleCue = {
  id: number;
  startMs: number;
  endMs: number;
  text: string;
  speaker?: string;
};

export type RenderConfig = {
  fps?: number;
  width?: number;
  height?: number;
  output: string;
};

export type ContentConfig = {
  title: string;
  subtitle?: string;
  author?: string;
};

export type AssetsConfig = {
  bgm?: string;
  [assetName: string]: string | undefined;
};

export type TranscriptConfig = {
  text?: string;
  file?: string;
};

export type TtsConfig = {
  apiKey: string;
  resourceId?: string;
  speaker?: string;
  speakers?: Record<string, string>;
  audioFormat?: string;
  sampleRate?: number;
};

export type AudioMixConfig = {
  bgmVolume?: number;
};

export type TemplateConfig = {
  fitMode?: FitMode;
};

export type VideoInputConfig = {
  template?: TemplateId;
  render: RenderConfig;
  content: ContentConfig;
  assets: AssetsConfig;
  transcript: TranscriptConfig;
  tts?: TtsConfig;
  audioMix?: AudioMixConfig;
  templateConfig?: TemplateConfig;
};

export type ResolvedVideoInput = VideoInputConfig & {
  template: TemplateId;
  fps: number;
  width: number;
  height: number;
  output: string;
  duration: number;
  audioDuration: number;
  fitMode: FitMode;
  subtitles: SubtitleCue[];
  /** Paths relative to the assets directory, for use with staticFile(). */
  assetPaths: Record<string, string>;
  audioPath: string;
  srtPath: string;
  bgmPath?: string;
};

export type PodcastXProps = ResolvedVideoInput;
