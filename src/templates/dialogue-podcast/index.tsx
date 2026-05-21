import React from 'react';
import {AbsoluteFill, Audio, Img} from 'remotion';
import type {PodcastXProps} from '../../types';
import {ActiveSubtitle} from './components/ActiveSubtitle';
import {Waveform} from './components/Waveform';
import {toStaticSrc} from './utils/media';

export const DialoguePodcast: React.FC<PodcastXProps> = ({
  assetPaths,
  audioPath,
  content,
  subtitles,
}) => {
  const backgroundPath = assetPaths.background;

  if (!backgroundPath || !audioPath) {
    return (
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111',
          color: '#fff',
          fontFamily: 'Arial, sans-serif',
          fontSize: 36,
          whiteSpace: 'pre-line',
        }}
      >
        Dialogue podcast missing required assets.background or audio.
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{backgroundColor: '#111', overflow: 'hidden'}}>
      <Img
        src={toStaticSrc(backgroundPath)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.18) 42%, rgba(0,0,0,0.62) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 72,
          right: 120,
          color: '#fff',
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
          textAlign: 'center',
          textShadow: '0 6px 22px rgba(0,0,0,0.42)',
        }}
      >
        <div
          style={{
            fontSize: 82,
            fontWeight: 900,
            lineHeight: 1.06,
            maxWidth: 1400,
            margin: '0 auto',
            overflowWrap: 'anywhere',
          }}
        >
          {content.title}
        </div>
        {content.subtitle ?? content.author ? (
          <div
            style={{
              marginTop: 18,
              fontSize: 34,
              fontWeight: 700,
              lineHeight: 1.2,
              color: 'rgba(255,255,255,0.82)',
              maxWidth: 980,
              marginLeft: 'auto',
              marginRight: 'auto',
              overflowWrap: 'anywhere',
            }}
          >
            {content.subtitle ?? content.author}
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '52%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Waveform />
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 118,
          transform: 'translateX(-50%)',
        }}
      >
        <ActiveSubtitle subtitles={subtitles} />
      </div>
      <Audio src={toStaticSrc(audioPath)} />
    </AbsoluteFill>
  );
};
