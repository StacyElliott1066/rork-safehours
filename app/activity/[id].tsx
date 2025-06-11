import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useActivityStore } from '@/store/activityStore';
import ActivityTypeSelector from '@/components/ActivityTypeSelector';
import TimeInput from '@/components/TimeInput';
import DurationInput from '@/components/DurationInput';
import PrePostValueInput from '@/components/PrePostValueInput';
import DateSelector from '@/components/DateSelector';
import { COLORS } from '@/constants/colors';
import { timeToMinutes, minutesToTime, getCurrentDate } from '@/utils/time';
import { ActivityType } from '@/types/activity';

export default function EditActivityScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { activities, updateActivity, deleteActivity } = useActivityStore();
  
  const [type, setType] = useState<ActivityType>('Flight');
  const [date, setDate] = useState(getCurrentDate()); // Initialize with current date as fallback
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [prePostValue, setPrePostValue] = useState(0);
  const [notes, setNotes] = useState('');
  const [activityFound, setActivityFound] = useState(false);
  
  // Find the activity by ID
  useEffect(() => {
    if (!id || typeof id !== 'string') {
      Alert.alert('Error', 'Activity ID is missing or invalid');
      router.back();
      return;
    }

    const activity = activities.find(a => a.id === id);
    if (activity) {
      try {
        setType(activity.type || 'Flight');
        
        // Validate date before setting it
        if (activity.date && typeof activity.date === 'string' && activity.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          setDate(activity.date);
        } else {
          console.warn(`Invalid date format in activity: ${activity.date || 'undefined'}, using current date instead`);
          setDate(getCurrentDate());
        }
        
        setStartTime(activity.startTime || '');
        setEndTime(activity.endTime || '');
        setPrePostValue(activity.prePostValue || 0);
        setNotes(activity.notes || '');
        setActivityFound(true);
      } catch (error) {
        console.error("Error setting activity data:", error);
        Alert.alert('Error', 'Failed to load activity data');
        router.back();
      }
    } else {
      Alert.alert('Error', 'Activity not found');
      router.back();
    }
  }, [id, activities, router]);
  
  // Update end time when duration changes
  const handleDurationChange = (durationHours: number) => {
    if (startTime) {
      try {
        const startMinutes = timeToMinutes(startTime);
        const durationMinutes = Math.round(durationHours * 60);
        const newEndMinutes = startMinutes + durationMinutes;
        const newEndTime = minutesToTime(newEndMinutes);
        setEndTime(newEndTime);
      } catch (error) {
        console.error("Error updating end time from duration:", error);
      }
    }
  };
  
  const handleSave = async () => {
    if (!activityFound) {
      Alert.alert('Error', 'Activity data not loaded properly');
      return;
    }
    
    if (!startTime || !endTime) {
      Alert.alert('Error', 'Start time and end time are required');
      return;
    }
    
    if (!date || typeof date !== 'string' || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Error', 'Invalid date format');
      return;
    }
    
    if (!id || typeof id !== 'string') {
      Alert.alert('Error', 'Activity ID is missing or invalid');
      return;
    }
    
    const activity = activities.find(a => a.id === id);
    if (activity) {
      const result = await updateActivity({
        ...activity,
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
        Alert.alert('Error', result.message || 'Failed to update activity');
      }
    }
  };
  
  const handleDelete = () => {
    if (!id || typeof id !== 'string') {
      Alert.alert('Error', 'Activity ID is missing or invalid');
      return;
    }
    
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            deleteActivity(id);
            router.back();
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Edit Activity',
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
              selectTextOnFocus={true}
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
        
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
          <Text style={styles.saveButtonText}>Save</Text>
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
    marginHorizontal: 4,
  },
  deleteButton: {
    backgroundColor: COLORS.red,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
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