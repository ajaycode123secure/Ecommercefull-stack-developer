import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, CATEGORIES } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { dummyProducts } from "../../../../../assets/assets";

export default function AddProduct() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Men");
  const [sizes, setSizes] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages(result.assets.map((a) => a.uri).slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !price.trim() || !sizes.trim()) {
      Alert.alert("Missing Fields", "Please fill in all required fields (Name, Price, Sizes).");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    const newProduct = {
      _id: "prod_" + Math.random().toString(36).substring(2, 11),
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
      category,
      sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
      images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop"],
      isFeatured,
      isActive: true,
      createdAt: new Date().toISOString(),
      ratings: {
        average: 0,
        count: 0,
      },
    };

    dummyProducts.unshift(newProduct);
    setSubmitting(false);

    Alert.alert("Success", "Product created successfully!", [
      {
        text: "OK",
        onPress: () => {
          setName("");
          setPrice("");
          setStock("");
          setSizes("");
          setDescription("");
          setImages([]);
          setIsFeatured(false);
          router.back();
        },
      },
    ]);
  };

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
            placeholder="e.g. Wireless Headphones"
            placeholderTextColor={COLORS.gray}
            value={name}
            onChangeText={setName}
          />

          {/* ─── Price + Stock Row ─── */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FieldLabel text="Price ($) *" />
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={COLORS.gray}
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
              />
            </View>
            <View style={{ width: 14 }} />
            <View style={{ flex: 1 }}>
              <FieldLabel text="Stock Level" />
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={COLORS.gray}
                keyboardType="number-pad"
                value={stock}
                onChangeText={setStock}
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
            <Text style={styles.dropdownText}>{category}</Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* ─── Images ─── */}
          <FieldLabel text="Product Images (max 5)" />
          <View style={styles.imagesRow}>
            {images.map((uri, i) => (
              <View key={i} style={styles.imageThumbWrapper}>
                <Image source={{ uri }} style={styles.imageThumb} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeImage(i)}
                >
                  <Ionicons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages} activeOpacity={0.8}>
                <Ionicons name="cloud-upload-outline" size={26} color={COLORS.primary} />
                <Text style={styles.addImageText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
          {images.length === 0 && (
            <TouchableOpacity style={styles.uploadPlaceholder} onPress={pickImages} activeOpacity={0.8}>
              <Ionicons name="image-outline" size={32} color={COLORS.gray} />
              <Text style={styles.uploadText}>Tap to upload images</Text>
              <Text style={styles.uploadSubtext}>JPEG, PNG · Max 5 images</Text>
            </TouchableOpacity>
          )}

          {/* ─── Description ─── */}
          <FieldLabel text="Description" />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write a product description..."
            placeholderTextColor={COLORS.gray}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />

          {/* ─── Featured Toggle ─── */}
          <View style={styles.featuredRow}>
            <View>
              <Text style={styles.featuredLabel}>Featured Product</Text>
              <Text style={styles.featuredSub}>Show on homepage banner</Text>
            </View>
            <Switch
              value={isFeatured}
              onValueChange={setIsFeatured}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={isFeatured ? "#fff" : "#fff"}
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
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.submitText}>Create Product</Text>
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
                    style={[styles.categoryOption, active && styles.categoryOptionActive]}
                    onPress={() => { setCategory(item.name); setModalVisible(false); }}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.categoryOptionText, active && styles.categoryOptionTextActive]}>
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
    marginBottom: 4,
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },

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
    marginBottom: 4,
  },
  dropdownText: { fontSize: 14, color: COLORS.text, fontWeight: "500" },

  /* Images */
  imagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 4,
  },
  imageThumbWrapper: { position: "relative" },
  imageThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
  },
  removeImageBtn: {
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
  addImageBtn: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  addImageText: { fontSize: 10, color: COLORS.primary, fontWeight: "600" },
  uploadPlaceholder: {
    width: "100%",
    height: 100,
    borderRadius: 14,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginBottom: 4,
  },
  uploadText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "600" },
  uploadSubtext: { fontSize: 11, color: COLORS.gray },

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
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },

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
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: COLORS.lightGray,
  },
  categoryOptionActive: { backgroundColor: "#EEF2FF" },
  categoryOptionText: { fontSize: 15, color: COLORS.text, fontWeight: "500" },
  categoryOptionTextActive: { color: COLORS.primary, fontWeight: "700" },
});
