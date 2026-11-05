import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Avatar,
  Space,
  Tag,
  Button,
  Drawer,
  Typography,
  Descriptions,
  Collapse,
  Empty,
  Image,
  Input,
  Row,
  Col,
  Statistic,
  Alert,
} from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  RightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { formatDate } from '@/utils/formatDate';
import { customerApi } from '../services/customerApi';
import { useDebounce } from '@/hooks/useDebounce';

const { Text, Title } = Typography;

const STATUS_TAGS = {
  completed: { color: 'success', icon: <CheckCircleOutlined />, label: 'Completed' },
  pending: { color: 'warning', icon: <ClockCircleOutlined />, label: 'Pending' },
  cancelled: { color: 'error', icon: <CloseCircleOutlined />, label: 'Cancelled' },
  processing: { color: 'processing', icon: <ClockCircleOutlined />, label: 'Processing' },
  shipped: { color: 'cyan', icon: <ClockCircleOutlined />, label: 'Shipped' },
  delivered: { color: 'geekblue', icon: <CheckCircleOutlined />, label: 'Delivered' },
};

export function CustomerOrdersByCustomer({ onViewOrderModal, preselectedCustomerId = null }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerSummary, setCustomerSummary] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const fetchCustomersWithOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await customerApi.getCustomersWithOrders({ search: debouncedSearch });
      const list = res?.list || [];
      setCustomers(list);

      // If preselectedCustomerId was provided, auto-open that customer
      if (preselectedCustomerId) {
        const found = list.find((c) => String(c.customer_id) === String(preselectedCustomerId));
        if (found) {
          handleOpenCustomerDrawer(found);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersWithOrders();
  }, [debouncedSearch]);

  const handleOpenCustomerDrawer = async (customer) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const res = await customerApi.getOrdersByCustomerId(customer.customer_id);
      setCustomerOrders(res?.orders || []);
      setCustomerSummary(res?.summary || null);
    } catch (err) {
      // Fallback to customer's loaded orders if available
      setCustomerOrders(customer.orders || []);
    } finally {
      setDrawerLoading(false);
    }
  };

  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <Space size="middle">
          <Avatar size={42} style={{ backgroundColor: '#1677ff', fontWeight: 600 }}>
            {(record.customer_name || 'C').charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, color: '#262626', fontSize: 14 }}>
              {record.customer_name}
            </div>
            <Space size="small" style={{ fontSize: 12, color: '#8c8c8c' }}>
              {record.email && (
                <span>
                  <MailOutlined style={{ marginRight: 4 }} />
                  {record.email}
                </span>
              )}
              {record.phone && (
                <span>
                  <PhoneOutlined style={{ marginRight: 4 }} />
                  {record.phone}
                </span>
              )}
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => {
        const loc = [record.city, record.country].filter(Boolean).join(', ');
        return loc ? (
          <span>
            <EnvironmentOutlined style={{ color: '#8c8c8c', marginRight: 4 }} />
            {loc}
          </span>
        ) : (
          <span style={{ color: '#bfbfbf' }}>—</span>
        );
      },
    },
    {
      title: 'Total Orders',
      dataIndex: 'orders_count',
      key: 'orders_count',
      align: 'center',
      width: 130,
      sorter: (a, b) => (a.orders_count || 0) - (b.orders_count || 0),
      render: (count) => (
        <Tag color={count > 0 ? 'blue' : 'default'} style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>
          {count} {count === 1 ? 'order' : 'orders'}
        </Tag>
      ),
    },
    {
      title: 'Total Spent',
      dataIndex: 'total_spent',
      key: 'total_spent',
      align: 'right',
      width: 140,
      sorter: (a, b) => (a.total_spent || 0) - (b.total_spent || 0),
      render: (spent) => (
        <span style={{ fontWeight: 700, color: '#52c41a' }}>
          ${Number(spent || 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Latest Order',
      key: 'latest_order',
      render: (_, record) => {
        const latest = record.latest_order;
        if (!latest) return <span style={{ color: '#bfbfbf' }}>No orders yet</span>;
        const statusMeta = STATUS_TAGS[(latest.status || '').toLowerCase()] || { color: 'default', label: latest.status };
        return (
          <div>
            <div style={{ fontWeight: 600 }}>{latest.order_no}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {latest.order_date ? formatDate(latest.order_date) : '—'} •{' '}
              <Tag color={statusMeta.color} style={{ fontSize: 11, padding: '0 6px', borderRadius: 6 }}>
                {statusMeta.label}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<RightOutlined />}
          onClick={() => handleOpenCustomerDrawer(record)}
        >
          View Orders
        </Button>
      ),
    },
  ];

  return (
    <div>
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      {/* Filter header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Input
          placeholder="Search customer by name, email, or phone..."
          prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 340 }}
          allowClear
        />
        <Button icon={<ReloadOutlined />} onClick={fetchCustomersWithOrders} loading={loading}>
          Refresh
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={customers}
        rowKey="customer_id"
        loading={loading}
        onRow={(record) => ({
          onClick: () => handleOpenCustomerDrawer(record),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} customers`,
        }}
      />

      {/* Drawer: Detailed Orders and Order Items for Clicked Customer */}
      <Drawer
        title={
          selectedCustomer ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar size={38} style={{ backgroundColor: '#1677ff' }}>
                {(selectedCustomer.customer_name || 'C').charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedCustomer.customer_name}</div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Customer #{selectedCustomer.customer_id}</div>
              </div>
            </div>
          ) : (
            'Customer Orders'
          )
        }
        width={760}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        loading={drawerLoading}
        destroyOnClose
      >
        {selectedCustomer && (
          <div>
            {/* Customer Summary Bar */}
            <Card size="small" style={{ marginBottom: 20, background: '#fafafa', borderRadius: 8 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title={<span style={{ fontSize: 12 }}>Total Orders</span>}
                    value={customerSummary?.total_orders ?? customerOrders.length}
                    prefix={<ShoppingOutlined style={{ color: '#1677ff' }} />}
                    valueStyle={{ fontSize: 20 }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title={<span style={{ fontSize: 12 }}>Total Spent</span>}
                    value={customerSummary?.total_spent ?? selectedCustomer.total_spent ?? 0}
                    precision={2}
                    prefix="$"
                    valueStyle={{ fontSize: 20, color: '#52c41a' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title={<span style={{ fontSize: 12 }}>Completed</span>}
                    value={customerSummary?.completed_orders ?? customerOrders.filter((o) => o.status === 'completed').length}
                    valueStyle={{ fontSize: 20, color: '#1677ff' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title={<span style={{ fontSize: 12 }}>Loyalty Points</span>}
                    value={selectedCustomer.loyalty_points ?? 0}
                    valueStyle={{ fontSize: 20, color: '#faad14' }}
                  />
                </Col>
              </Row>

              <Descriptions size="small" column={2} style={{ marginTop: 12 }}>
                <Descriptions.Item label="Email">{selectedCustomer.email || '—'}</Descriptions.Item>
                <Descriptions.Item label="Phone">{selectedCustomer.phone || '—'}</Descriptions.Item>
                <Descriptions.Item label="Address">
                  {[selectedCustomer.address, selectedCustomer.city, selectedCustomer.country].filter(Boolean).join(', ') || '—'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* List of Orders for this Customer */}
            <Title level={5} style={{ marginBottom: 12 }}>
              Orders & Purchased Items ({customerOrders.length})
            </Title>

            {customerOrders.length === 0 ? (
              <Empty description="No orders placed by this customer yet." style={{ margin: '40px 0' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {customerOrders.map((order) => {
                  const statusMeta = STATUS_TAGS[(order.status || '').toLowerCase()] || {
                    color: 'default',
                    label: order.status,
                  };
                  const items = order.items || [];
                  const payment = order.primary_payment || order.payments?.[0];
                  const invoice = order.invoice;

                  return (
                    <Card
                      key={order.order_id}
                      size="small"
                      style={{
                        borderRadius: 10,
                        border: '1px solid #e8e8e8',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space size="middle">
                            <Text strong style={{ fontSize: 15 }}>
                              Order #{order.order_no}
                            </Text>
                            <Tag color={statusMeta.color} icon={statusMeta.icon} style={{ borderRadius: 8 }}>
                              {statusMeta.label}
                            </Tag>
                          </Space>
                          <Space size="small">
                            <Button
                              size="small"
                              type="link"
                              onClick={() => onViewOrderModal && onViewOrderModal(order)}
                            >
                              Full Details
                            </Button>
                          </Space>
                        </div>
                      }
                      extra={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {order.order_date ? formatDate(order.order_date) : '—'}
                        </Text>
                      }
                    >
                      {/* Meta badges: Total amount, Payment status, Invoice number */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '6px 12px',
                          background: '#fafafa',
                          borderRadius: 6,
                          marginBottom: 12,
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        <Space size="middle">
                          <span>
                            <Text type="secondary" style={{ fontSize: 12 }}>Total: </Text>
                            <Text strong style={{ color: '#52c41a', fontSize: 15 }}>
                              ${Number(order.total_amount || 0).toFixed(2)}
                            </Text>
                          </span>
                          <span>
                            <Text type="secondary" style={{ fontSize: 12 }}>Items: </Text>
                            <Tag color="cyan">
                              {order.items_count || items.length} items ({order.total_quantity || 0} pcs)
                            </Tag>
                          </span>
                        </Space>

                        <Space size="middle">
                          {invoice && (
                            <Tag color="geekblue" icon={<FileTextOutlined />}>
                              Inv: {invoice.invoice_number}
                            </Tag>
                          )}
                          {payment && (
                            <Tag color="purple" icon={<CreditCardOutlined />}>
                              {(payment.payment_method || 'CARD').toUpperCase()} • {(payment.status || 'paid').toUpperCase()}
                            </Tag>
                          )}
                        </Space>
                      </div>

                      {/* Items of this order */}
                      <Table
                        dataSource={items}
                        rowKey={(it) => it.order_item_id || it.product_id}
                        pagination={false}
                        size="small"
                        columns={[
                          {
                            title: 'Product Item',
                            key: 'product',
                            render: (_, it) => {
                              const prod = it.product || {};
                              return (
                                <Space size="middle">
                                  {prod.image ? (
                                    <Image
                                      src={prod.image}
                                      alt={prod.product_name}
                                      width={36}
                                      height={36}
                                      style={{ objectFit: 'cover', borderRadius: 6 }}
                                      fallback="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' fill='%23eee'><rect width='36' height='36'/></svg>"
                                    />
                                  ) : (
                                    <Avatar shape="square" size={36} icon={<ShoppingOutlined />} />
                                  )}
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{prod.product_name || 'Product'}</div>
                                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>SKU: {prod.sku || 'N/A'}</div>
                                  </div>
                                </Space>
                              );
                            },
                          },
                          {
                            title: 'Price',
                            dataIndex: 'unit_price',
                            key: 'unit_price',
                            align: 'right',
                            width: 100,
                            render: (p) => `$${Number(p || 0).toFixed(2)}`,
                          },
                          {
                            title: 'Qty',
                            dataIndex: 'quantity',
                            key: 'quantity',
                            align: 'center',
                            width: 80,
                            render: (q) => <Tag color="blue">x{q}</Tag>,
                          },
                          {
                            title: 'Total',
                            dataIndex: 'total_price',
                            key: 'total_price',
                            align: 'right',
                            width: 110,
                            render: (tp) => (
                              <span style={{ fontWeight: 600, color: '#1677ff' }}>
                                ${Number(tp || 0).toFixed(2)}
                              </span>
                            ),
                          },
                        ]}
                      />
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default CustomerOrdersByCustomer;

