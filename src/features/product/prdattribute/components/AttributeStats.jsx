import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { SlidersOutlined, CheckCircleOutlined, PauseCircleOutlined, AppstoreOutlined } from '@ant-design/icons';

export function AttributeStats({ attributes = [] }) {
  const total = attributes.length;
  const activeCount = attributes.filter((a) => a.active === 1 || a.active === true).length;
  const inactiveCount = total - activeCount;
  const uniqueGroups = new Set(attributes.map((a) => a.attribute_name)).size;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
      <Col xs={24} sm={12} md={6}>
        <Card
          size="small"
          bordered={false}
          style={{
            background: 'linear-gradient(135deg, rgba(22, 119, 255, 0.08) 0%, rgba(22, 119, 255, 0.02) 100%)',
            border: '1px solid rgba(22, 119, 255, 0.15)',
            borderRadius: 10,
          }}
        >
          <Statistic
            title={<span style={{ fontSize: '13px', color: '#595959' }}>Total Attributes</span>}
            value={total}
            prefix={<SlidersOutlined style={{ color: '#1677ff', marginRight: 6 }} />}
            valueStyle={{ fontWeight: 700, color: '#1677ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card
          size="small"
          bordered={false}
          style={{
            background: 'linear-gradient(135deg, rgba(114, 46, 209, 0.08) 0%, rgba(114, 46, 209, 0.02) 100%)',
            border: '1px solid rgba(114, 46, 209, 0.15)',
            borderRadius: 10,
          }}
        >
          <Statistic
            title={<span style={{ fontSize: '13px', color: '#595959' }}>Attribute Types</span>}
            value={uniqueGroups}
            prefix={<AppstoreOutlined style={{ color: '#722ed1', marginRight: 6 }} />}
            valueStyle={{ fontWeight: 700, color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card
          size="small"
          bordered={false}
          style={{
            background: 'linear-gradient(135deg, rgba(82, 196, 26, 0.08) 0%, rgba(82, 196, 26, 0.02) 100%)',
            border: '1px solid rgba(82, 196, 26, 0.15)',
            borderRadius: 10,
          }}
        >
          <Statistic
            title={<span style={{ fontSize: '13px', color: '#595959' }}>Active Attributes</span>}
            value={activeCount}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a', marginRight: 6 }} />}
            valueStyle={{ fontWeight: 700, color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card
          size="small"
          bordered={false}
          style={{
            background: 'linear-gradient(135deg, rgba(250, 140, 22, 0.08) 0%, rgba(250, 140, 22, 0.02) 100%)',
            border: '1px solid rgba(250, 140, 22, 0.15)',
            borderRadius: 10,
          }}
        >
          <Statistic
            title={<span style={{ fontSize: '13px', color: '#595959' }}>Inactive Attributes</span>}
            value={inactiveCount}
            prefix={<PauseCircleOutlined style={{ color: '#fa8c16', marginRight: 6 }} />}
            valueStyle={{ fontWeight: 700, color: '#fa8c16' }}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default AttributeStats;
