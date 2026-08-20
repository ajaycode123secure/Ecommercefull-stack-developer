import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useClerk } from "@clerk/expo";
import { COLORS } from "@/constants";
import { dummyUser } from "../../../../assets/assets";

export default function AdminLayout() {
    const { user } = { user: dummyUser }
    const isLoaded = true;
    const router = useRouter();
    const { signOut } = useClerk();

    const isAdmin = user?.role === "admin" || user?.publicMetadata?.role === "admin" || true; // allow with dummyUser

    useEffect(() => {
        if (isLoaded && !isAdmin) {
            router.replace("/tabs");
        }
    }, [isLoaded, isAdmin]);

    if (!isLoaded) {
        return (
            <View className="flex-1 justify-center items-center bg-surface">
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!isAdmin) return null;

    return (
        <Tabs
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#fff",
                },
                headerTintColor: COLORS.black,
                headerTitleStyle: {
                    fontWeight: "bold",
                },
                headerShadowVisible: false,
                tabBarActiveTintColor: COLORS.black,
                tabBarInactiveTintColor: "gray",
                headerRight: () => (
                    <TouchableOpacity
                        onPress={async () => {
                            await signOut();
                            if (typeof document !== 'undefined') {
                              (document.activeElement as any)?.blur();
                            }
                            router.replace("/(auth)/sign-in" as any);
                        }}
                        className="mr-4 flex-row items-center"
                    >
                        <Ionicons name="log-out-outline" size={24} color={COLORS.black} />
                        <Text className="ml-1 text-gray-800 font-medium">Exit</Text>
                    </TouchableOpacity>
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="products"
                options={{
                    title: "Products",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cube-outline" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: "Orders",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="receipt-outline" size={size} color={color} />
                    )
                }}
            />
        </Tabs>
    );
}
