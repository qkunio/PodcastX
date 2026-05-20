import React from 'react';
import {Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {ContentConfig, SubtitleCue} from '../../../types';
import {subtitleDefaults} from '../config/layout';
import {ActiveSubtitle} from './ActiveSubtitle';
import {Controls} from './Controls';
import {RecordStack} from './RecordStack';
import {Waveform} from './Waveform';

type BlueStageProps = {
  backgroundImage: string;
  coverImage: string;
  discImage: string;
  content: ContentConfig;
  subtitles: SubtitleCue[];
  duration: number;
  audioDuration: number;
  fps: number;
};

export const BlueStage: React.FC<BlueStageProps> = ({
  backgroundImage,
  coverImage,
  discImage,
  content,
  subtitles,
  duration,
  audioDuration,
  fps,
}) => {
  const frame = useCurrentFrame();
  const {fps: compositionFps} = useVideoConfig();
  const accountLabel = content.subtitle ?? '';
  const accountName =
    accountLabel && !accountLabel.startsWith('@') ? `@ ${accountLabel}` : accountLabel;
  const waveformLeft = 1010;
  const waveformWidth = 640;
  const subtitleWidth = subtitleDefaults.maxWidth;
  const subtitleLeft = waveformLeft + waveformWidth / 2 - subtitleWidth / 2;
  const blinkPhase = (frame % (compositionFps * 2.4)) / (compositionFps * 2.4);
  const redDotOpacity = interpolate(
    blinkPhase,
    [0, 0.35, 0.7, 1],
    [1, 0.24, 1, 1],
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: '#072d8e',
        color: '#fff',
      }}
    >
      <Img
        src={backgroundImage}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'saturate(1.18) contrast(0.92)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(5,26,109,0.75), rgba(20,120,215,0.28) 50%, rgba(0,20,84,0.78))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.15,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 62,
          top: 62,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontFamily: '"Comic Sans MS", "Arial", sans-serif',
          fontSize: 48,
          fontWeight: 900,
          transform: 'rotate(-3deg)',
          textShadow: '0 4px 10px rgba(0,0,0,0.4)',
        }}
      >
        <span>REC</span>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#ff2f2f',
            opacity: redDotOpacity,
            boxShadow: `0 0 ${14 + redDotOpacity * 26}px rgba(255,47,47,0.9)`,
          }}
        />
      </div>
      <RecordStack
        coverImage={coverImage}
        discImage={discImage}
      />
      <div
        style={{
          position: 'absolute',
          left: 824,
          top: 110,
          width: 1010,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
            fontSize: 74,
            fontWeight: 900,
            lineHeight: 1.1,
            color: 'rgba(226,232,246,0.78)',
            letterSpacing: 0,
            textShadow: '0 5px 15px rgba(0,0,0,0.24)',
            overflowWrap: 'anywhere',
          }}
        >
          {content.title}
        </div>
        {content.author ? (
          <div
            style={{
              marginTop: 22,
              fontFamily: '"STKaiti", "KaiTi", "Songti SC", serif',
              fontSize: 34,
              fontWeight: 700,
              color: 'rgba(235,239,252,0.82)',
              textShadow: '0 3px 10px rgba(0,0,0,0.28)',
              overflowWrap: 'anywhere',
            }}
          >
            {content.author}
          </div>
        ) : null}
      </div>
      {accountName ? (
        <div
          style={{
            position: 'absolute',
            left: 190,
            top: 806,
            fontFamily: '"STKaiti", "KaiTi", "Songti SC", serif',
            fontSize: 38,
            fontWeight: 900,
            textShadow: '0 4px 10px rgba(0,0,0,0.42)',
          }}
        >
          {accountName}
        </div>
      ) : null}
      <div style={{position: 'absolute', left: subtitleLeft, top: 492}}>
        <ActiveSubtitle subtitles={subtitles} />
      </div>
      <div style={{position: 'absolute', left: waveformLeft, top: 715}}>
        <Waveform width={waveformWidth} />
      </div>
      <Controls
        duration={audioDuration || duration}
        fps={fps}
      />
    </div>
  );
};
