// import { Tabs } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';

// export default function SupervisorLayout() {
//   return (
//     <Tabs>
//       <Tabs.Screen
//         name="requests"
//         options={{
//           title: 'Requests',
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="list" size={size} color={color} />
//           ),
//         }}
//       />

//     </Tabs>
//   );
// }
import BasicHeader from "@/components/BasicHeader";

import { Stack } from "expo-router";

export default function SupervisorLayout() {
  return (
    <Stack >
      <Stack.Screen name="index" options={{
    header: () => <BasicHeader title="Requests" showLogout />,
  }} />
      <Stack.Screen name="requests/[id]" options={{
    header: () => <BasicHeader title="Request Details" showLogout showBack/>,
  }}  />
    </Stack>
  );
}