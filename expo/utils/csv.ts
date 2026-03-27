import { Activity } from '@/types/activity';
import { File, Paths } from 'expo-file-system';
import { Platform, Alert, Share } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

// Convert activities to CSV string
export const activitiesToCSV = (activities: Activity[]): string => {
  // CSV header
  const header = 'id,type,date,startTime,endTime,prePostValue,notes';
  
  // Convert each activity to CSV row
  const rows = activities.map(activity => {
    const { id, type, date, startTime, endTime, prePostValue, notes = '' } = activity;
    // Escape notes to handle commas and quotes
    const escapedNotes = notes ? `"${notes.replace(/"/g, '""')}"` : '';
    return `${id},${type},${date},${startTime},${endTime},${prePostValue},${escapedNotes}`;
  }).join('\n');
  
  return header + '\n' + rows;
};

// Export activities to CSV file
export const exportActivities = async (activities: Activity[]): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // Web implementation
      const csv = activitiesToCSV(activities);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `safehours_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } else {
      // Native implementation
      const csv = activitiesToCSV(activities);
      const file = new File(Paths.cache, `safehours_export_${new Date().toISOString().split('T')[0]}.csv`);
      file.write(csv);
      
      try {
        // Try to share the file
        await Share.share({
          url: file.uri,
          title: 'SafeHours Export',
          message: 'Here is your SafeHours data export'
        });
      } catch (shareError) {
        console.log('Share error:', shareError);
        // If sharing fails, just inform the user where the file is saved
        Alert.alert(
          'File Saved',
          `Your data has been exported to:\n${file.uri}\n\nYou can access this file using the Files app.`
        );
      }
      
      return true;
    }
  } catch (error) {
    console.error('Error exporting activities:', error);
    return false;
  }
};

// Parse CSV string to activities
export const parseCSV = (csvString: string): Activity[] => {
  const lines = csvString.split('\n');
  const header = lines[0].split(',');
  
  // Validate header
  const requiredFields = ['type', 'date', 'startTime', 'endTime', 'prePostValue'];
  const isValidHeader = requiredFields.every(field => header.includes(field));
  
  if (!isValidHeader) {
    throw new Error('Invalid CSV format: missing required fields');
  }
  
  const activities: Activity[] = [];
  
  // Parse each line (skip header)
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    // Handle quoted fields (for notes with commas)
    let fields: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    fields.push(currentField); // Add the last field
    
    // Create activity object
    const prePostValue = Number(fields[header.indexOf('prePostValue')]) || 0;
    const activity: Activity = {
      // Use existing ID if present, otherwise generate a new one
      id: header.includes('id') && fields[header.indexOf('id')] ? 
          fields[header.indexOf('id')] : 
          `import-${Date.now()}-${i}`,
      type: fields[header.indexOf('type')] as any,
      date: fields[header.indexOf('date')],
      startTime: fields[header.indexOf('startTime')],
      endTime: fields[header.indexOf('endTime')],
      preValue: prePostValue / 2,
      postValue: prePostValue / 2,
      prePostValue: prePostValue,
    };
    
    // Add notes if present
    const notesIndex = header.indexOf('notes');
    if (notesIndex !== -1 && fields[notesIndex]) {
      activity.notes = fields[notesIndex];
    }
    
    activities.push(activity);
  }
  
  return activities;
};

// Import activities from CSV file
export const importActivities = async (): Promise<Activity[] | null> => {
  try {
    if (Platform.OS === 'web') {
      // Web implementation
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) {
            resolve(null);
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const csvString = event.target?.result as string;
              const activities = parseCSV(csvString);
              resolve(activities);
            } catch (error) {
              reject(error);
            }
          };
          
          reader.onerror = () => {
            reject(new Error('Failed to read file'));
          };
          
          reader.readAsText(file);
        };
        
        input.click();
      });
    } else {
      // Native implementation using expo-document-picker
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'text/csv',
          copyToCacheDirectory: true
        });
        
        if (result.canceled) {
          return null;
        }
        
        const fileUri = result.assets[0].uri;
        let csvString;
        
        try {
          // Try to read the file with new FileSystem API
          const file = new File(fileUri);
          csvString = await file.text();
        } catch (fsError) {
          console.error('Error reading file with FileSystem:', fsError);
          
          // Fallback to fetch API
          try {
            const response = await fetch(fileUri);
            csvString = await response.text();
          } catch (fetchError) {
            console.error('Error reading file with fetch:', fetchError);
            throw new Error('Could not read file content');
          }
        }
        
        return parseCSV(csvString);
      } catch (error) {
        console.error('Error picking document:', error);
        Alert.alert('Error', 'Failed to read CSV file');
        return null;
      }
    }
  } catch (error) {
    console.error('Error importing activities:', error);
    return null;
  }
};