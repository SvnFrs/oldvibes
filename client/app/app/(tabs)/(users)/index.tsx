import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { getAllUsers, banUser, unbanUser } from '~/api/admin';
import TablerIconComponent from '~/components/icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

function UserCard({ user, onBan, onUnban, loading }: any) {
  return (
    <View
      className="mb-4 flex-row items-center rounded-2xl border border-gruvbox-dark-bg3 bg-gruvbox-dark-bg1/95 px-4 py-3 shadow-lg"
      style={{ width: CARD_WIDTH }}>
      <View className="flex-1">
        <View className="mb-1 flex-row items-center">
          <Text className="text-lg font-bold text-gruvbox-yellow-dark">{user.username}</Text>
          {user.role === 'admin' && (
            <TablerIconComponent name="crown" size={18} color="#fabd2f" style={{ marginLeft: 6 }} />
          )}
          {user.role === 'staff' && (
            <TablerIconComponent
              name="shield"
              size={18}
              color="#b8bb26"
              style={{ marginLeft: 6 }}
            />
          )}
          <Text className="ml-2 text-xs text-gruvbox-dark-fg4">{user.email}</Text>
        </View>
        <Text className="mb-1 text-xs text-gruvbox-dark-fg3">
          Name: <Text className="font-bold">{user.name}</Text>
        </Text>
        <Text className="mb-1 text-xs text-gruvbox-dark-fg3">
          Role: <Text className="font-bold">{user.role}</Text>
        </Text>
        <Text className="mb-1 text-xs text-gruvbox-dark-fg3">
          Status:{' '}
          <Text
            className={`font-bold ${user.isActive ? 'text-gruvbox-green-dark' : 'text-gruvbox-red'}`}>
            {user.isActive ? 'Active' : 'Banned'}
          </Text>
        </Text>
        <Text className="text-xs text-gruvbox-dark-fg4">
          Joined: {new Date(user.createdAt).toLocaleDateString()}
        </Text>
      </View>
      {user.role !== 'admin' && (
        <View className="ml-4">
          {user.isActive ? (
            <TouchableOpacity
              className="rounded-xl bg-gruvbox-red px-4 py-2"
              onPress={onBan}
              disabled={loading}>
              <Text className="font-bold text-gruvbox-light-bg0">{loading ? '...' : 'Ban'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="rounded-xl bg-gruvbox-green-dark px-4 py-2"
              onPress={onUnban}
              disabled={loading}>
              <Text className="font-bold text-gruvbox-dark-bg0">{loading ? '...' : 'Unban'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export default function UsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [banLoading, setBanLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(res.users || []);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to fetch users');
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleBan(userId: string) {
    Alert.alert(
      'Ban User',
      'Are you sure you want to ban this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ban',
          style: 'destructive',
          onPress: async () => {
            setBanLoading(userId);
            try {
              await banUser(userId);
              setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, isActive: false } : u))
              );
              Alert.alert('Banned', 'User has been banned.');
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to ban user');
            }
            setBanLoading(null);
          },
        },
      ],
      { cancelable: true }
    );
  }

  async function handleUnban(userId: string) {
    Alert.alert(
      'Unban User',
      'Are you sure you want to unban this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unban',
          style: 'default',
          onPress: async () => {
            setBanLoading(userId);
            try {
              await unbanUser(userId);
              setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: true } : u)));
              Alert.alert('Unbanned', 'User has been unbanned.');
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to unban user');
            }
            setBanLoading(null);
          },
        },
      ],
      { cancelable: true }
    );
  }

  return (
    <View className="flex-1 bg-gruvbox-dark-bg0 pt-10">
      <Text className="px-4 pb-2 pt-6 text-2xl font-bold text-gruvbox-yellow-dark">Users</Text>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#fabd2f" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ alignItems: 'center', paddingBottom: 40, flexGrow: 1 }}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onBan={() => handleBan(item.id)}
              onUnban={() => handleUnban(item.id)}
              loading={banLoading === item.id}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Text className="text-gruvbox-dark-fg3">No users found.</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchUsers();
              }}
              colors={['#fabd2f']}
              tintColor="#fabd2f"
            />
          }
        />
      )}
    </View>
  );
}
