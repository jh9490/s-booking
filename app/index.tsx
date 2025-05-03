import { useLocalSearchParams, router } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const { role } = useLocalSearchParams();

  useEffect(() => {
    setTimeout(() => {
      if (role === "technician") {
        router.replace("/technician");
      } else if (role === "user") {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    }, 0); // ✅ delay lets the layout render before navigating
  }, [role]);

  return null;
}
