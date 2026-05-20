import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {scaleLayout} from '../config/layout';
import type {FitMode} from '../../../types';
import {CroppedBackground} from './CroppedBackground';

type DiscProps = {
  backgroundImage: string;
  fitMode: FitMode;
  width: number;
  height: number;
};

export const Disc: React.FC<DiscProps> = ({
  backgroundImage,
  fitMode,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const layout = scaleLayout(width, height);
  const {centerX, centerY, diameter, rotationSecondsPerTurn, holeRadiusRatio} =
    layout.disc;

  const rotation = (frame / (fps * rotationSecondsPerTurn)) * 360;
  const cropX = centerX - diameter / 2;
  const cropY = centerY - diameter / 2;
  const holeSize = diameter * holeRadiusRatio * 2;

  const rings = [0.92, 0.78, 0.64, 0.5, 0.36].map((ratio, index) => (
    <div
      key={ratio}
      style={{
        position: 'absolute',
        inset: `${((1 - ratio) / 2) * 100}%`,
        borderRadius: '50%',
        border: `1px solid rgba(255,255,255,${0.08 + index * 0.02})`,
        pointerEvents: 'none',
      }}
    />
  ));

  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 3}}>
      <div
        style={{
          position: 'absolute',
          left: cropX,
          top: cropY,
          width: diameter,
          height: diameter,
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 14px 32px rgba(0,0,0,0.5)',
          border: '2px solid rgba(255,255,255,0.2)',
        }}
      >
        <CroppedBackground
          src={backgroundImage}
          canvasWidth={width}
          canvasHeight={height}
          fitMode={fitMode}
          cropX={cropX}
          cropY={cropY}
          cropWidth={diameter}
          cropHeight={diameter}
          borderRadius="50%"
          rotateDeg={rotation}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, transparent 55%, rgba(0,0,0,0.35) 100%)',
            pointerEvents: 'none',
          }}
        />
        {rings}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: holeSize,
            height: holeSize,
            marginLeft: -holeSize / 2,
            marginTop: -holeSize / 2,
            borderRadius: '50%',
            background: 'rgba(12,12,12,0.95)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
