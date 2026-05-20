export type FitMode = 'cover' | 'contain' | 'fill';

export type TemplateId =
  | 'blue-book-record-player'
  | 'classic-player';

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
  images: string;
  bgm?: string;
};

export type TranscriptConfig = {
  text?: string;
  file?: string;
};

export type TtsConfig = {
  apiKey: string;
  resourceId?: string;
  speaker?: string;
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
  imagePaths: string[];
  /** 相對 assets 目錄的路徑，供 staticFile() 使用 */
  backgroundImagePath: string;
  audioPath: string;
  srtPath: string;
  bgmPath?: string;
};

export type PodcastXProps = ResolvedVideoInput;
