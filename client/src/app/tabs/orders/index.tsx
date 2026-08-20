import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import {
    FlatList,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    ScrollView,
    Image,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { COLORS } from "@/constants";
import type { Order } from "@/constants/types";
import { dummyOrders, formatDate } from "../../../../assets/assets";

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
    placed:     { bg: '#EFF6FF', text: '#2563EB', icon: 'receipt-outline' },
    processing: { bg: '#FFFBEB', text: '#D97706', icon: 'time-outline' },
    shipped:    { bg: '#F3E8FF', text: '#7C3AED', icon: 'airplane-outline' },
    delivered:  { bg: '#F0FDF4', text: '#16A34A', icon: 'checkmark-circle-outline' },
    cancelled:  { bg: '#FEF2F2', text: '#DC2626', icon: 'close-circle-outline' },
};

const PAYMENT_STYLES: Record<string, { bg: string; text: string }> = {
    paid:    { bg: '#F0FDF4', text: '#16A34A' },
    pending: { bg: '#FFFBEB', text: '#D97706' },
    failed:  { bg: '#FEF2F2', text: '#DC2626' },
};

function getStatusStyle(status: string) {
    return STATUS_STYLES[status?.toLowerCase()] ?? { bg: '#F3F4F6', text: '#374151', icon: 'help-circle-outline' };
}
function getPaymentStyle(status: string) {
    return PAYMENT_STYLES[status?.toLowerCase()] ?? { bg: '#F3F4F6', text: '#374151' };
}

export default function Orders() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            setOrders([...dummyOrders] as any[]);
            setLoading(false);
        }, [])
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.centered} edges={['top']}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    if (orders.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Header title="My Orders" showBack />
                <View style={styles.centered}>
                    <Ionicons name="bag-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>No Orders Yet</Text>
                    <Text style={styles.emptySubtitle}>Your orders will appear here once you start shopping</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Header title="My Orders" showBack />

            <FlatList
                data={orders}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const statusStyle = getStatusStyle(item.orderStatus);
                    const payStyle = getPaymentStyle(item.paymentStatus);

                    return (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => router.push(`/orders/${item._id}`)}
                            activeOpacity={0.7}
                        >
                            {/* Card Header Row */}
                            <View style={styles.cardHeader}>
                                <View style={styles.orderNumberRow}>
                                    <Ionicons name="bag-handle-outline" size={16} color={COLORS.primary} />
                                    <Text style={styles.orderNumber}> #{item.orderNumber}</Text>
                                </View>
                                <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                            </View>

                            {/* Status Badges */}
                            <View style={styles.badgeRow}>
                                <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                                    <Ionicons name={statusStyle.icon as any} size={12} color={statusStyle.text} />
                                    <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                                        {' '}{item.orderStatus}
                                    </Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: payStyle.bg }]}>
                                    <Ionicons
                                        name={item.paymentStatus === 'paid' ? 'shield-checkmark-outline' : 'hourglass-outline'}
                                        size={12}
                                        color={payStyle.text}
                                    />
                                    <Text style={[styles.badgeText, { color: payStyle.text }]}>
                                        {' '}{item.paymentStatus}
                                    </Text>
                                </View>
                            </View>

                            {/* Payment method */}
                            <View style={styles.payMethodRow}>
                                <Ionicons name="card-outline" size={14} color="#9CA3AF" />
                                <Text style={styles.payMethodText}>
                                    {'  '}Payment via{' '}
                                    <Text style={styles.payMethodValue}>{item.paymentMethod}</Text>
                                </Text>
                            </View>

                            {/* Product Thumbnails */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.thumbScroll}
                                contentContainerStyle={{ paddingRight: 4 }}
                            >
                                {item.items.map((prod: any, idx: number) => {
                                    const image = prod.product?.images?.[0];
                                    return (
                                        <View key={idx} style={styles.thumbContainer}>
                                            {image ? (
                                                <Image
                                                    source={{ uri: image }}
                                                    style={styles.thumbImage}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View style={styles.thumbPlaceholder}>
                                                    <Ionicons name="image-outline" size={18} color="#D1D5DB" />
                                                </View>
                                            )}
                                            {prod.quantity > 1 && (
                                                <View style={styles.quantityBadge}>
                                                    <Text style={styles.quantityText}>×{prod.quantity}</Text>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </ScrollView>

                            {/* Footer: items count + total */}
                            <View style={styles.cardFooter}>
                                <Text style={styles.itemCount}>
                                    <Text style={styles.itemCountNum}>{item.items.length}</Text>
                                    {item.items.length === 1 ? ' item' : ' items'}
                                </Text>
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Total  </Text>
                                    <Text style={styles.totalAmount}>${item.totalAmount.toFixed(2)}</Text>
                                </View>
                            </View>

                            {/* Chevron */}
                            <View style={styles.chevronWrap}>
                                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        backgroundColor: '#F8FAFC',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 20,
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        position: 'relative',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    orderNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderNumber: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        letterSpacing: 0.3,
    },
    orderDate: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    payMethodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    payMethodText: {
        fontSize: 12,
        color: '#94A3B8',
    },
    payMethodValue: {
        color: '#475569',
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    thumbScroll: {
        marginBottom: 12,
    },
    thumbContainer: {
        marginRight: 8,
        position: 'relative',
    },
    thumbImage: {
        width: 52,
        height: 52,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
    },
    thumbPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#4F46E5',
        borderRadius: 8,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    quantityText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '700',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    itemCount: {
        fontSize: 13,
        color: '#94A3B8',
        fontWeight: '400',
    },
    itemCountNum: {
        color: '#475569',
        fontWeight: '700',
    },
    totalRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 13,
        color: '#94A3B8',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        letterSpacing: -0.3,
    },
    chevronWrap: {
        position: 'absolute',
        right: 12,
        top: '50%',
    },
});
