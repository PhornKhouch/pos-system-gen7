import React, { useState } from 'react';
import {
  Modal,
  Descriptions,
  Table,
  Tag,
  Avatar,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Divider,
  Button,
  Select,
  message,
  Empty,
  Image,
} from 'antd';
import {
  UserOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { formatDate } from '@/utils/formatDate';
import { customerApi } from '../services/customerApi';

const { Text, Title } = Typography;

const STATUS_TAGS = {
  completed: { color: 'success', icon: <CheckCircleOutlined />, label: 'Completed' },
  pending: { color: 'warning', icon: <ClockCircleOutlined />, label: 'Pending' },
  cancelled: { color: 'error', icon: <CloseCircleOutlined />, label: 'Cancelled' },
  processing: { color: 'processing', icon: <ClockCircleOutlined />, label: 'Processing' },
  shipped: { color: 'cyan', icon: <ClockCircleOutlined />, label: 'Shipped' },
  delivered: { color: 'geekblue', icon: <CheckCircleOutlined />, label: 'Delivered' },
};

export function OrderDetailModal({ order, open, onClose, onStatusUpdated }) {
  const [updating, setUpdating] = useState(false);
  const [statusVal, setStatusVal] = useState(order?.status || 'pending');

  // Sync state if order changes
  React.useEffect(() => {
    if (order) {
      setStatusVal(order.status || 'pending');
    }
  }, [order]);

  if (!order) return null;

  const currentStatus = (order.status || 'pending').toLowerCase();
  const statusMeta = STATUS_TAGS[currentStatus] || { color: 'default', label: order.status };

  const customer = order.customer || {};
  const payments = order.payments || [];
  const primaryPayment = order.primary_payment || payments[0] || null;
  const invoice = order.invoice;
  const items = order.items || [];

  const handleUpdateStatus = async () => {
    if (!statusVal || statusVal === order.status) return;
    setUpdating(true);
    try {
      await customerApi.updateCustomerOrderStatus(order.order_id, { status: statusVal });
      message.success(`Order ${order.order_no} status updated to ${statusVal}`);
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      message.error(err?.response?.data?.message || err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const itemColumns = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => {
        const prod = record.product || {};
        return (
          <Space orientation="horizontal" size="middle">
            {prod.image ? (
              <Image
                src={prod.image}
                alt={prod.product_name}
                width={48}
                height={48}
                style={{ objectFit: 'cover', borderRadius: 8 }}
                fallback="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' fill='%23eee'><rect width='48' height='48'/></svg>"
              />
            ) : (
              <Avatar shape="square" size={48} icon={<ShoppingOutlined />} style={{ backgroundColor: '#f0f2f5', color: '#8c8c8c' }} />
            )}
            <div>
              <div style={{ fontWeight: 600, color: '#262626' }}>{prod.product_name || 'Product'}</div>
              <Space size="small" style={{ fontSize: 12, color: '#8c8c8c' }}>
                <span>SKU: {prod.sku || 'N/A'}</span>
                {prod.barcode && <span>• Barcode: {prod.barcode}</span>}
              </Space>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      align: 'right',
      width: 110,
      render: (price) => `$${Number(price || 0).toFixed(2)}`,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 90,
      render: (qty) => (
        <Tag color="blue" style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>
          x{qty}
        </Tag>
      ),
    },
    {
      title: 'Total Price',
      dataIndex: 'total_price',
      key: 'total_price',
      align: 'right',
      width: 120,
      render: (price) => <span style={{ fontWeight: 600, color: '#1677ff' }}>${Number(price || 0).toFixed(2)}</span>,
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={840}
      style={{ top: 20 }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24 }}>
          <Space size="middle">
            <span style={{ fontSize: 18, fontWeight: 700 }}>Order #{order.order_no}</span>
            <Tag color={statusMeta.color} icon={statusMeta.icon} style={{ borderRadius: 12, padding: '2px 10px' }}>
              {statusMeta.label}
            </Tag>
          </Space>
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 'normal' }}>
            <CalendarOutlined style={{ marginRight: 6 }} />
            {order.order_date ? formatDate(order.order_date) : '—'}
          </Text>
        </div>
      }
    >
      <div style={{ marginTop: 12 }}>
        {/* Status Update Quick Bar */}
        <Card size="small" style={{ marginBottom: 16, background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <Space>
              <EditOutlined style={{ color: '#1677ff' }} />
              <Text strong>Change Status:</Text>
              <Select
                value={statusVal}
                onChange={setStatusVal}
                style={{ width: 140 }}
                options={[
                  { label: 'Pending', value: 'pending' },
                  { label: 'Processing', value: 'processing' },
                  { label: 'Completed', value: 'completed' },
                  { label: 'Shipped', value: 'shipped' },
                  { label: 'Delivered', value: 'delivered' },
                  { label: 'Cancelled', value: 'cancelled' },
                ]}
              />
              <Button
                type="primary"
                size="small"
                loading={updating}
                disabled={statusVal === order.status}
                onClick={handleUpdateStatus}
              >
                Apply
              </Button>
            </Space>

            <Space size="large">
              <span>
                <Text type="secondary">Total Items: </Text>
                <Tag color="cyan">{order.items_count || items.length} items ({order.total_quantity || 0} pcs)</Tag>
              </span>
              <span>
                <Text type="secondary">Grand Total: </Text>
                <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                  ${Number(order.total_amount || 0).toFixed(2)}
                </Text>
              </span>
            </Space>
          </div>
        </Card>

        {/* 3 Related Cards: Customer, Invoice, Payment */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          {/* Customer Profile Card */}
          <Col xs={24} md={8}>
            <Card
              size="small"
              title={
                <Space>
                  <UserOutlined style={{ color: '#1677ff' }} />
                  <span>Customer Info</span>
                </Space>
              }
              style={{ height: '100%', borderRadius: 8 }}
            >
              <div style={{ marginBottom: 6 }}>
                <Text strong style={{ fontSize: 14 }}>
                  {customer.customer_name || 'Anonymous Customer'}
                </Text>
              </div>
              <div style={{ fontSize: 12, color: '#595959', marginBottom: 4 }}>
                <strong>Email:</strong> {customer.email || '—'}
              </div>
              <div style={{ fontSize: 12, color: '#595959', marginBottom: 4 }}>
                <strong>Phone:</strong> {customer.phone || '—'}
              </div>
              <div style={{ fontSize: 12, color: '#595959', marginBottom: 4 }}>
                <strong>Address:</strong> {[customer.address, customer.city, customer.country].filter(Boolean).join(', ') || '—'}
              </div>
              <div style={{ fontSize: 12, color: '#595959' }}>
                <strong>Loyalty Points:</strong> <Tag color="gold">{customer.loyalty_points ?? 0}</Tag>
              </div>
            </Card>
          </Col>

          {/* Invoice Card */}
          <Col xs={24} md={8}>
            <Card
              size="small"
              title={
                <Space>
                  <FileTextOutlined style={{ color: '#52c41a' }} />
                  <span>Invoice Info</span>
                </Space>
              }
              style={{ height: '100%', borderRadius: 8 }}
            >
              {invoice ? (
                <>
                  <div style={{ marginBottom: 6 }}>
                    <Tag color="blue" style={{ fontSize: 13, padding: '2px 8px' }}>
                      {invoice.invoice_number}
                    </Tag>
                  </div>
                  <div style={{ fontSize: 12, color: '#595959', marginBottom: 4 }}>
                    <strong>Invoice Date:</strong> {invoice.invoice_date ? formatDate(invoice.invoice_date) : '—'}
                  </div>
                  <div style={{ fontSize: 12, color: '#595959', marginBottom: 4 }}>
                    <strong>Invoice Amount:</strong> ${Number(invoice.amount || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 12, color: '#595959' }}>
                    <strong>Tax Amount:</strong> ${Number(invoice.tax_amount || 0).toFixed(2)}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0', color: '#8c8c8c' }}>
                  <FileTextOutlined style={{ fontSize: 24, marginBottom: 6, display: 'block' }} />
                  <span>No invoice issued yet</span>
                </div>
              )}
            </Card>
          </Col>

          {/* Payment Card */}
          <Col xs={24} md={8}>
            <Card
              size="small"
              title={
                <Space>
                  <CreditCardOutlined style={{ color: '#722ed1' }} />
                  <span>Payment Info</span>
                </Space>
              }
              style={{ height: '100%', borderRadius: 8 }}
            >
              {primaryPayment ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Tag color="purple" style={{ textTransform: 'uppercase' }}>
                      {primaryPayment.payment_method || 'CARD'}
                    </Tag>
                    <Tag color={primaryPayment.status === 'completed' ? 'success' : primaryPayment.status === 'failed' ? 'error' : 'warning'}>
                      {(primaryPayment.status || 'Pending').toUpperCase()}
                    </Tag>
                  </div>
                  <div style={{ fontSize: 12, color: '#595959', marginBottom: 4 }}>
                    <strong>Amount:</strong> ${Number(primaryPayment.amount || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 12, color: '#595959', marginBottom: 4 }}>
                    <strong>Date:</strong> {primaryPayment.payment_date ? formatDate(primaryPayment.payment_date) : '—'}
                  </div>
                  {primaryPayment.reference_number && (
                    <div style={{ fontSize: 11, color: '#8c8c8c', wordBreak: 'break-all' }}>
                      <strong>Ref:</strong> {primaryPayment.reference_number}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0', color: '#8c8c8c' }}>
                  <CreditCardOutlined style={{ fontSize: 24, marginBottom: 6, display: 'block' }} />
                  <span>No payment record found</span>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Order Items Table */}
        <Card
          size="small"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <ShoppingOutlined style={{ color: '#fa8c16' }} />
                <span>Order Items ({items.length} product {items.length === 1 ? 'line' : 'lines'})</span>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Total Quantity: {order.total_quantity || 0}
              </Text>
            </div>
          }
          style={{ borderRadius: 8 }}
          bodyStyle={{ padding: 0 }}
        >
          {items.length > 0 ? (
            <Table
              dataSource={items}
              columns={itemColumns}
              rowKey={(record) => record.order_item_id || `${record.product_id}-${record.quantity}`}
              pagination={false}
              size="middle"
              summary={(pageData) => {
                const totalCalculated = pageData.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
                const totalUnits = pageData.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
                return (
                  <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 600 }}>
                    <Table.Summary.Cell index={0}>Summary</Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      {pageData.length} items
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="center">
                      <Tag color="blue">{totalUnits} pcs</Tag>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      <span style={{ color: '#52c41a', fontSize: 15 }}>${totalCalculated.toFixed(2)}</span>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          ) : (
            <div style={{ padding: 24 }}>
              <Empty description="No product items found for this order" />
            </div>
          )}
        </Card>
      </div>
    </Modal>
  );
}

export default OrderDetailModal;

