import { Activity } from '@/types/activity';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert, Share } from 'react-native';
import { activitiesToICS } from '@/utils/ical';

// Export activities to iCalendar (.ics) file
export const exportActivitiesToICS = async (activities: Activity[]): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // Web implementation
      const icsContent = activitiesToICS(activities);
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `safehours_calendar_${new Date().toISOString().split('T')[0]}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } else {
      // Native implementation
      const icsContent = activitiesToICS(activities);
      const fileUri = `${FileSystem.documentDirectory}safehours_calendar_${new Date().toISOString().split('T')[0]}.ics`;
      await FileSystem.writeAsStringAsync(fileUri, icsContent);
      
      try {
        // Try to share the file
        await Share.share({
          url: fileUri,
          title: 'SafeHours Calendar',
          message: 'Here is your SafeHours calendar export'
        });
      } catch (shareError) {
        console.log('Share error:', shareError);
        // If sharing fails, just inform the user where the file is saved
        Alert.alert(
          'File Saved',
          `Your calendar has been exported to:
${fileUri}

You can access this file using the Files app and import it into your calendar application.`
        );
      }
      
      return true;
    }
  } catch (error) {
    console.error('Error exporting activities to iCalendar:', error);
    return false;
  }
};