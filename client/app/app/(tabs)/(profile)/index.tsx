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
import {
  getMyProfile,
  updateMyProfile,
  updateMyAvatar,
  getUserVibes,
  uploadAvatar,
} from '~/api/profile';
import { logout } from '~/api/auth';
import { StorageService } from '~/utils/storage';
import ProfileCard from '~/components/profile/ProfileCard';
import TablerIconComponent from '~/components/icon';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIBE_SIZE = (SCREEN_WIDTH - 32 - 12) / 2; // 2 columns, 16px padding, 12px gap

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vibes, setVibes] = useState([]);
  const [avatarUploading, setAvatarUploading] = useState(false);

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
      Alert.alert('Error', e.message || 'Failed to load profile');
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
      Alert.alert('Error', e.message || 'Failed to update profile');
    }
  }

  async function handleAvatarPick() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setAvatarUploading(true);
        await uploadAvatar(result.assets[0].uri);
        fetchProfile();
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleLogout() {
    await logout();
    // Optionally, navigate to login
  }

  if (loading) {
    return (
      <View className="bg-gruvbox-dark-bg0 flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#fabd2f" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="bg-gruvbox-dark-bg0 flex-1 items-center justify-center">
        <Text className="text-gruvbox-yellow-dark">Failed to load profile.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="bg-gruvbox-dark-bg0 flex-1"
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
        isMe
        onEdit={() => setEditing(true)}
        onAvatarPress={handleAvatarPick}
        onLogout={handleLogout}
      />

      {/* Edit Modal */}
      {editing && (
        <View className="absolute bottom-0 left-0 right-0 top-0 z-50 items-center justify-center bg-black/60">
          <View className="bg-gruvbox-dark-bg1 w-11/12 rounded-2xl p-6">
            <Text className="text-gruvbox-yellow-dark mb-4 text-xl font-bold">Edit Profile</Text>
            <TextInput
              className="bg-gruvbox-dark-bg2 text-gruvbox-light-bg0 mb-3 rounded-lg px-4 py-2"
              value={editName}
              onChangeText={setEditName}
              placeholder="Name"
              placeholderTextColor="#a89984"
            />
            <TextInput
              className="bg-gruvbox-dark-bg2 text-gruvbox-light-bg0 mb-3 rounded-lg px-4 py-2"
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Bio"
              placeholderTextColor="#a89984"
              multiline
            />
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity onPress={() => setEditing(false)}>
                <Text className="text-gruvbox-dark-fg3 font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <Text className="text-gruvbox-yellow-dark font-bold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Divider */}
      <View className="bg-gruvbox-dark-bg3 my-6 h-px w-full opacity-60" />

      {/* My Vibes */}
      <View className="px-4">
        <Text className="text-gruvbox-yellow-dark mb-3 text-lg font-bold">My Vibes</Text>
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
                className="bg-gruvbox-dark-bg2 overflow-hidden rounded-2xl"
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
                  <Text className="text-gruvbox-yellow-dark font-bold" numberOfLines={1}>
                    {item.itemName}
                  </Text>
                  <Text className="text-gruvbox-dark-fg3 text-xs" numberOfLines={1}>
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
