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
import { login } from '~/api/auth';
import { StorageService } from '~/utils/storage';
import '~/global.css';

import { useRole } from '~/contexts/RoleContext';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });

  const router = useRouter();
  const { checkRole } = useRole();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '', general: '' };

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (email.length < 3) {
      newErrors.email = 'Email must be at least 3 characters';
      isValid = false;
    } else if (email.length > 30) {
      newErrors.email = 'Email must be less than 30 characters';
      isValid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({ email: '', password: '', general: '' });

    try {
      // Call login API
      const response = await login(email, password);

      if (response.message === 'Login successful') {
        // Store login data in AsyncStorage
        await StorageService.storeLoginData(response);

        await checkRole();

        // Navigate to home screen
        router.replace('/(tabs)/(home)');
      } else {
        setErrors((prev) => ({
          ...prev,
          general: response.message || 'Login failed',
        }));
      }
    } catch (error) {
      console.error('Login error:', error);

      // Handle different types of errors
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          setErrors((prev) => ({
            ...prev,
            general: 'Network error. Please check your connection.',
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            general: error.message,
          }));
        }
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
                Welcome to OldVibes
              </Text>
              <Text className="text-gruvbox-dark-fg3 text-center text-lg">
                Share & discover unique second-hand treasures
              </Text>
              <Text className="text-gruvbox-dark-fg4 mt-2 text-center">
                Sign in to start sharing your old vibes!
              </Text>
            </View>

            {/* Login Card */}
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

              {/* Email Field */}
              <View className="mb-6">
                <Text className="text-gruvbox-dark-fg1 mb-3 text-base font-semibold">Email</Text>
                <View
                  className={`bg-gruvbox-dark-bg2 flex-row items-center rounded-xl border-2 ${errors.email ? 'border-gruvbox-red' : 'border-gruvbox-dark-bg3'
                    }`}>
                  <View className="p-4">
                    <TablerIconComponent name="user" size={20} color="#bdae93" />
                  </View>
                  <TextInput
                    className="text-gruvbox-dark-fg1 flex-1 p-4 text-base"
                    placeholder="Enter your email"
                    placeholderTextColor="#a89984"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text.trim());
                      setErrors((prev) => ({
                        ...prev,
                        email: '',
                        general: '',
                      }));
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="username"
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
                  className={`bg-gruvbox-dark-bg2 flex-row items-center rounded-xl border-2 ${errors.password ? 'border-gruvbox-red' : 'border-gruvbox-dark-bg3'
                    }`}>
                  <View className="p-4">
                    <TablerIconComponent name="lock" size={20} color="#bdae93" />
                  </View>
                  <TextInput
                    className="text-gruvbox-dark-fg1 flex-1 p-4 text-base"
                    placeholder="Enter your password"
                    placeholderTextColor="#a89984"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrors((prev) => ({
                        ...prev,
                        password: '',
                        general: '',
                      }));
                    }}
                    secureTextEntry={!showPassword}
                    autoComplete="current-password"
                    textContentType="password"
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

              {/* Forgot Password Link */}
              <View className="mb-8 items-end">
                <Link href="/forgot" asChild>
                  <TouchableOpacity disabled={isLoading}>
                    <Text className="text-gruvbox-yellow-dark text-base font-medium">
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                className={`mb-6 items-center rounded-xl py-4 ${isLoading ? 'bg-gruvbox-yellow' : 'bg-gruvbox-yellow-dark'
                  }`}
                onPress={handleLogin}
                disabled={isLoading}>
                {isLoading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="#282828" size="small" />
                    <Text className="text-gruvbox-light-bg0 ml-3 text-lg font-bold">
                      Signing In...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <TablerIconComponent name="login" size={20} color="#282828" />
                    <Text className="text-gruvbox-light-bg0 ml-3 text-lg font-bold">Sign In</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View className="flex-row justify-center">
                <Text className="text-gruvbox-dark-fg3 text-base">Don't have an account? </Text>
                <Link href="/signup" asChild>
                  <TouchableOpacity disabled={isLoading}>
                    <Text className="text-gruvbox-yellow-dark text-base font-bold">Sign up</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

            {/* Social Login Options */}
            <View className="mb-8">
              <View className="mb-6 flex-row items-center">
                <View className="bg-gruvbox-dark-bg3 h-px flex-1" />
                <Text className="text-gruvbox-dark-fg3 mx-4 font-medium">Or continue with</Text>
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
