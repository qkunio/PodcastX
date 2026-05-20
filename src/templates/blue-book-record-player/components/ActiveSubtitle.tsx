import React, {useMemo} from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SubtitleCue} from '../../../types';
import {subtitleDefaults} from '../config/layout';

type ActiveSubtitleProps = {
  subtitles: SubtitleCue[];
  timeOffsetMs?: number;
};

const getActiveCue = (
  cues: SubtitleCue[],
  timeMs: number,
): {cue: SubtitleCue; fade: number} | null => {
  for (const cue of cues) {
    if (timeMs >= cue.startMs && timeMs < cue.endMs) {
      const fadeIn = interpolate(
        timeMs,
        [cue.startMs, cue.startMs + subtitleDefaults.fadeMs],
        [0, 1],
        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
      );
      const fadeOut = interpolate(
        timeMs,
        [cue.endMs - subtitleDefaults.fadeMs, cue.endMs],
        [1, 0],
        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
      );

      return {cue, fade: Math.min(fadeIn, fadeOut)};
    }
  }

  return null;
};

export const ActiveSubtitle: React.FC<ActiveSubtitleProps> = ({
  subtitles,
  timeOffsetMs = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const timeMs = (frame / fps) * 1000 - timeOffsetMs;
  const active = useMemo(
    () => getActiveCue(subtitles, timeMs),
    [subtitles, timeMs],
  );

  if (!active) {
    return null;
  }

  const style = subtitleDefaults;

  return (
    <div
      style={{
        width: style.maxWidth,
        opacity: active.fade,
        textAlign: 'center',
      }}
    >
      {active.cue.text.split('\n').map((line, index) => (
        <div
          key={`${active.cue.id}-${index}`}
          style={{
            color: style.color,
            fontFamily:
              '"STKaiti", "KaiTi", "Songti SC", "SimSun", serif',
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: 1.18,
            WebkitTextStroke: `${style.strokeWidth}px ${style.strokeColor}`,
            paintOrder: 'stroke fill',
            textShadow: '0 7px 16px rgba(0,0,0,0.38)',
            overflowWrap: 'anywhere',
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};
