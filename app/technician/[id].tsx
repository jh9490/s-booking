import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    View, Text, Pressable, StyleSheet, Linking, Platform,
    TextInput, ScrollView
} from 'react-native';
import { useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { updateBookingNotes } from '@/api/booking';
import { updateRequestStatus } from '@/api/requests';
import { useAuth } from '@/context/AuthContext';
type TimelineItem = {
    status: 'pending' | 'done' | 'cancel';
    note: string;
    timestamp: string;
};

export default function TechnicianDetail() {
    const router = useRouter();
    const {
        id,               // booking id
        request_id,       // request id
        request_status,
        service,
        first_name,
        last_name,
        mobile_number,
        technician_notes,
        unit,
        building,
        villa,
        additional_details
    } = useLocalSearchParams<{
        id: string;
        request_id: string;
        request_status: string;
        service: string;
        first_name: string;
        last_name: string;
        mobile_number: string;
        technician_notes: string;
        unit: string;
        building: string;
        villa: string
        additional_details: string
    }>();
    const [status, setStatus] = useState<'pending' | 'done' | 'cancel'>('pending');
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState('');
    const [history, setHistory] = useState<TimelineItem[]>([]);
    const { accessToken } = useAuth();
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

    const handleConfirm = async () => {
        try {
            if (!notes.trim()) {
              alert("Please add technician notes before submitting.");
              return;
            }
        
            // 1. Update booking notes
            await updateBookingNotes(Number(id), notes, accessToken!);
        
            // 2. Update request status
            await updateRequestStatus(Number(request_id), status, accessToken!);
        
            alert("Request and notes updated successfully.");
            router.back(); // or navigate to home
          } catch (err: any) {
            console.error("Update failed:", err.message);
            alert("Failed to update status and notes.");
          }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerRow}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </Pressable>
                <Text style={styles.headerText}>Booking #{id}</Text>
            </View>
            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Customer Details</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Service:</Text>
                    <Text style={styles.infoValue}>{service}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Customer:</Text>
                    <Text style={styles.infoValue}>{first_name} {last_name}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mobile:</Text>
                    <Text style={styles.infoValue}>{mobile_number}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Unit:</Text>
                    <Text style={styles.infoValue}>{unit || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Villa:</Text>
                    <Text style={styles.infoValue}>{villa || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Building:</Text>
                    <Text style={styles.infoValue}>{building || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Customer Notes:</Text>
                    <Text style={styles.infoValue}>{additional_details || '—'}</Text>
                </View>
            </View>



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
    infoCard: {
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
      },
      cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 12,
      },
      infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
      },
      infoLabel: {
        fontSize: 14,
        color: "#6b7280",
        fontWeight: "500",
      },
      infoValue: {
        fontSize: 14,
        color: "#111827",
        fontWeight: "600",
      },
      
});
