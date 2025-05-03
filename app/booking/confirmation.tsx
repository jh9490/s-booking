import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function Confirmation() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-3xl font-bold mb-4">Booked!</Text>
      <Text className="text-lg mb-8">Your service has been scheduled.</Text>
      <Link href="/(tabs)" className="px-4 py-2 bg-blue-500 rounded-lg">
        <Text className="text-white">Back to Home</Text>
      </Link>
    </View>
  );
}