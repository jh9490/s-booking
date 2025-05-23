// File: app/_layout.tsx
import { Slot } from "expo-router";
import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/context/AuthContext";
import BasicHeader from "@/components/BasicHeader";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <View style={styles.container}>
          <Slot />
          <StatusBar style="auto" />
        </View>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#242C3B",
  },
});
