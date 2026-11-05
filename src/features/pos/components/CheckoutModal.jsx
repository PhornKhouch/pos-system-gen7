import React, { useState } from 'react';
import {
  Modal,
  Radio,
  InputNumber,
  Button,
  Typography,
  Divider,
  Space,
  Tag,
  message,
  QRCode,
} from 'antd';
import {
  DollarOutlined,
  CreditCardOutlined,
  QrcodeOutlined,
  CheckCircleFilled,
  PrinterOutlined,
} from '@ant-design/icons';
import { posApi } from '../services/posApi';

const { Title, Text } = Typography;

export function CheckoutModal({
  open,
  onClose,
  cartItems = [],
  customer,
  subtotal,
  discountAmount,
  taxAmount,
  grandTotal,
  discountPercent = 0,
  taxPercent = 0,
  onSuccessfulPayment,
}) {
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'card' | 'qr'
  const [tenderedAmount, setTenderedAmount] = useState(grandTotal);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [khqr, setKhqr] = useState(null); // pending KHQR sale from the server
  const [now, setNow] = useState(Date.now());

  // Auto-update tendered amount when modal opens or total changes
  React.useEffect(() => {
    if (open) {
      setTenderedAmount(grandTotal);
      setReceiptData(null);
    }
  }, [open, grandTotal]);

  const downloadReceipt = async (saleId, receiptNumber) => {
    try {
      await posApi.downloadReceiptPdf(saleId, receiptNumber);
    } catch (err) {
      message.error('Could not download receipt PDF. Use "Download Receipt" to try again.');
    }
  };

  // Sale is saved on the server (sale, items, payment, invoice) — show the receipt and download the PDF
  const finishKhqrSale = (data) => {
    const receipt = {
      id: data.receipt_number || data.sale_no,
      saleId: data.sale_id,
      customer: customer?.name || 'Walk-in customer',
      paymentMethod: 'khqr',
      total: Number(data.total_amount),
      changeDue: 0,
    };
    setKhqr(null);
    setReceiptData(receipt);
    message.success('KHQR payment received!');
    downloadReceipt(receipt.saleId, receipt.id);
    if (onSuccessfulPayment) {
      onSuccessfulPayment(receipt);
    }
  };

  // Poll Bakong (via our API) every 3s while a QR is displayed
  const khqrSaleId = khqr?.sale_id;
  React.useEffect(() => {
    if (!khqrSaleId) return undefined;
    let stopped = false;
    let timer;

    const poll = async () => {
      try {
        const res = await posApi.checkKhqr(khqrSaleId);
        if (stopped) return;
        if (res.status === 'COMPLETED') {
          finishKhqrSale(res.data);
          return;
        }
        if (res.status === 'EXPIRED' || res.status === 'CANCELLED') {
          setKhqr(null);
          message.warning('KHQR expired. Please generate a new one.');
          return;
        }
      } catch (err) {
        if (stopped) return;
        if (err.status === 409) {
          // Paid, but amount/account does not match this sale
          setKhqr(null);
          message.error(err.message);
          return;
        }
        // Network / Bakong hiccup: keep polling
      }
      if (!stopped) timer = setTimeout(poll, 3000);
    };

    timer = setTimeout(poll, 3000);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [khqrSaleId]);

  // Countdown tick for the QR expiry
  React.useEffect(() => {
    if (!khqr) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [khqr]);

  const secondsLeft = khqr
    ? Math.max(0, Math.round((new Date(khqr.expires_at).getTime() - now) / 1000))
    : 0;

  const handleGenerateKhqr = async () => {
    setIsProcessing(true);
    try {
      const res = await posApi.generateKhqr({
        items: cartItems.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
        discount_percent: discountPercent,
        tax_percent: taxPercent,
        customer_id: customer?.id != null && Number.isInteger(Number(customer.id)) ? Number(customer.id) : null,
        currency: 'USD',
      });
      setNow(Date.now());
      setKhqr(res.data);
    } catch (err) {
      message.error(err.message || 'Failed to generate KHQR');
    } finally {
      setIsProcessing(false);
    }
  };

  // Closing with a QR on screen cancels the pending sale (unless it was just paid)
  const handleClose = async () => {
    if (khqr) {
      const saleId = khqr.sale_id;
      setKhqr(null);
      try {
        const res = await posApi.cancelKhqr(saleId);
        if (res.status === 'COMPLETED') {
          finishKhqrSale(res.data);
          return;
        }
      } catch (err) {
        message.error(err.message || 'Failed to cancel KHQR');
      }
    }
    onClose();
  };

  const changeDue = Math.max(0, (tenderedAmount || 0) - grandTotal);
  const isSufficient =
    paymentMethod !== 'cash' || (tenderedAmount || 0) >= grandTotal;

  const handleCompleteSale = async () => {
    if (!isSufficient) {
      message.error('Tendered cash is less than total amount!');
      return;
    }

    setIsProcessing(true);
    try {
      const orderPayload = {
        customer: customer?.name || 'Walk-in customer',
        customerId: customer?.id || 'walk-in',
        items: cartItems,
        subtotal,
        discountAmount,
        taxAmount,
        total: grandTotal,
        paymentMethod,
        tenderedAmount: paymentMethod === 'cash' ? tenderedAmount : grandTotal,
        changeDue: paymentMethod === 'cash' ? changeDue : 0,
      };

      const result = await posApi.processCheckout(orderPayload);
      if (result.success) {
        setReceiptData(result.data);
        message.success('Payment completed successfully!');
        if (onSuccessfulPayment) {
          onSuccessfulPayment(result.data);
        }
      }
    } catch (err) {
      message.error(err.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    // Server-saved sales have a real invoice PDF; local cash/card sales fall back to browser print
    if (receiptData?.saleId) {
      downloadReceipt(receiptData.saleId, receiptData.id);
      return;
    }
    window.print();
  };

  // If sale completed, show receipt screen
  if (receiptData) {
    return (
      <Modal
        open={open}
        onCancel={onClose}
        footer={[
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={handlePrintReceipt}
          >
            {receiptData.saleId ? 'Download Receipt' : 'Print Receipt'}
          </Button>,
          <Button
            key="new"
            type="primary"
            onClick={onClose}
            style={{ backgroundColor: '#2563eb' }}
          >
            New Sale (Done)
          </Button>,
        ]}
        width={450}
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <CheckCircleFilled style={{ fontSize: 50, color: '#10b981' }} />
          <Title level={4} style={{ marginTop: 12, marginBottom: 4 }}>
            Payment Successful!
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Receipt #{receiptData.id}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <div
            style={{
              textAlign: 'left',
              background: '#f8fafc',
              borderRadius: 8,
              padding: 14,
              fontSize: 13,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text type="secondary">Customer:</Text>
              <Text strong>{receiptData.customer}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text type="secondary">Payment Mode:</Text>
              <Tag color="blue" style={{ textTransform: 'uppercase' }}>
                {receiptData.paymentMethod}
              </Tag>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text type="secondary">Total Paid:</Text>
              <Text strong style={{ color: '#2563eb', fontSize: 15 }}>
                ${receiptData.total.toFixed(2)}
              </Text>
            </div>
            {receiptData.paymentMethod === 'cash' && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Change Returned:</Text>
                <Text strong style={{ color: '#16a34a' }}>
                  ${receiptData.changeDue.toFixed(2)}
                </Text>
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <Space>
          <DollarOutlined style={{ color: '#2563eb' }} />
          <span>Checkout & Payment</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={520}
    >
      <div style={{ padding: '8px 0' }}>
        {/* Total Banner */}
        <div
          style={{
            background: '#f1f5f9',
            padding: '16px 20px',
            borderRadius: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 20,
          }}
        >
          <div>
            <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>
              Amount Due ({cartItems.reduce((a, b) => a + b.quantity, 0)} items)
            </Text>
            <Text strong style={{ fontSize: 12 }}>
              Customer: {customer?.name || 'Walk-in'}
            </Text>
          </div>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#2563eb' }}>
            ${grandTotal.toFixed(2)}
          </span>
        </div>

        {/* Payment Method Selector */}
        <Title level={5} style={{ fontSize: 13, marginBottom: 10 }}>
          SELECT PAYMENT METHOD
        </Title>
        <Radio.Group
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          disabled={!!khqr}
          style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}
        >
          <Radio.Button
            value="cash"
            style={{
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            <DollarOutlined /> Cash
          </Radio.Button>

          <Radio.Button
            value="card"
            style={{
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            <CreditCardOutlined /> Card
          </Radio.Button>

          <Radio.Button
            value="qr"
            style={{
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            <QrcodeOutlined /> KHQR
          </Radio.Button>
        </Radio.Group>

        <Divider style={{ margin: '18px 0' }} />

        {/* Method-Specific Controls */}
        {paymentMethod === 'cash' && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>
                Cash Tendered ($)
              </Text>
              <InputNumber
                style={{ width: '100%', height: 44, fontSize: 18 }}
                min={0}
                value={tenderedAmount}
                onChange={(val) => setTenderedAmount(val || 0)}
                prefix="$"
              />
            </div>

            {/* Quick Cash Buttons */}
            <Space wrap style={{ marginBottom: 16 }}>
              {[grandTotal, 20, 50, 100, 200, 500].map((amt, idx) => (
                <Button
                  key={idx}
                  size="small"
                  onClick={() => setTenderedAmount(amt)}
                >
                  {idx === 0 ? 'Exact' : `$${amt}`}
                </Button>
              ))}
            </Space>

            {/* Change Calculation */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 8,
                background: changeDue >= 0 ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${changeDue >= 0 ? '#a7f3d0' : '#fecaca'}`,
              }}
            >
              <Text strong>Change Due:</Text>
              <Text
                strong
                style={{
                  fontSize: 16,
                  color: changeDue >= 0 ? '#10b981' : '#ef4444',
                }}
              >
                ${changeDue.toFixed(2)}
              </Text>
            </div>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CreditCardOutlined style={{ fontSize: 36, color: '#2563eb' }} />
            <p style={{ marginTop: 8, fontWeight: 600 }}>
              Insert, Swipe or Tap Card on Terminal
            </p>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Terminal is waiting for customer card...
            </Text>
          </div>
        )}

        {paymentMethod === 'qr' && !khqr && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <QrcodeOutlined style={{ fontSize: 36, color: '#2563eb' }} />
            <p style={{ marginTop: 8, fontWeight: 600 }}>
              Generate a Bakong KHQR for ${grandTotal.toFixed(2)}
            </p>
            <Text type="secondary" style={{ fontSize: 12 }}>
              The sale is recorded automatically once the customer pays.
            </Text>
          </div>
        )}

        {paymentMethod === 'qr' && khqr && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ display: 'inline-block', padding: 8, background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <QRCode value={khqr.qr} size={200} status={secondsLeft > 0 ? 'active' : 'expired'} />
            </div>
            <p style={{ marginTop: 8, fontWeight: 600, fontSize: 13 }}>
              Scan with Bakong, ABA, ACLEDA or any KHQR app
            </p>
            <Text strong style={{ display: 'block', fontSize: 16, color: '#2563eb' }}>
              {khqr.currency === 'KHR'
                ? `៛${Number(khqr.amount).toLocaleString()}`
                : `$${Number(khqr.amount).toFixed(2)}`}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {khqr.sale_no} ·{' '}
              {secondsLeft > 0
                ? `Waiting for payment… expires in ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
                : 'QR expired — checking final status…'}
            </Text>
          </div>
        )}

        <Divider style={{ margin: '18px 0' }} />

        {/* Complete Order Button */}
        {paymentMethod === 'qr' && khqr ? (
          <Button block size="large" danger onClick={handleClose} style={{ height: 48, fontWeight: 700 }}>
            Cancel KHQR
          </Button>
        ) : (
          <Button
            type="primary"
            block
            size="large"
            loading={isProcessing}
            disabled={!isSufficient || (paymentMethod === 'qr' && cartItems.length === 0)}
            onClick={paymentMethod === 'qr' ? handleGenerateKhqr : handleCompleteSale}
            style={{
              height: 48,
              backgroundColor: '#2563eb',
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {paymentMethod === 'qr'
              ? `Generate KHQR ($${grandTotal.toFixed(2)})`
              : `Complete Sale ($${grandTotal.toFixed(2)})`}
          </Button>
        )}
      </div>
    </Modal>
  );
}

export default CheckoutModal;
