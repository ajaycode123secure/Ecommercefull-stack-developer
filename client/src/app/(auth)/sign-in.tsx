import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSignIn, useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants';

export default function SignInScreen() {
  const { signIn } = useSignIn();
  const { isLoaded } = useAuth();
  const router = useRouter();

  console.log("SignInScreen mounted! isLoaded:", isLoaded);

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!isLoaded) return;
    if (!emailAddress || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await signIn.password({ emailAddress, password });
      
      if (error) {
        setErrorMessage(error.longMessage || error.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      if (signIn.status === 'complete') {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setErrorMessage(finalizeError.longMessage || finalizeError.message || 'Failed to finalize session');
          setLoading(false);
          return;
        }
        if (typeof document !== 'undefined') {
          (document.activeElement as any)?.blur();
        }
        // Redirect to tabs
        router.replace('/tabs');
      } else {
        setErrorMessage(`Sign in status: ${signIn.status}. Please check your credentials.`);
      }
    } catch (err: any) {
      const detailedError = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Something went wrong. Please try again.';
      setErrorMessage(detailedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Header Card */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-indigo-100 rounded-2xl items-center justify-center mb-4">
              <Ionicons name="bag-handle" size={32} color={COLORS.primary} />
            </View>
            <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </Text>
            <Text className="text-slate-500 mt-2 text-center text-base">
              Sign in to access your account & orders
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            {/* Error Banner */}
            {errorMessage && (
              <View className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 flex-row items-center">
                <Ionicons name="alert-circle" size={20} color={COLORS.error} className="mr-2" />
                <Text className="text-red-700 font-medium text-sm flex-1 ml-2">
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-2 text-sm">
                Email Address
              </Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <Ionicons name="mail-outline" size={20} color="#94A3B8" className="mr-3" />
                <TextInput
                  className="flex-1 text-slate-900 text-base py-1 px-2"
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={emailAddress}
                  onChangeText={(text) => {
                    setEmailAddress(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text className="text-slate-700 font-semibold mb-2 text-sm">
                Password
              </Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" className="mr-3" />
                <TextInput
                  className="flex-1 text-slate-900 text-base py-1 px-2"
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading}
              className={`w-full py-4 rounded-xl items-center justify-center flex-row shadow-sm ${
                loading ? 'bg-indigo-400' : 'bg-indigo-600 active:bg-indigo-700'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text className="text-white font-bold text-base mr-2">
                    Sign In
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {/* Footer switcher */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-500 text-sm">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/sign-up')}>
                <Text className="text-indigo-600 font-bold text-sm">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
