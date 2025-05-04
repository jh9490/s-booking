import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Message {
  id: string;
  text: string;
  sender: "user" | "technician";
}

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hi, I have a question about my booking.", sender: "user" },
    { id: "2", text: "Sure! How can I help?", sender: "technician" },
  ]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };
    setMessages([...messages, newMsg]);
    setInput("");
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100} // Ensure this is higher than tab bar height
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            {/* Header */}
            <View className="p-4 shadow-sm flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-800">Messages</Text>
            </View>

            {/* Messages List */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  className={`px-4 py-2 my-1 mx-3 max-w-[75%] rounded-xl ${item.sender === "user"
                      ? "bg-blue-100 self-end"
                      : "bg-gray-200 self-start"
                    }`}
                >
                  <Text className="text-sm text-gray-800">{item.text}</Text>
                </View>
              )}
              contentContainerStyle={{ paddingVertical: 20, paddingBottom: 100  }}
              showsVerticalScrollIndicator={false}
            />

            <View className="absolute bottom-20 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
              <View className="flex-row items-center">
                <TextInput
                  className="flex-1 h-12 bg-gray-100 text-gray-800 rounded-full px-4 mr-2"
                  placeholder="Type your message"
                  value={input}
                  onChangeText={setInput}
                  returnKeyType="send"
                  onSubmitEditing={sendMessage}
                />
                <Pressable
                  onPress={sendMessage}
                  className="p-3 bg-blue-500 rounded-full"
                >
                  <Ionicons name="send" size={20} color="white" />
                </Pressable>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
