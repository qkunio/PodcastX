import React from 'react';
import {useCurrentFrame} from 'remotion';

type ControlsProps = {
  duration: number;
  fps: number;
  timeOffsetSeconds?: number;
};

const formatTime = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const Controls: React.FC<ControlsProps> = ({
  duration,
  fps,
  timeOffsetSeconds = 0,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame / fps - timeOffsetSeconds);
  const progress = Math.max(0, Math.min(1, elapsed / Math.max(duration, 0.1)));

  return (
    <div
      style={{
        position: 'absolute',
        left: 54,
        right: 54,
        bottom: 30,
        height: 170,
        color: '#fff',
        fontFamily: '"Arial Narrow", "Impact", sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          fontSize: 50,
          fontWeight: 900,
          letterSpacing: 0,
          textShadow: '0 5px 12px rgba(0,0,0,0.35)',
        }}
      >
        {formatTime(elapsed)}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          fontSize: 50,
          fontWeight: 900,
          letterSpacing: 0,
          textShadow: '0 5px 12px rgba(0,0,0,0.35)',
        }}
      >
        {formatTime(duration)}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 72,
          height: 8,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.78)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            borderRadius: 999,
            width: `${progress * 100}%`,
            backgroundColor: '#ffffff',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${progress * 100}%`,
            top: -6,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: '#fff',
            transform: 'translateX(-50%)',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 64,
        }}
      >
        <div
          style={{
            width: 74,
            height: 52,
            clipPath: 'polygon(0 50%, 48% 0, 48% 35%, 100% 0, 100% 100%, 48% 65%, 48% 100%)',
            backgroundColor: '#fff',
          }}
        />
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            border: '4px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: '19px solid transparent',
              borderBottom: '19px solid transparent',
              borderLeft: '28px solid #fff',
              marginLeft: 7,
            }}
          />
        </div>
        <div
          style={{
            width: 74,
            height: 52,
            clipPath: 'polygon(0 0, 52% 35%, 52% 0, 100% 50%, 52% 100%, 52% 65%, 0 100%)',
            backgroundColor: '#fff',
          }}
        />
      </div>
    </div>
  );
};
