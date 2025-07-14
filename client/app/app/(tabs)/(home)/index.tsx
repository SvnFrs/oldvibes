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
} from 'react-native';
import { getVibeDetailAndIncreaseView, getVibes, likeVibe, unlikeVibe } from '~/api/vibes';
import { Vibes, MediaFile } from '~/utils/type';
import TablerIconComponent from '~/components/icon';
import CommentModal from '~/components/comments/CommentModal';
import { StorageService } from '~/utils/storage';
import { logout } from '~/api/auth';
import { router } from 'expo-router';
import { startChatAboutVibe } from '~/api/chat';
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
}: {
  vibe: Vibes;
  onLike: () => void;
  onUnlike: () => void;
  isLiked: boolean;
  onOpenComments: () => void;
}) {
  const media = vibe.mediaFiles?.[0];

  return (
    <View
      className="w-full items-center justify-center"
      style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }}>
      <View
        className="bg-gruvbox-dark-bg1/90 mb-16 overflow-hidden rounded-3xl shadow-xl"
        style={{
          height: CARD_HEIGHT,
          width: CARD_WIDTH,
        }}>
        <VibeMedia media={media} />

        {/* Overlay: Top */}
        <View className="absolute left-0 right-0 top-0 z-10 flex-row items-center px-4 pt-4">
          <Image
            source={
              vibe.user.profilePicture
                ? { uri: vibe.user.profilePicture }
                : require('~/assets/oldvibes-small.png')
            }
            className="border-gruvbox-yellow-dark h-10 w-10 rounded-full border-2"
          />
          <View className="ml-3">
            <View className="flex-row items-center">
              <Text className="text-gruvbox-light-bg0 text-lg font-bold">{vibe.user.username}</Text>
              {vibe.user.isVerified && (
                <TablerIconComponent
                  name="check"
                  size={16}
                  color="#b8bb26"
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
            <Text className="text-gruvbox-dark-fg3 text-xs">{vibe.location}</Text>
          </View>
        </View>

        {/* Overlay: Bottom */}
        <View className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-4">
          <View className="mb-1">
            <Text className="text-gruvbox-yellow-dark text-xl font-bold">{vibe.itemName}</Text>
            <Text className="text-gruvbox-dark-fg1">{vibe.description}</Text>
          </View>
          <View className="mb-2 flex-row items-center">
            <Text className="text-gruvbox-green-dark text-lg font-bold">${vibe.price}</Text>
            <Text className="text-gruvbox-dark-fg4 ml-3 text-xs">{vibe.condition}</Text>
            <Text className="text-gruvbox-dark-fg4 ml-3 text-xs">{vibe.category}</Text>
          </View>
          <View className="mb-2 flex-row flex-wrap">
            {vibe.tags.map((tag) => (
              <Text
                key={tag}
                className="bg-gruvbox-dark-bg3 text-gruvbox-yellow-dark mb-1 mr-2 rounded-full px-2 py-1 text-xs">
                #{tag}
              </Text>
            ))}
          </View>
          {/* Actions */}
          <View className="mt-2 flex-row items-center">
            <TouchableOpacity className="mr-6 items-center" onPress={isLiked ? onUnlike : onLike}>
              <TablerIconComponent name="heart" size={28} color={isLiked ? '#fb4934' : '#a89984'} />
              <Text className="text-gruvbox-light-bg0 text-xs">{vibe.likesCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="mr-6 items-center" onPress={onOpenComments}>
              <TablerIconComponent name="message-circle" size={28} color="#fabd2f" />
              <Text className="text-gruvbox-light-bg0 text-xs">{vibe.commentsCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="mr-6 items-center">
              <TablerIconComponent name="share" size={28} color="#83a598" />
              <Text className="text-gruvbox-light-bg0 text-xs">Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="items-center"
              onPress={async () => {
                try {
                  const res = await startChatAboutVibe(vibe.id);
                  router.push(`/chat/${res.conversationId}`);
                } catch (e) {
                  // handle error
                }
              }}>
              <TablerIconComponent name="send" size={28} color="#b8bb26" />
              <Text className="text-gruvbox-light-bg0 text-xs">Contact</Text>
            </TouchableOpacity>
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
          profilePicture: null, // or user.profilePicture if you have it
          isVerified: false, // or user.isVerified if you have it
        });
        setCurrentUserId(user.user_id);
        setIsStaff(user.role === 'staff' || user.role === 'admin');
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
      <View className="bg-gruvbox-dark-bg0 flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#fabd2f" />
      </View>
    );
  }

  if (!vibes.length) {
    return (
      <View className="bg-gruvbox-dark-bg0 flex-1 items-center justify-center">
        <Text className="text-gruvbox-yellow-dark text-lg">
          No vibes yet. Be the first to post!
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-gruvbox-dark-bg0 flex-1">
      <View className="absolute bottom-24 right-6 z-50">
        <TouchableOpacity
          className="bg-gruvbox-red flex-row items-center rounded-xl px-4 py-2 shadow-lg"
          onPress={async () => {
            await logout();
            router.replace('/(auth)/login');
          }}>
          <TablerIconComponent name="logout" size={18} color="#fbf1c7" />
          <Text className="text-gruvbox-light-bg0 ml-2 font-bold">Logout</Text>
        </TouchableOpacity>
      </View>

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
      />
    </View>
  );
}
