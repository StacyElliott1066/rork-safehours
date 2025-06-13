import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { Activity } from '@/types/activity';
import { parseICSToActivities } from '@/utils/ical';
import { calculateDuration } from '@/utils/time';

// Export activities to iCalendar format
export const exportActivitiesToICS = async (activities: Activity[]): Promise<boolean> => {
  try {
    if (activities.length === 0) {
      return false;
    }
    
    // Generate iCalendar content
    let icsContent = 'BEGIN:VCALENDAR\r\n';
    icsContent += 'VERSION:2.0\r\n';
    icsContent += 'PRODID:-//SafeHours//EN\r\n';
    
    // Add each activity as an event
    activities.forEach(activity => {
      const startDate = new Date(activity.date);
      if (activity.startTime) {
        const [startHours, startMinutes] = activity.startTime.split(':').map(Number);
        startDate.setHours(startHours, startMinutes);
      }
      
      const endDate = new Date(startDate);
      if (activity.endTime) {
        const [endHours, endMinutes] = activity.endTime.split(':').map(Number);
        endDate.setHours(endHours, endMinutes);
      } else {
        // Calculate duration from start and end time
        const durationMinutes = calculateDuration(activity.startTime, activity.endTime);
        // If no end time but we have duration
        if (durationMinutes > 0) {
          endDate.setMinutes(endDate.getMinutes() + durationMinutes);
        } else {
          // Default to 1 hour if no end time or duration
          endDate.setHours(endDate.getHours() + 1);
        }
      }
      
      // Format dates for iCal
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      icsContent += 'BEGIN:VEVENT\r\n';
      icsContent += `SUMMARY:${activity.type}\r\n`;
      icsContent += `DTSTART:${formatDate(startDate)}\r\n`;
      icsContent += `DTEND:${formatDate(endDate)}\r\n`;
      icsContent += `DESCRIPTION:Pre/Post Value: ${activity.prePostValue || 'N/A'}\r\n`;
      icsContent += `UID:${activity.id}@safehours.app\r\n`;
      icsContent += 'END:VEVENT\r\n';
    });
    
    icsContent += 'END:VCALENDAR\r\n';
    
    // Save to a temporary file
    const fileUri = `${FileSystem.cacheDirectory}activities.ics`;
    await FileSystem.writeAsStringAsync(fileUri, icsContent);
    
    if (Platform.OS === 'web') {
      // For web, create a download link
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'safehours_activities.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } else {
      // For mobile, use FileSystem sharing
      await FileSystem.shareAsync(fileUri, {
        mimeType: 'text/calendar',
        dialogTitle: 'Export Activities',
        UTI: 'public.calendar'
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