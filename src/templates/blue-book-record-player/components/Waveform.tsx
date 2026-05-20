import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';

type WaveformProps = {
  width?: number;
  barCount?: number;
};

const getBarHeight = (
  index: number,
  count: number,
  frame: number,
  fps: number,
): number => {
  const center = (count - 1) / 2;
  const distance = Math.abs(index - center) / center;
  const envelope = 1 - distance * 0.5;
  const time = frame / fps;
  const wave =
    Math.sin(time * 7.5 + index * 0.45) * 0.36 +
    Math.sin(time * 13.2 + index * 0.2) * 0.3 +
    Math.sin(time * 3.8 + index * 0.75) * 0.18;

  return 7 + ((wave + 1) / 2) * 96 * envelope;
};

export const Waveform: React.FC<WaveformProps> = ({
  width = 640,
  barCount = 62,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <div
      style={{
        width,
        height: 130,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {Array.from({length: barCount}).map((_, index) => {
        const dot = index % 6 === 0;
        return (
          <div
            key={index}
            style={{
              width: dot ? 6 : 7,
              height: dot ? 6 : getBarHeight(index, barCount, frame, fps),
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.9)',
              boxShadow: '0 0 12px rgba(255,255,255,0.25)',
            }}
          />
        );
      })}
    </div>
  );
};
