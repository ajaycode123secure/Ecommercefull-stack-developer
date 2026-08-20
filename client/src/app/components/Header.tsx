import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { HeaderProps } from '@/constants/types';
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from '@/constants';
import { useRouter } from 'expo-router';

export default function Header({
  title,
  showBck,
  showBack,
  showSearch,
  showCart,
  showMenu,
  showLogo,
  cartCount = 0,
}: HeaderProps) {
  const router = useRouter();
  const shouldShowBack = showBack ?? showBck;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: COLORS.white,
      }}
    >
      {/* Left side — Back / Menu */}
      <View style={{ flexDirection: 'row', alignItems: 'center', width: 40 }}>
        {shouldShowBack && (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
        {showMenu && (
          <TouchableOpacity>
            <Ionicons name="menu" size={26} color={COLORS.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center — Logo or Title */}
      <View style={{ flex: 1, alignItems: 'center' }}>
        {showLogo ? (
          <Image
            source={require('../../../assets/logo.png')}
            style={{ width: 120, height: 36 }}
            resizeMode="contain"
          />
        ) : (
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text }}>
            {title}
          </Text>
        )}
      </View>

      {/* Right side — Search / Cart with badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', width: 40, justifyContent: 'flex-end' }}>
        {showSearch && (
          <TouchableOpacity style={{ marginLeft: 12 }}>
            <Ionicons name="search" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
        {showCart && (
          <TouchableOpacity
            onPress={() => router.push('/tabs/cart')}
            style={{ position: 'relative' }}
            activeOpacity={0.7}
          >
            <Ionicons name="bag-outline" size={24} color={COLORS.text} />
            {cartCount >= 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  backgroundColor: COLORS.error,
                  borderRadius: 8,
                  minWidth: 16,
                  height: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 3,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}