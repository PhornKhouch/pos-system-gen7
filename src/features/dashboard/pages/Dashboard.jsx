import React from 'react';
import { Row, Col, Card, Statistic, Button, Typography, Space, Progress } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { Header } from '@/components/layout/Header';
import { useAppStore } from '@/store/store';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/routeConfig';
import { formatCurrency } from '@/utils/formatCurrency';

const { Text, Paragraph } = Typography;

export function Dashboard() {
  const user = useAppStore((state) => state.user);
  const navigate = useNavigate();

  const metrics = [
    {
      title: 'Active Users',
      value: '1,420',
      prefix: <UserOutlined style={{ color: '#1677ff' }} />,
      suffix: <RiseOutlined style={{ color: '#52c41a', fontSize: 16 }} />,
      color: '#1677ff',
      link: ROUTES.USERS,
      description: '+12% from last month',
    },
    {
      title: 'Total Employees',
      value: '385',
      prefix: <TeamOutlined style={{ color: '#52c41a' }} />,
      suffix: <RiseOutlined style={{ color: '#52c41a', fontSize: 16 }} />,
      color: '#52c41a',
      link: ROUTES.EMPLOYEES,
      description: '98% retention rate',
    },
    {
      title: 'Monthly Payroll',
      value: formatCurrency(284000),
      prefix: <DollarOutlined style={{ color: '#faad14' }} />,
      color: '#faad14',
      link: ROUTES.EMPLOYEES,
      description: 'On budget (100%)',
    },
    {
      title: 'Security Compliance',
      value: '100%',
      prefix: <SafetyCertificateOutlined style={{ color: '#722ed1' }} />,
      color: '#722ed1',
      description: 'All audits passed',
    },
  ];

  return (
    <div>
      <Header
        title="Executive Overview"
        subtitle={`Welcome back, ${user?.name || 'Administrator'}. Here is your operations snapshot.`}
        action={
          <Button
            type="primary"
            onClick={() => navigate(ROUTES.USERS)}
            icon={<ArrowRightOutlined />}
            iconPosition="end"
          >
            Manage Users
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {metrics.map((m, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card
              hoverable={!!m.link}
              onClick={() => m.link && navigate(m.link)}
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <Statistic
                title={<Text strong>{m.title}</Text>}
                value={m.value}
                prefix={m.prefix}
                suffix={m.suffix}
                valueStyle={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
              />
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                {m.description}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Departmental Workforce Distribution" style={{ borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>Engineering & Development</Text>
                  <Text strong>45%</Text>
                </div>
                <Progress percent={45} strokeColor="#1677ff" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>Product & Design</Text>
                  <Text strong>25%</Text>
                </div>
                <Progress percent={25} strokeColor="#52c41a" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>Marketing & Sales</Text>
                  <Text strong>20%</Text>
                </div>
                <Progress percent={20} strokeColor="#faad14" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>Human Resources & Finance</Text>
                  <Text strong>10%</Text>
                </div>
                <Progress percent={10} strokeColor="#722ed1" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Quick Actions" style={{ borderRadius: 'var(--radius-md)' }}>
            <Paragraph type="secondary" style={{ fontSize: '0.875rem' }}>
              Jump directly to primary workspace modules:
            </Paragraph>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button block icon={<UserOutlined />} onClick={() => navigate(ROUTES.USERS)}>
                View User Directory
              </Button>
              <Button block icon={<TeamOutlined />} onClick={() => navigate(ROUTES.EMPLOYEES)}>
                View Employee Directory
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
