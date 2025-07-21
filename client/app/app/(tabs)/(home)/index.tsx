import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  RefreshControl,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  getVibeDetailAndIncreaseView,
  getVibes,
  likeVibe,
  markVibeAsSold,
  unlikeVibe,
} from '~/api/vibes';
import { Vibes, MediaFile } from '~/utils/type';
import TablerIconComponent from '~/components/icon';
import CommentModal from '~/components/comments/CommentModal';
import { StorageService } from '~/utils/storage';
import { logout } from '~/api/auth';
import { router } from 'expo-router';
import { startChatAboutVibe } from '~/api/chat';
import VibeMediaCarousel from '~/components/vibes/VibeMediaCarousel';
// import Video from 'react-native-video'; // Uncomment if you support video

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// 80% of screen height, centered
const CARD_HEIGHT = SCREEN_HEIGHT * 0.75;
const CARD_WIDTH = SCREEN_WIDTH * 0.95;

function VibeMedia({ media }: { media?: MediaFile }) {
  if (!media) {
    return (
      <Image
        source={{ uri: 'https://placehold.co/600x800/282828/fbf1c7?text=No+Media' }}
        className="absolute h-full w-full rounded-3xl"
        resizeMode="cover"
      />
    );
  }
  if (media.type === 'image') {
    return (
      <Image
        source={{ uri: media.url }}
        className="absolute h-full w-full rounded-3xl"
        resizeMode="cover"
      />
    );
  }
  // Uncomment for video support
  // if (media.type === 'video') {
  //   return (
  //     <Video
  //       source={{ uri: media.url }}
  //       className="absolute w-full h-full rounded-3xl"
  //       resizeMode="cover"
  //       repeat
  //       muted
  //       controls={false}
  //       paused={false}
  //     />
  //   );
  // }
  return null;
}

