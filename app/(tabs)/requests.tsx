import { useEffect, useState } from 'react';
import { FlatList, Text, View, ActivityIndicator, Pressable } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { getCustomerRequests } from '@/api/requests';
import { router } from 'expo-router';
import BasicHeader from '@/components/BasicHeader';


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
    <View className="flex-1 bg-white">

      <BasicHeader title="My Requests" showLogout  />

      <View className="flex-1 bg-white px-6 py-10">
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            className="mb-3 border border-gray-200 rounded-lg p-4"
            onPress={() =>
              router.push({
                pathname: '/(tabs)/requests/[id]',
                params: {
                  id: item.id,
                  first_name: item.supervisor?.user?.first_name || '',
                  mobile_number: item.supervisor?.user?.mobile || '',
                  unit: item.unit || '',
                  prefered_date: item.prefered_date || '',
                  prefered_time_slot: item.prefered_time_slot || '',
                  status: item.status,
                },
              })
            }
          >
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
          </Pressable>
        )}

      />
    </View>
    </View>
  );
}


