import React from 'react';
import { Spin } from 'antd';

export function Loading({ size = 'default', text = 'Loading...', tip, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        ...style,
      }}
    >
      <Spin size={size === 'default' ? 'large' : size} tip={tip || text}>
        <div style={{ minHeight: 40 }} />
      </Spin>
    </div>
  );
}

export default Loading;
