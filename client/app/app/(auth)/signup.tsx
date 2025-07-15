import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import TablerIconComponent from '~/components/icon';
import { signup } from '~/api/auth';
import { StorageService } from '~/utils/storage';
import '~/global.css';
import { useRole } from '~/contexts/RoleContext';

const { height } = Dimensions.get('window');

export default function SignupScreen() {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    general: '',
  });

  const router = useRouter();
  const { checkRole } = useRole();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', username: '', email: '', password: '', general: '' };

    // Name
    if (!form.name) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (form.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Username
    if (!form.username) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      newErrors.username = '3-20 chars, letters/numbers/_ only';
      isValid = false;
    }

    // Email
    if (!form.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password
    if (!form.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({ name: '', username: '', email: '', password: '', general: '' });

    try {
      const response = await signup({
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      if (response.token) {
        await StorageService.storeLoginData({
          token: response.token,
          user: {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            username: response.user.username,
            role: response.user.role,
            isEmailVerified: response.user.isEmailVerified,
          },
          message: response.message,
        });

        await checkRole();

        // Optionally, show a message if email verification is required
        if (response.emailSent) {
          setErrors((prev) => ({
            ...prev,
            general: 'Signup successful! Please check your email to verify your account.',
          }));
        }

        // Navigate to home
        router.replace('/(tabs)/(home)');
      } else {
        setErrors((prev) => ({
          ...prev,
          general: response.message || 'Signup failed',
        }));
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrors((prev) => ({
          ...prev,
          general: error.message,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: 'An unexpected error occurred. Please try again.',
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="bg-gruvbox-dark-bg0 flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {/* Branding */}
          <View className="flex-1 px-6 pt-16">
            <View className="mb-10 items-center">
              <View className="bg-gruvbox-yellow-dark/20 mb-4 h-20 w-20 items-center justify-center rounded-full">
                <TablerIconComponent name="archive" size={40} color="#fabd2f" />
              </View>
              <Text className="text-gruvbox-yellow-dark mb-2 text-center text-3xl font-bold">
                Join OldVibes
              </Text>
              <Text className="text-gruvbox-dark-fg3 text-center text-lg">
                Create your account to share & discover unique treasures
              </Text>
              <Text className="text-gruvbox-dark-fg4 mt-2 text-center">
                Sign up to start sharing your old vibes!
              </Text>
            </View>

            {/* Signup Card */}
            <View className="bg-gruvbox-dark-bg1 border-gruvbox-dark-bg3 mb-6 rounded-3xl border p-6 shadow-lg">
              {/* General Error Message */}
              {errors.general ? (
                <View className="border-gruvbox-red bg-gruvbox-red/10 mb-6 rounded-xl border p-4">
                  <View className="flex-row items-center">
                    <TablerIconComponent name="alert-circle" size={20} color="#fb4934" />
                    <Text className="text-gruvbox-red-dark ml-2 flex-1">{errors.general}</Text>
                  </View>
                </View>
              ) : null}

              {/* Name Field */}
              <View className="mb-6">
                <Text className="text-gruvbox-dark-fg1 mb-3 text-base font-semibold">Name</Text>
                <View
                  className={`bg-gruvbox-dark-bg2 flex-row items-center rounded-xl border-2 ${
                    errors.name ? 'border-gruvbox-red' : 'border-gruvbox-dark-bg3'
                  }`}>
                  <View className="p-4">
                    <TablerIconComponent name="id" size={20} color="#bdae93" />
                  </View>
                  <TextInput
                    className="text-gruvbox-dark-fg1 flex-1 p-4 text-base"
                    placeholder="Your full name"
                    placeholderTextColor="#a89984"
                    value={form.name}
                    onChangeText={(text) => {
                      setForm((prev) => ({ ...prev, name: text }));
                      setErrors((prev) => ({ ...prev, name: '', general: '' }));
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
                {errors.name ? (
                  <Text className="text-gruvbox-red-dark ml-2 mt-2 text-sm">{errors.name}</Text>
                ) : null}
              </View>

              {/* Username Field */}
              <View className="mb-6">
                <Text className="text-gruvbox-dark-fg1 mb-3 text-base font-semibold">Username</Text>
                <View
                  className={`bg-gruvbox-dark-bg2 flex-row items-center rounded-xl border-2 ${
                    errors.username ? 'border-gruvbox-red' : 'border-gruvbox-dark-bg3'
                  }`}>
                  <View className="p-4">
                    <TablerIconComponent name="user" size={20} color="#bdae93" />
                  </View>
                  <TextInput
                    className="text-gruvbox-dark-fg1 flex-1 p-4 text-base"
                    placeholder="Choose a username"
                    placeholderTextColor="#a89984"
                    value={form.username}
                    onChangeText={(text) => {
                      setForm((prev) => ({ ...prev, username: text.replace(/\s/g, '') }));
                      setErrors((prev) => ({ ...prev, username: '', general: '' }));
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
                {errors.username ? (
                  <Text className="text-gruvbox-red-dark ml-2 mt-2 text-sm">{errors.username}</Text>
                ) : null}
              </View>

              {/* Email Field */}
              <View className="mb-6">
                <Text className="text-gruvbox-dark-fg1 mb-3 text-base font-semibold">Email</Text>
                <View
                  className={`bg-gruvbox-dark-bg2 flex-row items-center rounded-xl border-2 ${
                    errors.email ? 'border-gruvbox-red' : 'border-gruvbox-dark-bg3'
                  }`}>
                  <View className="p-4">
                    <TablerIconComponent name="mail" size={20} color="#bdae93" />
                  </View>
                  <TextInput
                    className="text-gruvbox-dark-fg1 flex-1 p-4 text-base"
                    placeholder="Enter your email"
                    placeholderTextColor="#a89984"
                    value={form.email}
                    onChangeText={(text) => {
                      setForm((prev) => ({ ...prev, email: text.trim() }));
                      setErrors((prev) => ({ ...prev, email: '', general: '' }));
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    keyboardType="email-address"
                    editable={!isLoading}
                  />
                </View>
                {errors.email ? (
                  <Text className="text-gruvbox-red-dark ml-2 mt-2 text-sm">{errors.email}</Text>
                ) : null}
              </View>

              {/* Password Field */}
              <View className="mb-6">
                <Text className="text-gruvbox-dark-fg1 mb-3 text-base font-semibold">Password</Text>
                <View
                  className={`bg-gruvbox-dark-bg2 flex-row items-center rounded-xl border-2 ${
                    errors.password ? 'border-gruvbox-red' : 'border-gruvbox-dark-bg3'
                  }`}>
                  <View className="p-4">
                    <TablerIconComponent name="lock" size={20} color="#bdae93" />
                  </View>
                  <TextInput
                    className="text-gruvbox-dark-fg1 flex-1 p-4 text-base"
                    placeholder="Create a password"
                    placeholderTextColor="#a89984"
                    value={form.password}
                    onChangeText={(text) => {
                      setForm((prev) => ({ ...prev, password: text }));
                      setErrors((prev) => ({ ...prev, password: '', general: '' }));
                    }}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    className="p-4"
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}>
                    <TablerIconComponent
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#bdae93"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <Text className="text-gruvbox-red-dark ml-2 mt-2 text-sm">{errors.password}</Text>
                ) : null}
              </View>

              {/* Signup Button */}
              <TouchableOpacity
                className={`mb-6 items-center rounded-xl py-4 ${
                  isLoading ? 'bg-gruvbox-yellow' : 'bg-gruvbox-yellow-dark'
                }`}
                onPress={handleSignup}
                disabled={isLoading}>
                {isLoading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="#282828" size="small" />
                    <Text className="text-gruvbox-light-bg0 ml-3 text-lg font-bold">
                      Signing Up...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <TablerIconComponent name="user-plus" size={20} color="#282828" />
                    <Text className="text-gruvbox-light-bg0 ml-3 text-lg font-bold">Sign Up</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View className="flex-row justify-center">
                <Text className="text-gruvbox-dark-fg3 text-base">Already have an account? </Text>
                <Link href="/login" asChild>
                  <TouchableOpacity disabled={isLoading}>
                    <Text className="text-gruvbox-yellow-dark text-base font-bold">Sign in</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

            {/* Social Signup Options */}
            <View className="mb-8">
              <View className="mb-6 flex-row items-center">
                <View className="bg-gruvbox-dark-bg3 h-px flex-1" />
                <Text className="text-gruvbox-dark-fg3 mx-4 font-medium">Or sign up with</Text>
                <View className="bg-gruvbox-dark-bg3 h-px flex-1" />
              </View>

              <View className="flex-row justify-center gap-4">
                <TouchableOpacity
                  className="bg-gruvbox-dark-bg3/60 flex-1 flex-row items-center justify-center rounded-xl p-4"
                  disabled={isLoading}>
                  <TablerIconComponent name="currency-google" size={24} color="#fabd2f" />
                  <Text className="text-gruvbox-yellow-dark ml-2 font-medium">Google</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Bottom Features */}
          <View className="px-6 pb-8">
            <View className="mb-4 flex-row items-center justify-center">
              <TablerIconComponent name="users" size={16} color="#b8bb26" />
              <Text className="text-gruvbox-green-dark ml-2 text-sm">
                Community-powered marketplace
              </Text>
            </View>
            <View className="flex-row justify-center gap-5">
              <View className="items-center">
                <TablerIconComponent name="camera" size={20} color="#83a598" />
                <Text className="text-gruvbox-blue-dark mt-1 text-xs">Share Reels</Text>
              </View>
              <View className="items-center">
                <TablerIconComponent name="archive" size={20} color="#fabd2f" />
                <Text className="text-gruvbox-yellow-dark mt-1 text-xs">Archive Finds</Text>
              </View>
              <View className="items-center">
                <TablerIconComponent name="shopping-bag" size={20} color="#fe8019" />
                <Text className="text-gruvbox-orange-dark mt-1 text-xs">Buy & Sell</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
