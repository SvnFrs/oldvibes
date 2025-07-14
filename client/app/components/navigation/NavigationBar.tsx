import React from 'react';
import { View, Dimensions, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import NavigationButton from './NavigationButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRole } from '../../contexts/RoleContext';
import { useSegments } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

const TAB_CONFIG = {
  user: [
    { name: '(home)', icon: 'home', label: 'Home' },
    { name: '(search)', icon: 'search', label: 'Explore' },
    { name: '(post)', icon: 'plus', label: 'Post', isPost: true },
    { name: '(chat)', icon: 'message', label: 'Chat' },
    { name: '(profile)', icon: 'user', label: 'Profile' },
  ],
  staff: [
    { name: '(home)', icon: 'home', label: 'Home' },
    { name: '(approvals)', icon: 'checkup-list', label: 'Approvals' },
    { name: '(chat)', icon: 'message', label: 'Chat' },
    { name: '(users)', icon: 'users', label: 'Users' },
    { name: '(profile)', icon: 'user', label: 'Profile' },
  ],
};

export default function NavigationBar({
  state,
  descriptors,
  navigation,
  isVisible = true,
}: BottomTabBarProps & { isVisible?: boolean }) {
  const insets = useSafeAreaInsets();
  const { currentRole, isLoading } = useRole();
  const segments = useSegments();

  // --- AUTO-HIDE LOGIC ---
  // segments example: ['(tabs)', '(chat)', '[conversationId]']
  const isChatDetail =
    segments.includes('(chat)') &&
    segments[segments.length - 1]?.startsWith('[') &&
    segments[segments.length - 1]?.endsWith(']');

  if (!isVisible || isLoading || !currentRole || isChatDetail) return null;

  // Pick tabs for current role
  const tabs = TAB_CONFIG[currentRole] || TAB_CONFIG.user;

  // Map route names to tab config
  const visibleRoutes = tabs
    .map((tab) => {
      const route = state.routes.find((r) => r.name.startsWith(tab.name));
      return { ...tab, route };
    })
    .filter((tab) => tab.route);

  // Find active tab index
  const activeIndex = visibleRoutes.findIndex(
    (tab) => state.index === state.routes.findIndex((r) => r.name === tab.route.name)
  );

  return (
    <View
      className="absolute -bottom-4 left-0 right-0 z-50"
      style={{
        paddingBottom: Math.max(insets.bottom, 10),
        paddingHorizontal: 12,
      }}>
      <View
        className="bg-gruvbox-dark-bg1/95 border-gruvbox-dark-bg3 flex-row items-center justify-between rounded-3xl border shadow-lg"
        style={{
          paddingVertical: Platform.OS === 'ios' ? 10 : 8,
          paddingHorizontal: 8,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        }}>
        {visibleRoutes.map((tab, idx) => (
          <NavigationButton
            key={tab.name}
            onPress={() => {
              if (state.index !== state.routes.findIndex((r) => r.name === tab.route.name)) {
                navigation.navigate(tab.route.name, tab.route.params);
              }
            }}
            onLongPress={() => {
              navigation.emit({
                type: 'tabLongPress',
                target: tab.route.key,
              });
            }}
            isFocused={activeIndex === idx}
            icon={tab.icon}
            label={tab.label}
            isPost={!!tab.isPost}
          />
        ))}
      </View>
    </View>
  );
}
