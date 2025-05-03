// File: app/components/HomeHeader.tsx
import { SafeAreaView, View, Text, TextInput, Image, Pressable, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';

const { width } = Dimensions.get('window');
// Mock banner images
const banners = [
  require('../assets/images/banner.png'),
  require('../assets/images/banner2.png'),
];

export default function HomeHeader() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<any>>(null);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % banners.length;
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * width,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 4000); // change slide every 4 seconds

    return () => clearInterval(interval);
  }, [activeIndex]);

  const onScrollEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(newIndex);
  };

  return (
    <SafeAreaView edges={['top']} className="bg-white">
      {/* Greeting + Location + Search */}
      <View className="px-4 pt-2 pb-4">
        <Text className="text-lg font-semibold">👋 Hello, Jaber</Text>

        <Pressable className="flex-row items-center mt-2 mb-3">
          <Ionicons name="location-sharp" size={16} color="#1F2937" />
          <Text className="text-sm text-gray-700 mx-2 flex-1">
            202, Croesus, Majan, Dubai
          </Text>
          <Ionicons name="chevron-down" size={16} color="#1F2937" />
        </Pressable>

        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search for Dry Cleaningr"
            className="ml-2 flex-1 text-sm text-gray-800"
          />
        </View>
      </View>

      {/* Banner Carousel */}
      <View>
        <FlatList
          ref={flatListRef}
          data={banners}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          onMomentumScrollEnd={onScrollEnd}
          renderItem={({ item }) => (
            <Image
              source={item}
              style={{ width, height: 160 }}
              resizeMode="cover"
            />
          )}
        />

        {/* Dots Indicator */}
        <View className="flex-row justify-center items-center mt-2 space-x-1">
          {banners.map((_, i) => (
            <View
              key={i}
              className={`h-2 w-2 rounded-full ${
                i === activeIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
