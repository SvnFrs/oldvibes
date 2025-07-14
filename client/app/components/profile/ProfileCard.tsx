import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import TablerIconComponent from '../icon';

export default function ProfileCard({
  profile,
  isMe,
  onEdit,
  onAvatarPress,
  onLogout,
  onFollow,
  isFollowing,
  onFollowersPress,
  onFollowingPress,
}) {
  return (
    <View>
      {/* Header background */}
      <View className="from-gruvbox-yellow-dark to-gruvbox-orange-dark absolute left-0 right-0 top-0 z-0 h-32 w-full rounded-b-3xl bg-gradient-to-b" />
      {/* Avatar */}
      <View className="z-10 mt-16 items-center">
        <TouchableOpacity onPress={onAvatarPress} activeOpacity={isMe ? 0.7 : 1}>
          <Image
            source={
              profile.profilePicture
                ? { uri: profile.profilePicture }
                : require('~/assets/oldvibes-small.png')
            }
            className="border-gruvbox-yellow-dark bg-gruvbox-dark-bg2 h-28 w-28 rounded-full border-4"
          />
          {isMe && (
            <View className="bg-gruvbox-yellow-dark absolute bottom-2 right-2 rounded-full p-1">
              <TablerIconComponent name="camera" size={18} color="#282828" />
            </View>
          )}
        </TouchableOpacity>
        <View className="mt-3 flex-row items-center">
          <Text className="text-gruvbox-yellow-dark text-2xl font-bold">{profile.name}</Text>
          {profile.isVerified && (
            <TablerIconComponent name="check" size={20} color="#b8bb26" style={{ marginLeft: 8 }} />
          )}
        </View>
        <Text className="text-gruvbox-dark-fg1 mt-1 text-base">@{profile.username}</Text>
        <Text className="text-gruvbox-dark-fg3 mt-2 px-6 text-center">
          {profile.bio || 'No bio yet.'}
        </Text>
      </View>
      {/* Stats */}
      <View className="mt-6 flex-row justify-center gap-4">
        <TouchableOpacity onPress={onFollowersPress} className="items-center">
          <Text className="text-gruvbox-yellow-dark text-lg font-bold">
            {profile.followersCount}
          </Text>
          <Text className="text-gruvbox-dark-fg3 text-xs">Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onFollowingPress} className="items-center">
          <Text className="text-gruvbox-yellow-dark text-lg font-bold">
            {profile.followingCount}
          </Text>
          <Text className="text-gruvbox-dark-fg3 text-xs">Following</Text>
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-gruvbox-yellow-dark text-lg font-bold">
            {profile.vibesCount ?? '-'}
          </Text>
          <Text className="text-gruvbox-dark-fg3 text-xs">Vibes</Text>
        </View>
      </View>
      {/* Buttons */}
      <View className="mt-6 flex-row justify-center gap-5">
        {isMe ? (
          <>
            <TouchableOpacity
              className="bg-gruvbox-yellow-dark rounded-xl px-6 py-2"
              onPress={onEdit}>
              <Text className="text-gruvbox-light-bg0 font-bold">Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-gruvbox-dark-bg3 rounded-xl px-6 py-2"
              onPress={onLogout}>
              <Text className="text-gruvbox-yellow-dark font-bold">Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            className={`rounded-xl px-6 py-2 ${
              isFollowing ? 'bg-gruvbox-dark-bg3' : 'bg-gruvbox-yellow-dark'
            }`}
            onPress={onFollow}>
            <Text
              className={`font-bold ${
                isFollowing ? 'text-gruvbox-yellow-dark' : 'text-gruvbox-light-bg0'
              }`}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
