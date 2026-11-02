-- Allow 'khqr' (Bakong KHQR) as a payment method in tbl_sale_payment
ALTER TABLE tbl_sale_payment
  DROP CHECK chk_sale_pay_method,
  ADD CONSTRAINT chk_sale_pay_method
    CHECK (payment_method IN ('cash', 'card', 'online', 'check', 'wallet', 'khqr'));
