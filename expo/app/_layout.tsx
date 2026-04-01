import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform } from "react-native";


import { useActivityStore } from "@/store/activityStore";
import { getCurrentDate } from "@/utils/time";
import { EndorsementProvider } from "@/store/endorsementStore";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {
    console.log('SplashScreen.preventAutoHideAsync failed');
  });
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded || error) {
      setReady(true);
      if (Platform.OS !== 'web') {
        SplashScreen.hideAsync().catch(() => {
          console.log('SplashScreen.hideAsync failed');
        });
      }
    }
  }, [loaded, error]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const timeout = setTimeout(() => {
        console.log('Font loading timeout on web, proceeding anyway');
        setReady(true);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, []);

  if (!ready) {
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
