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
import { timeToMinutes, minutesToTime } from '@/utils/time';
import { ActivityType } from '@/types/activity';

export default function EditActivityScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { activities, updateActivity, deleteActivity } = useActivityStore();
  
  const [type, setType] = useState<ActivityType>('Flight');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [prePostValue, setPrePostValue] = useState(0);
  const [notes, setNotes] = useState('');
  
  // Find the activity by ID
  useEffect(() => {
    const activity = activities.find(a => a.id === id);
    if (activity) {
      setType(activity.type);
      setDate(activity.date);
      setStartTime(activity.startTime);
      setEndTime(activity.endTime);
      setPrePostValue(activity.prePostValue);
      setNotes(activity.notes || '');
    } else {
      Alert.alert('Error', 'Activity not found');
      router.back();
    }
  }, [id, activities]);
  
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
            deleteActivity(id as string);
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