import React from 'react';
import {AbsoluteFill} from 'remotion';
import {scaleLayout} from '../config/layout';
import type {FitMode} from '../../../types';
import {CroppedBackground} from './CroppedBackground';

type CoverCardProps = {
  backgroundImage: string;
  fitMode: FitMode;
  width: number;
  height: number;
};

export const CoverCard: React.FC<CoverCardProps> = ({
  backgroundImage,
  fitMode,
  width,
  height,
}) => {
  const layout = scaleLayout(width, height);
  const {x, y, size, borderRadius} = layout.coverCard;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius,
          boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
          border: '2px solid rgba(255,255,255,0.35)',
          overflow: 'hidden',
          zIndex: 2,
        }}
      >
        <CroppedBackground
          src={backgroundImage}
          canvasWidth={width}
          canvasHeight={height}
          fitMode={fitMode}
          cropX={x}
          cropY={y}
          cropWidth={size}
          cropHeight={size}
          borderRadius={borderRadius}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)',
            backdropFilter: 'blur(1px)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
