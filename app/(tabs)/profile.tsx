import { View, Text } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { user } = useAuth();

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  const unit = user?.unit || 'N/A';

  return (
    <View className="flex-1 bg-white px-6 py-10">
      <Text className="text-2xl font-bold mb-6">My Profile</Text>

      <View className="mb-4">
        <Text className="text-gray-500 mb-1">Full Name</Text>
        <View className="bg-gray-100 rounded-lg p-3">
          <Text className="text-gray-800">{fullName}</Text>
        </View>
      </View>

      <View>
        <Text className="text-gray-500 mb-1">Unit Number</Text>
        <View className="bg-gray-100 rounded-lg p-3">
          <Text className="text-gray-800">{unit}</Text>
        </View>
      </View>
    </View>
  );
}
