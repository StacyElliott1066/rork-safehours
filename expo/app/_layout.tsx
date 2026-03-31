import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";


import { useActivityStore } from "@/store/activityStore";
import { getCurrentDate } from "@/utils/time";
import { EndorsementProvider } from "@/store/endorsementStore";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <EndorsementProvider>
      <RootLayoutNav />
    </EndorsementProvider>
  );
}

function RootLayoutNav() {
  const setSelectedDate = useActivityStore((state) => state.setSelectedDate);

  useEffect(() => {
    // Always set to current date when app opens
    const currentDate = getCurrentDate();
    setSelectedDate(currentDate);
  }, [setSelectedDate]);

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="endorsements/index" options={{ headerShown: false }} />
      <Stack.Screen name="endorsements/flight" options={{ headerShown: false }} />
      <Stack.Screen name="endorsements/written-practical" options={{ headerShown: false }} />
    </Stack>
  );
}
