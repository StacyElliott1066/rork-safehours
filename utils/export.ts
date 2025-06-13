import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { Activity } from '@/types/activity';
import { parseICSToActivities } from '@/utils/ical';

// Import activities from iCalendar file
export const importActivitiesFromICS = async (): Promise<Activity[] | null> => {
  try {
    // Pick a document
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/calendar', 'application/octet-stream'],
      copyToCacheDirectory: true,
    });
    
    // Check if user cancelled
    if (result.canceled) {
      return null;
    }
    
    // Get the file URI
    const fileUri = result.assets[0].uri;
    
    // Read the file content
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    // Parse the iCal content to activities
    const activities = parseICSToActivities(fileContent);
    
    return activities;
  } catch (error) {
    console.error('Error importing activities from iCalendar:', error);
    throw error;
  }
};