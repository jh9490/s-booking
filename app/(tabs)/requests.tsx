import { useEffect, useState } from 'react';
import { FlatList, Text, View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { getCustomerRequests } from '@/api/requests';


const mockRequests = [
  { id: 's1', service: 'AC Repair', status: 'Pending' },
  { id: 's2', service: 'Carpet Cleaning', status: 'Completed' },
  { id: 's3', service: 'Plumbing', status: 'In Progress' },
];

export default function RequestsScreen() {
  const { accessToken, user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?.profile_id || !accessToken) return;

      try {
        const data = await getCustomerRequests(user.profile_id, accessToken);
        setRequests(data);
      } catch (err) {
        console.error("Failed to load requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#7e22ce" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-6 py-10">
      <Text className="text-2xl font-bold mb-6">My Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="mb-3 border border-gray-200 rounded-lg p-4">
            <Text className="text-lg font-medium">{item.service?.title || 'N/A'}</Text>
            <Text className="text-gray-500">ID: {item.id}</Text>
            <Text className={`mt-1 font-semibold ${item.status === 'done'
                ? 'text-green-600'
                : item.status === 'pending'
                  ? 'text-yellow-600'
                  : 'text-blue-600'
              }`}>
              {item.status}
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              Last updated: {new Date(item.date_updated).toLocaleDateString()}
            </Text>

          </View>
        )}
      />
    </View>
  );
}


