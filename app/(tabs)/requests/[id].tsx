// File: app/(supervisorTabs)/requests/[id].tsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    View,
    Text,
    Pressable,
    ScrollView,
    TextInput,
    StyleSheet,
    Modal,
    FlatList,
    Platform,
    KeyboardAvoidingView,
    SafeAreaView,
    RefreshControl,
    Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from '@/context/AuthContext';
import { getTechnicians } from "@/api/profile";
import { createBooking } from "@/api/booking";
import { getRequest, updateRequestStatus } from "@/api/requests";
import { getChatMessages, sendChatMessage } from "@/api/chat";
import BasicHeader from "@/components/BasicHeader";
import { baseUrl } from "@/config/config";

export default function RequestDetail() {
    const { id, first_name, mobile_number, unit, prefered_date, prefered_time_slot, status } = useLocalSearchParams();
    const router = useRouter();
    const { accessToken, user } = useAuth();

    const [technicians, setTechnicians] = useState<Array<{ id: number; user?: { first_name?: string } }>>([]);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [startHour, setStartHour] = useState(9);
    const [endHour, setEndHour] = useState(12);
    const [selectedTechnician, setSelectedTechnician] = useState<number | null>(null);
    const [chatVisible, setChatVisible] = useState(false);
    const [currentRequest, setCurrentRequest] = useState<any>();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [messages, setMessages] = useState<Array<{
        id: string;
        text: string;
        sender: string;
        date_created?: string;
    }>>([]);
    const [input, setInput] = useState("");

    const [refreshing, setRefreshing] = useState(false);
    const flatListRef = useRef<FlatList<any>>(null);
    useEffect(() => {
        const fetch = async () => {
            if (!accessToken || !id) return;

            const requestId = Array.isArray(id) ? id[0] : id;

            try {
                const data = await getRequest(requestId, accessToken);
                setCurrentRequest(data[0]);
            } catch (err) {
                console.error('Failed to load request', err);
            }
        };

        fetch();
    }, [id?.toString(), accessToken]); // Ensures effect reruns only when id changes



    useEffect(() => {
        if (!chatVisible) return;

        const loadMessages = async () => {
            try {
                if (!accessToken || !user?.id) return; // Guard clause

                const data = await getChatMessages(Number(id), accessToken);

                setMessages(
                    data.map((msg: any) => ({
                        id: msg.id.toString(),
                        text: msg.message,
                        sender: msg.sender?.id === user.id ? 'supervisor' : 'customer',
                        date_created: msg.date_created
                    }))
                );
            } catch (err) {
                console.error("Failed to load chat messages:", (err as Error).message);
            }
        };


        loadMessages();
        // Set interval to reload every 5 seconds
        const interval = setInterval(loadMessages, 5000);

        // Clear on unmount or when modal closes
        return () => clearInterval(interval);
    }, [chatVisible]);


    const formatHour = (hour: number): string => {
        const isPM = hour >= 12;
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        return `${displayHour} ${isPM ? "PM" : "AM"}`;
    };



    const sendMessage = async () => {
        if (!input.trim()) return;

        try {
            if (!accessToken) return; // guard clause for null
            await sendChatMessage(Number(id), input, accessToken);
            setInput("");

            // Optional: re-fetch messages or append locally
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: input,
                sender: 'supervisor',
                date_created: new Date().toISOString(), // ✅ use ISO string instead
            }]);

            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        } catch (err) {
            console.error("Send failed:", err);
        }
    };


    const onRefresh = async () => {
        if (!accessToken || !user?.id) return;

        setRefreshing(true);
        try {
            const data = await getChatMessages(Number(id), accessToken);

            setMessages(
                data.map((msg: any) => ({
                    id: msg.id.toString(),
                    text: msg.message,
                    sender: msg.sender?.id === user.id ? "supervisor" : "customer",
                    date_created: msg.date_created
                }))
            );
        } catch (err) {
            console.error("Refresh failed:", (err as Error).message);
        }
        setRefreshing(false);
    };


    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "done":
                return {
                    backgroundColor: "#ecfdf5", // light green
                    borderColor: "#34d399",
                    textColor: "#065f46",
                };
            case "scheduled":
            case "pending":
                return {
                    backgroundColor: "#fefce8", // light orange
                    borderColor: "#fde68a",
                    textColor: "#92400e",
                };
            case "canceled":
                return {
                    backgroundColor: "#fef2f2", // light red
                    borderColor: "#fecaca",
                    textColor: "#991b1b",
                };
            case "new":
                return {
                    backgroundColor: "#fdf2f8", // light purple
                    borderColor: "#f9a8d4",
                    textColor: "#B42D90",
                };
            default:
                return {
                    backgroundColor: "#f3f4f6", // neutral gray
                    borderColor: "#d1d5db",
                    textColor: "#374151",
                };
        }
    };



    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
            <BasicHeader title="Request Details" showLogout showBack />

            <ScrollView style={styles.container}>
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

                {currentRequest?.status && (() => {

                    const { backgroundColor, borderColor, textColor } = getStatusStyles(currentRequest.status);
                    return (
                        <View style={[styles.infoCard, { backgroundColor, borderColor }]}>
                            <Text style={[styles.cardTitle, { color: textColor }]}>Request Status</Text>
                            <Text style={{ fontWeight: "600", fontSize: 16, color: textColor }}>
                                {currentRequest.status.replace("_", " ").toUpperCase()}
                            </Text>
                        </View>
                    );
                })()}



                <Pressable style={styles.chatButton} onPress={() => setChatVisible(true)}>
                    <Text style={styles.chatButtonText}>Chat with Supervisor</Text>
                </Pressable>
            </ScrollView>

            {/* Chat Modal */}
            <Modal visible={chatVisible} animationType="slide">
                <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                        <View style={styles.chatHeader}>
                            <Pressable onPress={() => setChatVisible(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </Pressable>
                            <Text style={styles.headerTitle}>Customer Chat</Text>
                        </View>
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View
                                    style={{
                                        backgroundColor: item.sender === "supervisor" ? "#e1f5fe" : "#e0e0e0",
                                        alignSelf: item.sender === "supervisor" ? "flex-end" : "flex-start",
                                        margin: 8,
                                        padding: 10,
                                        borderRadius: 10,
                                        maxWidth: "75%",
                                    }}
                                >
                                    <Text>{item.text}</Text>
                                    {item.date_created && (
                                        <Text style={{ fontSize: 10, color: '#666', marginTop: 4, textAlign: 'right' }}>
                                            {formatTime(item.date_created)}
                                        </Text>
                                    )}
                                </View>
                            )}
                            contentContainerStyle={{ padding: 10 }}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                            }
                        />
                        <View style={styles.chatInputRow}>
                            <TextInput
                                placeholder="Type a message"
                                value={input}
                                onChangeText={setInput}
                                style={styles.chatInput}
                            />
                            <Pressable style={styles.chatSend} onPress={sendMessage}>
                                <Ionicons name="send" size={20} color="white" />
                            </Pressable>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>
        </View>
    );

}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 16 },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    headerTitle: { fontSize: 20, fontWeight: "bold", marginLeft: 12 },
    label: { fontSize: 12, fontWeight: "600", marginTop: 16 },
    readonlyValue: {
        fontSize: 16,
        color: "#333",
        backgroundColor: "#f3f3f3",
        padding: 10,
        borderRadius: 8,
        marginTop: 4,
    },
    techCard: {
        backgroundColor: "#eee",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginHorizontal: 6,
    },
    techCardSelected: { backgroundColor: "#65ADD4" },
    techText: { color: "#333" },
    techTextSelected: { color: "#fff", fontWeight: "bold" },
    chatButton: {
        marginTop: 20,
        backgroundColor: "#65ADD4",
        paddingVertical: 12,
        alignItems: "center",
        borderRadius: 8,
    },
    chatButtonText: { color: "#fff", fontSize: 16 },
    assignButton: {
        marginTop: 24,
        backgroundColor: "#65ADD4",
        paddingVertical: 14,
        alignItems: "center",
        borderRadius: 8,
    },
    assignButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    chatHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderColor: "#ccc",
    },
    chatInputRow: {
        flexDirection: "row",
        padding: 10,
        borderTopWidth: 1,
        borderColor: "#ccc",
        alignItems: "center",
    },
    chatInput: {
        flex: 1,
        backgroundColor: "#f0f0f0",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    chatSend: {
        marginLeft: 10,
        backgroundColor: "#007AFF",
        borderRadius: 20,
        padding: 10,
    },
    infoCard: {
        backgroundColor: "#f9fafb",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    infoTitle: {
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
    timeInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 4,
        marginVertical: 4,
        minWidth: 50,
        textAlign: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 24,
    },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
});
