import "./../global.css";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Image,
  Alert,
  Platform,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Svg, Path, Rect } from "react-native-svg";
import { cssInterop } from "nativewind";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import BackgroundShape from "@/components/BackgroundShape";
import { Animated, Easing } from "react-native";
cssInterop(Svg, {
  className: {
    target: "style",
    nativeStyleToProp: { width: true, height: true },
  },
});
cssInterop(Path, { className: { target: "style" } });
cssInterop(Rect, { className: { target: "style" } });

export default function LoginScreen() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const logoTextOpacity = useRef(new Animated.Value(0)).current;
  const logoTextTranslateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoTextOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(logoTextTranslateY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);


  const handleLogin = async () => {
    try {
      const baseUrl =
        Platform.OS === "android" ? "http://10.0.2.2:8055" : "http://localhost:8055";

      const res = await fetch(`${baseUrl}/custom-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_number: mobileNumber, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.access_token || !data.profile?.user?.role?.name) {
        throw new Error("Login failed or incomplete response");
      }

      const userData = {
        id: data.profile.user.id,
        email: data.profile.user.email,
        first_name: data.profile.user.first_name,
        mobile_number: data.profile.mobile_number,
        unit: data.profile.unit,
        role: data.profile.user.role,
        profile_id: data.profile.id,
      };

      await login(userData, data.access_token, data.refresh_token);

      const role = userData.role.name.toLowerCase();

      if (role === "technician") {
        router.replace("/technician");
      } else if (role === "supervisor") {
        router.replace("/(supervisorTabs)");
      } else {
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert("Login Failed");
    }
  };

  return (

    <View className="flex-1">

      <BackgroundShape />
      {/* Login Card */}
      <View className="flex-1 items-center justify-center">
        {/* Background Gradient */}
        <View className="w-full md:w-1/2 xl:w-2/5 2xl:w-1/3 mx-auto p-8 md:p-10 rounded-2xl bg-white/10 backdrop-blur-lg">
          <View className="flex flex-col items-center gap-4 pb-4">
            <Image
              source={require("../assets/images/logo_white_2.png")}
              style={{ width: 250, height: 250 }}
              alt="Logo"
            />
            <Animated.Text
              style={{
                color: "#fff",
                fontSize: 32,
                fontWeight: "bold",
                opacity: logoTextOpacity,
                transform: [{ translateY: logoTextTranslateY }],
                marginBottom: 8,
              }}
            >
              ANC FM
            </Animated.Text>
          </View>

          {/* Mobile Number Input */}
          <View className="pb-2">
            <Text className="mb-2 text-sm font-medium text-[#fff]">Mobile Number</Text>
            <View className="relative">
              <View className="absolute inset-y-0 left-0 flex items-center p-1 pl-3">
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="gray">
                  <Rect width={20} height={16} x={2} y={4} rx={2} strokeWidth={2} />
                  <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" strokeWidth={2} />
                </Svg>
              </View>
              <TextInput
                className="pl-12 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg text-sm w-full p-2.5 py-3 px-4"
                placeholder="05XXXXXXXX"
                keyboardType="phone-pad"
                value={mobileNumber}
                onChangeText={setMobileNumber}
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="pb-6">
            <Text className="mb-2 text-sm font-medium text-[#fff]">Password</Text>
            <View className="relative">
              <View className="absolute inset-y-0 left-0 flex items-center p-1 pl-3">
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="gray">
                  <Rect width={18} height={18} x={3} y={3} rx={2} strokeWidth={2} />
                  <Path d="M12 8v8" strokeWidth={2} />
                  <Path d="m8.5 14 7-4" strokeWidth={2} />
                  <Path d="m8.5 10 7 4" strokeWidth={2} />
                </Svg>
              </View>
              <TextInput
                className="pl-12 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg text-sm w-full p-2.5 py-3 px-4"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoComplete="off"
              />
            </View>
          </View>

          {/* Submit */}
          <Pressable
            className="w-full bg-[#1B3555] rounded-lg text-sm px-5 py-2.5 mb-6 active:bg-[#4338CA]"
            onPress={handleLogin}
          >
            <Text className="text-white font-medium text-center">Login</Text>
          </Pressable>
        </View>
      </View>
    </View>

  );
}
