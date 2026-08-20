import { Product } from '@/constants/types';
import { dummyCart } from '../assets/assets';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type CartItem = {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  size: string;
  price: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string) => Promise<void>;
  removeFromCart: (itemId: string, size: string) => Promise<void>;
  updateCartItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  itemCount: number;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cartTotal, setCartTotal] = useState<number>(0);

  const fetchCartItems = async () => {
    setIsLoading(true);
    try {
      // dummyCart is an object: { items: [...], totalAmount: number }
      const mappedItems: CartItem[] = dummyCart.items.map((item: any) => ({
        id: item._id ?? item.productId ?? item.product?._id,
        productId: item.product?._id ?? item._id,
        product: { ...item.product, id: item.product?._id },
        quantity: item.quantity ?? 1,
        size: item.size || 'M',
        price: item.price ?? item.product?.price ?? 0,
      }));
      setCartItems(mappedItems);
      setCartTotal(dummyCart.totalAmount);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product, size: string) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.productId === product._id && item.size === size
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === product._id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `${product._id}_${size}`,
          productId: product._id,
          product,
          quantity: 1,
          size,
          price: product.price,
        },
      ];
    });
  };

  const removeFromCart = async (itemId: string, size: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.productId === itemId && item.size === size))
    );
  };

  const updateCartItemQuantity = async (itemId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    setCartItems([]);
    setCartTotal(0);
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    fetchCartItems();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        cartTotal,
        itemCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};