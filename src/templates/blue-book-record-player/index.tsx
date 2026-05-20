import React from 'react';
import {AbsoluteFill, Audio} from 'remotion';
import type {PodcastXProps} from '../../types';
import {STAGE_HEIGHT, STAGE_WIDTH} from './config/layout';
import {BlueStage} from './components/BlueStage';
import {ConfigError} from './components/ConfigError';
import {toStaticSrc} from './utils/media';

export const BlueBookRecordPlayer: React.FC<PodcastXProps> = ({
  imagePaths,
  backgroundImagePath,
  audioPath,
  content,
  subtitles,
  width,
  height,
  duration,
  audioDuration,
  fps,
}) => {
  const backgroundPath = imagePaths?.[0] ?? backgroundImagePath;
  const coverPath = imagePaths?.[1] ?? backgroundPath;
  const discPath = imagePaths?.[2] ?? coverPath;

  if (!backgroundPath || !coverPath || !discPath || !audioPath) {
    const missing = [
      !backgroundPath ? 'imagePaths[0] background image' : null,
      !coverPath ? 'imagePaths[1] book cover image' : null,
      !discPath ? 'imagePaths[2] rotating disc image' : null,
      !audioPath ? 'audio' : null,
    ].filter(Boolean);

    return (
      <ConfigError
        message={`Blue book record player missing required asset:\n${missing.join('\n')}`}
      />
    );
  }

  const scale = Math.min(width / STAGE_WIDTH, height / STAGE_HEIGHT);

  return (
    <AbsoluteFill style={{backgroundColor: '#04134a', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center',
        }}
      >
        <BlueStage
          backgroundImage={toStaticSrc(backgroundPath)}
          coverImage={toStaticSrc(coverPath)}
          discImage={toStaticSrc(discPath)}
          content={content}
          subtitles={subtitles}
          duration={duration}
          audioDuration={audioDuration}
          fps={fps}
        />
      </div>
      <Audio src={toStaticSrc(audioPath)} />
    </AbsoluteFill>
  );
};
