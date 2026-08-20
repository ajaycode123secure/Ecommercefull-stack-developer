import React, { useState, useMemo, useRef, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
  Pressable,
  StatusBar,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, CATEGORIES } from "@/constants";
import { dummyProducts } from "../../assets/assets";
import ProductCard from "./components/ProductCard";
import { Product } from "@/constants/types";

const ALL_CATEGORIES = [{ id: "All", name: "All" }, ...CATEGORIES];

type SortKey = "default" | "price_asc" | "price_desc" | "rating" | "newest";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "default", label: "Default" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "rating", label: "Top Rated" },
  { key: "newest", label: "Newest" },
];

export default function ShopScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [showSortModal, setShowSortModal] = useState(false);
  const [isFeaturedOnly, setIsFeaturedOnly] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [slideAnim] = useState(() => new Animated.Value(300));

  useFocusEffect(
    useCallback(() => {
      setProducts([...dummyProducts] as Product[]);
      if (params.category) {
        setSelectedCategory(params.category as string);
      }
    }, [params.category])
  );

  const openSortModal = () => {
    setShowSortModal(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeSortModal = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowSortModal(false));
  };

  const filteredProducts = useMemo(() => {
    let list = products;

    if (selectedCategory !== "All") {
      list = list.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (isFeaturedOnly) {
      list = list.filter((p) => p.isFeatured);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    switch (sortKey) {
      case "price_asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort(
          (a, b) => (b.ratings?.average ?? 0) - (a.ratings?.average ?? 0)
        );
        break;
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()
        );
        break;
    }

    return sorted;
  }, [products, searchQuery, selectedCategory, sortKey, isFeaturedOnly]);

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={{ width: "48%", marginBottom: 16 }}>
      <ProductCard
        product={item}
        onPress={() =>
          router.push({ pathname: "/product/[id]", params: { id: item._id } })
        }
      />
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
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 8 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
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
          Shop
        </Text>

        {/* Cart icon with badge */}
        <TouchableOpacity style={{ position: "relative" }}>
          <Ionicons name="bag-outline" size={24} color={COLORS.text} />
          <View
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              backgroundColor: COLORS.error,
              borderRadius: 8,
              minWidth: 16,
              height: 16,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 3,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "bold" }}>
              3
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ─── Search Bar + Filter Button ─── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: COLORS.white,
          gap: 10,
        }}
      >
        {/* Search input */}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: COLORS.lightGray,
            borderRadius: 10,
            paddingHorizontal: 12,
            height: 42,
          }}
        >
          <Ionicons name="search-outline" size={17} color={COLORS.gray} />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor={COLORS.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: 7,
              fontSize: 14,
              color: COLORS.text,
              paddingVertical: 0,
            }}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>

        {/* Dark filter/sort button */}
        <TouchableOpacity
          onPress={openSortModal}
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            backgroundColor: COLORS.text,
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.75}
        >
          <Ionicons name="options-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ─── Category Chips ─── */}
      <View style={{ backgroundColor: COLORS.white, paddingBottom: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {ALL_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 7,
                  borderRadius: 999,
                  backgroundColor: active ? COLORS.primary : COLORS.lightGray,
                }}
                activeOpacity={0.75}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: active ? "#fff" : COLORS.textSecondary,
                  }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Featured chip */}
          <TouchableOpacity
            onPress={() => setIsFeaturedOnly((v) => !v)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: isFeaturedOnly ? "#FEF3C7" : COLORS.lightGray,
              gap: 4,
            }}
            activeOpacity={0.75}
          >
            <Ionicons
              name="star"
              size={12}
              color={isFeaturedOnly ? "#F59E0B" : COLORS.gray}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: isFeaturedOnly ? "#D97706" : COLORS.textSecondary,
              }}
            >
              Featured
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ─── Product Grid ─── */}
      {filteredProducts.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 60,
          }}
        >
          <Ionicons name="search-outline" size={56} color={COLORS.border} />
          <Text
            style={{
              marginTop: 12,
              fontSize: 17,
              fontWeight: "600",
              color: COLORS.textSecondary,
            }}
          >
            No products found
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
            Try adjusting your search or filters
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSortKey("default");
              setIsFeaturedOnly(false);
            }}
            style={{
              marginTop: 20,
              paddingHorizontal: 24,
              paddingVertical: 11,
              borderRadius: 999,
              backgroundColor: COLORS.primary,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
              Clear Filters
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ─── Sort Bottom Sheet Modal ─── */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="none"
        onRequestClose={closeSortModal}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
          onPress={closeSortModal}
        >
          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: COLORS.white,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: 40,
            }}
          >
            <Pressable>
              {/* Drag handle */}
              <View
                style={{ alignItems: "center", paddingTop: 12, marginBottom: 4 }}
              >
                <View
                  style={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: COLORS.border,
                  }}
                />
              </View>

              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: COLORS.text,
                  marginHorizontal: 20,
                  marginTop: 14,
                  marginBottom: 10,
                }}
              >
                Sort By
              </Text>

              {SORT_OPTIONS.map((option) => {
                const active = sortKey === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => {
                      setSortKey(option.key);
                      closeSortModal();
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 20,
                      paddingVertical: 15,
                      borderBottomWidth: 1,
                      borderBottomColor: COLORS.border,
                    }}
                    activeOpacity={0.6}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 15,
                        fontWeight: active ? "700" : "400",
                        color: active ? COLORS.primary : COLORS.text,
                      }}
                    >
                      {option.label}
                    </Text>
                    {active && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={COLORS.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
