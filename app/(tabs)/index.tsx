import { useEffect, useState } from 'react';
import { ScrollView, FlatList, View, Text, Image, Pressable, ActivityIndicator, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import HomeHeader from '@/components/HomeHeader';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from "nativewind";

const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8055' : 'http://localhost:8055';

type Service = {
  id: number;
  title: string;
  description: string | null;
  image: {
    id: string;
    filename_download: string;
  } | null;
};

type Category = {
  title: string;
  services: Service[];
};

cssInterop(LinearGradient, {
  className: "style",
});

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { accessToken, getRefreshToken, login, logout, user, authLoading } = useAuth();

  const refreshToken = async (): Promise<string> => {
    try {
      const storedRefresh = await getRefreshToken();
      if (!storedRefresh) throw new Error("No refresh token");

      const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: storedRefresh }),
      });

      const json = await response.json();
      if (json.errors) throw new Error(json.errors[0].message);

      const { access_token, refresh_token } = json.data;

      if (!user) throw new Error("User context missing");

      // Use login() from context to update accessToken
      await login(user, access_token);

      // Still need to update refresh_token manually
      const SecureStore = await import('expo-secure-store');
      await SecureStore.setItemAsync("refresh_token", refresh_token);

      return access_token;
    } catch (err: any) {
      console.error("Token refresh failed:", err.message);
      Alert.alert("Session Expired", "Please log in again.");
      await logout();
      router.replace("/login");
      throw err;
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!accessToken) {
        Alert.alert("Not Logged In", "Please log in to continue.");
        router.replace("/login");
        return;
      }

      let token = accessToken;

      let res = await fetch(
        `${baseUrl}/items/service_categories?fields=title,services.id,services.title,services.description,services.image.id,services.image.filename_download`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          token = await refreshToken();
          res = await fetch(
            `${baseUrl}/items/service_categories?fields=title,services.id,services.title,services.description,services.image.id,services.image.filename_download`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } else {
          const errJson = await res.json();
          throw new Error(errJson.errors?.[0]?.message || `HTTP ${res.status}`);
        }
      }

      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0].message);

      setCategories(json.data || []);
    } catch (err: any) {
      console.error("Error fetching categories:", err.message);
      setError(err.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    //  console.log(authLoading);
    //  console.log(accessToken);
    //  console.log(user);
    if (!authLoading && accessToken && user) {
      fetchCategories();
    }
  }, [authLoading, accessToken, user]);

  if (authLoading || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#7e22ce" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-red-500 text-lg">{error}</Text>
        <Pressable
          className="mt-4 bg-[#7e22ce] rounded-lg p-3"
          onPress={fetchCategories}
        >
          <Text className="text-white text-center font-bold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!categories.length) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-gray-500 text-lg">No categories available</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentInsetAdjustmentBehavior="never">
      <HomeHeader />

      <View className="p-4">
        {categories.map((cat, cIdx) => (
          <View key={cIdx} className="mb-8">
            <Text className="text-2xl font-bold text-gray-800 mb-4">{cat.title}</Text>

            <FlatList
              horizontal
              data={cat.services}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4 }}
              renderItem={({ item }) => {
                const imageUrl = item.image
                  ? `${baseUrl}/assets/${item.image.id}${accessToken ? `?access_token=${accessToken}` : ''}`
                  : null;

                return (
                  <View className="flex flex-col w-80 bg-white rounded-2xl mx-2">
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        className="h-40 w-full rounded-t-2xl"
                        resizeMode="cover"
                        accessibilityLabel={item.image?.filename_download || item.title}
                      />
                    ) : (
                      <View className="h-40 w-full rounded-t-2xl bg-gray-200 justify-center items-center">
                        <Text className="text-gray-500">No image</Text>
                      </View>
                    )}
                    <View className="p-6">
                      <Text className="text-2xl font-bold text-[#374151] pb-4">{item.title}</Text>
                      {item.description && (
                        <Text className="text-lg text-[#374151] mb-2">{item.description}</Text>
                      )}
                      <Pressable
                        className="mt-3 rounded-lg overflow-hidden active:scale-95 transition-transform px-8 py-6"
                        onPress={() =>
                          router.push({
                            pathname: "/services/[id]",
                            params: {
                              id: item.id,
                              name: item.title,
                              image: imageUrl ?? "",
                              description: item.description ?? "",
                            },
                          })
                        }
                      >
                        <LinearGradient
                          colors={['#326AA6', '#073260']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          className="px-4 py-3 rounded-lg"
                        >
                        <Text className="text-base font-bold text-white text-center">Book Now</Text>
                        </LinearGradient>
                      </Pressable>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
