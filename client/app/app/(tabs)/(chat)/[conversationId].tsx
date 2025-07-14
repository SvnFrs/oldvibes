import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { getMessages, markMessageAsRead, sendMessage } from '~/api/chat';
import { getSocket } from '~/utils/socket';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TablerIconComponent from '~/components/icon';
import { StorageService } from '~/utils/storage';

export default function ChatRoomScreen() {
  const { conversationId } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [participant, setParticipant] = useState(null);
  const [vibe, setVibe] = useState(null);
  const [myUserId, setMyUserId] = useState('');
  const flatListRef = useRef(null);
  const socketRef = useRef(null);

  const socketSendMessage = (content) => {
    if (!socketRef.current) return;
    socketRef.current.emit('sendMessage', {
      conversationId,
      content,
      messageType: 'text',
    });
  };

  const markUnreadAsRead = useCallback(
    (msgs) => {
      msgs.forEach((msg) => {
        if (!msg.isRead && msg.sender?.id !== myUserId) {
          markMessageAsRead(msg.id).catch(() => {});
        }
      });
    },
    [myUserId]
  );

  // Get my user id for badge
  useEffect(() => {
    StorageService.getUserData().then((user) => setMyUserId(user?.user_id));
  }, []);

  // Fetch messages and conversation info
  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  // Setup socket and real-time listener
  useEffect(() => {
    let isMounted = true;
    let handler;

    (async () => {
      const socket = await getSocket();
      socketRef.current = socket;
      socket.emit('joinConversation', conversationId);

      handler = (msg) => {
        if (msg.conversationId === conversationId && isMounted) {
          setMessages((prev) => [...prev, msg]);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          // Mark as read if not from me
          if (msg.sender?.id !== myUserId) {
            markMessageAsRead(msg.id).catch(() => {});
          }
        }
      };

      socket.on('newMessage', handler);
    })();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.emit('leaveConversation', conversationId);
        if (handler) socketRef.current.off('newMessage', handler);
      }
    };
  }, [conversationId, myUserId, markUnreadAsRead]);

  async function fetchMessages() {
    try {
      const data = await getMessages(conversationId);
      setMessages(data.messages || []);
      setParticipant(data.participant || null);
      setVibe(data.vibe || null);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
      markUnreadAsRead(data.messages || []);
    } catch (e) {}
  }

  async function handleSend() {
    if (!input.trim()) return;

    // Send via socket only, do not update messages state here
    socketSendMessage(input.trim());

    setInput('');
  }

  function renderMessage({ item, index }) {
    const isMe = item.isFromMe || item.sender?.id === myUserId;
    const showUsername =
      index === 0 ||
      messages[index - 1]?.sender?.id !== item.sender?.id ||
      messages[index - 1]?.isFromMe !== item.isFromMe;

    // Badge color
    const badgeColor = isMe ? 'bg-gruvbox-yellow-dark' : 'bg-gruvbox-blue-dark';
    const badgeTextColor = isMe ? 'text-gruvbox-dark-bg0' : 'text-gruvbox-light-bg0';

    // Username
    const username = isMe
      ? 'You'
      : item.sender?.username || item.user?.username || participant?.username || 'User';

    return (
      <View className={`mb-2 px-3 ${isMe ? 'items-end' : 'items-start'}`}>
        {showUsername && (
          <View className="mb-1 flex-row items-center">
            {!isMe && (
              <Image
                source={
                  item.sender?.profilePicture || item.user?.profilePicture
                    ? { uri: item.sender?.profilePicture || item.user?.profilePicture }
                    : require('~/assets/oldvibes-small.png')
                }
                className="border-gruvbox-yellow-dark mr-2 h-7 w-7 rounded-full border-2"
              />
            )}
            <View className={`rounded-full px-3 py-1 ${badgeColor}`}>
              <Text className={`text-xs font-bold ${badgeTextColor}`}>{username}</Text>
            </View>
          </View>
        )}
        <View
          className={`max-w-[75%] px-4 py-2 shadow-sm ${
            isMe
              ? 'bg-gruvbox-yellow-dark self-end rounded-2xl rounded-br-sm'
              : 'bg-gruvbox-dark-bg2 self-start rounded-2xl rounded-bl-sm'
          }`}>
          <Text
            className={`${isMe ? 'text-gruvbox-dark-bg0 font-bold' : 'text-gruvbox-light-bg0'}`}
            style={{ fontSize: 15 }}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  }

  // --- HEADER ---
  function ChatHeader() {
    return (
      <View className="bg-gruvbox-dark-bg1 border-gruvbox-dark-bg3 flex-row items-center border-b px-3 py-3 pt-12">
        <TouchableOpacity
          className="bg-gruvbox-dark-bg2 mr-3 rounded-full p-1"
          onPress={() => router.back()}>
          <TablerIconComponent name="arrow-left" size={22} color="#fabd2f" />
        </TouchableOpacity>
        {participant && (
          <Image
            source={
              participant.profilePicture
                ? { uri: participant.profilePicture }
                : require('~/assets/oldvibes-small.png')
            }
            className="border-gruvbox-yellow-dark h-10 w-10 rounded-full border-2"
          />
        )}
        <View className="ml-3 flex-1">
          <Text className="text-gruvbox-yellow-dark text-base font-bold" numberOfLines={1}>
            {participant?.username || 'User'}
          </Text>
          {vibe && (
            <Text className="text-gruvbox-dark-fg3 text-xs" numberOfLines={1}>
              {vibe.itemName}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="bg-gruvbox-dark-bg0 flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      <ChatHeader />
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{
          paddingVertical: 16,
          paddingBottom: 16,
        }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View
        className="bg-gruvbox-dark-bg1 border-gruvbox-dark-bg3 flex-row items-center border-t px-4 py-3"
        style={{
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        }}>
        <TextInput
          className="bg-gruvbox-dark-bg2 text-gruvbox-light-bg0 mr-2 flex-1 rounded-xl px-4 py-2"
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#a89984"
          multiline
        />
        <TouchableOpacity
          className="bg-gruvbox-yellow-dark rounded-xl px-4 py-2"
          onPress={handleSend}
          disabled={!input.trim()}>
          <TablerIconComponent name="send" size={20} color="#282828" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
