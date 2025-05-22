import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { getAllRequests } from '@/api/requests';

const STATUS_TAGS = [
  { label: 'new', color: '#B42D90' },
  { label: 'pending', color: '#FFC23B' },
  { label: 'scheduled', color: '#FFA439' },
  { label: 'cancel', color: '#E35169' },
  { label: 'done', color: '#2ECDA7' },
];

export default function SupervisorRequestsList() {
  const router = useRouter();
  const { accessToken } = useAuth();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllRequests(accessToken!);
        setRequests(data);
      } catch (err) {
        console.error('Error loading supervisor requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

   useFocusEffect(
      useCallback(() => {
        const fetchData = async () => {
          try {
            const data = await getAllRequests(accessToken!);
            setRequests(data);
          } catch (err) {
            console.error("Error loading supervisor requests:", err);
          } finally {
            setLoading(false);
          }
        };
    
        fetchData();
      }, [])
    );

  const filteredRequests = filter
    ? requests.filter((req) => req.status === filter)
    : requests;

  return (
    <View className="flex-1 bg-white p-4">
      {/* <Text className="text-xl font-bold mb-4">Service Requests</Text> */}

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        className="flex-row gap-2 mb-4" // Removed flex-wrap
      >
        {STATUS_TAGS.map(({ label, color }) => (
          <Pressable
            key={label}
            onPress={() => setFilter(label === filter ? null : label)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 999,
              backgroundColor: filter === label ? color : '#F3F4F6',
              borderWidth: 1,
              borderColor: filter === label ? color : '#E5E7EB',
            }}
          >
            <Text
              style={{
                color: filter === label ? '#fff' : '#1F2937',
                fontWeight: '600',
                fontSize: 14,
              }}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7e22ce" />
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              className="py-3 px-4 mb-3 border border-gray-200 rounded-xl bg-white shadow-sm"
              onPress={() =>
                router.push({
                  pathname: '/(supervisorTabs)/requests/[id]',
                  params: { 
                    id: item.id ,
                    first_name : item.profile.user.first_name , 
                    mobile_number: item.profile.mobile_number ,
                    unit: item.profile.unit, 
                    prefered_date:item.prefered_date, 
                    prefered_time_slot:item.prefered_time_slot, 
                    status: item.status
                   },
                })
              }
            >
              <Text className="font-semibold">Request ID: {item.id}</Text>
              <Text>Unit: {item.profile.unit || 'N/A'}</Text>
              <Text>{item.profile?.user.first_name + " " + item.profile?.mobile_number || 'N/A'}</Text>
              <Text>Time Slot: {item.prefered_time_slot || 'N/A'}</Text>
              <Text className="text-gray-400 text-sm mt-1">
                Updated: {new Date(item.date_updated).toLocaleDateString()}
              </Text>
              <View className="mt-1 flex-row items-center gap-2">
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor:
                      STATUS_TAGS.find((s) => s.label === item.status)?.color || '#ccc',
                  }}
                />
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color:
                      STATUS_TAGS.find((s) => s.label === item.status)?.color || '#333',
                  }}
                >
                  {item.status}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
