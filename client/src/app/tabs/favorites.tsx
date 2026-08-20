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
import { useWishlist } from "../../../context/WishlistContext";
import { Product } from "@/constants/types";

export default function Favorites() {
  const router = useRouter();
  const { wishlist, toggleWishlist, loading } = useWishlist();

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={{ width: "48%", marginBottom: 16 }}
      activeOpacity={0.88}
      onPress={() =>
        router.push({ pathname: "/product/[id]", params: { id: item._id } })
      }
    >
      <View
        style={{
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: COLORS.white,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Image + Heart */}
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: item.images?.[0] }}
            style={{ width: "100%", height: 160 }}
            resizeMode="cover"
          />

          {/* Red filled heart — always active since it's in wishlist */}
          <TouchableOpacity
            onPress={() => toggleWishlist(item)}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(255,255,255,0.92)",
              borderRadius: 20,
              padding: 5,
            }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="heart" size={17} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={{ padding: 10 }}>
          {/* Rating */}
          {item.ratings && item.ratings.average > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.textSecondary,
                  marginLeft: 3,
                }}
              >
                {item.ratings.average.toFixed(1)}
              </Text>
            </View>
          )}

          {/* Name */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: COLORS.text,
              marginBottom: 4,
            }}
            numberOfLines={2}
          >
            {item.name}
          </Text>

          {/* Price */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: COLORS.text,
              }}
            >
              ${item.price.toFixed(2)}
            </Text>
            {item.comparePrice && (
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.gray,
                  textDecorationLine: "line-through",
                  marginLeft: 6,
                }}
              >
                ${item.comparePrice.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
        {/* Hamburger */}
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="menu" size={24} color={COLORS.text} />
        </TouchableOpacity>

        {/* Title */}
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 18,
            fontWeight: "700",
            color: COLORS.text,
          }}
        >
          Wishlist
        </Text>

        {/* Cart bag icon */}
        <TouchableOpacity
          onPress={() => router.push("/tabs/cart")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="bag-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* ─── Loading ─── */}
      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : wishlist.length === 0 ? (
        /* ─── Empty State ─── */
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 60,
          }}
        >
          <Ionicons name="heart-outline" size={72} color={COLORS.border} />
          <Text
            style={{
              marginTop: 16,
              fontSize: 18,
              fontWeight: "700",
              color: COLORS.textSecondary,
            }}
          >
            No favourites yet
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
            Tap the heart on any product to save it here
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
              Explore Products
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* ─── Wishlist Grid ─── */
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}