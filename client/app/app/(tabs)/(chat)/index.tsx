import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getConversations } from '~/api/chat';
import { useRouter } from 'expo-router';
import TablerIconComponent from '~/components/icon';

// --- Types ---
interface MediaFile {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  _id?: string;
}

interface Vibe {
  id: string;
  itemName: string;
  price: number;
  status: string;
  mediaFiles: MediaFile[];
}

interface Participant {
  id: string;
  username: string;
  name: string;
  profilePicture?: string;
  isVerified?: boolean;
}

interface LastMessage {
  content: string;
  timestamp: string;
  messageType: string;
  isFromMe: boolean;
}

interface Conversation {
  id: string;
  conversationId: string;
  vibe: Vibe;
  participant: Participant;
  lastMessage?: LastMessage;
  unreadCount: number;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GetConversationsResponse {
  conversations: Conversation[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// --- Component ---
export default function ChatListScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations(isRefresh = false) {
    if (!isRefresh) setLoading(true);
    try {
      const data: GetConversationsResponse = await getConversations();
      setConversations(data.conversations || []);
    } catch (e) {
      setConversations([]);
    }
    setLoading(false);
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gruvbox-dark-bg0">
        <ActivityIndicator color="#fabd2f" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gruvbox-dark-bg0 pt-10">
      <Text className="px-4 pb-2 pt-6 text-2xl font-bold text-gruvbox-yellow-dark">Chats</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.conversationId}
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            className="mx-4 my-2 flex-row items-center rounded-2xl border border-gruvbox-dark-bg3 bg-gruvbox-dark-bg1/90 px-3 py-3 shadow-sm"
            onPress={() => router.push(`/(tabs)/(chat)/${item.conversationId}`)}>
            <Image
              source={
                item.vibe.mediaFiles?.[0]
                  ? { uri: item.vibe.mediaFiles[0].url }
                  : require('~/assets/oldvibes-small.png')
              }
              className="mr-3 h-14 w-14 rounded-xl bg-gruvbox-dark-bg2"
            />
            <View className="flex-1">
              <Text className="font-bold text-gruvbox-yellow-dark" numberOfLines={1}>
                {item.vibe.itemName}
              </Text>
              <Text className="text-xs text-gruvbox-dark-fg3" numberOfLines={1}>
                with @{item.participant.username}
              </Text>
              <Text className="text-xs text-gruvbox-dark-fg4" numberOfLines={1}>
                ${item.vibe.price}
              </Text>
              {item.lastMessage && (
                <Text className="mt-1 text-xs text-gruvbox-dark-fg3" numberOfLines={1}>
                  <TablerIconComponent
                    name={item.lastMessage.isFromMe ? 'arrow-narrow-right' : 'arrow-narrow-left'}
                    size={12}
                    color="#a89984"
                  />{' '}
                  {item.lastMessage.content}
                </Text>
              )}
            </View>
            {item.unreadCount > 0 && (
              <View className="ml-2 rounded-full bg-gruvbox-red px-2 py-1">
                <Text className="text-xs font-bold text-gruvbox-light-bg0">{item.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="mt-12 items-center">
            <Text className="mb-4 text-center text-gruvbox-dark-fg3">No conversations yet.</Text>
            <TouchableOpacity
              className="flex-row items-center rounded-xl bg-gruvbox-yellow-dark px-4 py-2"
              onPress={() => {
                setRefreshing(true);
                fetchConversations(true);
              }}
              disabled={refreshing}
              style={{ opacity: refreshing ? 0.6 : 1 }}>
              <TablerIconComponent name="refresh" size={20} color="#282828" />
              <Text className="ml-2 font-bold text-gruvbox-dark-bg0">
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchConversations(true);
            }}
            colors={['#fabd2f']}
            tintColor="#fabd2f"
          />
        }
      />
    </View>
  );
}
