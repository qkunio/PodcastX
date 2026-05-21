import React from 'react';
import {AbsoluteFill, Audio} from 'remotion';
import type {PodcastXProps} from '../../types';
import {Background} from './components/Background';
import {ConfigError} from './components/ConfigError';
import {CoverCard} from './components/CoverCard';
import {Disc} from './components/Disc';
import {PlayerControls} from './components/PlayerControls';
import {Subtitle} from './components/Subtitle';
import {TitleText} from './components/TitleText';
import {ToneArm} from './components/ToneArm';
import {WaveBars} from './components/WaveBars';
import {toStaticSrc} from './utils/media';

export const ClassicPlayer: React.FC<PodcastXProps> = (props) => {
  const {
    assetPaths,
    audioPath,
    content,
    fitMode,
    width,
    height,
    subtitles,
  } = props;

  const primaryImagePath = assetPaths.background;

  if (!primaryImagePath || !audioPath) {
    const lines = [];
    if (!primaryImagePath) {
      lines.push('assets.background is missing.');
    }
    if (!audioPath) {
      lines.push('TTS audio was not generated.');
    }
    lines.push('');
    lines.push('Check assets.background, transcript, and tts settings before rendering.');

    return <ConfigError message={lines.join('\n')} />;
  }

  const backgroundSrc = toStaticSrc(primaryImagePath);
  const audioSrc = toStaticSrc(audioPath);

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Background backgroundImage={backgroundSrc} fitMode={fitMode} />
      <CoverCard
        backgroundImage={backgroundSrc}
        fitMode={fitMode}
        width={width}
        height={height}
      />
      <Disc
        backgroundImage={backgroundSrc}
        fitMode={fitMode}
        width={width}
        height={height}
      />
      <ToneArm width={width} height={height} />
      <TitleText
        title={content.title}
        subtitle={content.subtitle ?? content.author ?? ''}
        width={width}
        height={height}
      />
      <Subtitle
        subtitles={subtitles}
        width={width}
        height={height}
      />
      <WaveBars width={width} height={height} />
      <PlayerControls width={width} height={height} />
      <Audio src={audioSrc} />
    </AbsoluteFill>
  );
};
