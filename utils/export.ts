import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { Activity } from '@/types/activity';
import { activitiesToICS, parseICSToActivities } from '@/utils/ical';

// Export activities to iCalendar format
export const exportActivitiesToICS = async (activities: Activity[]): Promise<boolean> => {
  try {
    // Check if sharing is available
    if (!(await Sharing.isAvailableAsync()) && Platform.OS !== 'web') {
      console.error('Sharing is not available on this device');
      return false;
    }
    
    // Generate iCal content
    const icsContent = activitiesToICS(activities);
    
    // Create a temporary file
    const fileUri = `${FileSystem.cacheDirectory}safehours_activities_${Date.now()}.ics`;
    
    // Write the content to the file
    await FileSystem.writeAsStringAsync(fileUri, icsContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    // Share the file
    if (Platform.OS === 'web') {
      // For web, create a download link
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'safehours_activities.ics';
      link.click();
      URL.revokeObjectURL(url);
      return true;
    } else {
      // For mobile, use Sharing API
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/calendar',
        dialogTitle: 'Export SafeHours Activities',
        UTI: 'public.calendar',
      });
      return true;
    }
  } catch (error) {
    console.error('Error exporting activities to iCalendar:', error);
    return false;
  }
};

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