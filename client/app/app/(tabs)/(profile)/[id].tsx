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
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vibes, setVibes] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [myId, setMyId] = useState('');

  useEffect(() => {
    StorageService.getUserData().then((user) => setMyId(user?.user_id));
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const data = await getUserProfile(id);
      setProfile(data);
      const vibesRes = await getUserVibes(id);
      setVibes(vibesRes.vibes || []);
      const followersRes = await getFollowers(id);
      setFollowers(followersRes.count || 0);
      const followingRes = await getFollowing(id);
      setFollowing(followingRes.count || 0);
      // Check if current user is following this user
      if (data.followers && myId) {
        setIsFollowing(data.followers.includes(myId));
      } else {
        // Optionally, fetch a /is-following endpoint if you have one
        setIsFollowing(false);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to load profile');
    }
    setLoading(false);
    setRefreshing(false);
  }

  async function handleFollow() {
    try {
      if (isFollowing) {
        await unfollowUser(id);
        setIsFollowing(false);
        setFollowers((f) => Math.max(0, f - 1));
      } else {
        await followUser(id);
        setIsFollowing(true);
        setFollowers((f) => f + 1);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update follow status');
    }
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
        profile={{
          ...profile,
          followersCount: followers,
          followingCount: following,
          vibesCount: vibes.length,
        }}
        isMe={myId === id}
        isFollowing={isFollowing}
        onFollow={handleFollow}
      />

      {/* User's Vibes */}
      <View className="mt-6 px-4">
        <Text className="text-gruvbox-yellow-dark mb-3 text-lg font-bold">Vibes</Text>
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
