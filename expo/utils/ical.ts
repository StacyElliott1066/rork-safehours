import { Activity } from '@/types/activity';
import { formatDateToYYYYMMDD } from '@/utils/time';

// Generate a unique identifier for iCal events
const generateUID = (): string => {
  return 'safehours-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
};

// Format date to iCal format (YYYYMMDDTHHMMSSZ)
const formatDateTimeToICS = (dateString: string, timeString: string): string => {
  try {
    // Parse the date and time
    const [year, month, day] = dateString.split('-').map(Number);
    const [hour, minute] = timeString.split(':').map(Number);
    
    // Create a date object (use noon to avoid timezone issues)
    const date = new Date(year, month - 1, day, hour, minute, 0);
    
    // Format to iCal format
    const formattedDate = date.getUTCFullYear().toString() +
      (date.getUTCMonth() + 1).toString().padStart(2, '0') +
      date.getUTCDate().toString().padStart(2, '0') + 'T' +
      date.getUTCHours().toString().padStart(2, '0') +
      date.getUTCMinutes().toString().padStart(2, '0') +
      date.getUTCSeconds().toString().padStart(2, '0') + 'Z';
    
    return formattedDate;
  } catch (error) {
    console.error('Error formatting date for iCal:', error);
    // Return a fallback date if there's an error
    return '19700101T000000Z';
  }
};

// Escape special characters in iCal text
const escapeICalText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

// Unescape special characters in iCal text
const unescapeICalText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
};

