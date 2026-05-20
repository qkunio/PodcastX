import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {scaleLayout} from '../config/layout';

type ToneArmProps = {
  width: number;
  height: number;
};

export const ToneArm: React.FC<ToneArmProps> = ({width, height}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const layout = scaleLayout(width, height);
  const scaled = layout;
  const {coverCard, disc, toneArm} = scaled;

  const pressStartFrame = toneArm.pressStartSec * fps;
  const pressEndFrame = toneArm.pressEndSec * fps;
  const currentSec = frame / fps;

  const pressAngle = interpolate(
    frame,
    [pressStartFrame, pressEndFrame],
    [0, toneArm.pressAngleDeg],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  const wobble =
    currentSec > toneArm.pressEndSec
      ? Math.sin((currentSec / toneArm.wobblePeriodSec) * Math.PI * 2) *
        toneArm.wobbleDeg
      : 0;

  const pivotX = coverCard.x + coverCard.size * 0.75;
  const pivotY = coverCard.y + coverCard.size * 0.35;
  const needleX = disc.centerX + disc.diameter * 0.12;
  const needleY = disc.centerY - disc.diameter * 0.08;
  const totalAngle = -18 + pressAngle + wobble;

  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 5}}>
      <svg
        width={width}
        height={height}
        style={{position: 'absolute', left: 0, top: 0}}
      >
        <g
          transform={`rotate(${totalAngle} ${pivotX} ${pivotY})`}
          filter="drop-shadow(0 4px 8px rgba(0,0,0,0.35))"
        >
          <circle
            cx={pivotX}
            cy={pivotY}
            r={18}
            fill="rgba(40,40,40,0.9)"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={2}
          />
          <rect
            x={pivotX - 8}
            y={pivotY - 28}
            width={16}
            height={24}
            rx={4}
            fill="rgba(60,60,60,0.95)"
          />
          <path
            d={`M ${pivotX} ${pivotY} Q ${pivotX + 80} ${pivotY - 40} ${needleX} ${needleY}`}
            fill="none"
            stroke="rgba(230,230,230,0.92)"
            strokeWidth={7}
            strokeLinecap="round"
          />
          <path
            d={`M ${pivotX} ${pivotY} Q ${pivotX + 80} ${pivotY - 40} ${needleX} ${needleY}`}
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <line
            x1={needleX}
            y1={needleY}
            x2={needleX + 6}
            y2={needleY + 18}
            stroke="rgba(200,200,200,0.95)"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <polygon
            points={`${needleX + 6},${needleY + 18} ${needleX - 2},${needleY + 26} ${needleX + 10},${needleY + 26}`}
            fill="rgba(180,180,180,0.95)"
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
