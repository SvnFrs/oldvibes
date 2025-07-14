import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Keyboard,
} from 'react-native';
import { searchVibes } from '~/api/vibes';
import TablerIconComponent from '~/components/icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_WIDTH - 32 - 12) / 2; // 2 columns, 16px padding, 12px gap

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Books', 'Toys', 'Home', 'Other'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const doSearch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchVibes({
        q: query,
        category: category !== 'All' ? category : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });
      setResults(res.vibes || []);
    } catch (e) {
      setResults([]);
    }
    setLoading(false);
  }, [query, category, minPrice, maxPrice]);

  // Search on mount or when filters change
  useEffect(() => {
    doSearch();
  }, [doSearch]);

  function handleSearch() {
    Keyboard.dismiss();
    doSearch();
  }

  return (
    <View className="bg-gruvbox-dark-bg0 flex-1 pt-10">
      {/* Search Bar */}
      <View className="flex-row items-center px-4 pb-2 pt-8">
        <View className="bg-gruvbox-dark-bg2 flex-1 flex-row items-center rounded-xl px-3 py-2">
          <TablerIconComponent name="search" size={20} color="#a89984" />
          <TextInput
            className="text-gruvbox-light-bg0 ml-2 flex-1"
            placeholder="Search vibes, items, tags..."
            placeholderTextColor="#a89984"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <TablerIconComponent name="x" size={18} color="#a89984" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          className="bg-gruvbox-yellow-dark ml-3 rounded-xl px-3 py-2"
          onPress={handleSearch}>
          <TablerIconComponent name="search" size={20} color="#282828" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View className="flex-row flex-wrap px-4 pb-2">
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            className={`mb-2 mr-2 rounded-full px-3 py-1 ${
              category === cat
                ? 'bg-gruvbox-yellow-dark'
                : 'bg-gruvbox-dark-bg2 border-gruvbox-dark-bg3 border'
            }`}
            onPress={() => setCategory(cat)}>
            <Text
              className={`text-xs font-bold ${
                category === cat ? 'text-gruvbox-dark-bg0' : 'text-gruvbox-light-bg0'
              }`}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Price Range */}
      <View className="flex-row items-center px-4 pb-2">
        <Text className="text-gruvbox-dark-fg3 mr-2 text-xs">Price:</Text>
        <TextInput
          className="bg-gruvbox-dark-bg2 text-gruvbox-light-bg0 mr-2 w-16 rounded-lg px-2 py-1 text-xs"
          placeholder="Min"
          placeholderTextColor="#a89984"
          keyboardType="numeric"
          value={minPrice}
          onChangeText={setMinPrice}
        />
        <Text className="text-gruvbox-dark-fg3 mr-2 text-xs">-</Text>
        <TextInput
          className="bg-gruvbox-dark-bg2 text-gruvbox-light-bg0 mr-2 w-16 rounded-lg px-2 py-1 text-xs"
          placeholder="Max"
          placeholderTextColor="#a89984"
          keyboardType="numeric"
          value={maxPrice}
          onChangeText={setMaxPrice}
        />
        <TouchableOpacity
          className="bg-gruvbox-yellow-dark rounded-lg px-3 py-1"
          onPress={handleSearch}>
          <Text className="text-gruvbox-dark-bg0 text-xs font-bold">Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#fabd2f" />
        </View>
      ) : results.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gruvbox-yellow-dark">No vibes found.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 80 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-gruvbox-dark-bg1/90 overflow-hidden rounded-2xl"
              style={{ width: CARD_SIZE }}
              activeOpacity={0.9}
              // onPress={() => ... navigate to detail if you want
            >
              <Image
                source={
                  item.mediaFiles?.[0]
                    ? { uri: item.mediaFiles[0].url }
                    : require('~/assets/oldvibes-small.png')
                }
                className="h-40 w-full"
                resizeMode="cover"
              />
              <View className="p-2">
                <Text className="text-gruvbox-yellow-dark font-bold" numberOfLines={1}>
                  {item.itemName}
                </Text>
                <Text className="text-gruvbox-dark-fg3 text-xs" numberOfLines={1}>
                  ${item.price}
                </Text>
                <Text className="text-gruvbox-dark-fg4 text-xs" numberOfLines={1}>
                  {item.category}
                </Text>
                <View className="mt-1 flex-row flex-wrap">
                  {item.tags.slice(0, 2).map((tag) => (
                    <Text
                      key={tag}
                      className="bg-gruvbox-dark-bg3 text-gruvbox-yellow-dark mb-1 mr-1 rounded-full px-2 py-0.5 text-[10px]">
                      #{tag}
                    </Text>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
