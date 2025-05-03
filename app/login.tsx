import "./../global.css";
import { View, Text, Pressable, TextInput, Image } from "react-native";
import { useState } from "react";
import { Svg, Path, Rect } from "react-native-svg";
import { cssInterop } from "nativewind";
import { useRouter } from "expo-router";

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

  const handleLogin = () => {
    console.log("Logging in with mobile:", mobileNumber);

    // Dummy logic: Decide role based on mobile number prefix
    const isTechnician = mobileNumber.startsWith("050"); // Example logic
    const route = isTechnician ? "/technician" : "/tabs";
    const isUser = !isTechnician; // Any number not starting with 050
    if (isTechnician) {
      router.replace("/technician");
    } else if (isUser) {
      router.replace("/(tabs)");
    } else {
      console.warn("Invalid mobile number format.");
      // Optionally show error to user
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="w-full md:w-1/2 xl:w-2/5 2xl:w-2/5 3xl:w-1/3 mx-auto p-8 md:p-10 bg-white rounded-2xl">
        {/* Header */}
        <View className="flex flex-col items-center gap-4 pb-4">
          <Image
            source={require("../assets/images/icon_3.jpg")}
            style={{ width: 250, height: 250 }}
            alt="Logo"
          />
          <Text className="text-xl font-bold text-[#4B5563]">
            Your Life Partner.
          </Text>
        </View>

        {/* Form */}
        <View className="flex flex-col">
          {/* Mobile Number */}
          <View className="pb-2">
            <Text className="mb-2 text-sm font-medium text-[#111827]">
              Mobile Number
            </Text>
            <View className="relative">
              <View className="absolute inset-y-0 left-0 flex items-center p-1 pl-3">
                <Svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="gray"
                >
                  <Rect
                    width={20}
                    height={16}
                    x={2}
                    y={4}
                    rx={2}
                    strokeWidth={2}
                  />
                  <Path
                    d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
                    strokeWidth={2}
                  />
                </Svg>
              </View>
              <TextInput
                className="pl-12 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg text-sm w-full p-2.5 py-3 px-4"
                placeholder="05XXXXXXXX"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password */}
          <View className="pb-6">
            <Text className="mb-2 text-sm font-medium text-[#111827]">
              Password
            </Text>
            <View className="relative">
              <View className="absolute inset-y-0 left-0 flex items-center p-1 pl-3">
                <Svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="gray"
                >
                  <Rect
                    width={18}
                    height={18}
                    x={3}
                    y={3}
                    rx={2}
                    strokeWidth={2}
                  />
                  <Path d="M12 8v8" strokeWidth={2} />
                  <Path d="m8.5 14 7-4" strokeWidth={2} />
                  <Path d="m8.5 10 7 4" strokeWidth={2} />
                </Svg>
              </View>
              <TextInput
                className="pl-12 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg text-sm w-full p-2.5 py-3 px-4"
                placeholder="••••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>
          </View>

          {/* Login Button */}
          <Pressable
            className="w-full bg-[#4F46E5] rounded-lg text-sm px-5 py-2.5 mb-6 active:bg-[#4338CA]"
            onPress={handleLogin}
          >
            <Text className="text-white font-medium text-center">Login</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
