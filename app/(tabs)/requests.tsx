import { FlatList, Text, View } from 'react-native';

const mockRequests = [
  { id: 's1', service: 'AC Repair', status: 'Pending' },
  { id: 's2', service: 'Carpet Cleaning', status: 'Completed' },
  { id: 's3', service: 'Plumbing', status: 'In Progress' },
];

export default function RequestsScreen() {
  return (
    <View className="flex-1 bg-white px-6 py-10">
      <Text className="text-2xl font-bold mb-6">My Requests</Text>
      <FlatList
        data={mockRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mb-3 border border-gray-200 rounded-lg p-4">
            <Text className="text-lg font-medium">{item.service}</Text>
            <Text className="text-gray-500">ID: {item.id}</Text>
            <Text className={`mt-1 font-semibold ${
              item.status === 'Completed'
                ? 'text-green-600'
                : item.status === 'Pending'
                ? 'text-yellow-600'
                : 'text-blue-600'
            }`}>
              {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
