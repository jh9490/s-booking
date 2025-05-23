// File: app/services/[id].tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  FlatList,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { serviceImages } from '@/constants/serviceImages';
import * as ImagePicker from 'expo-image-picker';
import { uploadFileToDirectus, createRequest, getLastRequestByCustomer, submitReviewForRequest } from "@/api/requests";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from 'expo-linear-gradient';
const LOCATIONS = ['Unit: S123'];

function generateSlots(date: Date) {
  const slot1 = new Date(date);
  slot1.setHours(10, 0, 0, 0);
  const slot2 = new Date(date);
  slot2.setHours(14, 0, 0, 0);
  return [
    {
      label: '8:00 - 12:00',
      value: '08:00|12:00',
    },
    {
      label: '12:00 - 16:00',
      value: '12:00|16:00',
    },
  ];
}

export default function ServiceDetail() {
  const { id, name, image, description: passedDescription } = useLocalSearchParams<{
    id: string;
    name: string;
    image: string;
    description?: string;
  }>();
  const router = useRouter();

  const [location] = useState(LOCATIONS[0]);
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [lastRequest, setLastRequest] = useState<any | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [100, 60],
    extrapolate: 'clamp',
  });
  const titleFontSize = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [24, 18],
    extrapolate: 'clamp',
  });
  const { accessToken, user } = useAuth();
  const onConfirm = async () => {
    try {
      const fileIds: string[] = [];
  
      for (const file of mediaFiles) {
        const id = await uploadFileToDirectus(file.uri, accessToken!);
        fileIds.push(id);
      }
  
      // 🔄 Transform to match Directus many-to-many payload
      const fileRelationObjects = fileIds.map(id => ({ directus_files_id: id }));
  
      await createRequest(
        {
          service: Number(id),
          profile: user!.profile_id,
          additional_details: description,
          files: fileRelationObjects, // ✅ send as relation objects
          prefered_date: selectedDate?.toISOString().split("T")[0] || "",
          prefered_time_slot: selectedSlot || "",
        },
        accessToken!
      );
  
      router.push({
        pathname: "/booking/confirmation",
        params: { id, location, description, datetime: selectedSlot },
      });
    } catch (err: any) {
      console.error(err.message);
      alert("Something went wrong while submitting your request.");
    }
  };
  
  const handleReviewSubmit = async () => {
    if (!reviewRating || !lastRequest?.id) {
      alert("Please leave a star rating before proceeding.");
      return;
    }

    try {
      await submitReviewForRequest(
        lastRequest.id,
        reviewRating,
        reviewComment,
        accessToken!
      );

      setReviewSubmitted(true);
      setShowReviewModal(false);
    } catch (err: any) {
      console.error("Failed to submit review:", err.message);
      alert("Could not submit review. Please try again.");
    }
  };

  const [mediaFiles, setMediaFiles] = useState<{ uri: string; type: string }[]>([]);

  const pickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false, // Expo only supports one file on native
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const files = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type || 'image',
      }));
      setMediaFiles((prev) => [...prev, ...files]);
    }
  };


  useEffect(() => {
    const fetchLastRequest = async () => {
      if (!accessToken || !user?.profile_id) return;

      try {
        const last = await getLastRequestByCustomer(user.profile_id, accessToken);
        
        if (last) {
          setLastRequest(last);
          setShowReviewModal(true);
        } else {
          setReviewSubmitted(true); // ✅ No last request, go straight to booking
        }
      } catch (err) {
        console.error("Error loading last request", err);
        setReviewSubmitted(true); // Fallback: allow access
      }
    };

    fetchLastRequest();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Animated.View style={[styles.animatedHeader, { height: headerHeight }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </Pressable>
          <Animated.Text style={[styles.headerText, { fontSize: titleFontSize }]}>
            {name || `Service #${id}`}
          </Animated.Text>
        </View>
      </Animated.View>

      {!reviewSubmitted && (
        <Modal visible={showReviewModal} animationType="slide">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Please review your previous request</Text>
            <Text style={{ fontSize: 16, marginVertical: 10 }}>How was the last service?</Text>
            {lastRequest && (
              <View style={styles.prevDetailsBox}>
                <Text style={styles.prevDetail}><Text style={{ fontWeight: '600' }}>Service:</Text> {lastRequest.service?.title || 'N/A'}</Text>
                <Text style={styles.prevDetail}><Text style={{ fontWeight: '600' }}>Date:</Text> {new Date(lastRequest.date_created).toLocaleDateString()}</Text>

                {/* <Text style={styles.prevDetail}><Text style={{ fontWeight: '600' }}>Note:</Text> You can customize this field</Text> */}
              </View>
            )}
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setReviewRating(star)}>
                  <Ionicons
                    name={star <= reviewRating ? 'star' : 'star-outline'}
                    size={32}
                    color={star <= reviewRating ? '#FFD700' : '#ccc'}
                    style={{ marginHorizontal: 4 }}
                  />
                </Pressable>
              ))}
            </View>
            <TextInput
              style={[styles.textarea, { marginBottom: 16 }]}
              placeholder="Leave a comment..."
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
            />
            <Pressable
              style={[styles.button, { marginBottom: 12 }]}
              onPress={handleReviewSubmit}
            >
              <LinearGradient
                colors={['#326AA6', '#073260']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-4 py-3 rounded-lg"
              >
                <Text style={styles.buttonText}>Submit Review</Text>
              </LinearGradient>

            </Pressable>

            <Pressable onPress={() => router.back()}>
              <Text style={{ color: '#007AFF', textAlign: 'center' }}>Back</Text>
            </Pressable>
          </View>
        </Modal>
      )}

      {reviewSubmitted && (
        <Animated.ScrollView
          contentContainerStyle={styles.container}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {typeof image === 'string' && image.startsWith('http') ? (
            <Image
              source={{ uri: image }}
              style={{ width: '100%', height: 180 }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ width: '100%', height: 180, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#999' }}>No image</Text>
            </View>
          )}

          <Text style={styles.label}>Unit</Text>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownText}>{location}</Text>
          </View>

          <Text style={styles.label}>Additional Details *</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Let us know any specifics..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Select Date</Text>
          <DateTimePicker
            mode="date"
            display="default"
            value={selectedDate || new Date()}
            minimumDate={new Date()}
            onChange={(e, selected) => {
              if (selected) {
                setSelectedDate(selected);
                setSelectedSlot(null);
              }
            }}
          />

          {selectedDate && (
            <>
              <Text style={styles.label}>Select Time Slot</Text>
              <View style={styles.slotsContainer}>
                {generateSlots(selectedDate).map((slot) => (
                  <Pressable
                    key={slot.value}
                    style={[
                      styles.slotButton,
                      selectedSlot === slot.value && styles.slotButtonSelected,
                    ]}
                    onPress={() => setSelectedSlot(slot.value)}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        selectedSlot === slot.value && styles.slotTextSelected,
                      ]}
                    >
                      {slot.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <Text style={styles.label}>Upload Photos or Videos</Text>
          <Pressable onPress={pickMedia} style={[styles.button, { backgroundColor: '#eee', marginBottom: 10 }]}>
            <Text style={[styles.buttonText, { color: '#333' }]}>Choose Media</Text>
          </Pressable>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
            {mediaFiles.map((file, idx) => (
              <Image
                key={idx}
                source={{ uri: file.uri }}
                style={{ width: 80, height: 80, margin: 4, borderRadius: 6 }}
              />
            ))}
          </View>

          <Pressable
            style={[styles.button]}
            disabled={!selectedDate || !selectedSlot || !description.trim()}
            onPress={onConfirm}
          >
            <LinearGradient
              colors={
                !selectedDate || !selectedSlot || !description.trim()
                  ? ['#cccccc', '#aaaaaa']  // Gray gradient when disabled
                  : ['#326AA6', '#073260']  // Normal gradient
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-4 py-3 rounded-lg"
            >
              <Text style={styles.buttonText}>Confirm Booking</Text>
            </LinearGradient>
          </Pressable>

        </Animated.ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 100,
  },
  label: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 6,
  },
  dropdown: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  overlay: {
    flex: 1,
    backgroundColor: '#00000040',
  },
  modal: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: '40%',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    height: 100,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  slotButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    margin: 4,
    backgroundColor: '#fff',
  },
  slotButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  slotText: {
    fontSize: 14,
    color: '#333',
  },
  slotTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 30,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  backButton: {
    marginRight: 12,
  },
  headerText: {
    fontWeight: 'bold',
    color: '#111',
  },
  animatedHeader: {
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    elevation: 4,
    zIndex: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  prevDetailsBox: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  prevDetail: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
});
