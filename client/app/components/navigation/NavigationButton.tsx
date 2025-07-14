import React from 'react';
import { Text, Pressable, View, StyleSheet } from 'react-native';
import TablerIconComponent from '../../components/icon';
import { LinearGradient } from 'expo-linear-gradient';

export default function NavigationButton({
  onPress,
  onLongPress,
  isFocused,
  icon,
  label,
  isPost = false,
}: {
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  icon: string;
  label: string;
  isPost?: boolean;
}) {
  // Gruvbox colors
  const activeGradient = ['#fabd2f', '#fe8019'];
  const inactiveColor = '#a89984';
  const activeText = '#ebdbb2';
  const postGradient = ['#b8bb26', '#fabd2f'];

  // Special style for Post button
  if (isPost) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={{ alignItems: 'center', justifyContent: 'center', marginTop: -18 }}>
        <LinearGradient
          colors={postGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#fabd2f',
            shadowOpacity: 0.4,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 8,
          }}>
          <TablerIconComponent name={icon} size={28} color="#282828" />
        </LinearGradient>
        <Text
          style={{
            marginTop: 2,
            fontSize: 12,
            color: activeText,
            fontWeight: 'bold',
          }}>
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      {isFocused ? (
        <>
          <LinearGradient
            colors={activeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TablerIconComponent name={icon} size={22} color="#282828" />
          </LinearGradient>
          <Text
            style={{
              marginTop: 2,
              fontSize: 12,
              color: activeText,
              fontWeight: 'bold',
            }}>
            {label}
          </Text>
          <View
            style={{
              width: 16,
              height: 3,
              backgroundColor: '#fabd2f',
              borderRadius: 2,
              marginTop: 2,
            }}
          />
        </>
      ) : (
        <>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(168,153,132,0.08)',
            }}>
            <TablerIconComponent name={icon} size={22} color={inactiveColor} />
          </View>
          <Text
            style={{
              marginTop: 2,
              fontSize: 12,
              color: inactiveColor,
              fontWeight: 'normal',
            }}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
