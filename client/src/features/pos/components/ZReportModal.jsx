import React from 'react';
import { Modal, Descriptions, Typography, Divider, Button, Space, Card, Row, Col } from 'antd';
import { PrinterOutlined, ClockCircleOutlined, DollarOutlined, AuditOutlined } from '@ant-design/icons';
import { useAppStore } from '@/store/store';

const { Title, Text } = Typography;

export function ZReportModal({ open, onClose }) {
  const user = useAppStore((state) => state.user);
  const cashierName = user?.name || user?.full_name || user?.username || 'Dara Meas';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      title={
        <Space>
          <AuditOutlined style={{ color: '#2563eb' }} />
          <span>Terminal 2 · Daily Shift Z-Report</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          style={{ backgroundColor: '#2563eb' }}
        >
          Print Z-Report
        </Button>,
      ]}
      width={560}
    >
      <div style={{ padding: '8px 0' }}>
        <Descriptions size="small" column={2} bordered>
          <Descriptions.Item label="Terminal">Terminal 2 (Main branch)</Descriptions.Item>
          <Descriptions.Item label="Cashier">{cashierName}</Descriptions.Item>
          <Descriptions.Item label="Shift Start">08:02 AM Today</Descriptions.Item>
          <Descriptions.Item label="Current Time">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <span style={{ color: '#10b981', fontWeight: 600 }}>Active · In Progress</span>
          </Descriptions.Item>
          <Descriptions.Item label="Currency">USD ($)</Descriptions.Item>
        </Descriptions>

        <Divider style={{ margin: '16px 0' }} />

        <Row gutter={[12, 12]}>
          <Col span={12}>
            <Card size="small" title="Cash Drawer Starting" style={{ borderRadius: 8 }}>
              <Title level={4} style={{ margin: 0, color: '#0f172a' }}>
                $200.00
              </Title>
              <Text type="secondary" style={{ fontSize: 11 }}>Opening float</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="Total Shift Sales" style={{ borderRadius: 8 }}>
              <Title level={4} style={{ margin: 0, color: '#2563eb' }}>
                $1,489.00
              </Title>
              <Text type="secondary" style={{ fontSize: 11 }}>14 completed orders</Text>
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        <Title level={5} style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Payment Breakdown
        </Title>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <Text>Cash Tendered</Text>
            <Text strong>$620.00 (7 orders)</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <Text>Credit / Debit Cards</Text>
            <Text strong>$540.00 (4 orders)</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <Text>ABA KHQR & Mobile Pay</Text>
            <Text strong>$329.00 (3 orders)</Text>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 14,
              borderTop: '1px dashed #cbd5e1',
              paddingTop: 8,
              marginTop: 4,
            }}
          >
            <Text strong>Current Cash in Drawer</Text>
            <Text strong style={{ color: '#16a34a', fontSize: 16 }}>
              $820.00
            </Text>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ZReportModal;
