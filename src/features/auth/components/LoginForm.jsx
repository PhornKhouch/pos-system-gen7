import React from 'react';
import { Form, Input, Button, Card, Typography, App, Alert } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/routeConfig';

const { Title, Text, Paragraph } = Typography;

export function LoginForm() {
  const [form] = Form.useForm();
  const { login, loading, error } = useAuth();
  const { message } = App.useApp();

  const handleFinish = async (values) => {
    try {
      await login(values);
      message.success('Successfully signed in!');
    } catch (err) {
      message.error(err.message || 'Login failed');
    }
  };

  return (
    <Card
      style={{
        maxWidth: 420,
        width: '100%',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>
          Welcome Back
        </Title>
        <Paragraph type="secondary" style={{ margin: '6px 0 0', fontSize: '0.875rem' }}>
          Sign in to your Enterprise Management account
        </Paragraph>
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={{ email: 'admin@company.com', password: 'password123' }}
        onFinish={handleFinish}
        requiredMark={false}
      >
        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email address!' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="name@company.com" size="large" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
        </Form.Item>

        <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            icon={<ArrowRightOutlined />}
            iconPosition="end"
          >
            Sign In
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '0.85rem' }}>
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} style={{ color: '#1677ff', fontWeight: 600 }}>
              Sign up
            </Link>
          </Text>
        </div>
      </Form>
    </Card>
  );
}

export default LoginForm;
