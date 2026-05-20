import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {scaleLayout} from '../config/layout';

type TitleTextProps = {
  title: string;
  subtitle: string;
  width: number;
  height: number;
};

const textShadow =
  '0 2px 4px rgba(0,0,0,0.6), 0 0 12px rgba(0,0,0,0.35), -1px -1px 0 rgba(0,0,0,0.5), 1px -1px 0 rgba(0,0,0,0.5), -1px 1px 0 rgba(0,0,0,0.5), 1px 1px 0 rgba(0,0,0,0.5)';

export const TitleText: React.FC<TitleTextProps> = ({
  title,
  subtitle,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const layout = scaleLayout(width, height);
  const {right, top, line1FontSize, line2FontSize, gap} = layout.title;

  const enter = spring({
    frame,
    fps,
    config: {damping: 18, stiffness: 120},
  });

  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const translateY = interpolate(enter, [0, 1], [24, 0]);

  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 5}}>
      <div
        style={{
          position: 'absolute',
          right,
          top,
          textAlign: 'right',
          opacity,
          transform: `translateY(${translateY}px)`,
          maxWidth: width * 0.45,
        }}
      >
        <div
          style={{
            margin: 0,
            color: '#ffffff',
            fontSize: line1FontSize,
            fontWeight: 700,
            lineHeight: 1.15,
            fontFamily:
              '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
            textShadow,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: gap,
            color: '#ffffff',
            fontSize: line2FontSize,
            fontWeight: 800,
            lineHeight: 1.1,
            fontFamily:
              '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
            textShadow,
          }}
        >
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
