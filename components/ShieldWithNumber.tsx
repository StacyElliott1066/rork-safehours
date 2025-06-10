import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Shield } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

interface ShieldWithNumberProps {
  size: number;
  color: string;
  number: string;
}

export const ShieldWithNumber = ({ size, color, number }: ShieldWithNumberProps) => {
  return (
    <View style={styles.container}>
      <Shield size={size} color={color} />
      <Text style={[
        styles.number, 
        { 
          color, 
          fontSize: size * 0.5,
          // Adjust position by moving left 1px and up 2px
          transform: [{ translateX: -1 }, { translateY: -2 }]
        }
      ]}>
        {number}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    position: "absolute",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 2, // Slight adjustment to center the number vertically
  },
});