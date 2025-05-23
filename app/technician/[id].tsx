import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Linking,
    Platform,
    TextInput,
    ScrollView,
    Image,
} from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { updateBookingNotes } from '@/api/booking';
import { getRequest, updateRequestStatus } from '@/api/requests';
import { useAuth } from '@/context/AuthContext';
import { baseUrl } from '@/config/config';

type TimelineItem = {
    status: 'pending' | 'done' | 'cancel';
    note: string;
    timestamp: string;
};

export default function TechnicianDetail() {
    const router = useRouter();
    const { id, request_id } = useLocalSearchParams<{
        id: string;
        request_id: string;
    }>();
    const { accessToken } = useAuth();

    const [status, setStatus] = useState<'pending' | 'done' | 'canceled'>('pending');
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState('');
    const [currentRequest, setCurrentRequest] = useState<any>();
    const [history, setHistory] = useState<TimelineItem[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const handleStatus = (newStatus: typeof status) => {
        setStatus(newStatus);
        setShowNotes(true);
    };

    const handleConfirm = async () => {
        try {
            if (!notes.trim()) {
                alert('Please add technician notes before submitting.');
                return;
            }

            await updateBookingNotes(Number(id), notes, accessToken!);
            await updateRequestStatus(Number(request_id), status, accessToken!);

            alert('Request and notes updated successfully.');
            router.back();
        } catch (err: any) {
            console.error('Update failed:', err.message);
            alert('Failed to update status and notes.');
        }
    };

    const getStatusColor = (type: string) => {
        switch (type) {
            case 'pending':
                return '#FFA500'; // orange
            case 'done':
                return '#4CAF50'; // green
            case 'cancel':
            case 'canceled':
                return '#E53935'; // red
            default:
                return '#eee';
        }
    };

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getRequest(request_id, accessToken!);
               
                setCurrentRequest(data[0]);
            } catch (err) {
                console.error('Failed to load request', err);
            }
        };
        fetch();
    }, []);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.headerText}>Booking #{id}</Text>
            </View>

            {currentRequest && (
                <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Customer Details</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Service:</Text>
                        <Text style={styles.infoValue}>{currentRequest.service?.title}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Customer:</Text>
                        <Text style={styles.infoValue}>
                            {currentRequest.profile?.user?.first_name} {currentRequest.profile?.user?.last_name}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Mobile:</Text>
                        <Text style={styles.infoValue}>{currentRequest.profile?.mobile_number}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Unit:</Text>
                        <Text style={styles.infoValue}>{currentRequest.profile?.unit || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Villa:</Text>
                        <Text style={styles.infoValue}>{currentRequest.profile?.villa || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Building:</Text>
                        <Text style={styles.infoValue}>{currentRequest.profile?.building || 'N/A'}</Text>
                    </View>

                    <Text style={styles.infoLabel}>Customer Notes:</Text>
                    <Text style={styles.infoValue}>{currentRequest.additional_details || '—'}</Text>
                </View>
            )}

            {currentRequest?.files?.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                    <Text style={styles.label}>Attached Files</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {currentRequest.files.map((fileObj: any, idx: number) => {
                            const file = fileObj.directus_files_id;
                            if (!file?.id) return null;

                            const uri = `${baseUrl}/assets/${file.id}?access_token=${accessToken}`;

                            return (
                                <Pressable key={idx} onPress={() => setPreviewImage(uri)}>
                                    <Image
                                        source={{ uri }}
                                        style={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: 10,
                                            marginRight: 10,
                                            backgroundColor: '#f0f0f0',
                                        }}
                                        resizeMode="cover"
                                    />
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            <View style={styles.buttonsRow}>
                {['pending', 'done', 'cancel'].map((type) => {
                    const isActive = status === type;
                    return (
                        <Pressable
                            key={type}
                            style={[
                                styles.statusButton,
                                {
                                    backgroundColor: isActive ? getStatusColor(type) : '#eee',
                                    borderColor: getStatusColor(type),
                                    borderWidth: 1,
                                },
                            ]}
                            onPress={() => handleStatus(type as typeof status)}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    { color: isActive ? '#fff' : getStatusColor(type) },
                                ]}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Text>
                        </Pressable>
                    );
                })}
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
            {previewImage && (
                <View style={styles.fullscreenOverlay}>
                    <Pressable style={styles.closeButton} onPress={() => setPreviewImage(null)}>
                        <Ionicons name="close" size={30} color="#fff" />
                    </Pressable>
                    <Image
                        source={{ uri: previewImage }}
                        style={styles.fullscreenImage}
                        resizeMode="contain"
                    />
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff', paddingTop: 12 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    headerText: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
    infoCard: {
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 20,
    },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    infoLabel: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
    infoValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
    label: { fontSize: 16, marginTop: 10, fontWeight: '600' },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
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
    confirmText: { color: '#fff', fontWeight: 'bold' },
    fullscreenOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99,
    },

    fullscreenImage: {
        width: '100%',
        height: '100%',
    },

    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 100,
    }

});
