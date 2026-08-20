import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";

// ── Menu items ───────────────────────────────────────────────────
const MENU_ITEMS = [
  {
    id: "orders",
    label: "My Orders",
    icon: "bag-handle-outline" as const,
    route: "/tabs/orders",
  },
  {
    id: "addresses",
    label: "Shipping Addresses",
    icon: "location-outline" as const,
    route: "/tabs/addresses",
  },
  {
    id: "reviews",
    label: "My Reviews",
    icon: "star-outline" as const,
    route: "/tabs/reviews",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "settings-outline" as const,
    route: "/tabs/settings",
  },
];

export default function Profile() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();

  // ── Derived user info from Clerk ──────────────────────────────
  const fullName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "User";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const avatarUrl = user?.imageUrl ?? null;

  // Initials fallback (e.g. "JD" from "John Doe")
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    const performLogout = async () => {
      try {
        await signOut();
      } catch (_) {
        // session already cleared
      } finally {
        if (typeof document !== 'undefined') {
          (document.activeElement as any)?.blur();
        }
        router.replace("/(auth)/sign-in" as any);
      }
    };

    if (Platform.OS === 'web') {
      performLogout();
    } else {
      Alert.alert("Log Out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: performLogout,
        },
      ]);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.white }}
      edges={["top"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ─── Header ─── */}
        <Text
          style={{
            textAlign: "center",
            fontSize: 18,
            fontWeight: "700",
            color: COLORS.text,
            paddingTop: 16,
            paddingBottom: 24,
          }}
        >
          Profile
        </Text>

        {/* ─── Avatar + Name + Email ─── */}
        <View style={{ alignItems: "center", paddingBottom: 20 }}>
          {/* Avatar: real image OR initials circle */}
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              overflow: "hidden",
              backgroundColor: "#1a1a2e",
              marginBottom: 12,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 5,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: "#fff",
                  letterSpacing: 1,
                }}
              >
                {initials}
              </Text>
            )}
          </View>

          {/* Name */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: COLORS.text,
              marginBottom: 4,
            }}
          >
            {fullName}
          </Text>

          {/* Email */}
          {email ? (
            <Text
              style={{
                fontSize: 13,
                color: COLORS.textSecondary,
                marginBottom: 16,
              }}
            >
              {email}
            </Text>
          ) : null}

          {/* Admin Panel Button */}
          <TouchableOpacity
            onPress={() => router.push("/tabs/admin")}
            style={{
              backgroundColor: "#1a1a2e", // matching dark background in your screenshot
              paddingHorizontal: 28,
              paddingVertical: 12,
              borderRadius: 24,
              marginTop: 4,
              marginBottom: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
              Admin Panel
            </Text>
          </TouchableOpacity>
        </View>

        {/* ─── Divider ─── */}
        <View
          style={{
            height: 1,
            backgroundColor: COLORS.border,
            marginHorizontal: 0,
            marginBottom: 8,
          }}
        />

        {/* ─── Menu Items ─── */}
        <View style={{ paddingHorizontal: 0 }}>
          {MENU_ITEMS.map((item, index) => (
            <View key={item.id}>
              <TouchableOpacity
                onPress={() => router.push(item.route as any)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 22,
                  paddingVertical: 18,
                  backgroundColor: COLORS.white,
                }}
                activeOpacity={0.55}
              >
                {/* Icon */}
                <Ionicons
                  name={item.icon}
                  size={21}
                  color={COLORS.darkGray}
                  style={{ marginRight: 16 }}
                />

                {/* Label */}
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    fontWeight: "500",
                    color: COLORS.text,
                  }}
                >
                  {item.label}
                </Text>

                {/* Chevron */}
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.gray}
                />
              </TouchableOpacity>

              {/* Divider between items */}
              {index < MENU_ITEMS.length - 1 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: COLORS.border,
                    marginHorizontal: 22,
                  }}
                />
              )}
            </View>
          ))}
        </View>

        {/* ─── Divider ─── */}
        <View
          style={{
            height: 1,
            backgroundColor: COLORS.border,
            marginTop: 8,
          }}
        />

        {/* ─── Log Out ─── */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            alignItems: "center",
            paddingVertical: 28,
          }}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: COLORS.error,
            }}
          >
            Log Out
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}