import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Animated,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants";
import { useCart } from "../../context/CartContext";

/* ─────────────── Types ─────────────── */
type PaymentMethod = "card" | "cod" | "upi";
type AddressType = "home" | "work" | "other";

type Address = {
  id: string;
  type: AddressType;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
};

/* ─────────────── Dummy Data ─────────────── */
const SAVED_ADDRESSES: Address[] = [
  {
    id: "1",
    type: "home",
    label: "Home",
    street: "124 Main Street, Valley Market",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA",
    isDefault: true,
  },
  {
    id: "2",
    type: "work",
    label: "Work",
    street: "250 Park Avenue, Midtown",
    city: "New York",
    state: "NY",
    zipCode: "10022",
    country: "USA",
    isDefault: false,
  },
];

const DELIVERY_OPTIONS = [
  {
    id: "standard",
    label: "Standard Delivery",
    duration: "5–7 business days",
    price: 0,
  },
  {
    id: "express",
    label: "Express Delivery",
    duration: "2–3 business days",
    price: 4.99,
  },
  {
    id: "overnight",
    label: "Overnight Delivery",
    duration: "Next business day",
    price: 12.99,
  },
];

/* ─────────────── Section Card ─────────────── */
function SectionCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return <View style={[styles.sectionCard, style]}>{children}</View>;
}

