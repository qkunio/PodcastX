import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {scaleLayout} from '../config/layout';

type PlayerControlsProps = {
  width: number;
  height: number;
};

const IconButton: React.FC<{
  size: number;
  children: React.ReactNode;
}> = ({size, children}) => (
  <div
    style={{
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.35))',
    }}
  >
    {children}
  </div>
);

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const layout = scaleLayout(width, height);
  const {bottomOffset, iconSize, gap} = layout.playerControls;

  const breathe = interpolate(Math.sin(frame / 18), [-1, 1], [0.92, 1]);

  const stroke = 'rgba(255,255,255,0.88)';
  const fill = 'rgba(255,255,255,0.15)';

  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 8}}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: bottomOffset,
          transform: `translateX(-50%) scale(${breathe})`,
          display: 'flex',
          alignItems: 'center',
          gap,
        }}
      >
        <IconButton size={iconSize}>
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
            <polygon
              points="12,6 6,18 18,18"
              fill={fill}
              stroke={stroke}
              strokeWidth={1.5}
              transform="rotate(-90 12 12)"
            />
            <polygon
              points="8,6 2,18 14,18"
              fill={fill}
              stroke={stroke}
              strokeWidth={1.5}
              transform="rotate(-90 8 12)"
            />
          </svg>
        </IconButton>

        <IconButton size={iconSize * 1.35}>
          <svg
            width={iconSize * 1.35}
            height={iconSize * 1.35}
            viewBox="0 0 24 24"
          >
            <circle
              cx={12}
              cy={12}
              r={10}
              fill={fill}
              stroke={stroke}
              strokeWidth={1.5}
            />
            <polygon points="10,8 10,16 17,12" fill={stroke} />
          </svg>
        </IconButton>

        <IconButton size={iconSize}>
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
            <polygon
              points="12,6 6,18 18,18"
              fill={fill}
              stroke={stroke}
              strokeWidth={1.5}
              transform="rotate(90 12 12)"
            />
            <polygon
              points="16,6 10,18 22,18"
              fill={fill}
              stroke={stroke}
              strokeWidth={1.5}
              transform="rotate(90 16 12)"
            />
          </svg>
        </IconButton>
      </div>
    </AbsoluteFill>
  );
};
