// File: app/technician/index.tsx

import { useState } from 'react';
import { FlatList, Pressable, Text, View, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

const bookings = [
  {
    id: '101',
    customer: 'Alice',
    time: '2025-04-23 10:00',
    status: 'new',
    lat: 25.276987,
    lng: 55.296249,
    locationText: 'Jumeirah 1, Dubai',
    service: 'AC Repair',
  },
  {
    id: '102',
    customer: 'Bob',
    time: '2025-04-24 14:00',
    status: 'done',
    lat: 25.204849,
    lng: 55.270783,
    locationText: 'Al Barsha, Dubai',
    service: 'Plumbing',
  },
];

export default function TechnicianList() {
  const router = useRouter();
  const [filter, setFilter] = useState<'new' | 'done'>('new');

  const filtered = bookings.filter(b => b.status === filter);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        {/* <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </Pressable> */}
        <Text style={styles.headerText}>My Bookings</Text>
      </View>

      {/* Filter */}
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

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
          style={styles.card}
          onPress={() => router.push(`/technician/${item.id}`)}
        >
          <Text style={styles.service}>{item.service}</Text>
          <Text style={styles.name}>{item.customer}</Text>
          <Text style={styles.time}>{item.time}</Text>
          <Text style={styles.locationText}>📍 {item.locationText}</Text>
      
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: item.lat,
              longitude: item.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker coordinate={{ latitude: item.lat, longitude: item.lng }} />
          </MapView>
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
