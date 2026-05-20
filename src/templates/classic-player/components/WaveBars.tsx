import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {scaleLayout} from '../config/layout';

type WaveBarsProps = {
  width: number;
  height: number;
};

/** 模擬音量柱高度；後續可替換為真實音頻波形數據 */
export const getBarHeight = (
  barIndex: number,
  barCount: number,
  frame: number,
  fps: number,
  maxHeight: number,
): number => {
  const center = (barCount - 1) / 2;
  const distance = Math.abs(barIndex - center) / center;
  const envelope = 1 - distance * 0.55;
  const phase = frame / fps;
  const wave =
    Math.sin(phase * 6 + barIndex * 0.45) * 0.35 +
    Math.sin(phase * 11 + barIndex * 0.2) * 0.25 +
    Math.sin(phase * 3.5 + barIndex * 0.7) * 0.2;
  const normalized = (wave + 1) / 2;
  return Math.max(6, normalized * maxHeight * envelope);
};

export const WaveBars: React.FC<WaveBarsProps> = ({width, height}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const layout = scaleLayout(width, height);
  const {barCount, barWidth, barGap, maxHeight, bottomOffset} = layout.waveBars;
  const totalWidth = barCount * barWidth + (barCount - 1) * barGap;

  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 7}}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: bottomOffset,
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: barGap,
          width: totalWidth,
          height: maxHeight,
        }}
      >
        {Array.from({length: barCount}).map((_, index) => {
          const barHeight = getBarHeight(
            index,
            barCount,
            frame,
            fps,
            maxHeight,
          );

          return (
            <div
              key={index}
              style={{
                width: barWidth,
                height: barHeight,
                borderRadius: barWidth,
                background: 'rgba(255,255,255,0.82)',
                boxShadow: '0 0 8px rgba(255,255,255,0.25)',
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
