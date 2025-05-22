import { View, Text, Pressable } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function BasicHeader({
  title = "ANC FM",
  showLogout = false,
  showBack = false,
}: {
  title?: string;
  showLogout?: boolean;
  showBack?: boolean;
}) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {

    await logout();
    router.replace('/login'); // Redirect to login screen
  };

  return (
    <View className="flex-row justify-between items-center px-4 pt-16 pb-3 bg-[#073260] shadow-sm">
      <View className="flex-row items-center space-x-3">
        {showBack && (
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
        )}
        <Text className="text-xl font-bold text-white">{title}</Text>
      </View>

      {showLogout && (
        <Pressable onPress={handleLogout}>
          <Text className="text-sm text-white font-semibold">Logout</Text>
        </Pressable>
      )}
    </View>
  );
}
