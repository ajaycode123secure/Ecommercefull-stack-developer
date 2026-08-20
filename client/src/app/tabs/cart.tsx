import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { useCart, CartItem } from "../../../context/CartContext";

const SHIPPING_FEE = 2.0;

export default function Cart() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateCartItemQuantity, isLoading } =
    useCart();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + (cartItems.length > 0 ? SHIPPING_FEE : 0);

  const handleIncrease = (item: CartItem) => {
    updateCartItemQuantity(item.id, item.quantity + 1);
  };

  const handleDecrease = (item: CartItem) => {
    if (item.quantity <= 1) {
      removeFromCart(item.productId, item.size);
    } else {
      updateCartItemQuantity(item.id, item.quantity - 1);
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.white,
      }}
    >
      {/* Product Image */}
      <Image
        source={{ uri: item.product.images?.[0] }}
        style={{
          width: 72,
          height: 72,
          borderRadius: 8,
          backgroundColor: COLORS.lightGray,
        }}
        resizeMode="cover"
      />

      {/* Info */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: COLORS.text,
            marginBottom: 3,
          }}
          numberOfLines={2}
        >
          {item.product.name}
        </Text>
        <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 }}>
          Size: {item.size}
        </Text>
        <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.text }}>
          ${(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>

      {/* Right side: delete + qty controls */}
      <View style={{ alignItems: "flex-end", gap: 12 }}>
        {/* Delete button */}
        <TouchableOpacity
          onPress={() => removeFromCart(item.productId, item.size)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle-outline" size={20} color={COLORS.gray} />
        </TouchableOpacity>

        {/* Qty stepper */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
          }}
        >
          <TouchableOpacity
            onPress={() => handleDecrease(item)}
            style={{
              width: 28,
              height: 28,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.6}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "300",
                color: COLORS.text,
                lineHeight: 24,
              }}
            >
              −
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              minWidth: 24,
              textAlign: "center",
              fontSize: 15,
              fontWeight: "600",
              color: COLORS.text,
            }}
          >
            {item.quantity}
          </Text>

          <TouchableOpacity
            onPress={() => handleIncrease(item)}
            style={{
              width: 28,
              height: 28,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.6}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "300",
                color: COLORS.text,
                lineHeight: 24,
              }}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      edges={["top"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* ─── Header ─── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: COLORS.white,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 18,
            fontWeight: "700",
            color: COLORS.text,
          }}
        >
          My Cart
        </Text>

        {/* Placeholder to balance the header */}
        <View style={{ width: 22 }} />
      </View>

      {/* ─── Loading ─── */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : cartItems.length === 0 ? (
        /* ─── Empty State ─── */
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 60,
          }}
        >
          <Ionicons name="bag-outline" size={72} color={COLORS.border} />
          <Text
            style={{
              marginTop: 16,
              fontSize: 18,
              fontWeight: "700",
              color: COLORS.textSecondary,
            }}
          >
            Your cart is empty
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: 14,
              color: COLORS.gray,
              textAlign: "center",
              paddingHorizontal: 40,
            }}
          >
            Add items to your cart and they'll show up here
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/shop")}
            style={{
              marginTop: 24,
              paddingHorizontal: 32,
              paddingVertical: 13,
              borderRadius: 999,
              backgroundColor: COLORS.text,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
              Shop Now
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* ─── Cart Items ─── */}
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, backgroundColor: COLORS.white }}
          />

          {/* ─── Order Summary ─── */}
          <View
            style={{
              backgroundColor: COLORS.white,
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 8,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
            }}
          >
            {/* Subtotal */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>
                Subtotal
              </Text>
              <Text style={{ fontSize: 14, color: COLORS.text, fontWeight: "500" }}>
                ${subtotal.toFixed(2)}
              </Text>
            </View>

            {/* Shipping */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>
                Shipping
              </Text>
              <Text style={{ fontSize: 14, color: COLORS.text, fontWeight: "500" }}>
                ${SHIPPING_FEE.toFixed(2)}
              </Text>
            </View>

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: COLORS.border,
                marginBottom: 14,
              }}
            />

            {/* Total */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text }}>
                Total
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text }}>
                ${total.toFixed(2)}
              </Text>
            </View>

            {/* ─── Checkout Button ─── */}
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.text,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                marginBottom: 8,
              }}
              onPress={() => router.push("/checkout")}
              activeOpacity={0.85}
            >
              <Text
                style={{ color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 }}
              >
                Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}