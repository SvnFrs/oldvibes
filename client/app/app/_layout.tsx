import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StorageService } from '../utils/storage';
import { RoleProvider } from '../contexts/RoleContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [fontsLoaded] = useFonts({
    TablerIcons: require('../assets/tabler-icons/tabler-icons.ttf'),
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      if (!fontsLoaded) return;

      try {
        // Check if user is logged in
        const isLoggedIn = await StorageService.isLoggedIn();

        // Hide splash screen
        await SplashScreen.hideAsync();

        // Add a small delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (!isLoggedIn) {
          // Not logged in, always push to login if not already there
          if (!segments.includes('(auth)')) {
            router.replace('/(auth)/login');
          }
        } else {
          // Logged in, push to main app if on auth screens
          if (segments.includes('(auth)')) {
            router.replace('/(tabs)/(home)');
          }
        }
        setIsReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        await StorageService.clearLoginData();
        router.replace('/(auth)/login');
        setIsReady(true);
      }
    };

    initializeApp();
  }, [fontsLoaded, router, segments]);

  // Don't render anything until fonts are loaded and navigation is handled
  if (!fontsLoaded || !isReady) {
    return null;
  }

  return (
    <RoleProvider>
      <View className="flex-1 bg-white">
        <StatusBar translucent backgroundColor="transparent" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_bottom',
            animationDuration: 500,
            contentStyle: {
              backgroundColor: '#FFFFFF',
            },
          }}>
          {/* Auth Screens */}
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />

          {/* Main App Screens */}
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
        </Stack>
      </View>
    </RoleProvider>
  );
}
