import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView, Text, TextInput, TouchableOpacity,
  View, Switch, Image, ActivityIndicator,
  Platform, Modal, FlatList, Pressable,
  StyleSheet, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, CATEGORIES } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { dummyProducts } from "../../../../../../assets/assets";

export default function EditProduct() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [sizes, setSizes] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const product: any = dummyProducts.find((p) => p._id === id);
        if (!product) { router.back(); return; }
        setName(product.name);
        setDescription(product.description || "");
        setPrice(product.price.toString());
        setStock(product.stock.toString());
        setCategory(typeof product.category === "object" ? product.category.name : product.category);
        setIsFeatured(product.isFeatured);
        if (product.sizes) setSizes(Array.isArray(product.sizes) ? product.sizes.join(", ") : product.sizes);
        if (product.images) setExistingImages(Array.isArray(product.images) ? product.images : [product.images]);
      } catch (e) {
        router.back();
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const pickImages = async () => {
    const remaining = 5 - (existingImages.length + newImages.length);
    if (remaining <= 0) { Alert.alert("Max 5 images allowed"); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (!result.canceled) setNewImages((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
  };

  const removeExistingImage = (i: number) =>
    setExistingImages((prev) => prev.filter((_, idx) => idx !== i));
  const removeNewImage = (i: number) =>
    setNewImages((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!name.trim() || !price.trim() || !sizes.trim()) {
      Alert.alert("Missing Fields", "Please fill in Name, Price and Sizes.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    const idx = dummyProducts.findIndex((p) => p._id === id);
    if (idx !== -1) {
      dummyProducts[idx] = {
        ...dummyProducts[idx],
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        category,
        sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
        images: [...existingImages, ...newImages].length > 0
          ? [...existingImages, ...newImages]
          : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop"],
        isFeatured,
      };
    }

    setSubmitting(false);
    Alert.alert("Success", "Product updated successfully!", [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const totalImages = existingImages.length + newImages.length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>

          {/* ─── Product Name ─── */}
          <FieldLabel text="Product Name *" />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Product name"
            placeholderTextColor={COLORS.gray}
          />

          {/* ─── Price + Stock Row ─── */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FieldLabel text="Price ($) *" />
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor={COLORS.gray}
              />
            </View>
            <View style={{ width: 14 }} />
            <View style={{ flex: 1 }}>
              <FieldLabel text="Stock Level" />
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={stock}
                onChangeText={setStock}
                placeholder="0"
                placeholderTextColor={COLORS.gray}
              />
            </View>
          </View>

          {/* ─── Sizes ─── */}
          <FieldLabel text="Sizes (comma separated) *" />
          <TextInput
            style={styles.input}
            placeholder="e.g. S, M, L, XL"
            placeholderTextColor={COLORS.gray}
            value={sizes}
            onChangeText={setSizes}
            autoCapitalize="characters"
          />

          {/* ─── Category ─── */}
          <FieldLabel text="Category" />
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.dropdownBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownText}>{category || "Select Category"}</Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* ─── Images ─── */}
          <FieldLabel text={`Images (${totalImages}/5)`} />
          <View style={styles.imagesGrid}>
            {existingImages.map((uri, i) => (
              <View key={`e-${i}`} style={styles.thumbWrap}>
                <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
                <TouchableOpacity style={styles.removeBadge} onPress={() => removeExistingImage(i)}>
                  <Ionicons name="close" size={11} color="#fff" />
                </TouchableOpacity>
                <View style={styles.existingTag}>
                  <Text style={styles.existingTagText}>Saved</Text>
                </View>
              </View>
            ))}
            {newImages.map((uri, i) => (
              <View key={`n-${i}`} style={styles.thumbWrap}>
                <Image source={{ uri }} style={[styles.thumb, styles.thumbNew]} resizeMode="cover" />
                <TouchableOpacity style={[styles.removeBadge, { backgroundColor: COLORS.primary }]} onPress={() => removeNewImage(i)}>
                  <Ionicons name="close" size={11} color="#fff" />
                </TouchableOpacity>
                <View style={[styles.existingTag, { backgroundColor: COLORS.primary }]}>
                  <Text style={styles.existingTagText}>New</Text>
                </View>
              </View>
            ))}
            {totalImages < 5 && (
              <TouchableOpacity style={styles.addThumb} onPress={pickImages} activeOpacity={0.8}>
                <Ionicons name="add" size={26} color={COLORS.primary} />
                <Text style={styles.addThumbText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ─── Description ─── */}
          <FieldLabel text="Description" />
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
            placeholder="Product description..."
            placeholderTextColor={COLORS.gray}
          />

          {/* ─── Featured ─── */}
          <View style={styles.featuredRow}>
            <View>
              <Text style={styles.featuredLabel}>Featured Product</Text>
              <Text style={styles.featuredSub}>Show on homepage banner</Text>
            </View>
            <Switch
              value={isFeatured}
              onValueChange={setIsFeatured}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>

          {/* ─── Submit ─── */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.submitText}>Update Product</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ─── Category Modal ─── */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => {
                const active = category === item.name;
                return (
                  <TouchableOpacity
                    style={[styles.catOption, active && styles.catOptionActive]}
                    onPress={() => { setCategory(item.name); setModalVisible(false); }}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.catOptionText, active && styles.catOptionTextActive]}>
                      {item.name}
                    </Text>
                    {active && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function FieldLabel({ text }: { text: string }) {
  return <Text style={styles.fieldLabel}>{text}</Text>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 6,
  },

  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  textArea: { height: 100, textAlignVertical: "top", paddingTop: 12 },
  row: { flexDirection: "row", alignItems: "flex-start" },

  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownText: { fontSize: 14, color: COLORS.text, fontWeight: "500" },

  /* Images Grid */
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  thumbWrap: { position: "relative" },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
  },
  thumbNew: { borderWidth: 2, borderColor: COLORS.primary },
  removeBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
  },
  existingTag: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  existingTagText: { fontSize: 9, color: "#fff", fontWeight: "700" },
  addThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  addThumbText: { fontSize: 10, color: COLORS.primary, fontWeight: "600" },

  /* Featured */
  featuredRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.lightGray,
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featuredLabel: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  featuredSub: { fontSize: 11, color: COLORS.gray, marginTop: 2 },

  /* Submit */
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 14,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitBtnDisabled: { opacity: 0.65, shadowOpacity: 0 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: "60%",
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center", marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17, fontWeight: "700",
    color: COLORS.text, marginBottom: 12, textAlign: "center",
  },
  catOption: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 12, marginBottom: 6,
    backgroundColor: COLORS.lightGray,
  },
  catOptionActive: { backgroundColor: "#EEF2FF" },
  catOptionText: { fontSize: 15, color: COLORS.text, fontWeight: "500" },
  catOptionTextActive: { color: COLORS.primary, fontWeight: "700" },
});
