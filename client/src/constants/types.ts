import type { Dispatch, ReactNode, SetStateAction } from 'react';

export type Product = {
  _id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  sizes?: string[];
  category: string;
  stock: number;
  isFeatured: boolean;
  isActive?: boolean;
  createdAt?: string;
  ratings?: {
    average: number;
    count: number;
  };
};

export type HeaderProps = {
  title?: string;
  showBck?: boolean;
  showBack?: boolean;
  showSearch?: boolean;
  showCart?: boolean;
  showMenu?: boolean;
  showLogo?: boolean;
  cartCount?: number;
};

export type CategoryItemProps = {
  item: {
    id?: string;
    name: string;
    Icon?: string;
  };
  isSelected?: boolean;
  onPress?: () => void;
};

export type ProductCardProps = {
  product: Product;
  onPress?: () => void;
};

export type Address = {
  _id: string;
  user?: string;
  type?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
};

export type WishlistContextType = {
  wishlist: Product[];
  setWishlist: Dispatch<SetStateAction<Product[]>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
};

export type AppChildren = { children: ReactNode };
