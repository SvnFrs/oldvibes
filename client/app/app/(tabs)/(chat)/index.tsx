import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { getConversations } from '~/api/chat';
import { useRouter } from 'expo-router';
import TablerIconComponent from '~/components/icon';

export default function ChatListScreen() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    setLoading(true);
    try {
      const data = await getConversations();
      setConversations(data.conversations || []);
    } catch (e) {}
    setLoading(false);
  }

  if (loading) {
    return (
      <View className="bg-gruvbox-dark-bg0 flex-1 items-center justify-center">
        <ActivityIndicator color="#fabd2f" />
      </View>
    );
  }

  return (
    <View className="bg-gruvbox-dark-bg0 flex-1 pt-10">
      <Text className="text-gruvbox-yellow-dark px-4 pb-2 pt-6 text-2xl font-bold">Chats</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.conversationId}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            className="bg-gruvbox-dark-bg1/90 border-gruvbox-dark-bg3 mx-4 my-2 flex-row items-center rounded-2xl border px-3 py-3 shadow-sm"
            onPress={() => router.push(`/(tabs)/(chat)/${item.conversationId}`)}>
            <Image
              source={
                item.vibe.mediaFiles?.[0]
                  ? { uri: item.vibe.mediaFiles[0].url }
                  : require('~/assets/oldvibes-small.png')
              }
              className="bg-gruvbox-dark-bg2 mr-3 h-14 w-14 rounded-xl"
            />
            <View className="flex-1">
              <Text className="text-gruvbox-yellow-dark font-bold" numberOfLines={1}>
                {item.vibe.itemName}
              </Text>
              <Text className="text-gruvbox-dark-fg3 text-xs" numberOfLines={1}>
                with @{item.participant.username}
              </Text>
              <Text className="text-gruvbox-dark-fg4 text-xs" numberOfLines={1}>
                ${item.vibe.price}
              </Text>
              {item.lastMessage && (
                <Text className="text-gruvbox-dark-fg3 mt-1 text-xs" numberOfLines={1}>
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
              <View className="bg-gruvbox-red ml-2 rounded-full px-2 py-1">
                <Text className="text-gruvbox-light-bg0 text-xs font-bold">{item.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text className="text-gruvbox-dark-fg3 mt-12 text-center">No conversations yet.</Text>
        }
      />
    </View>
  );
}
