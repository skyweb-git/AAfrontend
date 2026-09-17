import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Cart Context
const CartContext = createContext();

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + action.payload.price
        };
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }],
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + action.payload.price
        };
      }

    case 'REMOVE_FROM_CART':
      const itemToRemove = state.items.find(item => item.id === action.payload);
      if (itemToRemove) {
        const updatedItems = state.items.filter(item => item.id !== action.payload);
        const itemTotal = itemToRemove.price * itemToRemove.quantity;
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems - itemToRemove.quantity,
          totalPrice: state.totalPrice - itemTotal
        };
      }
      return state;

    case 'UPDATE_QUANTITY':
      const itemToUpdate = state.items.find(item => item.id === action.payload.id);
      if (itemToUpdate) {
        const oldQuantity = itemToUpdate.quantity;
        const newQuantity = action.payload.quantity;
        const quantityDiff = newQuantity - oldQuantity;
        
        const updatedItemsWithQty = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: newQuantity }
            : item
        );
        
        return {
          ...state,
          items: updatedItemsWithQty,
          totalItems: state.totalItems + quantityDiff,
          totalPrice: state.totalPrice + (itemToUpdate.price * quantityDiff)
        };
      }
      return state;

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen
      };

    case 'LOAD_CART':
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
};

// Cart Provider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({
      items: state.items,
      totalItems: state.totalItems,
      totalPrice: state.totalPrice
    }));
  }, [state.items, state.totalItems, state.totalPrice]);

  const addToCart = (product) => {
    // Parse price properly - handle both ₹2,499 and 2499 formats
    let price = 0;
    if (typeof product.price === 'string') {
      price = parseFloat(product.price.replace(/[₹,]/g, ''));
    } else {
      price = parseFloat(product.price);
    }
    
    if (isNaN(price)) price = 0;
    
    console.log('Adding to cart:', { ...product, price });
    
    dispatch({
      type: 'ADD_TO_CART',
      payload: { ...product, price }
    });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: productId, quantity }
      });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
