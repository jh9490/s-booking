import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { getTechnicianBookings } from '@/api/booking';

const STATUS_FILTERS = [
  { label: 'Scheduled', key: 'scheduled', color: '#FFA500' },
  { label: 'Pending', key: 'pending', color: '#FF9800' },
  { label: 'Done', key: 'done', color: '#4CAF50' },
  { label: 'Canceled', key: 'canceled', color: '#E53935' },
];

export default function TechnicianList() {
  const router = useRouter();
  const { user, accessToken, logout } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('scheduled');

  const fetchBookings = async () => {
    try {
      const data = await getTechnicianBookings(user!.profile_id, accessToken!);
      setBookings(data);
    } catch (err) {
      console.error("Failed to load bookings", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const filtered = bookings.filter(b => b.request?.status === filter);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
  
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {STATUS_FILTERS.map(({ label, key, color }) => {
          const isActive = filter === key;
          return (
            <Pressable
              key={key}
              style={[
                styles.filterButton,
                {
                  backgroundColor: isActive ? color : 'transparent',
                  borderColor: color,
                },
              ]}
              onPress={() => setFilter(key)}
            >
              <Text
                style={{
                  color: isActive ? '#fff' : color,
                  fontWeight: '600',
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No requests found.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/technician/[id]',
                params: {
                  id: item.id.toString(),
                  request_id: item.request.id.toString(),
                },
              })
            }
          >
            <Text style={styles.service}>{item.request?.service?.title || 'Service'}</Text>
            <Text style={styles.name}>{item.request?.customer?.customer_name || 'Customer'}</Text>
            <Text style={styles.time}>{item.date} • {item.time_slot}</Text>
            <View style={[styles.statusPill, { backgroundColor: getStatusColor(item.request?.status) }]}>
              <Text style={styles.statusPillText}>{item.request?.status}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'scheduled': return '#FFA500';
    case 'pending': return '#FF9800';
    case 'done': return '#4CAF50';
    case 'canceled': return '#E53935';
    default: return '#ccc';
  }
}

import { ScrollView } from 'react-native-gesture-handler';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingVertical: 4,
    maxHeight:36
  },
  
  filterButton: {
    paddingVertical: 2,
    paddingHorizontal: 16,

    borderWidth: 1,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,

  },
  
  card: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  time: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  service: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 6,
  },
  statusPillText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
});
