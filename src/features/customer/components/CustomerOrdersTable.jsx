import React from 'react';
import { Table, Tag, Avatar, Space, Button, Tooltip, Image, Typography } from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { formatDate } from '@/utils/formatDate';

const { Text } = Typography;

const STATUS_TAGS = {
  completed: { color: 'success', icon: <CheckCircleOutlined />, label: 'Completed' },
  pending: { color: 'warning', icon: <ClockCircleOutlined />, label: 'Pending' },
  cancelled: { color: 'error', icon: <CloseCircleOutlined />, label: 'Cancelled' },
  processing: { color: 'processing', icon: <ClockCircleOutlined />, label: 'Processing' },
  shipped: { color: 'cyan', icon: <ClockCircleOutlined />, label: 'Shipped' },
  delivered: { color: 'geekblue', icon: <CheckCircleOutlined />, label: 'Delivered' },
};

export function CustomerOrdersTable({
  orders = [],
  loading = false,
  onViewOrder,
  onSelectCustomer,
}) {
  const columns = [
    {
      title: 'Order No',
      dataIndex: 'order_no',
      key: 'order_no',
      width: 140,
      render: (orderNo, record) => (
        <Button
          type="link"
          style={{ padding: 0, fontWeight: 700 }}
          onClick={() => onViewOrder && onViewOrder(record)}
        >
          {orderNo}
        </Button>
      ),
    },
    {
      title: 'Order Date',
      dataIndex: 'order_date',
      key: 'order_date',
      width: 160,
      sorter: (a, b) => new Date(a.order_date) - new Date(b.order_date),
      render: (date) => (date ? formatDate(date) : '—'),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => {
        const cus = record.customer || {};
        const name = cus.customer_name || 'Customer';
        return (
          <Space orientation="horizontal" size="small">
            <Avatar size={32} style={{ backgroundColor: '#1677ff' }}>
              {name.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: onSelectCustomer ? '#1677ff' : '#262626',
                  cursor: onSelectCustomer ? 'pointer' : 'default',
                }}
                onClick={() => onSelectCustomer && cus.customer_id && onSelectCustomer(cus)}
              >
                {name}
              </div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                {cus.email || cus.phone || '—'}
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Items',
      key: 'items_count',
      align: 'center',
      width: 140,
      sorter: (a, b) => (a.items_count || 0) - (b.items_count || 0),
      render: (_, record) => {
        const count = record.items_count ?? (record.items?.length || 0);
        const qty = record.total_quantity ?? record.items?.reduce((s, i) => s + (i.quantity || 0), 0) ?? 0;
        return (
          <Tooltip title={`${count} product lines, total ${qty} units`}>
            <Tag color="cyan" style={{ borderRadius: 12, padding: '2px 8px' }}>
              <ShoppingOutlined style={{ marginRight: 4 }} />
              {count} {count === 1 ? 'item' : 'items'} ({qty} pcs)
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      align: 'right',
      width: 130,
      sorter: (a, b) => Number(a.total_amount || 0) - Number(b.total_amount || 0),
      render: (val) => (
        <span style={{ fontWeight: 700, color: '#262626' }}>
          ${Number(val || 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Payment',
      key: 'payment',
      width: 150,
      render: (_, record) => {
        const payment = record.primary_payment || record.payments?.[0];
        if (!payment) {
          return <Tag color="default">Unpaid</Tag>;
        }
        const method = (payment.payment_method || 'CARD').toUpperCase();
        const pStatus = (payment.status || 'pending').toLowerCase();
        const color = pStatus === 'completed' ? 'success' : pStatus === 'failed' ? 'error' : 'warning';
        return (
          <Space direction="vertical" size={2}>
            <Tag color="purple" icon={<CreditCardOutlined />} style={{ borderRadius: 8 }}>
              {method}
            </Tag>
            <Tag color={color} style={{ fontSize: 11, borderRadius: 8 }}>
              {pStatus.toUpperCase()}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: 'Invoice',
      key: 'invoice',
      width: 150,
      render: (_, record) => {
        const inv = record.invoice;
        if (!inv || !inv.invoice_number) {
          return <Tag color="default">No Invoice</Tag>;
        }
        return (
          <Tooltip title={`Invoice Date: ${inv.invoice_date ? formatDate(inv.invoice_date) : '—'}`}>
            <Tag color="geekblue" icon={<FileTextOutlined />} style={{ borderRadius: 8 }}>
              {inv.invoice_number}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Order Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center',
      render: (status) => {
        const s = (status || 'pending').toLowerCase();
        const meta = STATUS_TAGS[s] || { color: 'default', label: status };
        return (
          <Tag color={meta.color} icon={meta.icon} style={{ borderRadius: 12, padding: '2px 8px' }}>
            {meta.label}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Tooltip title="View Order & Items Detail">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewOrder && onViewOrder(record)}
          >
            View Items
          </Button>
        </Tooltip>
      ),
    },
  ];

  // Inline expandable row showing items directly!
  const expandedRowRender = (orderRecord) => {
    const items = orderRecord.items || [];
    if (!items.length) {
      return <div style={{ padding: '8px 16px', color: '#8c8c8c' }}>No items in this order.</div>;
    }

    return (
      <div style={{ background: '#fcfcfc', padding: '12px 24px', borderRadius: 8 }}>
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <Text strong style={{ fontSize: 13 }}>
            Items in Order #{orderRecord.order_no} ({items.length} lines)
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Click "View Items" button for full customer, invoice, and payment details
          </Text>
        </div>
        <Table
          dataSource={items}
          rowKey={(item) => item.order_item_id || item.product_id}
          pagination={false}
          size="small"
          columns={[
            {
              title: 'Product',
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
                      <div style={{ fontWeight: 600 }}>{prod.product_name || 'Product'}</div>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>SKU: {prod.sku || 'N/A'}</div>
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
              width: 120,
              render: (price) => `$${Number(price || 0).toFixed(2)}`,
            },
            {
              title: 'Quantity',
              dataIndex: 'quantity',
              key: 'quantity',
              align: 'center',
              width: 100,
              render: (qty) => <Tag color="blue">x{qty}</Tag>,
            },
            {
              title: 'Total Price',
              dataIndex: 'total_price',
              key: 'total_price',
              align: 'right',
              width: 130,
              render: (price) => (
                <span style={{ fontWeight: 600, color: '#1677ff' }}>
                  ${Number(price || 0).toFixed(2)}
                </span>
              ),
            },
          ]}
        />
      </div>
    );
  };

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="order_id"
      loading={loading}
      expandable={{
        expandedRowRender,
        rowExpandable: (record) => (record.items || []).length > 0,
      }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
      }}
      scroll={{ x: 1050 }}
    />
  );
}

export default CustomerOrdersTable;

