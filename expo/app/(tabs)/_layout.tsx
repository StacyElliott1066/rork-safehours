import React from "react";
import { Tabs } from "expo-router";
import { BarChart2, Calendar, Database, Settings as SettingsIcon, HelpCircle } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { ShieldWithNumber } from "@/components/ShieldWithNumber";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function TabLayout() {
  const router = useRouter();
  
  const navigateToAbout = () => {
    router.push('/about');
  };
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.lightGray,
        },
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTitleStyle: {
          color: COLORS.primary,
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center', // Ensure all headers are centered
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "SafeHours",
          tabBarLabel: "Activities",
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
          headerTitleStyle: {
            fontSize: 28, // Twice as big as default
            fontWeight: 'bold',
            color: COLORS.primary,
          },
          headerRight: () => (
            <TouchableOpacity onPress={navigateToAbout} style={{ marginRight: 16 }}>
              <HelpCircle size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="charts"
        options={{
          title: "Weekly Statistics",
          tabBarLabel: "Weekly Stats",
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="data"
        options={{
          title: "Data Management",
          tabBarLabel: "Data Management",
          tabBarIcon: ({ color }) => <Database size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="shield"
        options={{
          title: "Rolling 24 Hour",
          tabBarLabel: "Rolling 24h",
          tabBarIcon: ({ color }) => <ShieldWithNumber size={24} color={color} number="24" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <SettingsIcon size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}