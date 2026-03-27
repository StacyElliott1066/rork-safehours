import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useActivityStore } from '@/store/activityStore';
import ActivityTypeSelector from '@/components/ActivityTypeSelector';
import TimeInput from '@/components/TimeInput';
import DurationInput from '@/components/DurationInput';
import PrePostSeparateInput from '@/components/PrePostSeparateInput';
import DateSelector from '@/components/DateSelector';
import MidnightConfirmationModal from '@/components/MidnightConfirmationModal';
import { COLORS } from '@/constants/colors';
import { getCurrentDate, getCurrentTime, timeToMinutes, minutesToTime, calculateDuration } from '@/utils/time';
import { ActivityType } from '@/types/activity';

export default function NewActivityScreen() {
  const router = useRouter();
  const { selectedDate, addActivity } = useActivityStore();
  
  const [type, setType] = useState<ActivityType>('Flight');
  const [date, setDate] = useState(selectedDate || getCurrentDate());
  const [startTime, setStartTime] = useState(getCurrentTime());
  const [endTime, setEndTime] = useState(getCurrentTime());
  const [preValue, setPreValue] = useState(0);
  const [postValue, setPostValue] = useState(0);
  const [notes, setNotes] = useState('');
  const [showMidnightConfirmation, setShowMidnightConfirmation] = useState(false);
  const [pendingEndTime, setPendingEndTime] = useState('');
  const [fieldTimestamps, setFieldTimestamps] = useState<{
    start: number;
    end: number;
    duration: number;
  }>({ start: Date.now(), end: 0, duration: 0 });
  
  // Check if end time crosses midnight
  const checkMidnightCrossing = (start: string, end: string): boolean => {
    if (!start || !end) return false;
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    return endMinutes < startMinutes;
  };

  // Get the two most recently updated fields
  const getTwoMostRecentFields = (timestamps: typeof fieldTimestamps): [string, string] => {
    const entries = Object.entries(timestamps).sort((a, b) => b[1] - a[1]);
    return [entries[0][0], entries[1][0]];
  };

  // Handle start time change with midnight confirmation
  const handleStartTimeChange = (newStartTime: string) => {
    const newTimestamps = { ...fieldTimestamps, start: Date.now() };
    setFieldTimestamps(newTimestamps);
    
    const [mostRecent, secondMostRecent] = getTwoMostRecentFields(newTimestamps);
    
    // If start and duration are the two most recent, recalculate end time
    if ((mostRecent === 'start' && secondMostRecent === 'duration') || 
        (mostRecent === 'duration' && secondMostRecent === 'start')) {
      if (endTime) {
        try {
          const currentDuration = calculateDuration(startTime, endTime);
          const startMinutes = timeToMinutes(newStartTime);
          const newEndMinutes = startMinutes + currentDuration;
          const newEndTime = minutesToTime(newEndMinutes);
          
          if (checkMidnightCrossing(newStartTime, newEndTime)) {
            setStartTime(newStartTime);
            setPendingEndTime(newEndTime);
            setShowMidnightConfirmation(true);
          } else {
            setStartTime(newStartTime);
            setEndTime(newEndTime);
          }
        } catch (error) {
          console.error("Error adjusting end time from start time change:", error);
          setStartTime(newStartTime);
        }
      } else {
        setStartTime(newStartTime);
      }
    } else {
      // Normal behavior - just update start time
      if (endTime && checkMidnightCrossing(newStartTime, endTime)) {
        setStartTime(newStartTime);
        setPendingEndTime(endTime);
        setShowMidnightConfirmation(true);
      } else {
        setStartTime(newStartTime);
      }
    }
  };

  // Handle end time change with midnight confirmation
  const handleEndTimeChange = (newEndTime: string) => {
    const newTimestamps = { ...fieldTimestamps, end: Date.now() };
    setFieldTimestamps(newTimestamps);
    
    const [mostRecent, secondMostRecent] = getTwoMostRecentFields(newTimestamps);
    
    // If end and duration are the two most recent, recalculate start time
    if ((mostRecent === 'end' && secondMostRecent === 'duration') || 
        (mostRecent === 'duration' && secondMostRecent === 'end')) {
      if (startTime) {
        try {
          const currentDuration = calculateDuration(startTime, endTime);
          const endMinutes = timeToMinutes(newEndTime);
          const newStartMinutes = endMinutes - currentDuration;
          const newStartTime = minutesToTime(newStartMinutes);
          
          if (checkMidnightCrossing(newStartTime, newEndTime)) {
            setStartTime(newStartTime);
            setPendingEndTime(newEndTime);
            setShowMidnightConfirmation(true);
          } else {
            setStartTime(newStartTime);
            setEndTime(newEndTime);
          }
        } catch (error) {
          console.error("Error adjusting start time from end time change:", error);
          setEndTime(newEndTime);
        }
      } else {
        setEndTime(newEndTime);
      }
    } else {
      // Normal behavior - just update end time
      if (startTime && checkMidnightCrossing(startTime, newEndTime)) {
        setPendingEndTime(newEndTime);
        setShowMidnightConfirmation(true);
      } else {
        setEndTime(newEndTime);
      }
    }
  };

  // Confirm midnight crossing
  const confirmMidnightCrossing = () => {
    setEndTime(pendingEndTime);
    setShowMidnightConfirmation(false);
    setPendingEndTime('');
  };

  // Cancel midnight crossing
  const cancelMidnightCrossing = () => {
    setShowMidnightConfirmation(false);
    setPendingEndTime('');
  };

  // Update times when duration changes based on two most recent fields
  const handleDurationChange = (durationHours: number) => {
    const newTimestamps = { ...fieldTimestamps, duration: Date.now() };
    setFieldTimestamps(newTimestamps);
    
    const [mostRecent, secondMostRecent] = getTwoMostRecentFields(newTimestamps);
    
    // If duration and start are the two most recent, recalculate end time
    if ((mostRecent === 'duration' && secondMostRecent === 'start') || 
        (mostRecent === 'start' && secondMostRecent === 'duration')) {
      if (startTime) {
        try {
          const startMinutes = timeToMinutes(startTime);
          const durationMinutes = Math.round(durationHours * 60);
          const newEndMinutes = startMinutes + durationMinutes;
          const newEndTime = minutesToTime(newEndMinutes);
          
          if (checkMidnightCrossing(startTime, newEndTime)) {
            setPendingEndTime(newEndTime);
            setShowMidnightConfirmation(true);
          } else {
            setEndTime(newEndTime);
          }
        } catch (error) {
          console.error("Error updating end time from duration:", error);
        }
      }
    }
    // If duration and end are the two most recent, recalculate start time
    else if ((mostRecent === 'duration' && secondMostRecent === 'end') || 
             (mostRecent === 'end' && secondMostRecent === 'duration')) {
      if (endTime) {
        try {
          const endMinutes = timeToMinutes(endTime);
          const durationMinutes = Math.round(durationHours * 60);
          const newStartMinutes = endMinutes - durationMinutes;
          const newStartTime = minutesToTime(newStartMinutes);
          
          if (checkMidnightCrossing(newStartTime, endTime)) {
            setStartTime(newStartTime);
            setPendingEndTime(endTime);
            setShowMidnightConfirmation(true);
          } else {
            setStartTime(newStartTime);
          }
        } catch (error) {
          console.error("Error updating start time from duration:", error);
        }
      }
    }
    // Default behavior - adjust end time based on start time
    else {
      if (startTime) {
        try {
          const startMinutes = timeToMinutes(startTime);
          const durationMinutes = Math.round(durationHours * 60);
          const newEndMinutes = startMinutes + durationMinutes;
          const newEndTime = minutesToTime(newEndMinutes);
          
          if (checkMidnightCrossing(startTime, newEndTime)) {
            setPendingEndTime(newEndTime);
            setShowMidnightConfirmation(true);
          } else {
            setEndTime(newEndTime);
          }
        } catch (error) {
          console.error("Error updating end time from duration:", error);
        }
      }
    }
  };
  
  const handleSave = async () => {
    if (!startTime || !endTime) {
      Alert.alert('Error', 'Start time and end time are required');
      return;
    }
    
    // Ensure date is in YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!date || typeof date !== 'string' || !dateRegex.test(date)) {
      Alert.alert('Error', 'Invalid date format');
      return;
    }
    
    const result = await addActivity({
      type,
      date,
      startTime,
      endTime,
      preValue,
      postValue,
      prePostValue: preValue + postValue, // For backward compatibility
      notes,
    });
    
    if (result.success) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } else {
      Alert.alert('Error', result.message || 'Failed to add activity');
    }
  };
  
  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
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
              onChangeText={handleStartTimeChange}
              onFocus={() => setFieldTimestamps(prev => ({ ...prev, start: Date.now() }))}
            />
            
            <TimeInput
              label="End Time"
              value={endTime}
              onChangeText={handleEndTimeChange}
              onFocus={() => setFieldTimestamps(prev => ({ ...prev, end: Date.now() }))}
            />
          </View>
          
          <DurationInput
            startTime={startTime}
            endTime={endTime}
            onDurationChange={handleDurationChange}
            onFocus={() => setFieldTimestamps(prev => ({ ...prev, duration: Date.now() }))}
          />
          
          <PrePostSeparateInput
            preValue={preValue}
            postValue={postValue}
            onPreChange={setPreValue}
            onPostChange={setPostValue}
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
              selectTextOnFocus={true}
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

      <MidnightConfirmationModal
        visible={showMidnightConfirmation}
        onConfirm={confirmMidnightCrossing}
        onCancel={cancelMidnightCrossing}
        startTime={startTime}
        endTime={pendingEndTime}
        date={date}
      />
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