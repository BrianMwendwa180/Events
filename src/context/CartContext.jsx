import { useState } from 'react';
import { computeTaxAmount, getConfiguredTaxRate } from '../utils/tax';
import { CartContext } from './cartContext';

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [selectedAddOns, setSelectedAddOns] = useState({});
  const [taxRate, setTaxRate] = useState(getConfiguredTaxRate());

  const addToCart = (event, category, quantity) => {
    setCart(prev => {
      const existing = prev.find(i => i.eventId === event.id && i.categoryId === category.id);
      if (existing) {
        if (quantity === 0) return prev.filter(i => !(i.eventId === event.id && i.categoryId === category.id));
        return prev.map(i =>
          i.eventId === event.id && i.categoryId === category.id
            ? { ...i, quantity }
            : i
        );
      }
      if (quantity === 0) return prev;
      return [...prev, {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        venue: event.venue,
        categoryId: category.id,
        categoryName: category.name,
        price: category.price,
        fee: category.fee,
        total: category.total,
        quantity,
      }];
    });
  };

  const toggleAddOn = (eventId, addOn) => {
    setSelectedAddOns(prev => {
      const key = `${eventId}-${addOn.id}`;
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: { ...addOn, eventId, quantity: 1 } };
    });
  };

  const removeFromCart = (eventId, categoryId) => {
    setCart(prev => prev.filter(i => !(i.eventId === eventId && i.categoryId === categoryId)));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedAddOns({});
  };

  const cartSubtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartFees = cart.reduce((sum, i) => sum + i.fee * i.quantity, 0);
  const addOnTotal = Object.values(selectedAddOns).reduce((sum, a) => sum + a.price, 0);
  const taxableAmount = cartSubtotal + cartFees + addOnTotal;
  const cartTax = computeTaxAmount(taxableAmount, taxRate);
  const cartTotal = taxableAmount + cartTax;
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, clearCart,
      selectedAddOns, toggleAddOn,
      taxRate, setTaxRate,
      cartSubtotal, cartFees, addOnTotal, cartTax, cartTotal, cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

// `useCart` is exported from `src/context/useCart.js` to satisfy
// react-refresh/only-export-components.
