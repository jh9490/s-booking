// File: app/(tabs)/index.tsx
import { ScrollView, FlatList, View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import HomeHeader from '@/components/HomeHeader';
import { serviceImages } from '@/constants/serviceImages';

// Define your service types
type Service = { id: string; name: string; description: string; image: string; };
type Category = { id: string; title: string; services: Service[]; };

// Sample data
const categories: Category[] = [
  {
    id: 'c1',
    title: 'Cleaning & Wash',
    services: [
      {
        id: 's1',
        name: 'Home Cleaning',
        description: 'Thorough cleaning for your entire home including all rooms, surfaces, and floors.',
        image: 'home_cleaning',
      },
      {
        id: 's2',
        name: 'Carpet Cleaning',
        description: 'Deep steam and vacuum cleaning for carpets to remove stains, dust, and allergens.',
        image: 'Carpet_Cleaning',
      },
      {
        id: 's10',
        name: 'Furniture Cleaning',
        description: 'Professional cleaning for sofas, curtains, and mattresses to restore freshness.',
        image: 'Furniture',
      },
    ],
  },
  {
    id: 'c3',
    title: 'Maintenance & Handy Man',
    services: [
      {
        id: 's3',
        name: 'AC Repair',
        description: 'Expert repair and maintenance for split and central AC units to ensure cooling efficiency.',
        image: 'AC_Repair',
      },
      {
        id: 's4',
        name: 'Plumbing',
        description: 'Fix leaks, clogs, and install fixtures with our licensed plumbing services.',
        image: 'Plumbing',
      },
      {
        id: 's5',
        name: 'Appliances',
        description: 'Installation and repair of kitchen and home appliances like ovens, washing machines, and more.',
        image: 'Appliances',
      },
      {
        id: 's15',
        name: 'Painting',
        description: 'Interior and exterior painting with professional finish using high-quality paint.',
        image: 'Painting',
      },
    ],
  },
  {
    id: 'c4',
    title: 'Pest Control',
    services: [
      {
        id: 's13',
        name: 'Ant & Cockroach Treatment',
        description: 'Safe and effective pest control to eliminate ants and cockroaches from your home.',
        image: 'pest_control_1',
      },
      {
        id: 's14',
        name: 'Bed Bug Treatment',
        description: 'Targeted treatment to remove bed bugs and prevent reinfestation.',
        image: 'pest_control_2',
      },
    ],
  },
];



export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white"   contentInsetAdjustmentBehavior="never">
      {/* Banner at the top */}
      <HomeHeader />

      <View className="p-4">
        {categories.map((cat) => (
          <View key={cat.id} className="mb-8">
            <Text className="text-2xl font-bold text-gray-800 mb-4">
              {cat.title}
            </Text>

            <FlatList
              horizontal
              data={cat.services}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4 }}
              renderItem={({ item }) => (
                <View className="flex flex-col w-80 bg-white rounded-2xl  mx-2">
                  <Image
                    source={serviceImages[item.image]}
                    className="h-40 w-full rounded-t-2xl"
                    resizeMode="cover"
                  />
                  <View className="p-6">
                    <Text className="text-2xl font-bold text-[#374151] pb-4">
                      {item.name}
                    </Text>
                    {/* <Text className="text-lg text-[#374151]">
                      {item.description}
                    </Text> */}
                    <Pressable
                      className="mt-6 bg-[#7e22ce] rounded-lg p-3 active:scale-95 transition-transform"
                      onPress={() =>
                        router.push({
                          pathname: '/services/[id]',
                          params: {
                            id: item.id,
                            name: item.name,
                            image: item.image,
                            description:item.description
                          },
                        })
                      }
                    >
                      <Text className="text-base font-bold text-white text-center">
                        Book Now
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}