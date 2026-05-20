import React from 'react';
import {AbsoluteFill} from 'remotion';

export const ConfigError: React.FC<{message: string}> = ({message}) => (
  <AbsoluteFill
    style={{
      backgroundColor: '#1a1a2e',
      color: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 80,
      fontFamily: 'sans-serif',
    }}
  >
    <div style={{maxWidth: 900, fontSize: 28, lineHeight: 1.6}}>
      <strong style={{fontSize: 36, display: 'block', marginBottom: 24}}>
        配置或资源缺失
      </strong>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          background: 'rgba(0,0,0,0.35)',
          padding: 24,
          borderRadius: 12,
          fontSize: 22,
        }}
      >
        {message}
      </pre>
      <p style={{marginTop: 24, opacity: 0.85}}>
        请在项目根目录执行：<code>npm run setup</code>
        <br />
        或将真实素材放入 assets/ 并修改 inputs/example.json
      </p>
    </div>
  </AbsoluteFill>
);
