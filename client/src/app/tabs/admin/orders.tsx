import React, { useState, useCallback } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Pressable,
  FlatList,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, getStatusColor } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { dummyOrders, dummyUser } from "../../../../assets/assets";

const STATUSES = ["placed", "processing", "shipped", "delivered", "cancelled"];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  placed:     { bg: "#DBEAFE", text: "#1D4ED8" },
  processing: { bg: "#FEF3C7", text: "#D97706" },
  shipped:    { bg: "#EDE9FE", text: "#7C3AED" },
  delivered:  { bg: "#DCFCE7", text: "#16A34A" },
  cancelled:  { bg: "#FEE2E2", text: "#DC2626" },
};

export default function AdminOrders() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = () => {
    setOrders(
      [...dummyOrders].map((order: any) => ({ ...order, user: dummyUser }))
    );
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  const openStatusModal = (order: any) => {
    setSelectedOrder(order);
    setStatusModalVisible(true);
  };

  const updateStatus = (newStatus: string) => {
    // Update local state
    setOrders((prev) =>
      prev.map((o) =>
        o._id === selectedOrder._id ? { ...o, orderStatus: newStatus } : o
      )
    );
    // Update in-memory shared array
    const idx = dummyOrders.findIndex((o) => o._id === selectedOrder._id);
    if (idx !== -1) {
      dummyOrders[idx] = {
        ...dummyOrders[idx],
        orderStatus: newStatus,
      };
    }
    setStatusModalVisible(false);
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      (o.user?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={COLORS.black} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      {/* ─── Top Bar ─── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topLabel}>Total Orders</Text>
          <Text style={styles.topCount}>{filtered.length} orders</Text>
        </View>
      </View>

      {/* ─── Search ─── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={COLORS.gray} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by order ID or customer..."
            placeholderTextColor={COLORS.gray}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ─── Status Filter Chips ─── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChips}
        style={styles.filterRow}
      >
        {["all", ...STATUSES].map((s) => {
          const active = statusFilter === s;
          const st = STATUS_STYLES[s] || { bg: COLORS.lightGray, text: COLORS.textSecondary };
          return (
            <TouchableOpacity
              key={s}
              onPress={() => setStatusFilter(s)}
              style={[
                styles.chip,
                active && { backgroundColor: s === "all" ? COLORS.black : st.bg },
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  active && { color: s === "all" ? "#fff" : st.text, fontWeight: "700" },
                ]}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ─── Orders List ─── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        ) : (
          filtered.map((order: any) => {
            const st = STATUS_STYLES[order.orderStatus] || STATUS_STYLES["placed"];
            return (
              <View key={order._id} style={styles.orderCard}>
                {/* Header */}
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId} numberOfLines={1}>
                    #{order._id.slice(-8).toUpperCase()}
                  </Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {/* Customer */}
                <View style={styles.customerRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(order.user?.name || "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.customerName}>{order.user?.name || "Unknown"}</Text>
                    <Text style={styles.customerEmail}>{order.user?.email || "No email"}</Text>
                  </View>
                </View>

                {/* Address */}
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={13} color={COLORS.gray} />
                  <Text style={styles.addressText} numberOfLines={1}>
                    {order.shippingAddress?.street}, {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state}
                  </Text>
                </View>

                {/* Items */}
                <View style={styles.itemsBox}>
                  {order.items.map((item: any) => (
                    <View key={item._id} style={styles.itemRow}>
                      <View style={styles.itemDot} />
                      <Text style={styles.itemText} numberOfLines={1}>
                        {item.quantity}× {item.product?.name || item.name}
                        {item.size ? <Text style={styles.itemSize}> ({item.size})</Text> : null}
                      </Text>
                      <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.divider} />

                {/* Footer */}
                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>${order.totalAmount.toFixed(2)}</Text>
                  <TouchableOpacity
                    onPress={() => openStatusModal(order)}
                    style={[styles.statusBadge, { backgroundColor: st.bg }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.statusText, { color: st.text }]}>
                      {order.orderStatus?.toUpperCase()}
                    </Text>
                    <Ionicons name="pencil" size={10} color={st.text} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ─── Status Modal ─── */}
      <Modal visible={statusModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setStatusModalVisible(false)}>
          <Pressable style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Status</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            {STATUSES.map((s) => {
              const active = selectedOrder?.orderStatus === s;
              const st = STATUS_STYLES[s];
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => updateStatus(s)}
                  style={[styles.statusOption, active && { backgroundColor: st.bg }]}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.statusOptionText, active && { color: st.text, fontWeight: "700" }]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                  {active && <Ionicons name="checkmark-circle" size={18} color={st.text} />}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },

  /* Top Bar */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topLabel: { fontSize: 12, color: COLORS.gray, fontWeight: "500" },
  topCount: { fontSize: 18, fontWeight: "800", color: COLORS.text, letterSpacing: -0.3 },

  /* Search */
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text, paddingVertical: 0 },

  /* Filter Chips */
  filterRow: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border, maxHeight: 52 },
  filterChips: { paddingHorizontal: 16, gap: 8, paddingVertical: 10, alignItems: "center" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.lightGray,
  },
  chipText: { fontSize: 12, fontWeight: "500", color: COLORS.textSecondary },

  /* List */
  scroll: { flex: 1 },
  listContent: { padding: 12, paddingBottom: 40, gap: 10 },

  /* Empty */
  emptyBox: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: COLORS.gray },

  /* Order Card */
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderId: { fontSize: 13, fontWeight: "700", color: COLORS.text, fontFamily: "monospace" },
  orderDate: { fontSize: 12, color: COLORS.gray },

  /* Customer */
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
    backgroundColor: COLORS.lightGray,
    padding: 10,
    borderRadius: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 13, fontWeight: "700", color: COLORS.black },
  customerName: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  customerEmail: { fontSize: 11, color: COLORS.gray },

  /* Address */
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  addressText: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },

  /* Items */
  itemsBox: { gap: 4, marginBottom: 10 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  itemDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.gray },
  itemText: { flex: 1, fontSize: 12, color: COLORS.textSecondary },
  itemSize: { color: COLORS.gray },
  itemPrice: { fontSize: 12, fontWeight: "600", color: COLORS.text },

  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 10 },

  /* Footer */
  orderFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderTotal: { fontSize: 18, fontWeight: "800", color: COLORS.text, letterSpacing: -0.3 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 360,
    gap: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
  },
  statusOptionText: { fontSize: 14, fontWeight: "500", color: COLORS.text, textTransform: "capitalize" },
});
