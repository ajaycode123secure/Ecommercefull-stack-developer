import { Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  console.log("Index mounted! isLoaded:", isLoaded, "isSignedIn:", isSignedIn);

  // Wait for Clerk to load before redirecting
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f4f5f7" }}>
        <ActivityIndicator size="large" color="#1a1a2e" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/tabs" />;
  }

  return <Redirect href="/sign-in" />;
}
