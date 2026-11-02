-- Storefront customer login: hashed password on the customer profile
-- (NULL for walk-in POS customers who never registered online)
ALTER TABLE tbl_customer_profile
  ADD COLUMN password VARCHAR(255) NULL DEFAULT NULL AFTER phone;

-- Storefront shopping cart, one row per customer + product
CREATE TABLE IF NOT EXISTS tbl_customer_cart (
  cart_id      INT AUTO_INCREMENT PRIMARY KEY,
  customer_id  INT NOT NULL,
  product_id   INT NOT NULL,
  quantity     INT NOT NULL DEFAULT 1,
  created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_customer_cart_item UNIQUE (customer_id, product_id),
  CONSTRAINT fk_customer_cart_customer FOREIGN KEY (customer_id)
    REFERENCES tbl_customer_profile (customer_id) ON DELETE CASCADE,
  CONSTRAINT fk_customer_cart_product FOREIGN KEY (product_id)
    REFERENCES tbl_product_master (product_id) ON DELETE CASCADE,
  CONSTRAINT chk_customer_cart_qty CHECK (quantity > 0)
);
