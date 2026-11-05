import React, { useState } from 'react';
import {
  Card,
  Input,
  Select,
  Button,
  Space,
  Alert,
  Tag,
  Tooltip,
  Tabs,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  DollarCircleOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  UserOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { CustomerOrdersTable } from '../components/CustomerOrdersTable';
import { CustomerOrdersByCustomer } from '../components/CustomerOrdersByCustomer';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { useCustomerOrders } from '../hooks/useCustomerOrders';
import { useCustomers } from '../hooks/useCustomers';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS_FILTER_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Cancelled', value: 'cancelled' },
];

export function CustomerOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCustomerId = searchParams.get('customer_id') || 'all';

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId);
  const [viewingOrder, setViewingOrder] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  // Fetch orders with filters
  const { orders, total, loading, error, stats, refetch } = useCustomerOrders({
    search: debouncedSearch,
    status,
    customer_id: selectedCustomerId,
  });

  // Fetch customers for the filter dropdown
  const { customers: customerList } = useCustomers();

  const customerOptions = [
    { label: 'All Customers', value: 'all' },
    ...customerList.map((c) => ({
      label: `${c.customer_name} (${c.email || c.phone || `#${c.customer_id}`})`,
      value: String(c.customer_id),
    })),
  ];

  const handleSelectCustomerFromTable = (customer) => {
    setSelectedCustomerId(String(customer.customer_id));
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('all');
    setSelectedCustomerId('all');
  };

  return (
    <div className="customer-orders-container">
      <Header
        title="Customer Orders"
        subtitle="Manage customer orders, view purchased items, payment status, and invoices"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Customers', path: '/customers' },
          { label: 'Customer Orders', path: '/customer-orders' },
        ]}
      />

      {error && (
        <Alert
          type="error"
          message="Failed to load customer orders"
          description={error}
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Top Statistic KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
          >
            <Statistic
              title={<span style={{ fontWeight: 500 }}>Total Orders</span>}
              value={stats.totalOrders}
              prefix={<ShoppingOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
          >
            <Statistic
              title={<span style={{ fontWeight: 500 }}>Total Revenue</span>}
              value={stats.totalRevenue}
              precision={2}
              prefix={<DollarCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ fontWeight: 700, color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
          >
            <Statistic
              title={<span style={{ fontWeight: 500 }}>Completed Orders</span>}
              value={stats.completedCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ fontWeight: 700, color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
          >
            <Statistic
              title={<span style={{ fontWeight: 500 }}>Total Items Sold</span>}
              value={stats.totalItems}
              prefix={<AppstoreOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ fontWeight: 700, color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content with Tabs */}
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'orders',
              label: (
                <span>
                  <UnorderedListOutlined /> All Customer Orders ({total})
                </span>
              ),
              children: (
                <div>
                  {/* Filters Bar */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <Space wrap size="middle">
                      <Input
                        placeholder="Search order no, customer, email, invoice..."
                        prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                      />
                      <Select
                        value={status}
                        onChange={setStatus}
                        style={{ width: 150 }}
                        options={STATUS_FILTER_OPTIONS}
                      />
                      <Select
                        showSearch
                        optionFilterProp="label"
                        value={selectedCustomerId}
                        onChange={setSelectedCustomerId}
                        style={{ width: 220 }}
                        options={customerOptions}
                        placeholder="Filter by Customer"
                      />
                      {(search || status !== 'all' || selectedCustomerId !== 'all') && (
                        <Button type="dashed" onClick={handleResetFilters}>
                          Reset Filters
                        </Button>
                      )}
                    </Space>

                    <Space size="middle">
                      <Tooltip title="Refresh orders">
                        <Button icon={<ReloadOutlined />} onClick={refetch} loading={loading}>
                          Refresh
                        </Button>
                      </Tooltip>
                      <Tag color="blue" style={{ borderRadius: 12, padding: '4px 12px', fontSize: 13 }}>
                        Showing {total} {total === 1 ? 'order' : 'orders'}
                      </Tag>
                    </Space>
                  </div>

                  {/* Customer Orders Table */}
                  <CustomerOrdersTable
                    orders={orders}
                    loading={loading}
                    onViewOrder={(record) => setViewingOrder(record)}
                    onSelectCustomer={handleSelectCustomerFromTable}
                  />
                </div>
              ),
            },
            {
              key: 'by-customer',
              label: (
                <span>
                  <UserOutlined /> Orders by Customer
                </span>
              ),
              children: (
                <CustomerOrdersByCustomer
                  onViewOrderModal={(record) => setViewingOrder(record)}
                  preselectedCustomerId={selectedCustomerId !== 'all' ? selectedCustomerId : null}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Full Order Detail Modal */}
      <OrderDetailModal
        order={viewingOrder}
        open={viewingOrder !== null}
        onClose={() => setViewingOrder(null)}
        onStatusUpdated={() => {
          refetch();
          setViewingOrder(null);
        }}
      />
    </div>
  );
}

export default CustomerOrdersPage;

