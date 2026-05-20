import React from 'react';
import {Img} from 'remotion';
import type {FitMode} from '../../../types';

type CroppedBackgroundProps = {
  src: string;
  canvasWidth: number;
  canvasHeight: number;
  fitMode: FitMode;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  borderRadius?: number | string;
  rotateDeg?: number;
  style?: React.CSSProperties;
};

const objectFitMap: Record<FitMode, React.CSSProperties['objectFit']> = {
  cover: 'cover',
  contain: 'contain',
  fill: 'fill',
};

/** 从全屏背景图中裁切局部区域，与 Background 组件使用相同对齐方式 */
export const CroppedBackground: React.FC<CroppedBackgroundProps> = ({
  src,
  canvasWidth,
  canvasHeight,
  fitMode,
  cropX,
  cropY,
  cropWidth,
  cropHeight,
  borderRadius = 0,
  rotateDeg = 0,
  style,
}) => {
  return (
    <div
      style={{
        width: cropWidth,
        height: cropHeight,
        overflow: 'hidden',
        borderRadius,
        position: 'relative',
        transform: rotateDeg ? `rotate(${rotateDeg}deg)` : undefined,
        ...style,
      }}
    >
      <Img
        src={src}
        style={{
          position: 'absolute',
          width: canvasWidth,
          height: canvasHeight,
          objectFit: objectFitMap[fitMode],
          left: -cropX,
          top: -cropY,
        }}
      />
    </div>
  );
};