function VibeCard({
  vibe,
  onLike,
  onUnlike,
  isLiked,
  onOpenComments,
  onMarkAsSold,
  isMine,
  isEmailVerified,
}: {
  vibe: Vibes;
  onLike: () => void;
  onUnlike: () => void;
  isLiked: boolean;
  onOpenComments: () => void;
  onMarkAsSold: () => void;
  isMine: boolean;
  isEmailVerified?: boolean;
}) {
  const media = vibe.mediaFiles?.[0];
  const [contactLoading, setContactLoading] = useState(false);

  return (
    <View
      className="w-full items-center justify-center"
      style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }}>
      <View
        className="mb-16 overflow-hidden rounded-3xl bg-gruvbox-dark-bg1/90 shadow-xl"
        style={{
          height: CARD_HEIGHT,
          width: CARD_WIDTH,
        }}>
        {isMine && (
          <View
            className="absolute right-4 top-6 z-20 flex-row items-center rounded-full px-4 py-1"
            style={{
              backgroundColor: '#fabd2f',
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 6,
            }}>
            <TablerIconComponent name="user" size={16} color="#282828" />
            <Text className="ml-2 text-xs font-bold" style={{ color: '#282828', letterSpacing: 1 }}>
              YOURS
            </Text>
          </View>
        )}
        <VibeMediaCarousel mediaFiles={vibe.mediaFiles || []} />

        {/* Overlay: Top */}
        <View className="absolute left-0 right-0 top-0 z-10 flex-row items-center px-4 pt-4">
          <Image
            source={
              vibe.user.profilePicture
                ? { uri: vibe.user.profilePicture }
                : require('~/assets/oldvibes-small.png')
            }
            className="h-10 w-10 rounded-full border-2 border-gruvbox-yellow-dark"
          />
          <View className="ml-3">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-gruvbox-light-bg0">{vibe.user.username}</Text>
              {vibe.user.isVerified && (
                <TablerIconComponent
                  name="check"
                  size={16}
                  color="#b8bb26"
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
            <Text className="text-xs font-bold text-gruvbox-dark-fg0">{vibe.location}</Text>
          </View>
        </View>

        {/* Overlay: Bottom */}
        <View className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-4">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gruvbox-yellow-dark" numberOfLines={1}>
              {vibe.itemName}
            </Text>
            <View className="ml-2 flex-row items-center">
              <TablerIconComponent name="eye" size={14} color="#b8bb26" />
              <Text
                className="ml-1"
                style={{
                  fontSize: 12,
                  color: '#b8bb26', // Gruvbox green-dark, or pick another for contrast
                  fontWeight: 'bold',
                }}>
                {vibe.views}
              </Text>
            </View>
          </View>
          <View className="mb-2 flex-row items-center">
            <Text className="text-lg font-bold text-gruvbox-green-dark">${vibe.price}</Text>
            <Text className="ml-3 text-xs text-gruvbox-dark-fg4">{vibe.condition}</Text>
            <Text className="ml-3 text-xs text-gruvbox-dark-fg4">{vibe.category}</Text>
          </View>
          <View className="mb-2 flex-row flex-wrap">
            {vibe.tags.map((tag) => (
              <Text
                key={tag}
                className="mb-1 mr-2 rounded-full bg-gruvbox-dark-bg3 px-2 py-1 text-xs text-gruvbox-yellow-dark">
                #{tag}
              </Text>
            ))}
          </View>
          {/* Actions */}
          <View className="mt-2 flex-row items-center">
            <TouchableOpacity
              className="mr-6 items-center"
              onPress={() => {
                if (!isEmailVerified) {
                  Alert.alert(
                    'Email verification required',
                    'Please verify your email address to like vibes.'
                  );
                  return;
                }
                isLiked ? onUnlike() : onLike();
              }}>
              <TablerIconComponent name="heart" size={28} color={isLiked ? '#fb4934' : '#a89984'} />
              <Text className="text-xs text-gruvbox-light-bg0">{vibe.likesCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="mr-6 items-center" onPress={onOpenComments}>
              <TablerIconComponent name="message-circle" size={28} color="#fabd2f" />
              <Text className="text-xs text-gruvbox-light-bg0">{vibe.commentsCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="mr-6 items-center">
              <TablerIconComponent name="share" size={28} color="#83a598" />
              <Text className="text-xs text-gruvbox-light-bg0">Share</Text>
            </TouchableOpacity>
            {!isMine && (
              <TouchableOpacity
                className="items-center"
                onPress={async () => {
                  if (!isEmailVerified) {
                    Alert.alert(
                      'Email verification required',
                      'Please verify your email address to contact sellers or start a chat.'
                    );
                    return;
                  }
                  setContactLoading(true);
                  try {
                    const res = await startChatAboutVibe(vibe.id);
                    router.push(`/(tabs)/(chat)/${res.conversationId}`);
                  } catch (e: any) {
                    // Handle API error for not verified, just in case
                    if (e?.message?.includes('Email verification required')) {
                      Alert.alert(
                        'Email verification required',
                        'Please verify your email address to contact sellers or start a chat.'
                      );
                    } else {
                      Alert.alert(
                        'Could not start chat',
                        e?.message || 'Failed to start chat. Please try again later.'
                      );
                    }
                  } finally {
                    setContactLoading(false);
                  }
                }}
                disabled={contactLoading}
                style={{ opacity: contactLoading ? 0.6 : 1 }}>
                <TablerIconComponent name="send" size={28} color="#b8bb26" />
                <Text className="text-xs text-gruvbox-light-bg0">
                  {contactLoading ? 'Loading...' : 'Contact'}
                </Text>
              </TouchableOpacity>
            )}

            {isMine && vibe.status !== 'sold' && (
              <TouchableOpacity
                className="ml-4 rounded-xl bg-gruvbox-green-dark px-4 py-2"
                onPress={onMarkAsSold}>
                <Text className="font-bold text-gruvbox-dark-bg0">Mark as Sold</Text>
              </TouchableOpacity>
            )}
            {isMine && vibe.status === 'sold' && (
              <View className="ml-4 rounded-xl bg-gruvbox-dark-bg3 px-4 py-2">
                <Text className="font-bold text-gruvbox-yellow-dark">SOLD</Text>
              </View>
            )}
          </View>
        </View>
        {/* Optional: dark overlay for readability */}
        <View className="absolute bottom-0 left-0 right-0 top-0 bg-black/20" pointerEvents="none" />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [vibes, setVibes] = useState<Vibes[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [likedVibes, setLikedVibes] = useState<Record<string, boolean>>({});
  const viewedVibes = useRef<Set<string>>(new Set());

  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedVibeId, setSelectedVibeId] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    StorageService.getUserData().then((user) => {
      if (user) {
        setCurrentUser({
          id: user.user_id,
          username: user.username,
          name: user.name,
          profilePicture: null,
          isVerified: user.isVerified ?? false,
          isEmailVerified: user.isEmailVerified ?? false,
        });
        setCurrentUserId(user.user_id);
        setIsStaff(user.role === 'staff' || user.role === 'admin');
        console.log('Current user data', user);
      }
    });
  }, []);

  const fetchVibes = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await getVibes();
      setVibes(data.vibes || []);
    } catch (e) {
      // handle error
    }
    setIsRefreshing(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchVibes();
  }, [fetchVibes]);

  // Called when a new card comes into view
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (!viewableItems?.length) return;
    const firstVisible = viewableItems[0]?.item;
    if (firstVisible && !viewedVibes.current.has(firstVisible.id)) {
      viewedVibes.current.add(firstVisible.id);
      // Increase view count
      getVibeDetailAndIncreaseView(firstVisible.id).catch(() => {});
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 80 });

  // Like/unlike logic
  const handleLike = async (id: string) => {
    try {
      await likeVibe(id);
      setLikedVibes((prev) => ({ ...prev, [id]: true }));
      setVibes((prev) =>
        prev.map((v) => (v.id === id ? { ...v, likesCount: v.likesCount + 1 } : v))
      );
    } catch {}
  };
  const handleUnlike = async (id: string) => {
    try {
      await unlikeVibe(id);
      setLikedVibes((prev) => ({ ...prev, [id]: false }));
      setVibes((prev) =>
        prev.map((v) => (v.id === id ? { ...v, likesCount: Math.max(0, v.likesCount - 1) } : v))
      );
    } catch {}
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gruvbox-dark-bg0">
        <ActivityIndicator size="large" color="#fabd2f" />
      </View>
    );
  }

  if (!vibes.length) {
    return (
      <View className="flex-1 items-center justify-center bg-gruvbox-dark-bg0">
        <Text className="mb-6 text-lg text-gruvbox-yellow-dark">
          No vibes yet. Be the first to post!
        </Text>
        {/* <View className="absolute bottom-24 right-6 z-50">
          <TouchableOpacity
            className="flex-row items-center rounded-xl bg-gruvbox-red px-4 py-2 shadow-lg"
            onPress={async () => {
              await logout();
              router.replace('/(auth)/login');
            }}>
            <TablerIconComponent name="logout" size={18} color="#fbf1c7" />
            <Text className="ml-2 font-bold text-gruvbox-light-bg0">Logout</Text>
          </TouchableOpacity>
        </View> */}
        <TouchableOpacity
          className="flex-row items-center rounded-xl bg-gruvbox-yellow-dark px-4 py-2"
          onPress={fetchVibes}
          disabled={isRefreshing}
          style={{ opacity: isRefreshing ? 0.6 : 1 }}>
          <TablerIconComponent name="refresh" size={20} color="#282828" />
          <Text className="ml-2 font-bold text-gruvbox-dark-bg0">
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gruvbox-dark-bg0">
      {/* <View className="absolute bottom-24 right-6 z-50">
        <TouchableOpacity
          className="flex-row items-center rounded-xl bg-gruvbox-red px-4 py-2 shadow-lg"
          onPress={async () => {
            await logout();
            router.replace('/(auth)/login');
          }}>
          <TablerIconComponent name="logout" size={18} color="#fbf1c7" />
          <Text className="ml-2 font-bold text-gruvbox-light-bg0">Logout</Text>
        </TouchableOpacity>
      </View> */}

      <FlatList
        data={vibes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VibeCard
            vibe={item}
            isLiked={!!likedVibes[item.id]}
            onLike={() => handleLike(item.id)}
            onUnlike={() => handleUnlike(item.id)}
            onOpenComments={() => {
              setSelectedVibeId(item.id);
              setCommentModalVisible(true);
            }}
            isMine={item.userId === currentUserId}
            onMarkAsSold={async () => {
              try {
                await markVibeAsSold(item.id);
                setVibes((prev) =>
                  prev.map((v) => (v.id === item.id ? { ...v, status: 'sold' } : v))
                );
                Alert.alert('Marked as Sold', 'Your vibe is now marked as sold.');
              } catch (e) {
                Alert.alert('Error', e.message || 'Failed to mark as sold');
              }
            }}
            isEmailVerified={currentUser?.isEmailVerified}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={fetchVibes}
            colors={['#fabd2f']}
            tintColor="#fabd2f"
          />
        }
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef.current}
      />

      <CommentModal
        visible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        vibeId={selectedVibeId || ''}
        currentUserId={currentUserId}
        isStaff={isStaff}
        currentUser={currentUser}
        isEmailVerified={currentUser?.isEmailVerified}
      />
    </View>
  );
}
