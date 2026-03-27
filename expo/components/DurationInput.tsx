import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';
import { calculateDuration } from '@/utils/time';
import { Check, X } from 'lucide-react-native';

interface DurationInputProps {
  startTime: string;
  endTime: string;
  onDurationChange: (durationHours: number) => void;
  onFocus?: () => void;
}

export default function DurationInput({ 
  startTime, 
  endTime, 
  onDurationChange,
  onFocus 
}: DurationInputProps) {
  const [durationText, setDurationText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Calculate duration whenever start or end time changes
  useEffect(() => {
    if (!isEditing && startTime && endTime) {
      try {
        const durationMinutes = calculateDuration(startTime, endTime);
        const durationHours = (durationMinutes / 60).toFixed(2);
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
        const durationHours = (durationMinutes / 60).toFixed(2);
        setDurationText(durationHours);
      } catch (error) {
        console.error("Error calculating duration on blur:", error);
        setDurationText('0.0');
      }
    }
  };

  const handleDonePress = () => {
    // Parse the duration input
    const durationHours = parseFloat(durationText);
    if (!isNaN(durationHours) && durationHours >= 0) {
      onDurationChange(durationHours);
    } else {
      // Reset to calculated duration if invalid input
      try {
        const durationMinutes = calculateDuration(startTime, endTime);
        const durationHours = (durationMinutes / 60).toFixed(2);
        setDurationText(durationHours);
      } catch (error) {
        console.error("Error calculating duration on done press:", error);
        setDurationText('0.0');
      }
    }
    
    setIsEditing(false);
  };

  const handleCancelPress = () => {
    // Reset to calculated duration
    try {
      const durationMinutes = calculateDuration(startTime, endTime);
      const durationHours = (durationMinutes / 60).toFixed(1);
      setDurationText(durationHours);
    } catch (error) {
      console.error("Error calculating duration on cancel:", error);
      setDurationText('0.0');
    }
    
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Duration (hours)</Text>
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={[
            styles.timeTextContainer,
            isEditing && styles.activeInputContainer
          ]}
          onPress={() => setIsEditing(true)}
        >
          <TextInput
            style={styles.input}
            value={durationText}
            onChangeText={handleDurationChange}
            onFocus={() => {
              onFocus?.();
              setIsEditing(true);
            }}
            onBlur={handleDurationBlur}
            keyboardType="numeric"
            placeholder="0.0"
            selectTextOnFocus={true}
          />
        </TouchableOpacity>
        
        {isEditing && (
          <View style={styles.editButtonsContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancelPress}
            >
              <X color={COLORS.white} size={18} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.doneButton} 
              onPress={handleDonePress}
            >
              <Check color={COLORS.white} size={18} />
            </TouchableOpacity>
          </View>
        )}
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
  timeTextContainer: {
    flex: 1,
  },
  activeInputContainer: {
    borderRightWidth: 0,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  editButtonsContainer: {
    flexDirection: 'row',
  },
  doneButton: {
    padding: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    padding: 10,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
});