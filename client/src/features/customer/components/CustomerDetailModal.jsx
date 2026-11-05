import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Tag, Spin, Alert, Tabs, Table, Button, Space, Image, Empty } from 'antd';
import { ShoppingOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '../services/customerApi';
import { formatDate } from '@/utils/formatDate';

/**
 * Shows full customer info and order history with items
 */
export function CustomerDetailModal({ customerId, open, onClose }) {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !customerId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      customerApi.getCustomerById(customerId),
      customerApi.getOrdersByCustomerId(customerId).catch(() => ({ orders: [], summary: null })),
    ])
      .then(([cusRes, orderRes]) => {
        if (!cancelled) {
          setCustomer(cusRes?.data || null);
          setOrders(orderRes?.orders || []);
          setSummary(orderRes?.summary || null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load customer');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, customerId]);

  const isActive = customer && (customer.active === 1 || customer.active === true || customer.active === '1');

  const orderColumns = [
    {
      title: 'Order No',
      dataIndex: 'order_no',
      key: 'order_no',
      render: (no) => <span style={{ fontWeight: 600 }}>{no}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (d) => (d ? formatDate(d) : '—'),
    },
    {
      title: 'Items',
      key: 'items',
      render: (_, r) => (
        <Tag color="cyan">
          {r.items_count || (r.items || []).length} items ({r.total_quantity || 0} pcs)
        </Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      align: 'right',
      render: (t) => <span style={{ fontWeight: 600, color: '#52c41a' }}>${Number(t || 0).toFixed(2)}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (s) => {
        const color = s === 'completed' ? 'success' : s === 'cancelled' ? 'error' : 'warning';
        return <Tag color={color}>{(s || 'pending').toUpperCase()}</Tag>;
      },
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
        <Button
          key="goto-orders"
          type="primary"
          icon={<ArrowRightOutlined />}
          onClick={() => {
            onClose();
            navigate(`/customer-orders?customer_id=${customerId}&tab=by-customer`);
          }}
        >
          View Full Customer Orders
        </Button>,
      ]}
      destroyOnClose
      width={720}
      title={
        <span style={{ fontSize: 16, fontWeight: 600 }}>
          Customer Details #{customerId} {customer ? `— ${customer.customer_name}` : ''}
        </span>
      }
    >
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 12 }} />}
      <Spin spinning={loading}>
        {customer && (
          <Tabs
            defaultActiveKey="profile"
            items={[
              {
                key: 'profile',
                label: (
                  <span>
                    <UserOutlined /> Profile
                  </span>
                ),
                children: (
                  <Descriptions bordered column={1} size="small" style={{ marginTop: 8 }}>
                    <Descriptions.Item label="Name">{customer.customer_name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{customer.email || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{customer.phone || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Address">{customer.address || '—'}</Descriptions.Item>
                    <Descriptions.Item label="City">{customer.city || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Country">{customer.country || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Loyalty Points">{customer.loyalty_points ?? 0}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={isActive ? 'success' : 'error'} style={{ borderRadius: 12 }}>
                        {isActive ? 'Active' : 'Inactive'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Created">
                      {customer.created_date ? formatDate(customer.created_date) : '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Updated">
                      {customer.updated_date ? formatDate(customer.updated_date) : '—'}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'orders',
                label: (
                  <span>
                    <ShoppingOutlined /> Orders ({orders.length})
                  </span>
                ),
                children: (
                  <div style={{ marginTop: 8 }}>
                    {summary && (
                      <div
                        style={{
                          display: 'flex',
                          gap: 16,
                          marginBottom: 12,
                          background: '#fafafa',
                          padding: '8px 12px',
                          borderRadius: 6,
                        }}
                      >
                        <span>
                          <strong>Total Orders:</strong> {summary.total_orders}
                        </span>
                        <span>
                          <strong>Total Spent:</strong>{' '}
                          <span style={{ color: '#52c41a', fontWeight: 600 }}>
                            ${Number(summary.total_spent || 0).toFixed(2)}
                          </span>
                        </span>
                        <span>
                          <strong>Completed:</strong> {summary.completed_orders}
                        </span>
                      </div>
                    )}
                    {orders.length > 0 ? (
                      <Table
                        columns={orderColumns}
                        dataSource={orders}
                        rowKey="order_id"
                        pagination={false}
                        size="small"
                        expandable={{
                          expandedRowRender: (record) => (
                            <div style={{ padding: '4px 16px', background: '#fafafa' }}>
                              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 12 }}>
                                Order Items ({record.items?.length || 0}):
                              </div>
                              {(record.items || []).map((it) => (
                                <div
                                  key={it.order_item_id || it.product_id}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: 12,
                                    padding: '2px 0',
                                  }}
                                >
                                  <span>{it.product?.product_name || `Product #${it.product_id}`}</span>
                                  <span>
                                    ${Number(it.unit_price).toFixed(2)} x {it.quantity} ={' '}
                                    <strong>${Number(it.total_price).toFixed(2)}</strong>
                                  </span>
                                </div>
                              ))}
                            </div>
                          ),
                          rowExpandable: (r) => (r.items || []).length > 0,
                        }}
                      />
                    ) : (
                      <Empty description="No orders placed yet" />
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </Spin>
    </Modal>
  );
}

export default CustomerDetailModal;
