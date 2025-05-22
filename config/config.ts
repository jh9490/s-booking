import { Platform } from "react-native";

// Automatically adjusts for Android emulator vs iOS vs Web
export const baseUrl =
  Platform.OS === "android"
    ? "http://10.0.2.2:8055" // Android emulator maps this to localhost
    : "http://localhost:8055"; // iOS simulator & web