import "./../../global.css";
import { View, Text, Pressable, TextInput, Image } from "react-native";
import { useState } from "react";
import { Svg, Path, Rect } from "react-native-svg";
import { cssInterop } from "nativewind";
import { useRouter } from "expo-router";

cssInterop(Svg, { className: { target: "style", nativeStyleToProp: { width: true, height: true } } });
cssInterop(Path, { className: { target: "style" } });
cssInterop(Rect, { className: { target: "style" } });

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "technician">("user");

  const handleLogin = () => {
    console.log("Logging in as:", role, email);
    router.push(`/?role=${role}`);
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="w-full md:w-1/2 xl:w-2/5 2xl:w-2/5 3xl:w-1/3 mx-auto p-8 md:p-10 2xl:p-12 3xl:p-14 bg-[#ffffff] rounded-2xl shadow-xl">

        {/* Header */}
        <View className="flex flex-row gap-3 pb-4">
          <Image
            source={require("../../assets/images/icon.png")}
            style={{ width: 50, height: 50 }}
            alt="Logo"
          />
          <Text className="text-3xl font-bold text-[#4B5563] my-auto">Your Company</Text>
        </View>

        {/* Description */}
        <Text className="text-sm font-light text-[#6B7280] pb-6">
          Login to your account on Your Company.
        </Text>

        {/* Role Toggle */}
        <View className="flex flex-row justify-center mb-6">
          <Pressable
            className={`px-4 py-2 rounded-l-lg ${role === 'user' ? 'bg-[#4F46E5]' : 'bg-gray-200'}`}
            onPress={() => setRole("user")}
          >
            <Text className={`${role === 'user' ? 'text-white' : 'text-gray-800'} font-medium`}>
              User
            </Text>
          </Pressable>
          <Pressable
            className={`px-4 py-2 rounded-r-lg ${role === 'technician' ? 'bg-[#4F46E5]' : 'bg-gray-200'}`}
            onPress={() => setRole("technician")}
          >
            <Text className={`${role === 'technician' ? 'text-white' : 'text-gray-800'} font-medium`}>
              Technician
            </Text>
          </Pressable>
        </View>

        {/* Form */}
        <View className="flex flex-col">
          {/* Email */}
          <View className="pb-2">
            <Text className="mb-2 text-sm font-medium text-[#111827]">Email</Text>
            <View className="relative">
              <View className="absolute inset-y-0 left-0 flex items-center p-1 pl-3">
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="gray">
                  <Rect width={20} height={16} x={2} y={4} rx={2} strokeWidth={2} />
                  <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" strokeWidth={2} />
                </Svg>
              </View>
              <TextInput
                className="pl-12 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg text-sm w-full p-2.5 py-3 px-4"
                placeholder="name@company.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password */}
          <View className="pb-6">
            <Text className="mb-2 text-sm font-medium text-[#111827]">Password</Text>
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
            <Text className="text-[#FFFFFF] font-medium text-center">Login</Text>
          </Pressable>
        </View>

        {/* OR Divider */}
        <View className="relative flex py-8 items-center">
          <View className="grow border-t border-gray-200" />
          <Text className="shrink mx-4 font-medium text-gray-500">OR</Text>
          <View className="grow border-t border-gray-200" />
        </View>

        {/* Social login buttons can stay below */}
      </View>
    </View>
  );
}
