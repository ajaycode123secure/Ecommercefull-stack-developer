import {
    View,
    Text,
    ActivityIndicator,
    Dimensions,
    Image,
    TouchableOpacity,
    StatusBar,
    StyleSheet,
    Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Product } from "@/constants/types";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { dummyProducts } from "../../../assets/assets";
import { COLORS } from "@/constants";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
const appWidth = Platform.OS === "web" ? Math.min(windowWidth, 480) : windowWidth;
const IMG_HEIGHT = windowHeight * 0.52;

export default function ProductDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        setLoading(true);
        const found = dummyProducts.find((p) => p._id === id);
        setProduct(found ? { ...found, id: found._id } as Product : null);
        setLoading(false);
    }, [id]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.centered}>
                <Ionicons name="bag-remove-outline" size={64} color={COLORS.gray} />
                <Text style={styles.notFoundText}>Product not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.goBackBtn}>
                    <Text style={styles.goBackText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isLiked = isInWishlist(product._id);

    const discount = product.comparePrice
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : null;

    const handleAddToCart = () => {
        if (product.sizes?.length && !selectedSize) return;
        addToCart(product, selectedSize ?? "M");
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

                {/* ── IMAGE SECTION ── */}
                <View style={{ height: IMG_HEIGHT }}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16}
                        onScroll={(e) =>
                            setActiveImageIndex(Math.round(e.nativeEvent.contentOffset.x / appWidth))
                        }
                    >
                        {product.images.map((img, i) => (
                            <Image
                                key={i}
                                source={{ uri: img }}
                                style={{ width: appWidth, height: IMG_HEIGHT }}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>

                    {/* Gradient overlay top - simulated with stacked Views */}
                    <View style={styles.topGradient} pointerEvents="none">
                        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.38)" }} />
                        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.18)" }} />
                        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.06)" }} />
                        <View style={{ flex: 1, backgroundColor: "transparent" }} />
                    </View>

                    {/* Gradient overlay bottom - simulated */}
                    <View style={styles.bottomGradient} pointerEvents="none">
                        <View style={{ flex: 1, backgroundColor: "transparent" }} />
                        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.08)" }} />
                        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.16)" }} />
                    </View>

                    {/* Top bar */}
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                            <Ionicons name="arrow-back" size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleWishlist(product)} style={styles.iconBtn}>
                            <Ionicons
                                name={isLiked ? "heart" : "heart-outline"}
                                size={20}
                                color={isLiked ? "#FF6B6B" : "#fff"}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Discount badge */}
                    {discount && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{discount}% OFF</Text>
                        </View>
                    )}

                    {/* Featured badge */}
                    {product.isFeatured && (
                        <View style={styles.featuredBadge}>
                            <Ionicons name="flash" size={10} color="#fff" />
                            <Text style={styles.featuredText}>FEATURED</Text>
                        </View>
                    )}

                    {/* Dot indicators */}
                    {product.images.length > 1 && (
                        <View style={styles.dotsRow}>
                            {product.images.map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.dot,
                                        i === activeImageIndex && styles.dotActive,
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* ── INFO CARD ── */}
                <View style={styles.card}>

                    {/* Name + Category row */}
                    <View style={styles.nameRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.category}>{product.category}</Text>
                            <Text style={styles.productName}>{product.name}</Text>
                        </View>
                        {product.stock <= 10 && product.stock > 0 && (
                            <View style={styles.stockBadge}>
                                <Text style={styles.stockText}>Only {product.stock} left</Text>
                            </View>
                        )}
                    </View>

                    {/* Rating */}
                    {product.ratings && product.ratings.average > 0 && (
                        <View style={styles.ratingRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons
                                    key={star}
                                    name={star <= Math.round(product.ratings!.average) ? "star" : "star-outline"}
                                    size={14}
                                    color="#FBBF24"
                                />
                            ))}
                            <Text style={styles.ratingText}>
                                {product.ratings.average.toFixed(1)}
                            </Text>
                            <Text style={styles.reviewCount}>
                                ({product.ratings.count} reviews)
                            </Text>
                        </View>
                    )}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Price */}
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                        {product.comparePrice && (
                            <Text style={styles.comparePrice}>${product.comparePrice.toFixed(2)}</Text>
                        )}
                        {discount && (
                            <View style={styles.saveBadge}>
                                <Text style={styles.saveText}>Save ${(product.comparePrice! - product.price).toFixed(2)}</Text>
                            </View>
                        )}
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Sizes */}
                    {product.sizes && product.sizes.length > 0 && (
                        <View style={styles.sizeSection}>
                            <View style={styles.sizeHeader}>
                                <Text style={styles.sectionLabel}>Select Size</Text>
                                {selectedSize && (
                                    <Text style={styles.selectedSizeLabel}>{selectedSize}</Text>
                                )}
                            </View>
                            <View style={styles.sizeRow}>
                                {product.sizes.map((size) => {
                                    const active = selectedSize === size;
                                    return (
                                        <TouchableOpacity
                                            key={size}
                                            onPress={() => setSelectedSize(size)}
                                            activeOpacity={0.75}
                                            style={[styles.sizeBtn, active && styles.sizeBtnActive]}
                                        >
                                            <Text style={[styles.sizeBtnText, active && styles.sizeBtnTextActive]}>
                                                {size}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Description */}
                    <View style={{ marginTop: 4 }}>
                        <Text style={styles.sectionLabel}>Description</Text>
                        <Text style={styles.description}>{product.description}</Text>
                    </View>

                    {/* Perks */}
                    <View style={styles.perksRow}>
                        {[
                            { icon: "car-outline", label: "Free Delivery" },
                            { icon: "refresh-outline", label: "Easy Return" },
                            { icon: "shield-checkmark-outline", label: "Authentic" },
                        ].map((p) => (
                            <View key={p.label} style={styles.perkItem}>
                                <Ionicons name={p.icon as any} size={22} color={COLORS.primary} />
                                <Text style={styles.perkLabel}>{p.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* ── STICKY BOTTOM BAR ── */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    onPress={() => toggleWishlist(product)}
                    style={styles.wishlistRound}
                >
                    <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={22}
                        color={isLiked ? "#FF6B6B" : COLORS.text}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleAddToCart}
                    activeOpacity={0.85}
                    style={[
                        styles.addToCartBtn,
                        product.sizes?.length && !selectedSize && styles.addToCartDisabled,
                    ]}
                >
                    <Ionicons
                        name={addedToCart ? "checkmark-circle" : "bag-add-outline"}
                        size={20}
                        color="#fff"
                    />
                    <Text style={styles.addToCartText}>
                        {addedToCart
                            ? "Added to Cart!"
                            : product.sizes?.length && !selectedSize
                            ? "Select a Size First"
                            : ""}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FA" },
    centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8F9FA", gap: 12 },
    notFoundText: { fontSize: 18, fontWeight: "600", color: COLORS.textSecondary, marginTop: 8 },
    goBackBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: COLORS.primary, borderRadius: 24 },
    goBackText: { color: "#fff", fontWeight: "700", fontSize: 14 },

    // Image overlays
    topGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 100, flexDirection: "column" },
    bottomGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: 80, flexDirection: "column" },
    topBar: {
        position: "absolute", top: Platform.OS === "ios" ? 52 : 40,
        left: 0, right: 0,
        flexDirection: "row", justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    iconBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center", alignItems: "center",
    },
    discountBadge: {
        position: "absolute", top: Platform.OS === "ios" ? 106 : 92,
        left: 16,
        backgroundColor: "#EF4444",
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    },
    discountText: { color: "#fff", fontWeight: "800", fontSize: 11 },
    featuredBadge: {
        position: "absolute", top: Platform.OS === "ios" ? 106 : 92,
        right: 16,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
        flexDirection: "row", alignItems: "center", gap: 4,
    },
    featuredText: { color: "#fff", fontWeight: "700", fontSize: 10 },
    dotsRow: {
        position: "absolute", bottom: 14,
        alignSelf: "center",
        flexDirection: "row", gap: 5,
    },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.5)" },
    dotActive: { width: 18, backgroundColor: "#fff" },

    // Card
    card: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        marginTop: -24,
        paddingHorizontal: 20, paddingTop: 28, paddingBottom: 16,
        shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
    },
    nameRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
    category: { fontSize: 12, fontWeight: "600", color: COLORS.primary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
    productName: { fontSize: 22, fontWeight: "800", color: COLORS.text, lineHeight: 28 },
    stockBadge: {
        backgroundColor: "#FEF3C7",
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginLeft: 10, marginTop: 20,
    },
    stockText: { color: "#92400E", fontSize: 11, fontWeight: "700" },

    // Rating
    ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 3 },
    ratingText: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginLeft: 4 },
    reviewCount: { fontSize: 12, color: COLORS.textSecondary },

    divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 16 },

    // Price
    priceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    price: { fontSize: 28, fontWeight: "900", color: COLORS.primary },
    comparePrice: { fontSize: 16, color: COLORS.gray, textDecorationLine: "line-through" },
    saveBadge: { backgroundColor: "#DCFCE7", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    saveText: { color: "#166534", fontSize: 11, fontWeight: "700" },

    // Sizes
    sizeSection: { marginBottom: 4 },
    sizeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionLabel: { fontSize: 15, fontWeight: "700", color: COLORS.text },
    selectedSizeLabel: { fontSize: 13, fontWeight: "600", color: COLORS.primary },
    sizeRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    sizeBtn: {
        minWidth: 48, height: 44, borderRadius: 10,
        borderWidth: 1.5, borderColor: "#E2E8F0",
        backgroundColor: "#F8FAFC",
        justifyContent: "center", alignItems: "center",
        paddingHorizontal: 14,
    },
    sizeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
    sizeBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.text },
    sizeBtnTextActive: { color: "#fff" },

    // Description
    description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginTop: 8 },

    // Perks
    perksRow: {
        flexDirection: "row", justifyContent: "space-around",
        marginTop: 20, paddingTop: 16,
        borderTopWidth: 1, borderTopColor: "#F1F5F9",
    },
    perkItem: { alignItems: "center", gap: 6 },
    perkLabel: { fontSize: 11, fontWeight: "600", color: COLORS.textSecondary },

    // Bottom bar
    bottomBar: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: Platform.OS === "ios" ? 30 : 18,
        backgroundColor: "#fff",
        borderTopWidth: 1, borderTopColor: "#F1F5F9",
        shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
    },
    wishlistRound: {
        width: 50, height: 50, borderRadius: 14,
        borderWidth: 1.5, borderColor: "#E2E8F0",
        justifyContent: "center", alignItems: "center",
        backgroundColor: "#F8FAFC",
    },
    addToCartBtn: {
        flex: 1, height: 50, borderRadius: 14,
        backgroundColor: COLORS.primary,
        flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
    },
    addToCartDisabled: { backgroundColor: COLORS.gray },
    addToCartText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