// Convert a single activity to iCal VEVENT format
const activityToVEVENT = (activity: Activity): string => {
  const { type, date, startTime, endTime, notes, prePostValue } = activity;
  
  // Calculate pre/post time adjustments (in minutes)
  const prePostMinutes = ['Flight', 'SIM'].includes(type) ? (prePostValue || 0) * 60 : 0;
  const preMinutes = prePostMinutes / 2;
  const postMinutes = prePostMinutes / 2;
  
  // Parse start time and adjust for pre-briefing
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const startDate = new Date(date);
  startDate.setHours(startHour, startMinute, 0);
  startDate.setMinutes(startDate.getMinutes() - preMinutes);
  
  // Parse end time and adjust for post-briefing
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const endDate = new Date(date);
  endDate.setHours(endHour, endMinute, 0);
  endDate.setMinutes(endDate.getMinutes() + postMinutes);
  
  // Handle overnight activities
  if (endDate < startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }
  
  // Format dates for iCal
  const dtstart = formatDateTimeToICS(
    formatDateToYYYYMMDD(startDate),
    `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`
  );
  
  const dtend = formatDateTimeToICS(
    formatDateToYYYYMMDD(endDate),
    `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
  );
  
  // Create summary and description
  const summary = `SafeHours: ${type} Activity`;
  const description = `Type: ${type}
${(prePostValue || 0) > 0 ? `Pre/Post Value: ${prePostValue} hours` : ''}
${notes ? `Notes: ${notes}` : ''}`;
  
  // Generate VEVENT
  return `BEGIN:VEVENT
UID:${generateUID()}
DTSTAMP:${formatDateTimeToICS(formatDateToYYYYMMDD(new Date()), getCurrentTime())}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${escapeICalText(summary)}
DESCRIPTION:${escapeICalText(description)}
END:VEVENT`;
};

// Get current time in HH:MM format
const getCurrentTime = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Convert activities to iCal format
export const activitiesToICS = (activities: Activity[]): string => {
  // Start with iCal header
  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SafeHours//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:SafeHours Activities
X-WR-TIMEZONE:UTC
`;

  // Add each activity as a VEVENT
  activities.forEach(activity => {
    icsContent += `${activityToVEVENT(activity)}
`;
  });

  // Add iCal footer
  icsContent += 'END:VCALENDAR';

  return icsContent;
};

// Parse iCal date format (YYYYMMDDTHHMMSSZ) to Date object
const parseICalDateTime = (icalDate: string): Date | null => {
  try {
    if (!icalDate) return null;
    
    // Handle different iCal date formats
    let year, month, day, hour = 0, minute = 0, second = 0;
    
    // Format: YYYYMMDDTHHMMSSZ
    if (icalDate.includes('T') && icalDate.endsWith('Z')) {
      const datePart = icalDate.split('T')[0];
      const timePart = icalDate.split('T')[1].replace('Z', '');
      
      year = parseInt(datePart.substring(0, 4), 10);
      month = parseInt(datePart.substring(4, 6), 10) - 1; // JS months are 0-based
      day = parseInt(datePart.substring(6, 8), 10);
      
      if (timePart.length >= 4) {
        hour = parseInt(timePart.substring(0, 2), 10);
        minute = parseInt(timePart.substring(2, 4), 10);
        if (timePart.length >= 6) {
          second = parseInt(timePart.substring(4, 6), 10);
        }
      }
      
      // Create UTC date and convert to local
      const utcDate = new Date(Date.UTC(year, month, day, hour, minute, second));
      return utcDate;
    }
    
    // Format: YYYYMMDD
    else if (icalDate.length === 8) {
      year = parseInt(icalDate.substring(0, 4), 10);
      month = parseInt(icalDate.substring(4, 6), 10) - 1;
      day = parseInt(icalDate.substring(6, 8), 10);
      
      return new Date(year, month, day, 12, 0, 0); // Noon to avoid timezone issues
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing iCal date:', error);
    return null;
  }
};

// Extract property value from an iCal line
const extractPropertyValue = (line: string): string => {
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return '';
  return line.substring(colonIndex + 1).trim();
};

// Parse a VEVENT block to an Activity object
const parseVEVENT = (veventBlock: string): Activity | null => {
  try {
    const lines = veventBlock.split('\n').map(line => line.trim()).filter(line => line);
    
    // Extract key properties
    let dtstart: Date | null = null;
    let dtend: Date | null = null;
    let summary = '';
    let description = '';
    
    for (const line of lines) {
      if (line.startsWith('DTSTART:')) {
        dtstart = parseICalDateTime(extractPropertyValue(line));
      } else if (line.startsWith('DTEND:')) {
        dtend = parseICalDateTime(extractPropertyValue(line));
      } else if (line.startsWith('SUMMARY:')) {
        summary = unescapeICalText(extractPropertyValue(line));
      } else if (line.startsWith('DESCRIPTION:')) {
        description = unescapeICalText(extractPropertyValue(line));
      }
    }
    
    if (!dtstart || !dtend) {
      console.error('Missing start or end time in iCal event');
      return null;
    }
    
    // Default activity type
    let activityType: 'Flight' | 'Ground' | 'SIM' | 'Other Internal' | 'Other External' = 'Other Internal';
    let prePostValue = 0;
    let notes = '';
    
    // Try to extract activity type from summary or description
    if (summary.includes('Flight')) {
      activityType = 'Flight';
    } else if (summary.includes('SIM')) {
      activityType = 'SIM';
    } else if (summary.includes('Ground')) {
      activityType = 'Ground';
    }
    
    // Parse description for more details
    if (description) {
      // Look for type information
      const typeMatch = description.match(/Type:\s*(.+?)(?:\n|$)/i);
      if (typeMatch) {
        const matchedType = typeMatch[1].trim();
        if (['Flight', 'Ground', 'SIM', 'Other Internal', 'Other External'].includes(matchedType)) {
          activityType = matchedType as any;
        }
      }
      
      // Look for pre/post value
      const prePostMatch = description.match(/Pre\/Post Value:\s*(\d+(\.\d+)?)\s*hours/i);
      if (prePostMatch) {
        prePostValue = parseFloat(prePostMatch[1]);
      }
      
      // Look for notes
      const notesMatch = description.match(/Notes:\s*(.*?)(\n|$)/is);
      if (notesMatch) {
        notes = notesMatch[1].trim();
      }
    }
    
    // Format date and times
    const date = formatDateToYYYYMMDD(dtstart);
    const startTime = `${dtstart.getHours().toString().padStart(2, '0')}:${dtstart.getMinutes().toString().padStart(2, '0')}`;
    const endTime = `${dtend.getHours().toString().padStart(2, '0')}:${dtend.getMinutes().toString().padStart(2, '0')}`;
    
    // Create activity object
    return {
      id: generateUID(),
      type: activityType,
      date,
      startTime,
      endTime,
      preValue: prePostValue / 2,
      postValue: prePostValue / 2,
      prePostValue,
      notes: notes || undefined
    };
  } catch (error) {
    console.error('Error parsing VEVENT:', error);
    return null;
  }
};

// Parse iCal content to Activity objects
export const parseICSToActivities = (icsContent: string): Activity[] => {
  try {
    if (!icsContent) return [];
    
    const activities: Activity[] = [];
    
    // Split the content into VEVENT blocks
    const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
    let match;
    
    while ((match = veventRegex.exec(icsContent)) !== null) {
      const veventBlock = match[0];
      const activity = parseVEVENT(veventBlock);
      
      if (activity) {
        activities.push(activity);
      }
    }
    
    return activities;
  } catch (error) {
    console.error('Error parsing iCal content:', error);
    return [];
  }
};