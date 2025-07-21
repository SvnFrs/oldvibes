import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';

type Province = {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  phone_code: number;
};

export default function LocationPicker({
  visible,
  onClose,
  onSelect,
  selectedLocation,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (province: Province) => void;
  selectedLocation?: Province | null;
}) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    fetch('https://provinces.open-api.vn/api/?depth=1')
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [visible]);

  const filtered = provinces.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[70%] rounded-t-3xl bg-gruvbox-dark-bg1 p-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gruvbox-yellow-dark">Select Location</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-lg font-bold text-gruvbox-yellow-dark">✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            className="mb-3 rounded-xl bg-gruvbox-dark-bg2 px-4 py-2 text-gruvbox-light-bg0"
            placeholder="Search province/city..."
            placeholderTextColor="#a89984"
            value={search}
            onChangeText={setSearch}
          />
          {loading ? (
            <ActivityIndicator color="#fabd2f" />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.code)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`mb-1 rounded-xl px-4 py-3 ${
                    selectedLocation?.code === item.code
                      ? 'bg-gruvbox-yellow-dark'
                      : 'bg-gruvbox-dark-bg2'
                  }`}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}>
                  <Text
                    className={`text-base ${
                      selectedLocation?.code === item.code
                        ? 'font-bold text-gruvbox-dark-bg0'
                        : 'text-gruvbox-light-bg0'
                    }`}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 350 }}
              ListEmptyComponent={
                <Text className="mt-8 text-center text-gruvbox-dark-fg4">No results found.</Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
