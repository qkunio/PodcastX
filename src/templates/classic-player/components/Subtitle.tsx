import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {layout} from '../config/layout';
import type {SubtitleCue} from '../../../types';
import {subtitleStyle} from '../utils/subtitleStyle';

type SubtitleProps = {
  subtitles: SubtitleCue[];
  width: number;
  height: number;
};

const getActiveCue = (
  cues: SubtitleCue[],
  timeMs: number,
): {cue: SubtitleCue; fade: number} | null => {
  const fadeMs = layout.subtitle.fadeMs;

  for (const cue of cues) {
    if (timeMs >= cue.startMs && timeMs < cue.endMs) {
      const fadeIn = interpolate(
        timeMs,
        [cue.startMs, cue.startMs + fadeMs],
        [0, 1],
        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
      );
      const fadeOut = interpolate(
        timeMs,
        [cue.endMs - fadeMs, cue.endMs],
        [1, 0],
        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
      );
      return {cue, fade: Math.min(fadeIn, fadeOut)};
    }
  }

  return null;
};

export const Subtitle: React.FC<SubtitleProps> = ({
  subtitles,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const style = subtitleStyle;
  const scaleY = height / 1080;
  const scaleX = width / 1440;
  const bottom = style.bottom * scaleY;
  const fontSize = style.fontSize * Math.min(scaleX, scaleY);
  const maxWidth = style.maxWidth * scaleX;
  const strokeWidth = style.strokeWidth * Math.min(scaleX, scaleY);

  const timeMs = (frame / fps) * 1000;
  const active = useMemo(
    () => getActiveCue(subtitles, timeMs),
    [subtitles, timeMs],
  );

  if (!active) {
    return null;
  }

  const lines = active.cue.text.split('\n');

  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 6}}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom,
          transform: 'translateX(-50%)',
          width: maxWidth,
          textAlign: 'center',
          opacity: active.fade,
        }}
      >
        {lines.map((line, index) => (
          <div
            key={`${active.cue.id}-${index}`}
            style={{
              margin: 0,
              color: style.color,
              fontSize,
              fontWeight: style.fontWeight,
              lineHeight: 1.35,
              fontFamily:
                '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
              WebkitTextStroke: `${strokeWidth}px ${style.strokeColor}`,
              paintOrder: 'stroke fill',
              textShadow: '0 2px 8px rgba(0,0,0,0.45)',
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
