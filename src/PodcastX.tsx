import React from 'react';
import {Audio, staticFile} from 'remotion';
import {DEFAULT_TEMPLATE, templates} from './templates';
import type {PodcastXProps} from './types';

export const PodcastX: React.FC<PodcastXProps> = (props) => {
  const templateId = props.template ?? DEFAULT_TEMPLATE;
  const Template = templates[templateId];

  if (!Template) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111',
          color: '#fff',
          fontFamily: 'sans-serif',
          fontSize: 42,
        }}
      >
        Unknown template: {templateId}
      </div>
    );
  }

  return (
    <>
      <Template {...props} template={templateId} />
      {props.bgmPath ? (
        <Audio
          src={staticFile(props.bgmPath)}
          loop
          volume={props.audioMix?.bgmVolume ?? 0.18}
        />
      ) : null}
    </>
  );
};
