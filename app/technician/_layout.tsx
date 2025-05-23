import BasicHeader from "@/components/BasicHeader";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TechincianLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack >
        <Stack.Screen name="index" options={{
          header: () => <BasicHeader title="My Bookings" showLogout />,
        }} />
        <Stack.Screen name="[id]" options={{
          header: () => <BasicHeader title="Request Details" showLogout showBack />,
        }} />
      </Stack>
    </GestureHandlerRootView>

  );
}