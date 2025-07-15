import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { getPendingVibes, moderateVibe, deleteVibe } from '~/api/moderation';
import TablerIconComponent from '~/components/icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

function ModerationNotesModal({ visible, onClose, onSubmit, action }: any) {
  const [notes, setNotes] = useState('');
  useEffect(() => {
    if (!visible) setNotes('');
  }, [visible]);
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/60">
        <View className="w-11/12 rounded-2xl bg-gruvbox-dark-bg1 p-6">
          <Text className="mb-3 text-lg font-bold text-gruvbox-yellow-dark">
            {action === 'approve' ? 'Approve Vibe' : 'Reject Vibe'}
          </Text>
          <TextInput
            className="mb-4 rounded-lg bg-gruvbox-dark-bg2 px-4 py-2 text-gruvbox-light-bg0"
            placeholder="Add moderation notes (optional)"
            placeholderTextColor="#a89984"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <View className="flex-row justify-end gap-3">
            <TouchableOpacity onPress={onClose}>
              <Text className="font-bold text-gruvbox-dark-fg3">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`rounded-xl px-4 py-2 ${
                action === 'approve' ? 'bg-gruvbox-green-dark' : 'bg-gruvbox-red'
              }`}
              onPress={() => {
                onSubmit(notes);
                setNotes('');
              }}>
              <Text className="font-bold text-gruvbox-light-bg0">
                {action === 'approve' ? 'Approve' : 'Reject'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PendingVibeCard({ vibe, onApprove, onReject, onDelete }: any) {
  const media = vibe.mediaFiles?.[0];

  return (
    <View
      className="mb-6 overflow-hidden rounded-2xl border border-gruvbox-dark-bg3 bg-gruvbox-dark-bg1/95 shadow-lg"
      style={{ width: CARD_WIDTH }}>
      <View className="flex-row">
        <Image
          source={media ? { uri: media.url } : require('~/assets/oldvibes-small.png')}
          className="h-40 w-32 bg-gruvbox-dark-bg2"
          resizeMode="cover"
        />
        <View className="flex-1 p-3">
          <View className="mb-1 flex-row items-center">
            <Image
              source={
                vibe.user.profilePicture
                  ? { uri: vibe.user.profilePicture }
                  : require('~/assets/oldvibes-small.png')
              }
              className="h-8 w-8 rounded-full border-2 border-gruvbox-yellow-dark"
            />
            <Text className="ml-2 font-bold text-gruvbox-yellow-dark">{vibe.user.username}</Text>
            <Text className="ml-2 text-xs text-gruvbox-dark-fg4">{vibe.location}</Text>
          </View>
          <Text className="text-lg font-bold text-gruvbox-yellow-dark">{vibe.itemName}</Text>
          <Text className="mb-1 text-gruvbox-dark-fg1">{vibe.description}</Text>
          <Text className="font-bold text-gruvbox-green-dark">${vibe.price}</Text>
          <View className="mt-1 flex-row flex-wrap">
            {vibe.tags.map((tag: string) => (
              <Text
                key={tag}
                className="mb-1 mr-2 rounded-full bg-gruvbox-dark-bg3 px-2 py-0.5 text-xs text-gruvbox-yellow-dark">
                #{tag}
              </Text>
            ))}
          </View>
        </View>
      </View>
      <View className="flex-row justify-end gap-2 px-3 pb-3">
        <TouchableOpacity
          className="rounded-xl bg-gruvbox-green-dark px-4 py-2"
          onPress={onApprove}>
          <Text className="font-bold text-gruvbox-dark-bg0">Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity className="rounded-xl bg-gruvbox-red px-4 py-2" onPress={onReject}>
          <Text className="font-bold text-gruvbox-light-bg0">Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity className="rounded-xl bg-gruvbox-dark-bg3 px-4 py-2" onPress={onDelete}>
          <Text className="font-bold text-gruvbox-yellow-dark">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ApprovalScreen() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState({ visible: false, action: '', vibeId: null });

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPendingVibes();
      setPending(res.vibes || []);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to fetch pending vibes');
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  async function handleModerate(vibeId: string, action: 'approve' | 'reject', notes: string) {
    try {
      await moderateVibe(vibeId, action, notes);
      setPending((prev) => prev.filter((v) => v.id !== vibeId));
      Alert.alert('Success', `Vibe ${action}d!`);
    } catch (e) {
      Alert.alert('Error', e.message || `Failed to ${action} vibe`);
    }
  }

  async function handleDelete(vibeId: string) {
    Alert.alert(
      'Delete Vibe',
      'Are you sure you want to delete this vibe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVibe(vibeId);
              setPending((prev) => prev.filter((v) => v.id !== vibeId));
              Alert.alert('Deleted', 'Vibe deleted.');
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to delete vibe');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }

  return (
    <View className="flex-1 bg-gruvbox-dark-bg0 pt-10">
      <Text className="px-4 pb-2 pt-6 text-2xl font-bold text-gruvbox-yellow-dark">
        Pending Vibes
      </Text>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#fabd2f" />
        </View>
      ) : (
        <FlatList
          data={pending}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ alignItems: 'center', paddingBottom: 40, flexGrow: 1 }}
          renderItem={({ item }) => (
            <PendingVibeCard
              vibe={item}
              onApprove={() => setModal({ visible: true, action: 'approve', vibeId: item.id })}
              onReject={() => setModal({ visible: true, action: 'reject', vibeId: item.id })}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Text className="text-gruvbox-dark-fg3">No pending vibes.</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchPending();
              }}
              colors={['#fabd2f']}
              tintColor="#fabd2f"
            />
          }
        />
      )}

      {/* Moderation Notes Modal */}
      <ModerationNotesModal
        visible={modal.visible}
        action={modal.action}
        onClose={() => setModal({ visible: false, action: '', vibeId: null })}
        onSubmit={async (notes: string) => {
          await handleModerate(modal.vibeId, modal.action, notes);
          setModal({ visible: false, action: '', vibeId: null });
        }}
      />
    </View>
  );
}
