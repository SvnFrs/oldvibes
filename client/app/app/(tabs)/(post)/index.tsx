import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import TablerIconComponent from '~/components/icon';
import { createVibe, uploadVibeMedia } from '~/api/vibes';
import { router } from 'expo-router';

const CATEGORIES = ['Electronics', 'Fashion', 'Books', 'Toys', 'Home', 'Other'];
const CONDITIONS = ['new', 'like new', 'good', 'fair', 'poor'];

export default function PostScreen() {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [media, setMedia] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pick images/videos
  async function handlePickMedia() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      // Expo SDK 49+: result.assets is array
      setMedia([...media, ...(result.assets || [])]);
    }
  }

  async function handleRemoveMedia(idx) {
    setMedia((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    if (!itemName || !description || !price || !category || !condition || !location) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Create vibe (without media)
      const vibeRes = await createVibe({
        itemName,
        description,
        price: Number(price),
        category,
        condition,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        location,
      });
      // 2. Upload media if any
      if (media.length > 0) {
        await uploadVibeMedia(vibeRes.vibe.id, media);
      }
      Alert.alert(
        'Submitted!',
        'Your vibe has been submitted for review. It will be visible after approval.'
      );
      // Reset form
      setItemName('');
      setDescription('');
      setPrice('');
      setCategory(CATEGORIES[0]);
      setCondition(CONDITIONS[0]);
      setTags('');
      setLocation('');
      setMedia([]);
      // Optionally, navigate to home
      router.replace('/(tabs)/(home)');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to post vibe');
    }
    setIsSubmitting(false);
  }

  return (
    <ScrollView
      className="flex-1 bg-gruvbox-dark-bg0"
      contentContainerStyle={{ paddingBottom: 40 }}>
      <Text className="px-6 pb-4 pt-10 text-2xl font-bold text-gruvbox-yellow-dark">
        Post a Vibe
      </Text>
      <View className="px-6">
        {/* Item Name */}
        <Text className="mb-1 font-semibold text-gruvbox-dark-fg1">Item Name *</Text>
        <TextInput
          className="mb-3 rounded-xl bg-gruvbox-dark-bg2 px-4 py-3 text-gruvbox-light-bg0"
          value={itemName}
          onChangeText={setItemName}
          placeholder="e.g. Vintage Camera"
          placeholderTextColor="#a89984"
        />
        {/* Description */}
        <Text className="mb-1 font-semibold text-gruvbox-dark-fg1">Description *</Text>
        <TextInput
          className="mb-3 rounded-xl bg-gruvbox-dark-bg2 px-4 py-3 text-gruvbox-light-bg0"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your item"
          placeholderTextColor="#a89984"
          multiline
        />
        {/* Price */}
        <Text className="mb-1 font-semibold text-gruvbox-dark-fg1">Price (USD) *</Text>
        <TextInput
          className="mb-3 rounded-xl bg-gruvbox-dark-bg2 px-4 py-3 text-gruvbox-light-bg0"
          value={price}
          onChangeText={setPrice}
          placeholder="150"
          placeholderTextColor="#a89984"
          keyboardType="numeric"
        />
        {/* Category */}
        <Text className="mb-1 font-semibold text-gruvbox-dark-fg1">Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3 flex-row">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              className={`mr-2 rounded-full px-4 py-2 ${
                category === cat
                  ? 'bg-gruvbox-yellow-dark'
                  : 'border border-gruvbox-dark-bg3 bg-gruvbox-dark-bg2'
              }`}
              onPress={() => setCategory(cat)}>
              <Text
                className={`font-bold ${
                  category === cat ? 'text-gruvbox-dark-bg0' : 'text-gruvbox-light-bg0'
                }`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Condition */}
        <Text className="mb-1 font-semibold text-gruvbox-dark-fg1">Condition *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3 flex-row">
          {CONDITIONS.map((cond) => (
            <TouchableOpacity
              key={cond}
              className={`mr-2 rounded-full px-4 py-2 ${
                condition === cond
                  ? 'bg-gruvbox-yellow-dark'
                  : 'border border-gruvbox-dark-bg3 bg-gruvbox-dark-bg2'
              }`}
              onPress={() => setCondition(cond)}>
              <Text
                className={`font-bold ${
                  condition === cond ? 'text-gruvbox-dark-bg0' : 'text-gruvbox-light-bg0'
                }`}>
                {cond}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Tags */}
        <Text className="mb-1 font-semibold text-gruvbox-dark-fg1">Tags (comma separated)</Text>
        <TextInput
          className="mb-3 rounded-xl bg-gruvbox-dark-bg2 px-4 py-3 text-gruvbox-light-bg0"
          value={tags}
          onChangeText={setTags}
          placeholder="vintage, camera"
          placeholderTextColor="#a89984"
        />
        {/* Location */}
        <Text className="mb-1 font-semibold text-gruvbox-dark-fg1">Location *</Text>
        <TextInput
          className="mb-3 rounded-xl bg-gruvbox-dark-bg2 px-4 py-3 text-gruvbox-light-bg0"
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. New York, NY"
          placeholderTextColor="#a89984"
        />
        {/* Media */}
        <Text className="mb-1 font-semibold text-gruvbox-dark-fg1">Photos / Videos</Text>
        <ScrollView horizontal className="mb-3 flex-row">
          {media.map((file, idx) => (
            <View key={idx} className="relative mr-3">
              <Image
                source={{ uri: file.uri }}
                className="h-24 w-20 rounded-xl"
                resizeMode="cover"
              />
              <TouchableOpacity
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1"
                onPress={() => handleRemoveMedia(idx)}>
                <TablerIconComponent name="x" size={16} color="#fabd2f" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            className="mr-3 h-24 w-20 items-center justify-center rounded-xl border border-gruvbox-dark-bg3 bg-gruvbox-dark-bg2"
            onPress={handlePickMedia}>
            <TablerIconComponent name="plus" size={28} color="#fabd2f" />
            <Text className="mt-1 text-xs font-bold text-gruvbox-yellow-dark">Add</Text>
          </TouchableOpacity>
        </ScrollView>
        {/* Submit */}
        <TouchableOpacity
          className={`mt-4 items-center rounded-xl py-4 ${
            isSubmitting ? 'bg-gruvbox-yellow' : 'bg-gruvbox-yellow-dark'
          }`}
          onPress={handleSubmit}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#282828" />
          ) : (
            <Text className="text-lg font-bold text-gruvbox-dark-bg0">Submit Vibe</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
