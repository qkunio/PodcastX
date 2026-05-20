import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {scaleLayout} from '../config/layout';
import type {FitMode} from '../../../types';

type BackgroundProps = {
  backgroundImage: string;
  fitMode: FitMode;
};

const objectFitMap: Record<FitMode, React.CSSProperties['objectFit']> = {
  cover: 'cover',
  contain: 'contain',
  fill: 'fill',
};

export const Background: React.FC<BackgroundProps> = ({
  backgroundImage,
  fitMode,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  const scaled = scaleLayout(width, height);
  const {scaleFrom, scaleTo, vignetteOpacity} = scaled.background;

  const scale = interpolate(
    frame,
    [0, Math.max(durationInFrames - 1, 1)],
    [scaleFrom, scaleTo],
    {extrapolateRight: 'clamp'},
  );

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#0a0a0a'}}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <Img
          src={backgroundImage}
          style={{
            width: '100%',
            height: '100%',
            objectFit: objectFitMap[fitMode],
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${vignetteOpacity}) 100%)`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
