import React, { createContext, useState, useEffect } from "react";

const CART_STORAGE_KEY = "shopping-cart";

const areAttributesEqual = (attributes1, attributes2) => {
  if (attributes1.length !== attributes2.length) return false;
  return attributes1.every((attr1) => {
    const attr2 = attributes2.find((attr) => attr.name === attr1.name);
    return attr2 && attr1.value === attr2.value;
  });
};

const addCartItem = (cartItems, productToAdd, quantity) => {
  const existingCartItem = cartItems.find(
    (cartItem) =>
      cartItem.id === productToAdd.id &&
      areAttributesEqual(
        cartItem.selectedAttributes,
        productToAdd.selectedAttributes,
      ),
  );

  if (existingCartItem) {
    return cartItems.map((cartItem) =>
      cartItem.id === productToAdd.id &&
      areAttributesEqual(
        cartItem.selectedAttributes,
        productToAdd.selectedAttributes,
      )
        ? { ...cartItem, quantity: cartItem.quantity + quantity }
        : cartItem,
    );
  }

  return [...cartItems, { ...productToAdd, quantity: quantity }];
};

const clearCartItem = (cartItems, itemIdx) => {
  return cartItems.filter((cartItem, idx) => idx !== itemIdx);
};

const updateCartItem = (cartItems, itemIdx, quantityChange) => {
  return cartItems.map((cartItem, index) =>
    index === itemIdx
      ? { ...cartItem, quantity: cartItem.quantity + quantityChange }
      : cartItem,
  );
};

const clearCart = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
  return [];
};

// Load cart items from localStorage
const loadCartFromStorage = () => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
    return [];
  }
};

export const CartContext = createContext({
  addItemToCart: () => {},
  ClearCart: () => {},
  clearItemFromCart: () => {},
  updateCartItemQuantity: () => {},
  cartItems: [],
  cartCount: 0,
  cartTotal: 0,
});

export const CartProvider = ({ children }) => {
  // Initialize state directly from localStorage
  const [cartItems, setCartItems] = useState(loadCartFromStorage());
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  // Update localStorage whenever cart items change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const newCartTotal = cartItems.reduce(
      (total, cartItem) => total + cartItem.quantity * cartItem.price,
      0,
    );
    setCartTotal(newCartTotal);

    const newCartCount = cartItems.length;
    setCartCount(newCartCount);
  }, [cartItems]);

  const addItemToCart = (productToAdd, quantity) => {
    setCartItems(addCartItem(cartItems, productToAdd, quantity));
  };

  const clearItemFromCart = (itemIdx) => {
    setCartItems(clearCartItem(cartItems, itemIdx));
  };

  const updateCartItemQuantity = (itemIdx, quantityChange) => {
    setCartItems(updateCartItem(cartItems, itemIdx, quantityChange));
  };

  const ClearCart = () => {
    setCartItems(clearCart());
  };

  const value = {
    addItemToCart,
    ClearCart,
    clearItemFromCart,
    updateCartItemQuantity,
    cartItems,
    cartCount,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
