import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';

type WaveformProps = {
  width?: number;
  barCount?: number;
};

const seededRandom = (seed: number): number => {
  const value = Math.sin(seed * 999) * 10000;
  return value - Math.floor(value);
};

const getBarHeight = (
  index: number,
  count: number,
  frame: number,
  fps: number,
): number => {
  const heightScale = 1.3;
  const randomPhase = seededRandom(index + 1) * Math.PI * 2;
  const randomSpeed = 0.75 + seededRandom(index + 17) * 0.7;
  const randomAmplitude = 0.78 + seededRandom(index + 31) * 0.46;
  const center = (count - 1) / 2;
  const distance = Math.abs(index - center) / center;
  const envelope = 0.28 + Math.pow(1 - distance, 0.75) * 0.9;
  const time = frame / fps;
  const wave =
    Math.sin(time * 7.5 * randomSpeed + index * 0.45 + randomPhase) * 0.36 +
    Math.sin(time * 13.2 * randomSpeed + index * 0.2 + randomPhase * 0.6) *
      0.3 +
    Math.sin(time * 3.8 * randomSpeed + index * 0.75 + randomPhase * 1.4) *
      0.18;
  const normalized = Math.max(0, Math.min(1, (wave * randomAmplitude + 1) / 2));

  return (7 + normalized * 96 * envelope) * heightScale;
};

export const Waveform: React.FC<WaveformProps> = ({
  width = 640,
  barCount = 40,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <div
      style={{
        width,
        height: 169,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      {Array.from({length: barCount}).map((_, index) => {
        return (
          <div
            key={index}
            style={{
              width: 10,
              height: getBarHeight(index, barCount, frame, fps),
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.5)',
              boxShadow: '0 0 12px rgba(255,255,255,0.25)',
            }}
          />
        );
      })}
    </div>
  );
};
