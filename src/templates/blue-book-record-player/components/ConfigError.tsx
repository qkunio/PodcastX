import React from 'react';
import {AbsoluteFill} from 'remotion';

export const ConfigError: React.FC<{message: string}> = ({message}) => (
  <AbsoluteFill
    style={{
      backgroundColor: '#08215f',
      color: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 80,
      fontFamily: '"Microsoft YaHei", sans-serif',
    }}
  >
    <pre style={{whiteSpace: 'pre-wrap', fontSize: 30, lineHeight: 1.55}}>
      {message}
    </pre>
  </AbsoluteFill>
);
