// File: app/components/HomeHeader.tsx
import { SafeAreaView, View, Text, TextInput, Image, Pressable, FlatList, Dimensions , StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { useUser } from "../context/UserContext";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
// Mock banner images
const banners = [
  require('../assets/images/banner_3.png'),
];

export default function HomeHeader() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<any>>(null);

  const { user , logout } = useAuth();
  const router = useRouter();
  const firstName = user?.first_name || "Guest";
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

  const handleLogout = async () => {

    await logout();
    router.replace('/login'); // Redirect to login screen
  };

  return (
    <SafeAreaView edges={['top']} className="bg-white">
      {/* Greeting + Location + Search */}
      <View className="px-4 pt-2 pb-4" style={styles.headerRow}>
        <Text className="text-lg font-semibold">👋 Hello, {firstName}</Text>
        <Pressable onPress={handleLogout} style={{ padding: 12 }}>
          <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Logout</Text>
        </Pressable>
        {/* <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search for Dry Cleaningr"
            className="ml-2 flex-1 text-sm text-gray-800"
          />
        </View> */}
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
              className={`h-2 w-2 rounded-full ${i === activeIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    marginBottom: 16,
  },
})
