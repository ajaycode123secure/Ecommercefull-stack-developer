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
import { useAuth, useSignUp } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants';

export default function SignUpScreen() {
  const { signUp } = useSignUp();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!isLoaded) return;
    if (!emailAddress || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await signUp.password({ emailAddress, password });
      if (error) {
        setErrorMessage(error.longMessage || error.message || 'Failed to initialize sign up');
        setLoading(false);
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setErrorMessage(sendError.longMessage || sendError.message || 'Failed to send verification email');
        setLoading(false);
        return;
      }

      setIsVerifying(true);
    } catch (err: any) {
      const detailedError = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Something went wrong during sign up.';
      setErrorMessage(detailedError);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    if (!code) {
      setErrorMessage('Please enter the verification code');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) {
        setErrorMessage(error.longMessage || error.message || 'Verification code is invalid');
        setLoading(false);
        return;
      }

      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) {
        setErrorMessage(finalizeError.longMessage || finalizeError.message || 'Failed to complete sign up');
        setLoading(false);
        return;
      }

      if (typeof document !== 'undefined') {
        (document.activeElement as any)?.blur();
      }
      // Redirect to home/tabs
      router.replace('/tabs');
    } catch (err: any) {
      const detailedError = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Verification failed. Please try again.';
      setErrorMessage(detailedError);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        setErrorMessage(error.longMessage || error.message || 'Failed to resend code');
      } else {
        setErrorMessage('A new verification code has been sent!');
      }
    } catch (err: any) {
      const detailedError = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Could not resend code.';
      setErrorMessage(detailedError);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isSignedIn) {
      router.replace('/tabs');
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return null;
  }

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
          {!isVerifying ? (
            <>
              {/* Header */}
              <View className="items-center mb-8">
                <View className="w-16 h-16 bg-indigo-100 rounded-2xl items-center justify-center mb-4">
                  <Ionicons name="person-add" size={30} color={COLORS.primary} />
                </View>
                <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Create Account
                </Text>
                <Text className="text-slate-500 mt-2 text-center text-base">
                  Sign up to get started on your shopping journey
                </Text>
              </View>

              {/* Form Card */}
              <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                {/* Error Banner */}
                {errorMessage && (
                  <View className={`border-l-4 p-4 rounded-lg mb-6 flex-row items-center ${
                    errorMessage.includes('sent') ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                  }`}>
                    <Ionicons
                      name={errorMessage.includes('sent') ? 'checkmark-circle' : 'alert-circle'}
                      size={20}
                      color={errorMessage.includes('sent') ? COLORS.success : COLORS.error}
                    />
                    <Text className={`font-medium text-sm flex-1 ml-2 ${
                      errorMessage.includes('sent') ? 'text-green-700' : 'text-red-700'
                    }`}>
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
                      placeholder="Minimum 8 characters"
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
                  onPress={handleSignUp}
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
                        Create Account
                      </Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>

                {/* Footer switcher */}
                <View className="flex-row justify-center mt-6">
                  <Text className="text-slate-500 text-sm">Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.push('/sign-in')}>
                    <Text className="text-indigo-600 font-bold text-sm">Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Required for sign-up flows on Expo web. Clerk skips the browser CAPTCHA on iOS and Android */}
              <View nativeID="clerk-captcha" />
            </>
          ) : (
            <>
              {/* Back to sign up button */}
              <TouchableOpacity
                onPress={() => {
                  setIsVerifying(false);
                  setErrorMessage(null);
                }}
                className="self-start flex-row items-center mb-6"
              >
                <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
                <Text className="text-indigo-600 font-medium ml-1 text-sm">Back to Sign Up</Text>
              </TouchableOpacity>

              {/* Header */}
              <View className="items-center mb-8">
                <View className="w-16 h-16 bg-indigo-100 rounded-2xl items-center justify-center mb-4">
                  <Ionicons name="mail-open" size={30} color={COLORS.primary} />
                </View>
                <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Verify Email
                </Text>
                <Text className="text-slate-500 mt-2 text-center text-base px-2">
                  Enter the verification code sent to {emailAddress}
                </Text>
              </View>

              {/* Verification Code Card */}
              <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                {/* Error Banner */}
                {errorMessage && (
                  <View className={`border-l-4 p-4 rounded-lg mb-6 flex-row items-center ${
                    errorMessage.includes('sent') ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                  }`}>
                    <Ionicons
                      name={errorMessage.includes('sent') ? 'checkmark-circle' : 'alert-circle'}
                      size={20}
                      color={errorMessage.includes('sent') ? COLORS.success : COLORS.error}
                    />
                    <Text className={`font-medium text-sm flex-1 ml-2 ${
                      errorMessage.includes('sent') ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {errorMessage}
                    </Text>
                  </View>
                )}

                {/* Verification Code Input */}
                <View className="mb-6">
                  <Text className="text-slate-700 font-semibold mb-2 text-sm text-center">
                    Verification Code
                  </Text>
                  <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <TextInput
                      className="text-slate-900 text-center font-bold text-2xl tracking-[10px] py-1"
                      placeholder="000000"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={code}
                      onChangeText={(text) => {
                        setCode(text);
                        if (errorMessage) setErrorMessage(null);
                      }}
                    />
                  </View>
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                  onPress={handleVerify}
                  disabled={loading}
                  className={`w-full py-4 rounded-xl items-center justify-center flex-row shadow-sm ${
                    loading ? 'bg-indigo-400' : 'bg-indigo-600 active:bg-indigo-700'
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      Verify & Activate
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Resend Action */}
                <View className="items-center mt-6">
                  <Text className="text-slate-400 text-xs">Didn't receive the code?</Text>
                  <TouchableOpacity onPress={handleResendCode} className="mt-2">
                    <Text className="text-indigo-600 font-bold text-sm">Resend Code</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
