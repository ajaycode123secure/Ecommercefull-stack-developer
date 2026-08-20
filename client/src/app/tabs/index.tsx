import {
  ScrollView,
  View,
  Image,
  Dimensions,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import Header from "../components/Header";
import { BANNERS, dummyProducts } from "../../../assets/assets";
import CategoryItem from "../components/CategoryItem";
import ProductCard from "../components/ProductCard";
import { CATEGORIES, COLORS } from "@/constants";
import { Product } from "@/constants/types";
import { useCart } from "../../../context/CartContext";

export default function Home() {
  const router = useRouter();
  const { itemCount } = useCart();
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const windowWidth = Dimensions.get("window").width;
  const containerWidth = Platform.OS === "web" ? Math.min(windowWidth, 480) : windowWidth;
  const bannerWidth = containerWidth - 32;

  const categories = [{ id: "All", name: "All", Icon: "grid" }, ...CATEGORIES];

  const fetchProducts = async () => {
    setLoading(true);
    setProducts([...dummyProducts] as Product[]);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={["top"]}>
      <Header showMenu showCart showLogo cartCount={itemCount} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* Banner Slider */}
        <ScrollView
          horizontal
          decelerationRate="fast"
          snapToInterval={bannerWidth + 12}
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: 16,
            marginTop: 12,
          }}
          onScroll={(event) => {
            const slide = Math.round(
              event.nativeEvent.contentOffset.x / (bannerWidth + 12)
            );
            if (slide !== activeBannerIndex) setActiveBannerIndex(slide);
          }}
        >
          {BANNERS.map((banner, index) => (
            <View
              key={index}
              style={{
                width: bannerWidth,
                height: 180,
                borderRadius: 16,
                overflow: "hidden",
                marginRight: index === BANNERS.length - 1 ? 0 : 12,
                position: "relative",
              }}
            >
              <Image
                source={{ uri: banner.image }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              {/* Dark overlay */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.3)",
                }}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  zIndex: 10,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 24,
                    fontWeight: "800",
                    letterSpacing: 0.5,
                  }}
                >
                  {banner.title}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 }}>
                  {banner.subtitle}
                </Text>
                <TouchableOpacity
                  style={{
                    marginTop: 10,
                    backgroundColor: "#fff",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 999,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.black,
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    Get Now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 12,
          }}
        >
          {BANNERS.map((_, index) => (
            <View
              key={index}
              style={{
                width: activeBannerIndex === index ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  activeBannerIndex === index ? COLORS.black : COLORS.border,
                marginHorizontal: 3,
              }}
            />
          ))}
        </View>

        {/* Category Section */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: COLORS.text }}>
              Categories
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 12, paddingHorizontal: 4 }}
          >
            {categories.map((cat: any) => (
              <CategoryItem
                key={cat.id}
                item={cat}
                isSelected={selectedCategory === cat.id}
                onPress={() => {
                  setSelectedCategory(cat.id);
                  router.push({
                    pathname: "/shop",
                    params: { category: cat.id },
                  });
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Popular Products */}
        <View style={{ paddingHorizontal: 16, marginTop: 24, paddingBottom: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: COLORS.text }}>
              Popular
            </Text>
            <TouchableOpacity onPress={() => router.push("/shop")}>
              <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: "600" }}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Text style={{ color: COLORS.textSecondary }}>Loading...</Text>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {filteredProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onPress={() =>
                    router.push({
                      pathname: "/product/[id]",
                      params: { id: product._id },
                    })
                  }
                />
              ))}
            </View>
          )}
           {/* Newsletter CTA */}
          <View
            style={{
              marginTop: 32,
              padding: 20,
              backgroundColor: COLORS.secondary,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "black", fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
              Join Our Revolution
            </Text>
            <Text style={{ color: "black", fontSize: 14, textAlign: "center", marginBottom: 12 }}>
              Get the latest updates and offers directly in your inbox.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#fff",
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: COLORS.primary, fontWeight: "500" }}>Subscribe</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

      