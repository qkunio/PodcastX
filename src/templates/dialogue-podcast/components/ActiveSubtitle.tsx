import React, {useMemo} from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SubtitleCue} from '../../../types';

type ActiveSubtitleProps = {
  subtitles: SubtitleCue[];
};

const getActiveCue = (
  cues: SubtitleCue[],
  timeMs: number,
): {cue: SubtitleCue; fade: number} | null => {
  for (const cue of cues) {
    if (timeMs >= cue.startMs && timeMs < cue.endMs) {
      const fadeIn = interpolate(timeMs, [cue.startMs, cue.startMs + 160], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      const fadeOut = interpolate(timeMs, [cue.endMs - 160, cue.endMs], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

      return {cue, fade: Math.min(fadeIn, fadeOut)};
    }
  }

  return null;
};

const speakerLabel = (speaker?: string): string => {
  if (!speaker) {
    return '';
  }

  return speaker.replace(/[-_]+/g, ' ').toUpperCase();
};

export const ActiveSubtitle: React.FC<ActiveSubtitleProps> = ({subtitles}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const timeMs = (frame / fps) * 1000;
  const active = useMemo(
    () => getActiveCue(subtitles, timeMs),
    [subtitles, timeMs],
  );

  if (!active) {
    return null;
  }

  return (
    <div
      style={{
        width: 1180,
        minHeight: 188,
        opacity: active.fade,
        textAlign: 'center',
      }}
    >
      {active.cue.speaker ? (
        <div
          style={{
            marginBottom: 18,
            color: 'rgba(255,255,255,0.72)',
            fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 0,
          }}
        >
          {speakerLabel(active.cue.speaker)}
        </div>
      ) : null}
      {active.cue.text.split('\n').map((line, index) => (
        <div
          key={`${active.cue.id}-${index}`}
          style={{
            color: '#fff',
            fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
            fontSize: 60,
            fontWeight: 900,
            lineHeight: 1.2,
            WebkitTextStroke: '2px rgba(0,0,0,0.42)',
            paintOrder: 'stroke fill',
            textShadow: '0 8px 24px rgba(0,0,0,0.5)',
            overflowWrap: 'anywhere',
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};
