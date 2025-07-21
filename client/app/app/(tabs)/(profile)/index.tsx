import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { getMyProfile, updateMyProfile, getUserVibes, uploadAvatar } from '~/api/profile';
import { logout } from '~/api/auth';
import ProfileCard from '~/components/profile/ProfileCard';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import TablerIconComponent from '~/components/icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIBE_SIZE = (SCREEN_WIDTH - 32 - 12) / 2; // 2 columns, 16px padding, 12px gap

export default function ProfileScreen() {
  type Vibe = {
    id: string;
    mediaFiles?: { url: string }[];
    itemName: string;
    price: number | string;
  };

  type Profile = {
    id: string;
    name: string;
    bio?: string;
    // Add other fields as needed
  };

  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vibes, setVibes] = useState<Vibe[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const data = await getMyProfile();
      setProfile(data);
      setEditName(data.name);
      setEditBio(data.bio || '');
      // Fetch vibes
      const vibesRes = await getUserVibes(data.id);
      setVibes(vibesRes.vibes || []);
    } catch (e) {
      let message = 'Failed to load profile';
      if (e instanceof Error) {
        message = e.message;
      }
      Alert.alert('Error', message);
    }
    setLoading(false);
    setRefreshing(false);
  }

  async function handleSave() {
    try {
      await updateMyProfile({ name: editName, bio: editBio });
      setEditing(false);
      fetchProfile();
    } catch (e) {
      let message = 'Failed to update profile';
      if (e instanceof Error) {
        message = e.message;
      }
      Alert.alert('Error', message);
    }
  }

  async function handleAvatarPick() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // MediaTypeOptions is deprecated, but All is still supported for now
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        await uploadAvatar(result.assets[0].uri);
        fetchProfile();
      }
    } catch (e) {
      let message = 'Failed to upload avatar';
      if (e instanceof Error) {
        message = e.message;
      }
      Alert.alert('Error', message);
    }
  }

  async function handleLogout() {
    // Clear local storage and call logout API, but don't wait for it to finish before navigating
    logout().catch(() => {}); // fire and forget

    await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay to ensure logout is processed

    // Show alert immediately
    Alert.alert('Logged out', 'You have been logged out.');

    // Wait a moment to ensure logout is processed
    // This is a simple delay, you can adjust as needed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Navigate to login screen immediately
    router.replace('/(auth)/login');
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gruvbox-dark-bg0">
        <ActivityIndicator size="large" color="#fabd2f" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-gruvbox-dark-bg0">
        <Text className="text-gruvbox-yellow-dark">Failed to load profile.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gruvbox-dark-bg0"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchProfile();
          }}
          colors={['#fabd2f']}
          tintColor="#fabd2f"
        />
      }>
      <ProfileCard
        profile={{ ...profile, vibesCount: vibes.length }}
        isMe={true}
        onEdit={() => setEditing(true)}
        onAvatarPress={handleAvatarPick}
        onLogout={handleLogout}
        onFollow={undefined}
        isFollowing={undefined}
        onFollowersPress={undefined}
        onFollowingPress={undefined}
      />

      {/* Edit Modal */}
      {editing && (
        <View className="absolute bottom-0 left-0 right-0 top-40 z-50 flex-1 items-center justify-center">
          <View className="w-11/12 rounded-2xl bg-gruvbox-dark-bg1 p-6">
            <Text className="mb-4 text-xl font-bold text-gruvbox-yellow-dark">Edit Profile</Text>
            <TextInput
              className="mb-3 rounded-lg bg-gruvbox-dark-bg2 px-4 py-2 text-gruvbox-light-bg0"
              value={editName}
              onChangeText={setEditName}
              placeholder="Name"
              placeholderTextColor="#a89984"
            />
            <TextInput
              className="mb-3 rounded-lg bg-gruvbox-dark-bg2 px-4 py-2 text-gruvbox-light-bg0"
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Bio"
              placeholderTextColor="#a89984"
              multiline
            />
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity onPress={() => setEditing(false)}>
                <Text className="font-bold text-gruvbox-dark-fg3">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <Text className="font-bold text-gruvbox-yellow-dark">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Divider */}
      <View className="my-6 h-px w-full bg-gruvbox-dark-bg3 opacity-60" />

      {/* My Vibes */}
      <View className="px-4">
        <Text className="mb-3 text-lg font-bold text-gruvbox-yellow-dark">My Vibes</Text>
        {vibes.length === 0 ? (
          <Text className="text-gruvbox-dark-fg3">No vibes yet.</Text>
        ) : (
          <FlatList
            data={vibes}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => (
              <View
                className="overflow-hidden rounded-2xl bg-gruvbox-dark-bg2"
                style={{ width: VIBE_SIZE }}>
                <Image
                  source={
                    item.mediaFiles?.[0]
                      ? { uri: item.mediaFiles[0].url }
                      : require('~/assets/oldvibes-small.png')
                  }
                  className="h-40 w-full"
                  resizeMode="cover"
                />
                <View className="p-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-bold text-gruvbox-yellow-dark" numberOfLines={1}>
                      {item.itemName}
                    </Text>
                    <View className="ml-2 flex-row items-center">
                      <TablerIconComponent name="eye" size={12} color="#b8bb26" />
                      <Text
                        className="ml-1"
                        style={{
                          fontSize: 10,
                          color: '#b8bb26',
                          fontWeight: 'bold',
                        }}>
                        {item.views}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-gruvbox-dark-fg3" numberOfLines={1}>
                    ${item.price}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
      <View className="h-10" />
    </ScrollView>
  );
}
