import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { getTechnicianBookings } from '@/api/booking';


export default function TechnicianList() {
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<'new' | 'done'>('new');
  const { logout } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getTechnicianBookings(user!.profile_id, accessToken!);
        setBookings(data);
      } catch (err) {
        console.error("Failed to load bookings", err);
      }
    };
    fetch();
  }, []);
  const handleLogout = async () => {

    await logout();
    router.replace('/login'); // Redirect to login screen
  };
  const filtered = filter === 'done'
    ? bookings.filter(b => b.request?.status === 'done')
    : bookings.filter(b => b.request?.status === 'scheduled');

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>My Bookings</Text>
        <Pressable onPress={handleLogout} style={{ padding: 12 }}>
      <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Logout</Text>
    </Pressable>
      </View>

      <View style={styles.filterRow}>
        {['new', 'done'].map(status => (
          <Pressable
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(status as 'new' | 'done')}
          >
            <Text style={filter === status ? styles.filterTextActive : styles.filterText}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/technician/[id]',
                params: {
                  id: item.id.toString(),
                  request_id: item.request.id.toString(),
                  status: item.request.status,
                  service: item.request.service.title,
                  additional_details:item.request.additional_details,
                  first_name: item.request.profile.user?.first_name || '',
                  last_name: item.request.profile.user?.last_name || '',
                  mobile_number: item.request.profile.mobile_number,
                  technician_notes: item.technician_notes || '',
                  unit: item.request.profile.unit || '',
                  building: item.request.profile.building || '', 
                  villa: item.request.profile.villa || ''
                },
              })
            }
          >
            <Text style={styles.service}>{item.request?.service?.title || "Service"}</Text>
            <Text style={styles.name}>{item.request?.customer?.customer_name || "Customer"}</Text>
            <Text style={styles.time}>{item.date} - {item.time_slot}</Text>
            {/* Map removed as per your request */}
          </Pressable>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingTop:60
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    color: '#333',
  },
  filterTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  time: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  map: {
    width: '100%',
    height: 140,
    borderRadius: 8,
  },
  service: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
});
