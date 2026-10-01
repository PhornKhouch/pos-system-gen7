import React from 'react';
import { Typography, Space, Breadcrumb } from 'antd';

const { Title, Paragraph } = Typography;

export function Header({ title, subtitle, action = null, breadcrumbs = [] }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumb
          items={breadcrumbs.map((b) => ({ title: b.label, href: b.path }))}
          style={{ marginBottom: 8 }}
        />
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>
            {title}
          </Title>
          {subtitle && (
            <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>
              {subtitle}
            </Paragraph>
          )}
        </div>
        {action && <Space>{action}</Space>}
      </div>
    </div>
  );
}

export default Header;
