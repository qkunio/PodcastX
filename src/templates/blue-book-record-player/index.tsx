import React from 'react';
import {AbsoluteFill, Audio} from 'remotion';
import type {PodcastXProps} from '../../types';
import {STAGE_HEIGHT, STAGE_WIDTH} from './config/layout';
import {BlueStage} from './components/BlueStage';
import {ConfigError} from './components/ConfigError';
import {toStaticSrc} from './utils/media';

export const BlueBookRecordPlayer: React.FC<PodcastXProps> = ({
  assetPaths,
  audioPath,
  content,
  subtitles,
  width,
  height,
  duration,
  audioDuration,
  fps,
}) => {
  const backgroundPath = assetPaths.background;
  const coverPath = assetPaths.cover ?? assetPaths.album_img ?? backgroundPath;
  const discPath = assetPaths.disc ?? assetPaths.disc_img ?? coverPath;

  if (!backgroundPath || !coverPath || !discPath || !audioPath) {
    const missing = [
      !backgroundPath ? 'assets.background' : null,
      !coverPath ? 'assets.cover or assets.album_img' : null,
      !discPath ? 'assets.disc or assets.disc_img' : null,
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