/* ─────────────── Step Indicator ─────────────── */
function StepIndicator({ step }: { step: number }) {
  const steps = ["Address", "Payment", "Review"];
  return (
    <View style={styles.stepRow}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const active = idx === step;
        const done = idx < step;
        return (
          <React.Fragment key={label}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  active && styles.stepCircleActive,
                  done && styles.stepCircleDone,
                ]}
              >
                {done ? (
                  <Ionicons name="checkmark" size={13} color="#fff" />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      (active || done) && styles.stepNumberActive,
                    ]}
                  >
                    {idx}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  active && styles.stepLabelActive,
                  done && styles.stepLabelDone,
                ]}
              >
                {label}
              </Text>
            </View>
            {i < steps.length - 1 && (
              <View
                style={[styles.stepLine, done && styles.stepLineDone]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

/* ─────────────── Address Card ─────────────── */
function AddressCard({
  address,
  selected,
  onSelect,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
}) {
  const iconMap: Record<AddressType, string> = {
    home: "home-outline",
    work: "briefcase-outline",
    other: "location-outline",
  };
  return (
    <TouchableOpacity
      style={[styles.addressCard, selected && styles.addressCardSelected]}
      onPress={onSelect}
      activeOpacity={0.75}
    >
      <View style={styles.addressCardInner}>
        <View
          style={[
            styles.addressIcon,
            selected && styles.addressIconSelected,
          ]}
        >
          <Ionicons
            name={iconMap[address.type] as any}
            size={18}
            color={selected ? "#fff" : COLORS.textSecondary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.addressLabelRow}>
            <Text style={styles.addressLabel}>{address.label}</Text>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={styles.addressStreet}>{address.street}</Text>
          <Text style={styles.addressCity}>
            {address.city}, {address.state} {address.zipCode}
          </Text>
          <Text style={styles.addressCountry}>{address.country}</Text>
        </View>
        <View
          style={[
            styles.radioOuter,
            selected && styles.radioOuterSelected,
          ]}
        >
          {selected && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ─────────────── Payment Option ─────────────── */
function PaymentOption({
  id,
  icon,
  label,
  subtitle,
  selected,
  onSelect,
  children,
}: {
  id: PaymentMethod;
  icon: string;
  label: string;
  subtitle?: string;
  selected: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}) {
  return (
    <View>
      <TouchableOpacity
        style={[
          styles.paymentOption,
          selected && styles.paymentOptionSelected,
        ]}
        onPress={onSelect}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.paymentIcon,
            selected && styles.paymentIconSelected,
          ]}
        >
          <Ionicons
            name={icon as any}
            size={20}
            color={selected ? "#fff" : COLORS.textSecondary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.paymentLabel,
              selected && styles.paymentLabelSelected,
            ]}
          >
            {label}
          </Text>
          {subtitle && (
            <Text style={styles.paymentSubtitle}>{subtitle}</Text>
          )}
        </View>
        <View
          style={[
            styles.radioOuter,
            selected && styles.radioOuterSelected,
          ]}
        >
          {selected && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
      {selected && children && (
        <View style={styles.paymentExpanded}>{children}</View>
      )}
    </View>
  );
}

/* ─────────────── Order Item Row ─────────────── */
function OrderItemRow({
  name,
  size,
  qty,
  price,
}: {
  name: string;
  size: string;
  qty: number;
  price: number;
}) {
  return (
    <View style={styles.orderItemRow}>
      <View style={styles.orderItemQtyBadge}>
        <Text style={styles.orderItemQtyText}>{qty}</Text>
      </View>
      <Text style={styles.orderItemName} numberOfLines={1}>
        {name}{" "}
        <Text style={styles.orderItemSize}>· {size}</Text>
      </Text>
      <Text style={styles.orderItemPrice}>${(price * qty).toFixed(2)}</Text>
    </View>
  );
}

/* ─────────────── Main Checkout Screen ─────────────── */
export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, cartTotal, itemCount } = useCart();

  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState("1");
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* Card form */
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");

  /* UPI */
  const [upiId, setUpiId] = useState("");

  /* New address form */
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newZip, setNewZip] = useState("");

  /* Animations */
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  /* Computed */
  const subtotal = cartTotal || cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const selectedDelivery = DELIVERY_OPTIONS.find((d) => d.id === deliveryOption);
  const deliveryFee = selectedDelivery?.price ?? 0;
  const discount = promoApplied ? +(subtotal * 0.1).toFixed(2) : 0;
  const taxes = +((subtotal - discount) * 0.08).toFixed(2);
  const total = +(subtotal - discount + deliveryFee + taxes).toFixed(2);

  /* Format card input */
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 16);
    return cleaned.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  };

  /* Promo */
  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "SAVE10") {
      setPromoApplied(true);
      setPromoError(false);
    } else {
      setPromoError(true);
      setPromoApplied(false);
    }
  };

  /* Place order */
  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    await new Promise((r) => setTimeout(r, 1800));
    setIsPlacingOrder(false);
    setShowSuccess(true);
    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* Validate current step */
  const canProceed = () => {
    if (step === 1) return !!selectedAddressId && !!deliveryOption;
    if (step === 2) {
      if (paymentMethod === "card")
        return cardNumber.length >= 19 && cardHolder && cardExpiry.length === 5 && cardCVV.length === 3;
      if (paymentMethod === "upi") return upiId.includes("@");
      return true; // cod
    }
    return true;
  };

  /* ─── Success Modal ─── */
  if (showSuccess) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar barStyle="dark-content" />
        <Animated.View
          style={[
            styles.successContainer,
            { opacity: successOpacity, transform: [{ scale: successScale }] },
          ]}
        >
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-circle" size={72} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successSubtitle}>
            Your order has been successfully placed.{"\n"}You'll receive a confirmation shortly.
          </Text>
          <View style={styles.successOrderBox}>
            <Text style={styles.successOrderLabel}>Order Total</Text>
            <Text style={styles.successOrderTotal}>${total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.successBtn}
            onPress={() => router.replace("/")}
            activeOpacity={0.85}
          >
            <Text style={styles.successBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.successBtnOutline}
            onPress={() => router.push("/tabs/orders" as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.successBtnOutlineText}>Track My Order</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
          style={styles.headerBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ─── Step Indicator ─── */}
      <View style={styles.stepContainer}>
        <StepIndicator step={step} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ══════════════ STEP 1: ADDRESS & DELIVERY ══════════════ */}
        {step === 1 && (
          <View style={styles.stepContent}>
            {/* Shipping Address */}
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Shipping Address</Text>
            </View>

            {SAVED_ADDRESSES.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                selected={selectedAddressId === addr.id}
                onSelect={() => setSelectedAddressId(addr.id)}
              />
            ))}

            <TouchableOpacity
              style={styles.addAddressBtn}
              onPress={() => setShowAddAddress(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.addAddressBtnText}>Add New Address</Text>
            </TouchableOpacity>

            {/* Delivery Options */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Ionicons name="bicycle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Delivery Method</Text>
            </View>

            {DELIVERY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.deliveryOption,
                  deliveryOption === opt.id && styles.deliveryOptionSelected,
                ]}
                onPress={() => setDeliveryOption(opt.id)}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.deliveryLabel,
                      deliveryOption === opt.id && styles.deliveryLabelSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text style={styles.deliveryDuration}>{opt.duration}</Text>
                </View>
                <View style={styles.deliveryPriceRow}>
                  <Text
                    style={[
                      styles.deliveryPrice,
                      deliveryOption === opt.id && styles.deliveryPriceSelected,
                    ]}
                  >
                    {opt.price === 0 ? "FREE" : `$${opt.price.toFixed(2)}`}
                  </Text>
                  <View
                    style={[
                      styles.radioOuter,
                      deliveryOption === opt.id && styles.radioOuterSelected,
                    ]}
                  >
                    {deliveryOption === opt.id && <View style={styles.radioInner} />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ══════════════ STEP 2: PAYMENT ══════════════ */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card-outline" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>

            <SectionCard>
              <PaymentOption
                id="card"
                icon="card-outline"
                label="Pay with Card"
                subtitle="Credit or Debit card"
                selected={paymentMethod === "card"}
                onSelect={() => setPaymentMethod("card")}
              >
                <View style={styles.cardForm}>
                  {/* Card number */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Card Number</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="card-outline"
                        size={16}
                        color={COLORS.gray}
                        style={{ marginRight: 8 }}
                      />
                      <TextInput
                        style={styles.textInput}
                        placeholder="0000 0000 0000 0000"
                        placeholderTextColor={COLORS.gray}
                        keyboardType="numeric"
                        value={cardNumber}
                        onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                        maxLength={19}
                      />
                    </View>
                  </View>
                  {/* Card holder */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Cardholder Name</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="person-outline"
                        size={16}
                        color={COLORS.gray}
                        style={{ marginRight: 8 }}
                      />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Full name on card"
                        placeholderTextColor={COLORS.gray}
                        value={cardHolder}
                        onChangeText={setCardHolder}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                  {/* Expiry + CVV */}
                  <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                      <Text style={styles.inputLabel}>Expiry Date</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={[styles.textInput, { textAlign: "center" }]}
                          placeholder="MM/YY"
                          placeholderTextColor={COLORS.gray}
                          keyboardType="numeric"
                          value={cardExpiry}
                          onChangeText={(t) => setCardExpiry(formatExpiry(t))}
                          maxLength={5}
                        />
                      </View>
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>CVV</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={[styles.textInput, { textAlign: "center" }]}
                          placeholder="• • •"
                          placeholderTextColor={COLORS.gray}
                          keyboardType="numeric"
                          secureTextEntry
                          value={cardCVV}
                          onChangeText={(t) => setCardCVV(t.replace(/\D/g, "").slice(0, 3))}
                          maxLength={3}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </PaymentOption>

              <View style={styles.paymentDivider} />

              <PaymentOption
                id="upi"
                icon="qr-code-outline"
                label="UPI / Wallet"
                subtitle="Google Pay, PhonePe, Paytm"
                selected={paymentMethod === "upi"}
                onSelect={() => setPaymentMethod("upi")}
              >
                <View style={styles.cardForm}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>UPI ID</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="at-outline"
                        size={16}
                        color={COLORS.gray}
                        style={{ marginRight: 8 }}
                      />
                      <TextInput
                        style={styles.textInput}
                        placeholder="yourname@upi"
                        placeholderTextColor={COLORS.gray}
                        value={upiId}
                        onChangeText={setUpiId}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>
                </View>
              </PaymentOption>

              <View style={styles.paymentDivider} />

              <PaymentOption
                id="cod"
                icon="cash-outline"
                label="Cash on Delivery"
                subtitle="Pay when you receive"
                selected={paymentMethod === "cod"}
                onSelect={() => setPaymentMethod("cod")}
              />
            </SectionCard>

            {/* Promo Code */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Ionicons name="pricetag-outline" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Promo Code</Text>
            </View>
            <SectionCard>
              <View style={styles.promoRow}>
                <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                  <Ionicons
                    name="ticket-outline"
                    size={16}
                    color={COLORS.gray}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter code (try SAVE10)"
                    placeholderTextColor={COLORS.gray}
                    value={promoCode}
                    onChangeText={(t) => {
                      setPromoCode(t);
                      setPromoError(false);
                      if (!t) setPromoApplied(false);
                    }}
                    autoCapitalize="characters"
                    editable={!promoApplied}
                  />
                  {promoApplied && (
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.promoBtn, promoApplied && styles.promoBtnApplied]}
                  onPress={
                    promoApplied
                      ? () => {
                          setPromoApplied(false);
                          setPromoCode("");
                        }
                      : handleApplyPromo
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.promoBtnText}>
                    {promoApplied ? "Remove" : "Apply"}
                  </Text>
                </TouchableOpacity>
              </View>
              {promoError && (
                <Text style={styles.promoError}>
                  Invalid promo code. Try "SAVE10"
                </Text>
              )}
              {promoApplied && (
                <Text style={styles.promoSuccess}>
                  🎉 10% discount applied!
                </Text>
              )}
            </SectionCard>
          </View>
        )}

        {/* ══════════════ STEP 3: REVIEW ══════════════ */}
        {step === 3 && (
          <View style={styles.stepContent}>
            {/* Delivery Address Summary */}
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Delivering To</Text>
            </View>
            <SectionCard>
              {(() => {
                const addr = SAVED_ADDRESSES.find((a) => a.id === selectedAddressId);
                return addr ? (
                  <View style={styles.reviewAddressRow}>
                    <View style={styles.reviewAddressIcon}>
                      <Ionicons name="home-outline" size={16} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewAddressLabel}>{addr.label}</Text>
                      <Text style={styles.reviewAddressText}>
                        {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setStep(1)}>
                      <Text style={styles.changeText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                ) : null;
              })()}
            </SectionCard>

            {/* Payment Summary */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Ionicons name="card-outline" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Payment</Text>
            </View>
            <SectionCard>
              <View style={styles.reviewAddressRow}>
                <View style={styles.reviewAddressIcon}>
                  <Ionicons
                    name={
                      paymentMethod === "card"
                        ? "card-outline"
                        : paymentMethod === "upi"
                        ? "qr-code-outline"
                        : "cash-outline"
                    }
                    size={16}
                    color={COLORS.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewAddressLabel}>
                    {paymentMethod === "card"
                      ? "Credit / Debit Card"
                      : paymentMethod === "upi"
                      ? "UPI / Wallet"
                      : "Cash on Delivery"}
                  </Text>
                  {paymentMethod === "card" && cardNumber && (
                    <Text style={styles.reviewAddressText}>
                      •••• •••• •••• {cardNumber.replace(/\s/g, "").slice(-4)}
                    </Text>
                  )}
                  {paymentMethod === "upi" && upiId && (
                    <Text style={styles.reviewAddressText}>{upiId}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => setStep(2)}>
                  <Text style={styles.changeText}>Change</Text>
                </TouchableOpacity>
              </View>
            </SectionCard>

            {/* Order Items */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Ionicons name="bag-outline" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>
                Order Summary ({itemCount} {itemCount === 1 ? "item" : "items"})
              </Text>
            </View>
            <SectionCard>
              {cartItems.length === 0 ? (
                <Text style={styles.emptyCart}>Your cart is empty</Text>
              ) : (
                cartItems.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    <OrderItemRow
                      name={item.product.name}
                      size={item.size}
                      qty={item.quantity}
                      price={item.price}
                    />
                    {idx < cartItems.length - 1 && (
                      <View style={styles.itemDivider} />
                    )}
                  </React.Fragment>
                ))
              )}
            </SectionCard>

            {/* Price Breakdown */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Ionicons name="receipt-outline" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Price Details</Text>
            </View>
            <SectionCard>
              <PriceRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
              {discount > 0 && (
                <PriceRow
                  label="Discount (SAVE10)"
                  value={`-$${discount.toFixed(2)}`}
                  highlight
                />
              )}
              <PriceRow
                label={`Delivery (${selectedDelivery?.label})`}
                value={deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}
                freeTag={deliveryFee === 0}
              />
              <PriceRow label="Taxes & Fees" value={`$${taxes.toFixed(2)}`} />
              <View style={styles.priceDivider} />
              <PriceRow
                label="Total"
                value={`$${total.toFixed(2)}`}
                bold
              />
            </SectionCard>
          </View>
        )}
      </ScrollView>

      {/* ─── Bottom CTA ─── */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarInner}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.ctaBtn,
              (!canProceed() || isPlacingOrder) && styles.ctaBtnDisabled,
            ]}
            onPress={
              step < 3 ? () => setStep((s) => s + 1) : handlePlaceOrder
            }
            disabled={!canProceed() || isPlacingOrder}
            activeOpacity={0.88}
          >
            {isPlacingOrder ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.ctaBtnText}>
                  {step < 3 ? "Continue" : "Place Order"}
                </Text>
                <Ionicons
                  name={step < 3 ? "arrow-forward" : "checkmark-circle-outline"}
                  size={18}
                  color="#fff"
                  style={{ marginLeft: 6 }}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Add Address Modal ─── */}
      <Modal
        visible={showAddAddress}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddAddress(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAddAddress(false)}
        >
          <Pressable style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Delivery Address</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Street</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Street address"
                  placeholderTextColor={COLORS.gray}
                  value={newStreet}
                  onChangeText={setNewStreet}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>City</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="City"
                    placeholderTextColor={COLORS.gray}
                    value={newCity}
                    onChangeText={setNewCity}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>State</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="State"
                    placeholderTextColor={COLORS.gray}
                    value={newState}
                    onChangeText={setNewState}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ZIP Code</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="ZIP"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                  value={newZip}
                  onChangeText={setNewZip}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => {
                Alert.alert("Address Saved", "New address has been added.");
                setShowAddAddress(false);
              }}
              activeOpacity={0.88}
            >
              <Text style={styles.ctaBtnText}>Save Address</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* ─────────────── PriceRow helper ─────────────── */
function PriceRow({
  label,
  value,
  bold,
  highlight,
  freeTag,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  freeTag?: boolean;
}) {
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceLabel, bold && styles.priceLabelBold]}>
        {label}
      </Text>
      <Text
        style={[
          styles.priceValue,
          bold && styles.priceValueBold,
          highlight && styles.priceValueHighlight,
          freeTag && styles.priceValueFree,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/* ─────────────── Styles ─────────────── */
const styles = StyleSheet.create({
  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBack: { width: 40, alignItems: "flex-start" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  /* Step Indicator */
  stepContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepItem: { alignItems: "center" },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepCircleDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  stepNumber: { fontSize: 11, fontWeight: "700", color: COLORS.gray },
  stepNumberActive: { color: "#fff" },
  stepLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.gray,
    marginTop: 4,
  },
  stepLabelActive: { color: COLORS.primary, fontWeight: "700" },
  stepLabelDone: { color: COLORS.success, fontWeight: "600" },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginBottom: 20,
    marginHorizontal: 6,
  },
  stepLineDone: { backgroundColor: COLORS.success },

  /* Step Content */
  stepContent: { padding: 16 },

  /* Section Card */
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.2,
  },

  /* Address Card */
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 10,
    padding: 14,
  },
  addressCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#F0EFFF",
  },
  addressCardInner: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  addressIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  addressIconSelected: { backgroundColor: COLORS.primary },
  addressLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  addressLabel: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  defaultBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  defaultBadgeText: { fontSize: 10, fontWeight: "600", color: "#2563EB" },
  addressStreet: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 1 },
  addressCity: { fontSize: 13, color: COLORS.textSecondary },
  addressCountry: { fontSize: 12, color: COLORS.gray, marginTop: 1 },

  /* Add Address Button */
  addAddressBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    justifyContent: "center",
    marginTop: 4,
  },
  addAddressBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  /* Delivery Options */
  deliveryOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  deliveryOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#F0EFFF",
  },
  deliveryLabel: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  deliveryLabelSelected: { color: COLORS.primary },
  deliveryDuration: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  deliveryPriceRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  deliveryPrice: { fontSize: 14, fontWeight: "700", color: COLORS.textSecondary },
  deliveryPriceSelected: { color: COLORS.primary },

  /* Radio */
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: { borderColor: COLORS.primary },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  /* Payment */
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  paymentOptionSelected: {},
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentIconSelected: { backgroundColor: COLORS.primary },
  paymentLabel: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  paymentLabelSelected: { color: COLORS.primary },
  paymentSubtitle: { fontSize: 12, color: COLORS.gray, marginTop: 1 },
  paymentDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  paymentExpanded: {
    paddingTop: 4,
    paddingBottom: 8,
  },

  /* Card Form */
  cardForm: { gap: 12 },
  inputGroup: {},
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 0,
  },
  inputRow: { flexDirection: "row" },

  /* Promo */
  promoRow: { flexDirection: "row", alignItems: "center" },
  promoBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  promoBtnApplied: { backgroundColor: COLORS.error },
  promoBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  promoError: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 8,
    fontWeight: "500",
  },
  promoSuccess: {
    color: COLORS.success,
    fontSize: 12,
    marginTop: 8,
    fontWeight: "500",
  },

  /* Review */
  reviewAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reviewAddressIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAddressLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  reviewAddressText: { fontSize: 13, color: COLORS.textSecondary },
  changeText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
    textDecorationLine: "underline",
  },

  /* Order Item */
  orderItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  orderItemQtyBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  orderItemQtyText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
  },
  orderItemName: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: "500" },
  orderItemSize: { color: COLORS.gray, fontWeight: "400" },
  orderItemPrice: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  itemDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  emptyCart: {
    textAlign: "center",
    color: COLORS.gray,
    paddingVertical: 20,
    fontSize: 14,
  },

  /* Price Breakdown */
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  priceLabel: { fontSize: 14, color: COLORS.textSecondary },
  priceLabelBold: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  priceValue: { fontSize: 14, fontWeight: "500", color: COLORS.text },
  priceValueBold: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  priceValueHighlight: { color: COLORS.success, fontWeight: "700" },
  priceValueFree: { color: COLORS.success, fontWeight: "700" },
  priceDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },

  /* Bottom Bar */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomBarInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: "500" },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaBtnDisabled: { backgroundColor: COLORS.gray, shadowOpacity: 0 },
  ctaBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 14,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },

  /* Success */
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  successIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  successOrderBox: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 32,
    width: "100%",
  },
  successOrderLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  successOrderTotal: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -1,
  },
  successBtn: {
    width: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  successBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  successBtnOutline: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  successBtnOutlineText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
});