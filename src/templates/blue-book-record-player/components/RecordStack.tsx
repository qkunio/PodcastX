import React from 'react';
import {Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

type RecordStackProps = {
  coverImage: string;
  discImage: string;
};

export const RecordStack: React.FC<RecordStackProps> = ({
  coverImage,
  discImage,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rotation = (frame / (fps * 9)) * 360;
  const discLeft = 300;
  const discTop = 0;
  const discSize = 540;
  const discCenterX = discLeft + discSize / 2;
  const discCenterY = discTop + discSize / 2;
  const vinylSize = 430;
  const labelSize = 248;

  return (
    <div
      style={{
        position: 'absolute',
        left: 54,
        top: 228,
        width: 780,
        height: 560,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: discLeft,
          top: discTop,
          width: discSize,
          height: discSize,
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow:
            '0 34px 64px rgba(0,0,0,0.42), inset 0 0 0 2px rgba(255,255,255,0.12)',
          zIndex: 1,
        }}
      >
        <Img
          src={discImage}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `rotate(${rotation}deg) scale(1.08)`,
            filter: 'saturate(1.08) contrast(0.96)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle, transparent 0 42%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0.24) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 28,
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.16)',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: discCenterX - vinylSize / 2,
          top: discCenterY - vinylSize / 2,
          width: vinylSize,
          height: vinylSize,
          borderRadius: '50%',
          background:
            'repeating-radial-gradient(circle, #05070a 0 3px, #101318 3px 6px, #05070a 6px 12px)',
          boxShadow:
            'inset 0 0 0 1px rgba(255,255,255,0.18), 0 16px 32px rgba(0,0,0,0.22)',
          zIndex: 2,
        }}
      >
        {[0.92, 0.78, 0.64, 0.5, 0.36].map((ratio) => (
          <div
            key={ratio}
            style={{
              position: 'absolute',
              inset: `${((1 - ratio) / 2) * 100}%`,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 570,
          height: 520,
          borderRadius: 42,
          overflow: 'hidden',
          boxShadow: '0 30px 46px rgba(0,0,0,0.34)',
          zIndex: 3,
        }}
      >
        <Img
          src={coverImage}
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: discCenterX - labelSize / 2,
          top: discCenterY - labelSize / 2,
          width: labelSize,
          height: labelSize,
          borderRadius: '50%',
          overflow: 'hidden',
          transform: `rotate(${rotation}deg)`,
          border: '6px solid rgba(255,255,255,0.88)',
          boxShadow:
            '0 0 0 8px rgba(0,0,0,0.82), 0 0 0 12px rgba(255,255,255,0.18), 0 16px 28px rgba(0,0,0,0.34)',
          zIndex: 4,
        }}
      >
        <Img
          src={discImage}
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.34), transparent 40%, rgba(0,0,0,0.22))',
          }}
        />
      </div>
      <Img
        src={staticFile('generated/template-assets/blue-book-record-player/tonearm.png')}
        style={{
          position: 'absolute',
          left: discLeft + 306,
          top: discTop + 64,
          width: 190,
          height: 350,
          objectFit: 'contain',
          transform: 'rotate(8deg)',
          transformOrigin: '55% 18%',
          filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.42))',
          zIndex: 5,
        }}
      />
    </div>
  );
};
