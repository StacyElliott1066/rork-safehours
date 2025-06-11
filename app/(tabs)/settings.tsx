import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Switch, Platform } from 'react-native';
import { Stack, Link, useRouter } from 'expo-router';
import { useActivityStore } from '@/store/activityStore';
import { COLORS } from '@/constants/colors';
import { exportActivitiesToICS } from '@/utils/export';
import { Share } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { activities, clearAllActivities } = useActivityStore();
  
  const handleExportToICS = async () => {
    if (activities.length === 0) {
      Alert.alert('No Data', 'There are no activities to export.');
      return;
    }
    
    try {
      const success = await exportActivitiesToICS(activities);
      if (success) {
        if (Platform.OS === 'web') {
          Alert.alert('Export Successful', 'Your calendar has been downloaded.');
        }
      } else {
        Alert.alert('Export Failed', 'There was an error exporting your calendar.');
      }
    } catch (error) {
      console.error('Error in export handler:', error);
      Alert.alert('Export Error', 'An unexpected error occurred during export.');
    }
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
          <Text style={styles.sectionTitle}>Export</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleExportToICS}
          >
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Export to Calendar</Text>
              <Text style={styles.settingDescription}>
                Export your activities as an iCalendar (.ics) file
              </Text>
            </View>
            <Share color={COLORS.primary} size={20} />
          </TouchableOpacity>
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