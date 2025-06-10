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

// Convert a single activity to iCal VEVENT format
const activityToVEVENT = (activity: Activity): string => {
  const { type, date, startTime, endTime, notes, prePostValue } = activity;
  
  // Calculate pre/post time adjustments (in minutes)
  const prePostMinutes = ['Flight', 'SIM'].includes(type) ? prePostValue * 60 : 0;
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
${prePostValue > 0 ? `Pre/Post Value: ${prePostValue} hours` : ''}
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
    icsContent += `${activityToVEVENT(activity)}\n`;
  });

  // Add iCal footer
  icsContent += 'END:VCALENDAR';

  return icsContent;
};