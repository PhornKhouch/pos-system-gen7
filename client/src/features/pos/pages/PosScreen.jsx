import React, { useState } from 'react';
import { message } from 'antd';
import { usePosProducts } from '../hooks/usePosProducts';
import { usePosCart } from '../hooks/usePosCart';
import { PosHeader } from '../components/PosHeader';
import { PosCategorySidebar } from '../components/PosCategorySidebar';
import { PosProductGrid } from '../components/PosProductGrid';
import { PosCartSidebar } from '../components/PosCartSidebar';
import { CustomerLookupModal } from '../components/CustomerLookupModal';
import { ZReportModal } from '../components/ZReportModal';
import { CheckoutModal } from '../components/CheckoutModal';
import '../components/pos.css';

export function PosScreen() {
  const {
    categories,
    filteredProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    loading,
    findProductByBarcode,
  } = usePosProducts();

  const {
    cartItems,
    customer,
    setCustomer,
    subtotal,
    discountAmount,
    effectiveDiscountRate,
    taxPercent,
    taxAmount,
    grandTotal,
    addToCart,
    updateQuantity,
    clearCart,
    resetToMockup,
    holdOrder,
  } = usePosCart();

  // Modal visibility states
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isZReportModalOpen, setIsZReportModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Handle barcode scanned or enter pressed in search bar
  const handleBarcodeScan = (query) => {
    const product = findProductByBarcode(query);
    if (product) {
      if (product.stock <= 0) {
        message.warning(`${product.name} is out of stock!`);
      } else {
        addToCart(product);
        message.success(`Added ${product.name} to cart`);
        setSearchQuery('');
      }
    } else {
      message.info(`No product found with code "${query}"`);
    }
  };

  const handleAddToCart = (product) => {
    const added = addToCart(product);
    if (!added) {
      message.warning(`${product.name} is out of stock!`);
    }
  };

  const handleHoldOrder = () => {
    const held = holdOrder();
    if (held) {
      message.info(`Order #${held.id} has been held`);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
  };

  return (
    <div className="pos-root">
      {/* 1. Header Bar */}
      <PosHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBarcodeScan={handleBarcodeScan}
        onOpenZReport={() => setIsZReportModalOpen(true)}
      />

      {/* 2. Workspace Layout */}
      <div className="pos-workspace">
        {/* Left: Category Sidebar */}
        <PosCategorySidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Center: Product Grid */}
        <PosProductGrid
          products={filteredProducts}
          loading={loading}
          onAddToCart={handleAddToCart}
        />

        {/* Right: Cart & Checkout Sidebar */}
        <PosCartSidebar
          cartItems={cartItems}
          customer={customer}
          subtotal={subtotal}
          discountAmount={discountAmount}
          taxAmount={taxAmount}
          grandTotal={grandTotal}
          onUpdateQuantity={updateQuantity}
          onClearCart={clearCart}
          onOpenCustomerLookup={() => setIsCustomerModalOpen(true)}
          onOpenCheckout={() => setIsCheckoutModalOpen(true)}
          onHoldOrder={handleHoldOrder}
          onResetToMockup={resetToMockup}
        />
      </div>

      {/* 3. Interactive Modals */}
      <CustomerLookupModal
        open={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        currentCustomer={customer}
        onSelectCustomer={setCustomer}
      />

      <ZReportModal
        open={isZReportModalOpen}
        onClose={() => setIsZReportModalOpen(false)}
      />

      <CheckoutModal
        open={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cartItems}
        customer={customer}
        subtotal={subtotal}
        discountAmount={discountAmount}
        taxAmount={taxAmount}
        grandTotal={grandTotal}
        discountPercent={effectiveDiscountRate}
        taxPercent={taxPercent}
        onSuccessfulPayment={handlePaymentSuccess}
      />
    </div>
  );
}

// Export both PosScreen and Sale for seamless naming compatibility
export const Sale = PosScreen;
export default PosScreen;
