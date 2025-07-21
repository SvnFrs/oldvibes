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
  Alert,
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

function ReplyThread({
  replies,
  parentId,
  onLike,
  onUnlike,
  onDelete,
  likedComments,
  onReplyPress,
  replyingTo,
  onReplySubmit,
  loadingReplies,
  fetchReplies,
  currentUserId,
  isStaff,
  currentUser,
  isEmailVerified,
  depth = 1,
}: any) {
  // Only allow nesting up to 3 levels for sanity
  if (!replies || !replies.length || depth > 3) return null;

  return (
    <View className="ml-6 mt-2">
      {replies.map((reply: any) => (
        <View key={reply.id} className="mb-2">
          <View className="flex-row items-start">
            <Image
              source={
                reply.user.profilePicture
                  ? { uri: reply.user.profilePicture }
                  : require('~/assets/oldvibes-small.png')
              }
              className="h-7 w-7 rounded-full border border-gruvbox-yellow-dark"
            />
            <View className="ml-2 flex-1">
              <View className="flex-row items-center">
                <Text className="font-bold text-gruvbox-yellow-dark">{reply.user.username}</Text>
                {reply.user.isVerified && (
                  <TablerIconComponent
                    name="check"
                    size={12}
                    color="#b8bb26"
                    style={{ marginLeft: 2 }}
                  />
                )}
                <Text className="ml-2 text-xs text-gruvbox-dark-fg4">
                  {new Date(reply.createdAt).toLocaleString()}
                </Text>
                {(isStaff || reply.user.id === currentUserId) && (
                  <TouchableOpacity className="ml-2" onPress={() => onDelete(reply.id)}>
                    <TablerIconComponent name="trash" size={14} color="#fb4934" />
                  </TouchableOpacity>
                )}
              </View>
              <Text className="text-gruvbox-light-bg0">{reply.content}</Text>
              <View className="mt-1 flex-row items-center">
                <TouchableOpacity
                  className="mr-4 flex-row items-center"
                  onPress={() => (likedComments[reply.id] ? onUnlike(reply.id) : onLike(reply.id))}>
                  <TablerIconComponent
                    name="heart"
                    size={16}
                    color={likedComments[reply.id] ? '#fb4934' : '#a89984'}
                  />
                  <Text className="ml-1 text-xs text-gruvbox-light-bg0">{reply.likesCount}</Text>
                </TouchableOpacity>
                <TouchableOpacity className="mr-4" onPress={() => onReplyPress(reply)}>
                  <Text className="text-xs font-bold text-gruvbox-yellow-dark">Reply</Text>
                </TouchableOpacity>
                {reply.repliesCount > 0 && (
                  <TouchableOpacity className="mr-4" onPress={() => fetchReplies(reply.id)}>
                    <Text className="text-xs text-gruvbox-blue-dark">
                      {reply.showReplies
                        ? 'Hide'
                        : `View ${reply.repliesCount} repl${reply.repliesCount === 1 ? 'y' : 'ies'}`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {/* Nested replies */}
              {reply.showReplies && (
                <ReplyThread
                  replies={reply.replies}
                  parentId={reply.id}
                  onLike={onLike}
                  onUnlike={onUnlike}
                  onDelete={onDelete}
                  likedComments={likedComments}
                  onReplyPress={onReplyPress}
                  replyingTo={replyingTo}
                  onReplySubmit={onReplySubmit}
                  loadingReplies={loadingReplies}
                  fetchReplies={fetchReplies}
                  currentUserId={currentUserId}
                  isStaff={isStaff}
                  currentUser={currentUser}
                  isEmailVerified={isEmailVerified}
                  depth={depth + 1}
                />
              )}
              {/* Reply input for this reply */}
              {replyingTo && replyingTo.id === reply.id && (
                <View className="mt-2 flex-row items-center">
                  <TextInput
                    className="mr-2 flex-1 rounded-xl bg-gruvbox-dark-bg2 px-3 py-2 text-gruvbox-light-bg0"
                    placeholder="Write a reply..."
                    placeholderTextColor="#a89984"
                    value={replyingTo.replyContent}
                    onChangeText={(text) => onReplyPress({ ...reply, replyContent: text })}
                  />
                  <TouchableOpacity
                    className="rounded-xl bg-gruvbox-yellow-dark px-3 py-2"
                    onPress={() => onReplySubmit(reply.id, replyingTo.replyContent)}>
                    <Text className="font-bold text-gruvbox-dark-bg0">Send</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      ))}
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
  isEmailVerified,
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
  isEmailVerified?: boolean;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [pagination, setPagination] = useState({ offset: 0, limit: 20, hasMore: false });
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});

  // Fetch top-level comments
  const fetchComments = async (reset = false) => {
    if (reset) setLoading(true);
    try {
      const res = await getComments(vibeId, { limit: 20, offset: reset ? 0 : pagination.offset });
      // Add showReplies and replies array to each comment
      const newComments = (res.comments || []).map((c: any) => ({
        ...c,
        showReplies: false,
        replies: [],
      }));
      setComments(reset ? newComments : [...comments, ...newComments]);
      setPagination({
        offset: (reset ? 0 : pagination.offset) + newComments.length,
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
        prev.map((c) =>
          c.id === id
            ? { ...c, likesCount: c.likesCount + 1 }
            : {
                ...c,
                replies: c.replies?.map((r: any) =>
                  r.id === id ? { ...r, likesCount: r.likesCount + 1 } : r
                ),
              }
        )
      );
    } catch {}
  };
  const handleUnlike = async (id: string) => {
    try {
      await unlikeComment(id);
      setLikedComments((prev) => ({ ...prev, [id]: false }));
      setComments((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, likesCount: Math.max(0, c.likesCount - 1) }
            : {
                ...c,
                replies: c.replies?.map((r: any) =>
                  r.id === id ? { ...r, likesCount: Math.max(0, r.likesCount - 1) } : r
                ),
              }
        )
      );
    } catch {}
  };

  // Show/hide replies for a comment or reply
  const fetchReplies = async (commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, showReplies: !c.showReplies }
          : {
              ...c,
              replies: c.replies?.map((r: any) =>
                r.id === commentId ? { ...r, showReplies: !r.showReplies } : r
              ),
            }
      )
    );
    // If already shown, just hide
    const comment = comments.find((c) => c.id === commentId);
    if (comment?.showReplies) return;

    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
    try {
      const res = await getReplies(commentId);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                replies: (res.replies || []).map((r: any) => ({
                  ...r,
                  showReplies: false,
                  replies: [],
                })),
              }
            : {
                ...c,
                replies: c.replies?.map((r: any) =>
                  r.id === commentId
                    ? {
                        ...r,
                        replies: (res.replies || []).map((rr: any) => ({
                          ...rr,
                          showReplies: false,
                          replies: [],
                        })),
                        showReplies: true,
                      }
                    : r
                ),
              }
        )
      );
    } catch {}
    setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
  };

  // Add comment
  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    try {
      const res = await createComment(vibeId, commentInput.trim());
      const comment = {
        ...res.comment,
        user: res.comment.user || currentUser,
        repliesCount: 0,
        likesCount: 0,
        isActive: true,
        createdAt: res.comment.createdAt || new Date().toISOString(),
        showReplies: false,
        replies: [],
      };
      setComments((prev) => [comment, ...prev]);
      setCommentInput('');
    } catch {}
  };

  // Add reply (to comment or reply)
  const handleReplySubmit = async (parentCommentId: string, content: string) => {
    if (!content.trim()) return;
    try {
      const res = await createComment(vibeId, content.trim(), parentCommentId);
      const reply = {
        ...res.comment,
        user: res.comment.user || currentUser,
        repliesCount: 0,
        likesCount: 0,
        isActive: true,
        createdAt: res.comment.createdAt || new Date().toISOString(),
        showReplies: false,
        replies: [],
      };
      // Insert reply into the correct place in the tree
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentCommentId) {
            // Reply to top-level comment
            return {
              ...c,
              replies: [reply, ...(c.replies || [])],
              repliesCount: (c.repliesCount || 0) + 1,
              showReplies: true,
            };
          }
          // Check if reply to a reply
          return {
            ...c,
            replies: c.replies?.map((r: any) =>
              r.id === parentCommentId
                ? {
                    ...r,
                    replies: [reply, ...(r.replies || [])],
                    repliesCount: (r.repliesCount || 0) + 1,
                    showReplies: true,
                  }
                : r
            ),
          };
        })
      );
      setReplyingTo(null);
    } catch {}
  };

  // Delete comment/reply
  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id);
      // Remove from comments and all replies
      setComments((prev) =>
        prev
          .filter((c) => c.id !== id)
          .map((c) => ({
            ...c,
            replies: c.replies?.filter((r: any) => r.id !== id),
          }))
      );
    } catch {}
  };

  // Handle reply button press
  const handleReplyPress = (commentOrReply: any) => {
    setReplyingTo({
      id: commentOrReply.id,
      replyContent: '',
    });
  };

  // Handle reply input change
  const handleReplyInputChange = (text: string) => {
    setReplyingTo((prev: any) => ({ ...prev, replyContent: text }));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-[80%] rounded-t-3xl bg-gruvbox-dark-bg1 p-4">
            {/* Header */}
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gruvbox-yellow-dark">Comments</Text>
              <TouchableOpacity onPress={onClose}>
                <TablerIconComponent name="x" size={28} color="#a89984" />
              </TouchableOpacity>
            </View>

            {/* Input */}
            <View className="mb-3 flex-row items-center">
              <TextInput
                className="mr-2 flex-1 rounded-xl bg-gruvbox-dark-bg2 px-3 py-2 text-gruvbox-light-bg0"
                placeholder={isEmailVerified ? 'Add a comment...' : 'Verify your email to comment'}
                placeholderTextColor="#a89984"
                value={commentInput}
                onChangeText={setCommentInput}
                onSubmitEditing={() => {
                  if (!isEmailVerified) {
                    Alert.alert(
                      'Email verification required',
                      'Please verify your email address to comment.'
                    );
                    return;
                  }
                  handleAddComment();
                }}
                editable={!!isEmailVerified}
                returnKeyType="send"
              />
              <TouchableOpacity
                className="rounded-xl bg-gruvbox-yellow-dark px-3 py-2"
                onPress={() => {
                  if (!isEmailVerified) {
                    Alert.alert(
                      'Email verification required',
                      'Please verify your email address to comment.'
                    );
                    return;
                  }
                  handleAddComment();
                }}
                disabled={!isEmailVerified}
                style={{ opacity: isEmailVerified ? 1 : 0.5 }}>
                <Text className="font-bold text-gruvbox-dark-bg0">Send</Text>
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
                  <View className="mb-3">
                    <View className="flex-row items-start">
                      <Image
                        source={
                          item.user.profilePicture
                            ? { uri: item.user.profilePicture }
                            : require('~/assets/oldvibes-small.png')
                        }
                        className="h-8 w-8 rounded-full border-2 border-gruvbox-yellow-dark"
                      />
                      <View className="ml-2 flex-1">
                        <View className="flex-row items-center">
                          <Text className="font-bold text-gruvbox-yellow-dark">
                            {item.user.username}
                          </Text>
                          {item.user.isVerified && (
                            <TablerIconComponent
                              name="check"
                              size={14}
                              color="#b8bb26"
                              style={{ marginLeft: 2 }}
                            />
                          )}
                          <Text className="ml-2 text-xs text-gruvbox-dark-fg4">
                            {new Date(item.createdAt).toLocaleString()}
                          </Text>
                          {(isStaff || item.user.id === currentUserId) && (
                            <TouchableOpacity
                              className="ml-2"
                              onPress={() => handleDelete(item.id)}>
                              <TablerIconComponent name="trash" size={16} color="#fb4934" />
                            </TouchableOpacity>
                          )}
                        </View>
                        <Text className="text-gruvbox-light-bg0">{item.content}</Text>
                        <View className="mt-1 flex-row items-center">
                          <TouchableOpacity
                            className="mr-4 flex-row items-center"
                            onPress={() =>
                              likedComments[item.id] ? handleUnlike(item.id) : handleLike(item.id)
                            }>
                            <TablerIconComponent
                              name="heart"
                              size={18}
                              color={likedComments[item.id] ? '#fb4934' : '#a89984'}
                            />
                            <Text className="ml-1 text-xs text-gruvbox-light-bg0">
                              {item.likesCount}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity className="mr-4" onPress={() => handleReplyPress(item)}>
                            <Text className="text-xs font-bold text-gruvbox-yellow-dark">
                              Reply
                            </Text>
                          </TouchableOpacity>
                          {item.repliesCount > 0 && (
                            <TouchableOpacity
                              className="mr-4"
                              onPress={() => fetchReplies(item.id)}>
                              <Text className="text-xs text-gruvbox-blue-dark">
                                {item.showReplies
                                  ? 'Hide'
                                  : `View ${item.repliesCount} repl${item.repliesCount === 1 ? 'y' : 'ies'}`}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        {/* Reply input for this comment */}
                        {replyingTo && replyingTo.id === item.id && (
                          <View className="mt-2 flex-row items-center">
                            <TextInput
                              className="mr-2 flex-1 rounded-xl bg-gruvbox-dark-bg2 px-3 py-2 text-gruvbox-light-bg0"
                              placeholder="Write a reply..."
                              placeholderTextColor="#a89984"
                              value={replyingTo.replyContent}
                              onChangeText={handleReplyInputChange}
                            />
                            <TouchableOpacity
                              className="rounded-xl bg-gruvbox-yellow-dark px-3 py-2"
                              onPress={() => handleReplySubmit(item.id, replyingTo.replyContent)}>
                              <Text className="font-bold text-gruvbox-dark-bg0">Send</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        {/* Replies */}
                        {item.showReplies &&
                          (loadingReplies[item.id] ? (
                            <ActivityIndicator size="small" color="#fabd2f" />
                          ) : (
                            <ReplyThread
                              replies={item.replies}
                              parentId={item.id}
                              onLike={handleLike}
                              onUnlike={handleUnlike}
                              onDelete={handleDelete}
                              likedComments={likedComments}
                              onReplyPress={handleReplyPress}
                              replyingTo={replyingTo}
                              onReplySubmit={handleReplySubmit}
                              loadingReplies={loadingReplies}
                              fetchReplies={fetchReplies}
                              currentUserId={currentUserId}
                              isStaff={isStaff}
                              currentUser={currentUser}
                              isEmailVerified={isEmailVerified}
                            />
                          ))}
                      </View>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <Text className="mt-8 text-center text-gruvbox-dark-fg4">No comments yet.</Text>
                }
                onEndReached={() => {
                  if (pagination.hasMore && !loading) {
                    fetchComments(false);
                  }
                }}
                onEndReachedThreshold={0.2}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 400 }}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
