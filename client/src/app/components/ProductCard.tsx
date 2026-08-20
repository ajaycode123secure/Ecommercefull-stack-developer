import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { ProductCardProps } from '@/constants/types';
import { COLORS } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '../../../context/WishlistContext';

export default function ProductCard({ product, onPress }: ProductCardProps) {

  const { toggleWishlist, isInWishlist } = useWishlist();
  const isLiked = isInWishlist(product._id);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ width: '48%', marginBottom: 16 }}
      activeOpacity={0.85}
    >
      <View
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: COLORS.white,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Image + Badges */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: product.images[0] }}
            style={{ width: '100%', height: 160 }}
            resizeMode="cover"
          />

          {/* Featured badge */}
          {product.isFeatured && (
            <View
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: COLORS.black,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>
                FEATURED
              </Text>
            </View>
          )}

          {/* Wishlist button */}
          <TouchableOpacity
            onPress={() => toggleWishlist(product)}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#fff',
              borderRadius: 20,
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={18}
              color={isLiked ? COLORS.secondary : COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={{ padding: 10 }}>
          <Text
            style={{ fontSize: 14, fontWeight: '600', color: COLORS.text }}
            numberOfLines={1}
          >
            {product.name}
          </Text>

          {/* Rating */}
          {product.ratings && product.ratings.average > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
              <Ionicons name="star" size={12} color="#F59E0B" style={{ marginRight: 2 }} />
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginLeft: 1 }}>
                {product.ratings.average.toFixed(1)}
              </Text>
            </View>
          )}

          {/* Price */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.black }}>
              ${product.price.toFixed(2)}
            </Text>
            {product.comparePrice && (
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.gray,
                  textDecorationLine: 'line-through',
                  marginLeft: 6,
                }}
              >
                ${product.comparePrice.toFixed(2)}
              </Text>
            )}
          </View>
          



        </View>
      </View>
    </TouchableOpacity>
  );
}
