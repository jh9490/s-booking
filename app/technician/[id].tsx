import { useLocalSearchParams , useRouter } from 'expo-router';
import {
    View, Text, Pressable, StyleSheet, Linking, Platform,
    TextInput, ScrollView
} from 'react-native';
import { useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

type TimelineItem = {
    status: 'pending' | 'done' | 'cancel';
    note: string;
    timestamp: string;
};

export default function TechnicianDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [status, setStatus] = useState<'pending' | 'done' | 'cancel'>('pending');
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState('');
    const [history, setHistory] = useState<TimelineItem[]>([]);

    const booking = {
        id,
        service: 'AC Repair',
        customer: 'Alice Johnson',
        phone: '+971501234567',
        address: 'Jumeirah 1, Dubai, UAE',
        lat: 25.276987,
        lng: 55.296249,
    };

    const openMap = () => {
        const url =
            Platform.OS === 'ios'
                ? `http://maps.apple.com/?ll=${booking.lat},${booking.lng}`
                : `geo:${booking.lat},${booking.lng}?q=${encodeURIComponent(booking.address)}`;
        Linking.openURL(url);
    };

    const handleStatus = (newStatus: typeof status) => {
        setStatus(newStatus);
        setShowNotes(true);
    };

    const handleConfirm = () => {
        if (!notes.trim()) return;

        const timestamp = new Date().toLocaleString();

        const newItem: TimelineItem = {
            status,
            note: notes.trim(),
            timestamp,
        };

        setHistory((prev) => [...prev, newItem]);
        setShowNotes(false);
        setNotes('');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerRow}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </Pressable>
                <Text style={styles.headerText}>Booking #{booking.id}</Text>
            </View>
            <Text style={styles.label}>Service: <Text style={styles.value}>{booking.service}</Text></Text>
            <Text style={styles.label}>Customer: <Text style={styles.value}>{booking.customer}</Text></Text>
            <Text style={styles.label}>Phone: <Text style={styles.value}>{booking.phone}</Text></Text>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.address}>{booking.address}</Text>

            <Pressable onPress={openMap} style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: booking.lat,
                        longitude: booking.lng,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }}
                    pointerEvents="none"
                >
                    <Marker coordinate={{ latitude: booking.lat, longitude: booking.lng }} />
                </MapView>
                <View style={styles.mapOverlay}>
                    <Ionicons name="location" size={20} color="#fff" />
                    <Text style={styles.mapText}>Open in Maps</Text>
                </View>
            </Pressable>

            <View style={styles.buttonsRow}>
                {['pending', 'done', 'cancel'].map((type) => (
                    <Pressable
                        key={type}
                        style={[
                            styles.statusButton,
                            status === type && styles.activeStatus,
                        ]}
                        onPress={() => handleStatus(type as typeof status)}
                    >
                        <Text style={styles.statusText}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {showNotes && (
                <>
                    <Text style={styles.label}>Technician Notes</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder="Enter notes here..."
                        multiline
                        value={notes}
                        onChangeText={setNotes}
                    />
                    <Pressable style={styles.confirmButton} onPress={handleConfirm}>
                        <Text style={styles.confirmText}>Confirm</Text>
                    </Pressable>
                </>
            )}

            {/* Timeline View */}
            {history.length > 0 && (
                <View style={styles.timeline}>
                    <Text style={styles.label}>Status History</Text>
                    {history.map((item, idx) => (
                        <View key={idx} style={styles.timelineItem}>
                            <View style={styles.timelineBadge}>
                                <Ionicons
                                    name={
                                        item.status === 'done'
                                            ? 'checkmark-circle'
                                            : item.status === 'cancel'
                                                ? 'close-circle'
                                                : 'time'
                                    }
                                    size={20}
                                    color="#fff"
                                />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineText}>
                                    <Text style={{ fontWeight: 'bold' }}>{item.status.toUpperCase()}</Text> - {item.timestamp}
                                </Text>
                                <Text style={styles.timelineNote}>{item.note}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff', paddingTop: 60 },
    heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
    label: { fontSize: 16, marginTop: 10, fontWeight: '600' },
    value: { fontWeight: '400', color: '#333' },
    address: { fontSize: 14, color: '#555', marginTop: 4 },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
      },
      backButton: {
        marginRight: 8,
      },
      headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
      },
      
    mapContainer: { marginTop: 12, borderRadius: 12, overflow: 'hidden', position: 'relative' },
    map: { width: '100%', height: 180 },
    mapOverlay: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: '#007AFF',
        padding: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    mapText: { color: '#fff', marginLeft: 6 },

    buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 },
    statusButton: {
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#eee',
        alignItems: 'center',
    },
    activeStatus: { backgroundColor: '#4CAF50' },
    statusText: { color: '#333', fontWeight: '600' },

    textarea: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 12,
    },
    confirmButton: {
        backgroundColor: '#007AFF',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    timeline: { marginTop: 24 },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    timelineBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 4,
    },
    timelineContent: { flex: 1 },
    timelineText: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
    timelineNote: { fontSize: 14, color: '#555' },
});
