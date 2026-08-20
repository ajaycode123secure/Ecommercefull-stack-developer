import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from '@/constants';
import { useAuth } from '@clerk/expo';
import { ActivityIndicator, View, Platform } from 'react-native';
import { useCart } from "../../../context/CartContext";

export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { itemCount } = useCart();

  // Wait for Clerk to load
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f5f7' }}>
        <ActivityIndicator size="large" color="#1a1a2e" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.black,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        }
      }}
    >

        <Tabs.Screen name="index" options={{
            tabBarIcon: ({color,focused}) => <Ionicons name=
            {focused ? "home" : "home-outline"} color={color} size={24} />,
         }} />
        <Tabs.Screen name="cart" options={{
            tabBarIcon: ({color,focused}) => <Ionicons name=
            {focused ? "cart" : "cart-outline"} color={color} size={24} />,
            tabBarBadge: itemCount,
            tabBarBadgeStyle: {
              backgroundColor: COLORS.error,
              color: '#fff',
              fontSize: 10,
            }
         }} />
        <Tabs.Screen name="favorites" options={{
            tabBarIcon: ({color,focused}) => <Ionicons name=
            {focused ? "heart" : "heart-outline"} color={color} size={24} />,
         }} />
        <Tabs.Screen name="profile" options={{
            tabBarIcon: ({color,focused}) => <Ionicons name=
            {focused ? "person" : "person-outline"} color={color} size={24} />,
         }} />

        {/* ── Hidden sub-screens: no tab bar entry ── */}
        <Tabs.Screen name="addresses" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="orders" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="orders/[id]" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="admin" options={{ href: null, tabBarStyle: { display: "none" } }} />
    </Tabs>
  );
}
