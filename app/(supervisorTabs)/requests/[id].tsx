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
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from '@/context/AuthContext';
import { getTechnicians } from "@/api/profile";
import { createBooking } from "@/api/booking";
import { updateRequestStatus } from "@/api/requests";
// const technicians = [
//   { id: "tech1", name: "Ahmed" },
//   { id: "tech2", name: "Sara" },
//   { id: "tech3", name: "Omar" },
//   { id: "tech4", name: "Fatima" },
//   { id: "tech5", name: "Ali" },
// ];


export default function RequestDetail() {
  const { id, first_name, mobile_number, unit, prefered_date, prefered_time_slot, status } = useLocalSearchParams<{
    id: string;
    first_name: string;
    mobile_number: string;
    unit: string;
    prefered_date: string;
    prefered_time_slot: string,
    status: string
  }>();
  const router = useRouter();

  const { accessToken } = useAuth();
  const [technicians, setTechnicians] = useState<{ id: string; user: any }[]>([]);
  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const data = await getTechnicians(accessToken!);
        setTechnicians(data);
      } catch (err) {
        console.error("Failed to load technicians", err);
      }
    };
    fetchTechs();
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(12);
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState([
    { id: "1", text: "Hello, I need help with my service.", sender: "customer" },
    { id: "2", text: "Sure, I'm here to assist.", sender: "supervisor" },
  ]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const formatHour = (hour: number) => {
    const isPM = hour >= 12;
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour} ${isPM ? "PM" : "AM"}`;
  };

  const onAssign = async () => {
    try {
      if (!selectedTechnician) throw new Error("Technician not selected");

      const timeSlot = `${formatHour(startHour)}|${formatHour(endHour)}`;
      const formattedDate = selectedDate.toISOString().split("T")[0];

      const booking = await createBooking(
        {
          request: Number(id),
          technician: Number(selectedTechnician),
          time_slot: timeSlot,
          date: formattedDate,
        },
        accessToken!
      );

      await updateRequestStatus(Number(id), "scheduled", accessToken!, booking.id);

      alert("Booking successfully created");
      router.back();
    } catch (err: any) {
      console.error("Booking failed:", err.message);
      alert("Failed to create booking");
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      text: input,
      sender: "supervisor",
    };
    setMessages([...messages, newMsg]);
    setInput("");
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <ScrollView style={styles.container}>
      {/* <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Request #{id}</Text>
      </View> */}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Request Details</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Unit:</Text>
          <Text style={styles.infoValue}>{unit || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Customer:</Text>
          <Text style={styles.infoValue}>{first_name} - {mobile_number}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Preferred Slot:</Text>
          <Text style={styles.infoValue}>{prefered_date} - {prefered_time_slot}</Text>
        </View>
      </View>
      <Text style={styles.label}>Select Date</Text>
      <DateTimePicker
        mode="date"
        value={selectedDate}
        minimumDate={new Date()}
        onChange={(e, date) => date && setSelectedDate(date)}
      />

      <Text style={styles.label}>Select Time Slot (Range)</Text>
      <View style={styles.inputRow}>
        <Text>Start Hour:</Text>
        <TextInput
          style={styles.timeInput}
          keyboardType="numeric"
          value={String(startHour)}
          onChangeText={(text) => {
            const num = parseInt(text, 10);

            if (isNaN(num) && text !== "") return; // Ignore non-numeric input unless it's an empty string

            let validatedStartHour = isNaN(num) ? 8 : num; // Default to 8 if empty or invalid

            validatedStartHour = Math.max(8, validatedStartHour); // Min 8 AM
            // Clamp against endHour: must be at least 1 less than endHour.
            // Also ensure endHour - 1 doesn't go below the absolute min of 8.
            validatedStartHour = Math.min(validatedStartHour, Math.max(8, endHour - 1));
            validatedStartHour = Math.min(validatedStartHour, 17); // Max 5 PM (to allow endHour to be 6 PM)
            
            setStartHour(validatedStartHour);
          }}
        />
        <Text style={{ marginLeft: 5 }}>{formatHour(startHour)}</Text>
      </View>

      <View style={styles.inputRow}>
        <Text>End Hour:</Text>
        <TextInput
          style={styles.timeInput}
          keyboardType="numeric"
          value={String(endHour)}
          onChangeText={(text) => {
            const num = parseInt(text, 10);
            if (isNaN(num) && text !== "") return;

            let validatedEndHour = isNaN(num) ? 18 : num; // Default to 18 if empty or invalid

            validatedEndHour = Math.min(18, validatedEndHour); // Max 6 PM
            // Clamp against startHour: must be at least 1 greater than startHour.
            // Also ensure startHour + 1 doesn't exceed the absolute max of 18.
            validatedEndHour = Math.max(validatedEndHour, Math.min(18, startHour + 1));
            validatedEndHour = Math.max(validatedEndHour, 9); // Min 9 AM 
            
            setEndHour(validatedEndHour);
          }}
        />
        <Text style={{ marginLeft: 5 }}>{formatHour(endHour)}</Text>
      </View>

      <Text style={styles.label}>Technician</Text>
      <ScrollView horizontal style={{ marginVertical: 10 }}>
        {technicians.map((tech) => (
          <Pressable
            key={tech.id}
            onPress={() => setSelectedTechnician(tech.id)}
            style={[styles.techCard, selectedTechnician === tech.id && styles.techCardSelected]}
          >
            <Text style={[styles.techText, selectedTechnician === tech.id && styles.techTextSelected]}>
              {tech.user?.first_name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable style={styles.chatButton} onPress={() => setChatVisible(true)}>
        <Text style={styles.chatButtonText}>Chat with Customer</Text>
      </Pressable>

      <Pressable
        style={[
          styles.assignButton,
          (!selectedTechnician || status === "done") && { backgroundColor: "#ccc" },
        ]}
        disabled={!selectedTechnician || status === "done"}
        onPress={onAssign}
      >
        <Text style={styles.assignButtonText}>
          {status === "done" ? "Done" : "Update"}
        </Text>
      </Pressable>

      {/* Chat Modal */}
      <Modal visible={chatVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
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
                </View>
              )}
              contentContainerStyle={{ padding: 10 }}
              showsVerticalScrollIndicator={false}
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
    </ScrollView>
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
  techCardSelected: { backgroundColor: "#007AFF" },
  techText: { color: "#333" },
  techTextSelected: { color: "#fff", fontWeight: "bold" },
  chatButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  chatButtonText: { color: "#fff", fontSize: 16 },
  assignButton: {
    marginTop: 24,
    backgroundColor: "#007AFF",
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
    marginLeft: 10,
    minWidth: 50,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  }
});
