import { Product, WishlistContextType } from '@/constants/types';

import { dummyWishlist } from '../assets/assets';
import { createContext, useContext, useEffect, useState } from 'react';


const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {

    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchWishlist = async () => {
        setLoading(true);
        setWishlist(dummyWishlist);
        setLoading(false);
    }

    const toggleWishlist = (product: Product) => {
        const isInWishlist = wishlist.find((p) => p.id === product.id);
        setWishlist((prevWishlist) => {
          const existing = prevWishlist.find((p) => p.id === product.id);
          if (existing) {
            return prevWishlist.filter((p) => p.id !== product.id);
          } else {
            return [...prevWishlist, product];
          }
        });
    };
    const isInWishlist = (productId: string) => {
        return wishlist.some((product) => product.id === productId);
    }


    useEffect(() => {
        fetchWishlist();
    }, []);
       
    


  return (
    <WishlistContext.Provider value={{ wishlist, setWishlist, loading, setLoading, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};