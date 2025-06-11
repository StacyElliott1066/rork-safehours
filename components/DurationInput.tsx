import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { calculateDuration } from '@/utils/time';

interface DurationInputProps {
  startTime: string;
  endTime: string;
  onDurationChange: (durationHours: number) => void;
}

export default function DurationInput({ 
  startTime, 
  endTime, 
  onDurationChange 
}: DurationInputProps) {
  const [durationText, setDurationText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Calculate duration whenever start or end time changes
  useEffect(() => {
    if (!isEditing && startTime && endTime) {
      try {
        const durationMinutes = calculateDuration(startTime, endTime);
        const durationHours = (durationMinutes / 60).toFixed(1);
        setDurationText(durationHours);
      } catch (error) {
        console.error("Error calculating duration:", error);
        setDurationText('0.0');
      }
    }
  }, [startTime, endTime, isEditing]);

  const handleDurationChange = (text: string) => {
    setDurationText(text);
  };

  const handleDurationBlur = () => {
    setIsEditing(false);
    
    // Parse the duration input
    const durationHours = parseFloat(durationText);
    if (!isNaN(durationHours) && durationHours >= 0) {
      onDurationChange(durationHours);
    } else {
      // Reset to calculated duration if invalid input
      try {
        const durationMinutes = calculateDuration(startTime, endTime);
        const durationHours = (durationMinutes / 60).toFixed(1);
        setDurationText(durationHours);
      } catch (error) {
        console.error("Error calculating duration on blur:", error);
        setDurationText('0.0');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Duration (hours)</Text>
      <Text style={styles.helperText}>Editing this will change the End Time.</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={durationText}
          onChangeText={handleDurationChange}
          onFocus={() => setIsEditing(true)}
          onBlur={handleDurationBlur}
          keyboardType="numeric"
          placeholder="0.0"
          selectTextOnFocus={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: COLORS.black,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
});