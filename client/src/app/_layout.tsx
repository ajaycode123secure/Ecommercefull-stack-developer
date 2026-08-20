import { Stack } from "expo-router";
import "../../global.css";
import { CartProvider } from "../../context/CartContext";
import { WishlistProvider } from "../../context/WishlistContext";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ClerkProvider } from '@clerk/expo';
import { Platform, View, StyleSheet } from 'react-native';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env file');
}

// tokenCache only works on native (iOS/Android), not on web
const getTokenCache = () => {
  if (Platform.OS === 'web') return undefined;
  const { tokenCache } = require('@clerk/expo/token-cache');
  return tokenCache;
};

export default function RootLayout() {
  const content = <Stack screenOptions={{ headerShown: false }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider
        publishableKey={publishableKey}
        tokenCache={getTokenCache()}
      >
        <CartProvider>
          <WishlistProvider>
            {Platform.OS === 'web' ? (
              <View style={styles.webContainer}>
                <View style={styles.mobileFrame}>
                  {content}
                </View>
              </View>
            ) : (
              content
            )}
          </WishlistProvider>
        </CartProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9', // slate-100 background for surrounding area
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileFrame: {
    width: '100%',
    maxWidth: 480,
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
