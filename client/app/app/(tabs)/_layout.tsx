import React from 'react';
import { Tabs } from 'expo-router';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import NavigationBar from '~/components/navigation/NavigationBar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRole } from '~/contexts/RoleContext';

export default function TabLayout() {
  const { currentRole, isLoading } = useRole();

  // Show loading while role is being determined
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </SafeAreaProvider>
    );
  }

  // If no role is determined, return empty view (should redirect in _layout.tsx)
  if (!currentRole) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 bg-white" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hide the default tab bar
        }}
        tabBar={(props) => <NavigationBar {...props} />}>
        {/* Home Tab - Available for all roles */}
        <Tabs.Screen
          name="(home)"
          options={{
            title: 'Home',
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
