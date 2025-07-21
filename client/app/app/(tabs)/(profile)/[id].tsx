import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  getUserProfile,
  getUserVibes,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
} from '~/api/profile';
import ProfileCard from '~/components/profile/ProfileCard';
import { StorageService } from '~/utils/storage';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIBE_SIZE = (SCREEN_WIDTH - 32 - 12) / 2;

export default function OtherProfileScreen() {
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vibes, setVibes] = useState<any[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [myId, setMyId] = useState<string>('');

  useEffect(() => {
    StorageService.getUserData().then((user: any) => setMyId(user?.user_id ?? ''));
  }, []);

  // id from useLocalSearchParams can be string | string[] | undefined
  // We'll normalize it to a string or empty string
  const normalizedId = typeof id === 'string' ? id : Array.isArray(id) ? (id[0] ?? '') : '';

  // fetchProfile must be stable for useEffect dependency
  const fetchProfile = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserProfile(normalizedId);
      setProfile(data);
      const vibesRes = await getUserVibes(normalizedId);
      setVibes(vibesRes.vibes || []);
      const followersRes = await getFollowers(normalizedId);
      setFollowers(followersRes.count || 0);
      const followingRes = await getFollowing(normalizedId);
      setFollowing(followingRes.count || 0);
      // Check if current user is following this user
      if (data.followers && myId) {
        setIsFollowing(data.followers.includes(myId));
      } else {
        setIsFollowing(false);
      }
    } catch (e: unknown) {
      let message = 'Failed to load profile';
      if (e && typeof e === 'object' && 'message' in e && typeof (e as any).message === 'string') {
        message = (e as any).message;
      }
      Alert.alert('Error', message);
    }
    setLoading(false);
    setRefreshing(false);
  }, [normalizedId, myId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function handleFollow() {
    try {
      if (isFollowing) {
        await unfollowUser(normalizedId);
        setIsFollowing(false);
        setFollowers((f) => Math.max(0, f - 1));
      } else {
        await followUser(normalizedId);
        setIsFollowing(true);
        setFollowers((f) => f + 1);
      }
    } catch (e: unknown) {
      let message = 'Failed to update follow status';
      if (e && typeof e === 'object' && 'message' in e && typeof (e as any).message === 'string') {
        message = (e as any).message;
      }
      Alert.alert('Error', message);
    }
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
        profile={{
          ...(profile ?? {}),
          followersCount: followers,
          followingCount: following,
          vibesCount: vibes.length,
        }}
        isMe={myId === normalizedId}
        isFollowing={isFollowing}
        onFollow={handleFollow}
        onEdit={() => {}}
        onAvatarPress={() => {}}
        onLogout={() => {}}
        onFollowersPress={() => {}}
        onFollowingPress={() => {}}
      />

      {/* User's Vibes */}
      <View className="mt-6 px-4">
        <Text className="mb-3 text-lg font-bold text-gruvbox-yellow-dark">Vibes</Text>
        {vibes.length === 0 ? (
          <Text className="text-gruvbox-dark-fg3">No vibes yet.</Text>
        ) : (
          <FlatList
            data={vibes}
            keyExtractor={(item: any) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }: { item: any }) => (
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
                  <Text className="font-bold text-gruvbox-yellow-dark" numberOfLines={1}>
                    {item.itemName}
                  </Text>
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
