import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import TablerIconComponent from '../icon';
import {
  getComments,
  getReplies,
  createComment,
  likeComment,
  unlikeComment,
  deleteComment,
} from '~/api/comments';
import { useRole } from '~/contexts/RoleContext';

function CommentItem({
  comment,
  onReply,
  onLike,
  onUnlike,
  onDelete,
  isLiked,
  showReplies,
  onShowReplies,
  replies,
  loadingReplies,
  onReplySubmit,
  replyingTo,
  setReplyingTo,
  isOwnerOrStaff,
}: any) {
  return (
    <View className="mb-3">
      <View className="flex-row items-start">
        <Image
          source={
            comment.user.profilePicture
              ? { uri: comment.user.profilePicture }
              : require('~/assets/oldvibes-small.png')
          }
          className="border-gruvbox-yellow-dark h-8 w-8 rounded-full border-2"
        />
        <View className="ml-2 flex-1">
          <View className="flex-row items-center">
            <Text className="text-gruvbox-yellow-dark font-bold">{comment.user.username}</Text>
            {comment.user.isVerified && (
              <TablerIconComponent
                name="check"
                size={14}
                color="#b8bb26"
                style={{ marginLeft: 2 }}
              />
            )}
            <Text className="text-gruvbox-dark-fg4 ml-2 text-xs">
              {new Date(comment.createdAt).toLocaleString()}
            </Text>
            {isOwnerOrStaff && (
              <TouchableOpacity className="ml-2" onPress={() => onDelete(comment.id)}>
                <TablerIconComponent name="trash" size={16} color="#fb4934" />
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-gruvbox-light-bg0">{comment.content}</Text>
          <View className="mt-1 flex-row items-center">
            <TouchableOpacity
              className="mr-4 flex-row items-center"
              onPress={() => (isLiked ? onUnlike(comment.id) : onLike(comment.id))}>
              <TablerIconComponent name="heart" size={18} color={isLiked ? '#fb4934' : '#a89984'} />
              <Text className="text-gruvbox-light-bg0 ml-1 text-xs">{comment.likesCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="mr-4" onPress={() => setReplyingTo(comment)}>
              <Text className="text-gruvbox-yellow-dark text-xs font-bold">Reply</Text>
            </TouchableOpacity>
            {comment.repliesCount > 0 && (
              <TouchableOpacity className="mr-4" onPress={() => onShowReplies(comment.id)}>
                <Text className="text-gruvbox-blue-dark text-xs">
                  {showReplies
                    ? 'Hide'
                    : `View ${comment.repliesCount} repl${comment.repliesCount === 1 ? 'y' : 'ies'}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      {/* Replies */}
      {showReplies && (
        <View className="ml-10 mt-2">
          {loadingReplies ? (
            <ActivityIndicator size="small" color="#fabd2f" />
          ) : (
            replies.map((reply: any) => (
              <View key={reply.id} className="mb-2 flex-row items-start">
                <Image
                  source={
                    reply.user.profilePicture
                      ? { uri: reply.user.profilePicture }
                      : require('~/assets/oldvibes-small.png')
                  }
                  className="border-gruvbox-yellow-dark h-7 w-7 rounded-full border"
                />
                <View className="ml-2 flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-gruvbox-yellow-dark font-bold">
                      {reply.user.username}
                    </Text>
                    {reply.user.isVerified && (
                      <TablerIconComponent
                        name="check"
                        size={12}
                        color="#b8bb26"
                        style={{ marginLeft: 2 }}
                      />
                    )}
                    <Text className="text-gruvbox-dark-fg4 ml-2 text-xs">
                      {new Date(reply.createdAt).toLocaleString()}
                    </Text>
                    {isOwnerOrStaff && (
                      <TouchableOpacity className="ml-2" onPress={() => onDelete(reply.id)}>
                        <TablerIconComponent name="trash" size={14} color="#fb4934" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text className="text-gruvbox-light-bg0">{reply.content}</Text>
                  <View className="mt-1 flex-row items-center">
                    <TouchableOpacity
                      className="mr-4 flex-row items-center"
                      onPress={() => (reply.isLiked ? onUnlike(reply.id) : onLike(reply.id))}>
                      <TablerIconComponent
                        name="heart"
                        size={16}
                        color={reply.isLiked ? '#fb4934' : '#a89984'}
                      />
                      <Text className="text-gruvbox-light-bg0 ml-1 text-xs">
                        {reply.likesCount}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="mr-4" onPress={() => setReplyingTo(reply)}>
                      <Text className="text-gruvbox-yellow-dark text-xs font-bold">Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
          {/* Reply input */}
          {replyingTo && replyingTo.id === comment.id && (
            <View className="mt-2 flex-row items-center">
              <TextInput
                className="bg-gruvbox-dark-bg2 text-gruvbox-light-bg0 mr-2 flex-1 rounded-xl px-3 py-2"
                placeholder="Write a reply..."
                placeholderTextColor="#a89984"
                value={replyingTo.replyContent}
                onChangeText={(text) =>
                  setReplyingTo((prev: any) => ({ ...prev, replyContent: text }))
                }
              />
              <TouchableOpacity
                className="bg-gruvbox-yellow-dark rounded-xl px-3 py-2"
                onPress={() => onReplySubmit(comment.id, replyingTo.replyContent)}>
                <Text className="text-gruvbox-dark-bg0 font-bold">Send</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default function CommentModal({
  visible,
  onClose,
  vibeId,
  currentUserId,
  isStaff,
  currentUser,
}: {
  visible: boolean;
  onClose: () => void;
  vibeId: string;
  currentUserId: string;
  isStaff: boolean;
  currentUser: {
    id: string;
    username: string;
    name: string;
    profilePicture: string | null;
    isVerified: boolean;
  };
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({ offset: 0, limit: 20, hasMore: false });
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const [replies, setReplies] = useState<Record<string, any[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<any>(null);

  // Fetch comments
  const fetchComments = async (reset = false) => {
    if (reset) setLoading(true);
    try {
      const res = await getComments(vibeId, { limit: 20, offset: reset ? 0 : pagination.offset });
      setComments(reset ? res.comments : [...comments, ...res.comments]);
      setPagination({
        offset: (reset ? 0 : pagination.offset) + res.comments.length,
        limit: res.pagination.limit,
        hasMore: res.pagination.hasMore,
      });
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (visible) fetchComments(true);
    // eslint-disable-next-line
  }, [visible, vibeId]);

  // Like/unlike
  const handleLike = async (id: string) => {
    try {
      await likeComment(id);
      setLikedComments((prev) => ({ ...prev, [id]: true }));
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, likesCount: c.likesCount + 1 } : c))
      );
    } catch {}
  };
  const handleUnlike = async (id: string) => {
    try {
      await unlikeComment(id);
      setLikedComments((prev) => ({ ...prev, [id]: false }));
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, likesCount: Math.max(0, c.likesCount - 1) } : c))
      );
    } catch {}
  };

  // Show/hide replies
  const handleShowReplies = async (commentId: string) => {
    setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    if (!showReplies[commentId]) {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
      try {
        const res = await getReplies(commentId);
        setReplies((prev) => ({ ...prev, [commentId]: res.replies }));
      } catch {}
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    try {
      const res = await createComment(vibeId, commentInput.trim());
      // Patch user info if missing
      const comment = {
        ...res.comment,
        user: res.comment.user || currentUser,
        repliesCount: 0,
        likesCount: 0,
        isActive: true,
        createdAt: res.comment.createdAt || new Date().toISOString(),
      };
      setComments((prev) => [comment, ...prev]);
      setCommentInput('');
    } catch {}
  };

  // Add reply
  const handleReplySubmit = async (parentCommentId: string, content: string) => {
    if (!content.trim()) return;
    try {
      const res = await createComment(vibeId, content.trim(), parentCommentId);
      // Patch user info if missing
      const reply = {
        ...res.comment,
        user: res.comment.user || currentUser,
        repliesCount: 0,
        likesCount: 0,
        isActive: true,
        createdAt: res.comment.createdAt || new Date().toISOString(),
      };
      setReplies((prev) => ({
        ...prev,
        [parentCommentId]: [reply, ...(prev[parentCommentId] || [])],
      }));
      setReplyingTo(null);
    } catch {}
  };

  // Delete comment/reply
  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      setReplies((prev) => {
        const newReplies = { ...prev };
        Object.keys(newReplies).forEach((key) => {
          newReplies[key] = newReplies[key].filter((r: any) => r.id !== id);
        });
        return newReplies;
      });
    } catch {}
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-gruvbox-dark-bg1 max-h-[80%] rounded-t-3xl p-4">
            {/* Header */}
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-gruvbox-yellow-dark text-lg font-bold">Comments</Text>
              <TouchableOpacity onPress={onClose}>
                <TablerIconComponent name="x" size={28} color="#a89984" />
              </TouchableOpacity>
            </View>
            {/* Input */}
            <View className="mb-3 flex-row items-center">
              <TextInput
                className="bg-gruvbox-dark-bg2 text-gruvbox-light-bg0 mr-2 flex-1 rounded-xl px-3 py-2"
                placeholder="Add a comment..."
                placeholderTextColor="#a89984"
                value={commentInput}
                onChangeText={setCommentInput}
                onSubmitEditing={handleAddComment}
                returnKeyType="send"
              />
              <TouchableOpacity
                className="bg-gruvbox-yellow-dark rounded-xl px-3 py-2"
                onPress={handleAddComment}>
                <Text className="text-gruvbox-dark-bg0 font-bold">Send</Text>
              </TouchableOpacity>
            </View>
            {/* Comments List */}
            {loading ? (
              <ActivityIndicator size="large" color="#fabd2f" />
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <CommentItem
                    comment={item}
                    onReply={handleReplySubmit}
                    onLike={handleLike}
                    onUnlike={handleUnlike}
                    onDelete={handleDelete}
                    isLiked={!!likedComments[item.id]}
                    showReplies={!!showReplies[item.id]}
                    onShowReplies={handleShowReplies}
                    replies={replies[item.id] || []}
                    loadingReplies={!!loadingReplies[item.id]}
                    onReplySubmit={handleReplySubmit}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    isOwnerOrStaff={isStaff || item.user.id === currentUserId}
                  />
                )}
                ListEmptyComponent={
                  <Text className="text-gruvbox-dark-fg4 mt-8 text-center">No comments yet.</Text>
                }
                onEndReached={() => {
                  if (pagination.hasMore && !loadingMore) {
                    setLoadingMore(true);
                    fetchComments(false).finally(() => setLoadingMore(false));
                  }
                }}
                onEndReachedThreshold={0.2}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 400 }}
              />
            )}
            {loadingMore && <ActivityIndicator size="small" color="#fabd2f" />}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
