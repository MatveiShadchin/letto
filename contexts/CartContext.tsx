'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DEFAULT_CART_EXTRAS, makeCartKey } from '@/lib/cart-extras';
import { CartAddons, CartItem, CartItemExtras, CartState, OrderPostcard, Product } from '@/types/product';

interface CartContextType {
  state: CartState;
  addPulse: number;
  addToCart: (product: Product, extras?: CartItemExtras) => void;
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  updateItemAddons: (cartKey: string, addons: CartAddons) => void;
  setOrderPostcard: (postcard: OrderPostcard) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; extras: CartItemExtras } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { cartKey: string; quantity: number } }
  | { type: 'UPDATE_ITEM_ADDONS'; payload: { cartKey: string; addons: CartAddons } }
  | { type: 'SET_ORDER_POSTCARD'; payload: OrderPostcard }
  | { type: 'CLEAR_CART' };

function calcTotals(items: CartItem[]) {
  return {
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, extras } = action.payload;
      const cartKey = makeCartKey(product.id, extras);
      const existingItem = state.items.find((item) => item.cartKey === cartKey);

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item
        );
        return { ...state, items: updatedItems, ...calcTotals(updatedItems) };
      }

      const newItem: CartItem = {
        ...product,
        cartKey,
        quantity: 1,
        postcardWanted: extras.postcardWanted,
        postcardText: extras.postcardText,
        addons: { ...extras.addons },
      };
      const newItems = [...state.items, newItem];
      return { ...state, items: newItems, ...calcTotals(newItems) };
    }

    case 'REMOVE_FROM_CART': {
      const filteredItems = state.items.filter((item) => item.cartKey !== action.payload);
      return { ...state, items: filteredItems, ...calcTotals(filteredItems) };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items
        .map((item) =>
          item.cartKey === action.payload.cartKey
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        )
        .filter((item) => item.quantity > 0);
      return { ...state, items: updatedItems, ...calcTotals(updatedItems) };
    }

    case 'UPDATE_ITEM_ADDONS': {
      const { cartKey, addons } = action.payload;
      const item = state.items.find((entry) => entry.cartKey === cartKey);
      if (!item) return state;

      const extras: CartItemExtras = {
        postcardWanted: item.postcardWanted,
        postcardText: item.postcardText,
        addons: { ...addons },
      };
      const newCartKey = makeCartKey(item.id, extras);

      if (newCartKey === cartKey) {
        const updatedItems = state.items.map((entry) =>
          entry.cartKey === cartKey ? { ...entry, addons: { ...addons } } : entry
        );
        return { ...state, items: updatedItems };
      }

      const withoutOld = state.items.filter((entry) => entry.cartKey !== cartKey);
      const existing = withoutOld.find((entry) => entry.cartKey === newCartKey);
      const newItems = existing
        ? withoutOld.map((entry) =>
            entry.cartKey === newCartKey
              ? { ...entry, quantity: entry.quantity + item.quantity }
              : entry
          )
        : [...withoutOld, { ...item, cartKey: newCartKey, addons: { ...addons } }];

      return { ...state, items: newItems, ...calcTotals(newItems) };
    }

    case 'SET_ORDER_POSTCARD':
      return { ...state, orderPostcard: action.payload };

    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0, orderPostcard: null };

    default:
      return state;
  }
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  orderPostcard: null,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [addPulse, setAddPulse] = React.useState(0);

  const addToCart = (product: Product, extras: CartItemExtras = DEFAULT_CART_EXTRAS) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, extras } });
    setAddPulse((n) => n + 1);
  };

  const removeFromCart = (cartKey: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: cartKey });
  };

  const updateQuantity = (cartKey: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartKey, quantity } });
  };

  const updateItemAddons = (cartKey: string, addons: CartAddons) => {
    dispatch({ type: 'UPDATE_ITEM_ADDONS', payload: { cartKey, addons } });
  };

  const setOrderPostcard = (postcard: OrderPostcard) => {
    dispatch({ type: 'SET_ORDER_POSTCARD', payload: postcard });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addPulse,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemAddons,
        setOrderPostcard,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
