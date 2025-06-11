import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useActivityStore } from '@/store/activityStore';
import ActivityTypeSelector from '@/components/ActivityTypeSelector';
import TimeInput from '@/components/TimeInput';
import DurationInput from '@/components/DurationInput';
import PrePostValueInput from '@/components/PrePostValueInput';
import DateSelector from '@/components/DateSelector';
import { COLORS } from '@/constants/colors';
import { getCurrentDate, getCurrentTime, calculateDuration, timeToMinutes, minutesToTime } from '@/utils/time';
import { ActivityType } from '@/types/activity';

export default function NewActivityScreen() {
  const router = useRouter();
  const { selectedDate, addActivity } = useActivityStore();
  
  const [type, setType] = useState<ActivityType>('Flight');
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState(getCurrentTime());
  const [endTime, setEndTime] = useState(getCurrentTime());
  const [prePostValue, setPrePostValue] = useState(0);
  const [notes, setNotes] = useState('');
  
  // Update end time when duration changes
  const handleDurationChange = (durationHours: number) => {
    if (startTime) {
      const startMinutes = timeToMinutes(startTime);
      const durationMinutes = Math.round(durationHours * 60);
      const newEndMinutes = startMinutes + durationMinutes;
      const newEndTime = minutesToTime(newEndMinutes);
      setEndTime(newEndTime);
    }
  };
  
  const handleSave = async () => {
    const result = await addActivity({
      type,
      date,
      startTime,
      endTime,
      prePostValue,
      notes,
    });
    
    if (result.success) {
      router.back();
    } else {
      Alert.alert('Error', result.message || 'Failed to add activity');
    }
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Add Activity',
          headerBackTitle: 'Cancel',
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Date:</Text>
            <View style={styles.dateSelector}>
              <DateSelector
                selectedDate={date}
                onDateChange={setDate}
              />
            </View>
          </View>
          
          <ActivityTypeSelector
            selectedType={type}
            onTypeChange={setType}
          />
          
          <View style={styles.timeContainer}>
            <TimeInput
              label="Start Time"
              value={startTime}
              onChangeText={setStartTime}
            />
            
            <TimeInput
              label="End Time"
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>
          
          <DurationInput
            startTime={startTime}
            endTime={endTime}
            onDurationChange={handleDurationChange}
          />
          
          <PrePostValueInput
            value={prePostValue}
            onChange={setPrePostValue}
            disabled={type !== 'Flight' && type !== 'SIM'}
          />
          
          <View style={styles.notesContainer}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional information here..."
              numberOfLines={1}
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Activity</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    color: COLORS.black,
  },
  dateSelector: {
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  notesContainer: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.black,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    height: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: COLORS.black,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});