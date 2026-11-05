import { useState, useMemo, useCallback } from 'react';
import { INITIAL_CART_ITEMS, MOCK_CUSTOMERS } from '../services/mockData';

export function usePosCart() {
  const [cartItems, setCartItems] = useState(INITIAL_CART_ITEMS);
  const [customer, setCustomer] = useState(MOCK_CUSTOMERS[0]); // Walk-in customer
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [heldOrders, setHeldOrders] = useState([]);

  // Subtotal calculation
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  // Customer loyalty discount or manual discount
  const effectiveDiscountRate = useMemo(() => {
    return Math.max(discountPercent, customer?.discountRate || 0);
  }, [discountPercent, customer]);

  const discountAmount = useMemo(() => {
    return (subtotal * effectiveDiscountRate) / 100;
  }, [subtotal, effectiveDiscountRate]);

  const taxAmount = useMemo(() => {
    const afterDiscount = subtotal - discountAmount;
    return (afterDiscount * taxPercent) / 100;
  }, [subtotal, discountAmount, taxPercent]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  const totalItemCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Add product to cart
  const addToCart = useCallback((product) => {
    if (product.stock <= 0) return false;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id || item.sku === product.sku
      );

      if (existingIndex > -1) {
        // Increment quantity if available in stock
        const updated = [...prev];
        const existing = updated[existingIndex];
        if (existing.quantity < product.stock) {
          updated[existingIndex] = {
            ...existing,
            quantity: existing.quantity + 1,
          };
        }
        return updated;
      }

      // Add new item
      const avatarCode =
        product.avatarCode ||
        product.sku.substring(0, 3).toUpperCase() ||
        'PRD';

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          quantity: 1,
          avatarCode,
          maxStock: product.stock,
        },
      ];
    });

    return true;
  }, []);

  // Update quantity with stepper
  const updateQuantity = useCallback((sku, delta) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.sku === sku) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  }, []);

  // Set specific quantity
  const setItemQuantity = useCallback((sku, qty) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((item) => item.sku !== sku));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.sku === sku ? { ...item, quantity: qty } : item))
    );
  }, []);

  // Remove item completely
  const removeItem = useCallback((sku) => {
    setCartItems((prev) => prev.filter((item) => item.sku !== sku));
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Reset back to initial mockup state
  const resetToMockup = useCallback(() => {
    setCartItems(INITIAL_CART_ITEMS);
    setCustomer(MOCK_CUSTOMERS[0]);
    setDiscountPercent(0);
    setTaxPercent(0);
  }, []);

  // Hold / Park order
  const holdOrder = useCallback(() => {
    if (!cartItems.length) return false;
    const newHold = {
      id: `HOLD-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customer,
      items: cartItems,
      total: grandTotal,
    };
    setHeldOrders((prev) => [newHold, ...prev]);
    clearCart();
    return newHold;
  }, [cartItems, customer, grandTotal, clearCart]);

  // Resume held order
  const resumeOrder = useCallback((holdId) => {
    setHeldOrders((prev) => {
      const target = prev.find((h) => h.id === holdId);
      if (target) {
        setCartItems(target.items);
        setCustomer(target.customer);
        return prev.filter((h) => h.id !== holdId);
      }
      return prev;
    });
  }, []);

  return {
    cartItems,
    customer,
    setCustomer,
    subtotal,
    discountPercent,
    effectiveDiscountRate,
    setDiscountPercent,
    taxPercent,
    setTaxPercent,
    discountAmount,
    taxAmount,
    grandTotal,
    totalItemCount,
    heldOrders,
    addToCart,
    updateQuantity,
    setItemQuantity,
    removeItem,
    clearCart,
    resetToMockup,
    holdOrder,
    resumeOrder,
  };
}

export default usePosCart;
