import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Switch, Platform } from 'react-native';
import { Stack, Link, useRouter } from 'expo-router';
import { useActivityStore } from '@/store/activityStore';
import { COLORS } from '@/constants/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const { 
    activities, 
    clearAllActivities, 
    warningThresholds, 
    updateWarningThresholds, 
    resetWarningThresholds 
  } = useActivityStore();
  
  const [thresholds, setThresholds] = useState({
    maxFlightHours: warningThresholds.maxFlightHours.toString(),
    minRestBetweenDays: warningThresholds.minRestBetweenDays.toString(),
    maxContactTime: warningThresholds.maxContactTime.toString(),
    maxDutyDay: warningThresholds.maxDutyDay.toString(),
    maxConsecutiveDays: warningThresholds.maxConsecutiveDays.toString(),
    maxWeeklyHours: warningThresholds.maxWeeklyHours.toString(),
    maxPastSevenDaysHours: warningThresholds.maxPastSevenDaysHours.toString(),
  });
  
  const handleSave = () => {
    // Validate inputs
    const numericValues = {
      maxFlightHours: 8, // Always use 8 as this is an FAA mandatory limit
      minRestBetweenDays: parseFloat(thresholds.minRestBetweenDays),
      maxContactTime: parseFloat(thresholds.maxContactTime),
      maxDutyDay: parseFloat(thresholds.maxDutyDay),
      maxConsecutiveDays: parseInt(thresholds.maxConsecutiveDays, 10),
      maxWeeklyHours: parseFloat(thresholds.maxWeeklyHours),
      maxPastSevenDaysHours: parseFloat(thresholds.maxPastSevenDaysHours),
    };
    
    // Check for invalid values (excluding maxFlightHours which is fixed)
    if ([
      numericValues.minRestBetweenDays,
      numericValues.maxContactTime,
      numericValues.maxDutyDay,
      numericValues.maxConsecutiveDays,
      numericValues.maxWeeklyHours,
      numericValues.maxPastSevenDaysHours
    ].some(isNaN)) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for all thresholds.');
      return;
    }
    
    // Update thresholds
    updateWarningThresholds(numericValues);
    Alert.alert('Success', 'Warning thresholds updated successfully.');
  };
  
  const handleReset = () => {
    Alert.alert(
      'Reset Thresholds',
      'Are you sure you want to reset all warning thresholds to default values?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: () => {
            resetWarningThresholds();
            setThresholds({
              maxFlightHours: '8', // Always 8 (FAA mandatory)
              minRestBetweenDays: '10',
              maxContactTime: '10',
              maxDutyDay: '16',
              maxConsecutiveDays: '15',
              maxWeeklyHours: '40',
              maxPastSevenDaysHours: '50',
            });
            Alert.alert('Success', 'Warning thresholds reset to defaults.');
          },
        },
      ]
    );
  };
  
  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all activities? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All',
          onPress: () => {
            clearAllActivities();
            Alert.alert('Success', 'All activities have been deleted.');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Settings',
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Warning Thresholds</Text>
          
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Max Flight Instruction Hours <Text style={styles.labelSmall}>(24h)</Text>
                <Text style={styles.uneditableText}> uneditable</Text>
              </Text>
              <View style={styles.fixedValueContainer}>
                <Text style={styles.fixedValue}>8</Text>
              </View>
              <Text style={styles.unit}>hours</Text>
              <Text style={styles.faaNote}>FAA Limit</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Min Rest Between Days</Text>
              <TextInput
                style={styles.input}
                value={thresholds.minRestBetweenDays}
                onChangeText={(text) => setThresholds({ ...thresholds, minRestBetweenDays: text })}
                keyboardType="numeric"
                placeholder="10"
              />
              <Text style={styles.unit}>hours</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Max Contact Time</Text>
              <TextInput
                style={styles.input}
                value={thresholds.maxContactTime}
                onChangeText={(text) => setThresholds({ ...thresholds, maxContactTime: text })}
                keyboardType="numeric"
                placeholder="10"
              />
              <Text style={styles.unit}>hours</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Max Duty Day</Text>
              <TextInput
                style={styles.input}
                value={thresholds.maxDutyDay}
                onChangeText={(text) => setThresholds({ ...thresholds, maxDutyDay: text })}
                keyboardType="numeric"
                placeholder="16"
              />
              <Text style={styles.unit}>hours</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Max Consecutive Days</Text>
              <TextInput
                style={styles.input}
                value={thresholds.maxConsecutiveDays}
                onChangeText={(text) => setThresholds({ ...thresholds, maxConsecutiveDays: text })}
                keyboardType="numeric"
                placeholder="15"
              />
              <Text style={styles.unit}>days</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Max Weekly Hours</Text>
              <TextInput
                style={styles.input}
                value={thresholds.maxWeeklyHours}
                onChangeText={(text) => setThresholds({ ...thresholds, maxWeeklyHours: text })}
                keyboardType="numeric"
                placeholder="40"
              />
              <Text style={styles.unit}>hours</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Max Past 7 Days Hours</Text>
              <TextInput
                style={styles.input}
                value={thresholds.maxPastSevenDaysHours}
                onChangeText={(text) => setThresholds({ ...thresholds, maxPastSevenDaysHours: text })}
                keyboardType="numeric"
                placeholder="50"
              />
              <Text style={styles.unit}>hours</Text>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Reset to Defaults</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <Link href="/about" asChild>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>About SafeHours</Text>
                <Text style={styles.settingDescription}>
                  Version information and acknowledgments
                </Text>
              </View>
            </TouchableOpacity>
          </Link>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleClearAllData}
          >
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, styles.dangerText]}>Clear All Data</Text>
              <Text style={styles.settingDescription}>
                Delete all activities and reset the app
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  labelSmall: {
    fontSize: 14,
    fontWeight: '400',
  },
  uneditableText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.gray,
  },
  input: {
    width: 80,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 4,
    padding: 8,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  fixedValueContainer: {
    width: 80,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    padding: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  fixedValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
  },
  faaNote: {
    fontSize: 12,
    color: COLORS.red,
    fontWeight: 'bold',
    position: 'absolute',
    right: 0,
    bottom: -15,
  },
  unit: {
    width: 50,
    fontSize: 14,
    color: COLORS.gray,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  resetButtonText: {
    color: COLORS.black,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.gray,
  },
  dangerText: {
    color: COLORS.red,
  },
});