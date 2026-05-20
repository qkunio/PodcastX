import React from 'react';
import {Composition} from 'remotion';
import studioDefaultProps from './generated/studio-props.json';
import {PodcastX} from './PodcastX';
import type {PodcastXProps} from './types';

const COMPOSITION_ID = 'PodcastX';

/** Studio 預覽用：由 scripts/sync-studio-props.ts 從 inputs/*.json 生成，勿在此文件使用 fs */
const defaultProps = studioDefaultProps as PodcastXProps;

export const RemotionRoot: React.FC = () => {
  const durationInFrames = Math.ceil(defaultProps.duration * defaultProps.fps);

  return (
    <>
      <Composition
        id={COMPOSITION_ID}
        component={PodcastX}
        durationInFrames={durationInFrames || 360}
        fps={defaultProps.fps}
        width={defaultProps.width}
        height={defaultProps.height}
        defaultProps={defaultProps}
        calculateMetadata={async ({props}) => {
          const input = props as PodcastXProps;
          return {
            durationInFrames: Math.ceil(input.duration * input.fps),
            fps: input.fps,
            width: input.width,
            height: input.height,
          };
        }}
      />
    </>
  );
};

export {COMPOSITION_ID};
