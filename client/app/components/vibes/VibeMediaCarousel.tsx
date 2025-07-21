import React, { useRef, useState } from 'react';
import { View, Image, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import Video from 'react-native-video';
import TablerIconComponent from '../icon';
import { MediaFile } from '~/utils/type';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MEDIA_WIDTH = SCREEN_WIDTH * 0.95;
const MEDIA_HEIGHT = MEDIA_WIDTH * 1.2; // adjust as needed

export default function VibeMediaCarousel({ mediaFiles }: { mediaFiles: MediaFile[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 80 });

  if (!mediaFiles || mediaFiles.length === 0) {
    return (
      <Image
        source={{ uri: 'https://placehold.co/600x800/282828/fbf1c7?text=No+Media' }}
        style={{ width: MEDIA_WIDTH, height: MEDIA_HEIGHT, borderRadius: 24 }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={mediaFiles}
        keyExtractor={(item, idx) => item._id || item.url || String(idx)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ width: MEDIA_WIDTH, height: MEDIA_HEIGHT }}
        renderItem={({ item }) => {
          if (item.type === 'image') {
            return (
              <Image
                source={{ uri: item.url }}
                style={{ width: MEDIA_WIDTH, height: MEDIA_HEIGHT, borderRadius: 24 }}
                resizeMode="cover"
              />
            );
          }
          if (item.type === 'video') {
            return (
              <Video
                source={{ uri: item.url }}
                style={{ width: MEDIA_WIDTH, height: MEDIA_HEIGHT, borderRadius: 24 }}
                resizeMode="cover"
                repeat
                muted
                controls={true}
                paused={false}
              />
            );
          }
          return null;
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef.current}
      />
      {/* Dots indicator */}
      <View
        style={{
          position: 'absolute',
          bottom: 12,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {mediaFiles.map((_, idx) => (
          <View
            key={idx}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginHorizontal: 3,
              backgroundColor: idx === currentIndex ? '#fabd2f' : '#a89984',
              opacity: idx === currentIndex ? 1 : 0.5,
            }}
          />
        ))}
      </View>
    </View>
  );
}
