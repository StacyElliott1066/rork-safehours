import { Activity } from '@/types/activity';

// Parse user input time in various formats (100, 1:00, 1300, 13:00)
export const parseTimeInput = (input: string): string | null => {
  try {
    // Remove any non-numeric and non-colon characters
    const cleanInput = input.replace(/[^\d:]/g, '');
    
    if (!cleanInput) {
      return null;
    }
    
    // If input already has a colon, check if it's valid
    if (cleanInput.includes(':')) {
      const [hours, minutes] = cleanInput.split(':');
      
      // Validate hours and minutes
      const hoursNum = parseInt(hours, 10);
      const minutesNum = parseInt(minutes, 10);
      
      if (isNaN(hoursNum) || isNaN(minutesNum) || hoursNum > 23 || minutesNum > 59) {
        return null;
      }
      
      return `${hoursNum.toString().padStart(2, '0')}:${minutesNum.toString().padStart(2, '0')}`;
    }
    
    // Handle numeric-only input
    const inputLength = cleanInput.length;
    
    // Handle 1-2 digit input as hours only
    if (inputLength === 1 || inputLength === 2) {
      const hours = parseInt(cleanInput, 10);
      if (isNaN(hours) || hours > 23) {
        return null;
      }
      return `${hours.toString().padStart(2, '0')}:00`;
    }
    
    // Handle 3-4 digit input as hours and minutes
    if (inputLength === 3 || inputLength === 4) {
      let hours, minutes;
      
      if (inputLength === 3) {
        // Format: 130 -> 01:30
        hours = parseInt(cleanInput.substring(0, 1), 10);
        minutes = parseInt(cleanInput.substring(1), 10);
      } else {
        // Format: 1330 -> 13:30
        hours = parseInt(cleanInput.substring(0, 2), 10);
        minutes = parseInt(cleanInput.substring(2), 10);
      }
      
      if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) {
        return null;
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    return null;
  } catch (error) {
    console.error("Error parsing time input:", error);
    return null;
  }
};

// Convert HH:MM to minutes
export const timeToMinutes = (time: string): number => {
  try {
    if (!time || typeof time !== 'string') {
      console.error("Invalid time format:", time);
      return 0;
    }
    
    // Ensure the time format is valid (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(time)) {
      console.error("Time does not match expected format (HH:MM):", time);
      return 0;
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    
    // Validate hours and minutes
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.error("Invalid time components:", hours, minutes);
      return 0;
    }
    
    return hours * 60 + minutes;
  } catch (error) {
    console.error("Error converting time to minutes:", error);
    return 0;
  }
};

// Convert minutes to HH:MM
export const minutesToTime = (minutes: number): string => {
  try {
    if (isNaN(minutes) || minutes < 0) {
      console.error("Invalid minutes value:", minutes);
      return "00:00";
    }
    
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error("Error converting minutes to time:", error);
    return "00:00";
  }
};

// Calculate duration between two times in minutes
export const calculateDuration = (startTime: string, endTime: string): number => {
  try {
    // Validate time formats
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      console.error("Invalid time format for duration calculation:", startTime, endTime);
      return 0;
    }
    
    const startMinutes = timeToMinutes(startTime);
    let endMinutes = timeToMinutes(endTime);
    
    // Handle overnight activities
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60; // Add 24 hours
    }
    
    return endMinutes - startMinutes;
  } catch (error) {
    console.error("Error calculating duration:", error);
    return 0;
  }
};

// Format duration in minutes to hours and minutes
export const formatDuration = (minutes: number): string => {
  try {
    if (isNaN(minutes) || minutes < 0) {
      console.error("Invalid minutes for formatting:", minutes);
      return "0h 0m";
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  } catch (error) {
    console.error("Error formatting duration:", error);
    return "0h 0m";
  }
};

// Calculate total flight hours for a day
export const calculateFlightHours = (activities: Activity[], date: string): number => {
  try {
    if (!date || !Array.isArray(activities)) {
      return 0;
    }
    
    return activities
      .filter(activity => activity.date === date && activity.type === 'Flight')
      .reduce((total, activity) => {
        const duration = calculateDuration(activity.startTime, activity.endTime);
        return total + duration; // Only count actual flight time, not pre/post
      }, 0) / 60; // Convert to hours
  } catch (error) {
    console.error("Error calculating flight hours:", error);
    return 0;
  }
};

// Calculate total contact time for a day (all activities + pre/post)
export const calculateContactTime = (activities: Activity[], date: string): number => {
  try {
    if (!date || !Array.isArray(activities)) {
      return 0;
    }
    
    return activities
      .filter(activity => activity.date === date && activity.type !== 'Other')
      .reduce((total, activity) => {
        const duration = calculateDuration(activity.startTime, activity.endTime);
        // Calculate pre/post time using separate values or legacy combined value
        let prePostMinutes = 0;
        if (activity.preValue !== undefined && activity.postValue !== undefined) {
          prePostMinutes = ['Flight', 'SIM'].includes(activity.type) ? (activity.preValue + activity.postValue) * 60 : 0;
        } else if (activity.prePostValue !== undefined) {
          prePostMinutes = ['Flight', 'SIM'].includes(activity.type) ? activity.prePostValue * 60 : 0;
        }
        const prePost = prePostMinutes;
        return total + duration + prePost;
      }, 0) / 60; // Convert to hours
  } catch (error) {
    console.error("Error calculating contact time:", error);
    return 0;
  }
};

// Calculate rolling contact time in a 24-hour window
export const calculateRollingContactTime = (activities: Activity[], fromTime: Date): number => {
  try {
    if (!fromTime || !Array.isArray(activities)) {
      return 0;
    }
    
    if (!(fromTime instanceof Date) || isNaN(fromTime.getTime())) {
      console.error("Invalid fromTime:", fromTime);
      return 0;
    }
    
    // Create a copy of the date to avoid modifying the original
    const fromTimeCopy = new Date(fromTime.getTime());
    
    // Ensure we're using the exact time provided without timezone adjustments
    const twentyFourHoursAgo = new Date(fromTimeCopy.getTime() - (24 * 60 * 60 * 1000));
    
    let totalMinutes = 0;
    
    activities.forEach(activity => {
      if (activity.type === 'Other') return; // Skip 'Other' type activities
      
      try {
        // Validate date format
        if (!activity.date || !activity.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          console.error("Invalid activity date format:", activity.date);
          return;
        }
        
        // Parse the activity date with noon time to avoid timezone issues
        // Use the exact date string without timezone conversion
        const [year, month, day] = activity.date.split('-').map(Number);
        const activityDate = new Date(year, month - 1, day, 12, 0, 0);
        
        if (isNaN(activityDate.getTime())) {
          console.error("Invalid activity date:", activity.date);
          return;
        }
        
        const startDateTime = new Date(activityDate);
        const [startHours, startMinutes] = activity.startTime.split(':').map(Number);
        if (isNaN(startHours) || isNaN(startMinutes)) {
          console.error("Invalid start time:", activity.startTime);
          return;
        }
        startDateTime.setHours(startHours, startMinutes, 0, 0);
        
        const endDateTime = new Date(activityDate);
        const [endHours, endMinutes] = activity.endTime.split(':').map(Number);
        if (isNaN(endHours) || isNaN(endMinutes)) {
          console.error("Invalid end time:", activity.endTime);
          return;
        }
        endDateTime.setHours(endHours, endMinutes, 0, 0);
        
        // Handle overnight activities
        if (endDateTime < startDateTime) {
          endDateTime.setDate(endDateTime.getDate() + 1);
        }
        
        // Add pre/post time using separate values or legacy combined value
        let preMinutes, postMinutes;
        if (activity.preValue !== undefined && activity.postValue !== undefined) {
          preMinutes = ['Flight', 'SIM'].includes(activity.type) ? activity.preValue * 60 : 0;
          postMinutes = ['Flight', 'SIM'].includes(activity.type) ? activity.postValue * 60 : 0;
        } else if (activity.prePostValue !== undefined) {
          const prePostMinutes = ['Flight', 'SIM'].includes(activity.type) ? activity.prePostValue * 60 : 0;
          preMinutes = prePostMinutes / 2;
          postMinutes = prePostMinutes / 2;
        } else {
          preMinutes = 0;
          postMinutes = 0;
        }
        
        const adjustedStartDateTime = new Date(startDateTime.getTime() - (preMinutes * 60000));
        const adjustedEndDateTime = new Date(endDateTime.getTime() + (postMinutes * 60000));
        
        // Check if activity is within the 24-hour window
        if (adjustedEndDateTime > twentyFourHoursAgo && adjustedStartDateTime < fromTimeCopy) {
          // Calculate overlap with the 24-hour window
          const overlapStart = Math.max(adjustedStartDateTime.getTime(), twentyFourHoursAgo.getTime());
          const overlapEnd = Math.min(adjustedEndDateTime.getTime(), fromTimeCopy.getTime());
          
          if (overlapEnd > overlapStart) {
            const overlapMinutes = (overlapEnd - overlapStart) / 60000;
            totalMinutes += overlapMinutes;
          }
        }
      } catch (error) {
        console.error("Error calculating rolling contact time for activity:", error);
      }
    });
    
    return totalMinutes / 60; // Convert to hours
  } catch (error) {
    console.error("Error calculating rolling contact time:", error);
    return 0;
  }
};

// Calculate duty day length (first activity start to last activity end including pre/post)
export const calculateDutyDay = (activities: Activity[], date: string): number => {
  try {
    if (!date || !Array.isArray(activities)) {
      return 0;
    }
    
    const dayActivities = activities.filter(activity => activity.date === date);
    
    if (dayActivities.length === 0) return 0;
    
    // Find earliest start time considering pre-briefing
    const startTimes = dayActivities.map(activity => {
      let preTime = 0;
      if (activity.preValue !== undefined && ['Flight', 'SIM'].includes(activity.type)) {
        preTime = activity.preValue * 60;
      } else if (activity.prePostValue !== undefined && ['Flight', 'SIM'].includes(activity.type)) {
        preTime = (activity.prePostValue / 2) * 60;
      }
      const startMinutes = timeToMinutes(activity.startTime) - preTime;
      return startMinutes;
    });
    
    // Find latest end time considering post-briefing
    const endTimes = dayActivities.map(activity => {
      let postTime = 0;
      if (activity.postValue !== undefined && ['Flight', 'SIM'].includes(activity.type)) {
        postTime = activity.postValue * 60;
      } else if (activity.prePostValue !== undefined && ['Flight', 'SIM'].includes(activity.type)) {
        postTime = (activity.prePostValue / 2) * 60;
      }
      const endMinutes = timeToMinutes(activity.endTime) + postTime;
      return endMinutes;
    });
    
    const earliestStart = Math.min(...startTimes);
    const latestEnd = Math.max(...endTimes);
    
    return (latestEnd - earliestStart) / 60; // Convert to hours
  } catch (error) {
    console.error("Error calculating duty day:", error);
    return 0;
  }
};

// Calculate rest between days - from last activity end (including post) to first activity start (including pre)
export const calculateRestBetween = (activities: Activity[], currentDate: string): number => {
  try {
    if (!currentDate || !Array.isArray(activities)) {
      return 24; // Default to full rest if invalid input
    }
    
    // Validate date format
    if (!currentDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.error("Invalid date format:", currentDate);
      return 24;
    }
    
    // Parse the current date with noon time to avoid timezone issues
    const [year, month, day] = currentDate.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", currentDate);
      return 24;
    }
    
    // Calculate previous date
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    
    // Get activities for both days
    const prevDayActivities = activities.filter(a => a.date === prevDateStr);
    const currentDayActivities = activities.filter(a => a.date === currentDate);
    
    if (prevDayActivities.length === 0 || currentDayActivities.length === 0) {
      return 24; // No activities on one of the days, so full rest
    }
    
    // Find the latest end time from previous day including post-briefing
    const prevDayEndTimes = prevDayActivities.map(activity => {
      let postTime = 0;
      if (activity.postValue !== undefined && ['Flight', 'SIM'].includes(activity.type)) {
        postTime = activity.postValue * 60;
      } else if (activity.prePostValue !== undefined && ['Flight', 'SIM'].includes(activity.type)) {
        postTime = (activity.prePostValue / 2) * 60;
      }
      return timeToMinutes(activity.endTime) + postTime;
    });
    
    // Find the earliest start time from current day including pre-briefing
    const currentDayStartTimes = currentDayActivities.map(activity => {
      let preTime = 0;
      if (activity.preValue !== undefined && ['Flight', 'SIM'].includes(activity.type)) {
        preTime = activity.preValue * 60;
      } else if (activity.prePostValue !== undefined && ['Flight', 'SIM'].includes(activity.type)) {
        preTime = (activity.prePostValue / 2) * 60;
      }
      return timeToMinutes(activity.startTime) - preTime;
    });
    
    const latestPrevEnd = Math.max(...prevDayEndTimes);
    const earliestCurrentStart = Math.min(...currentDayStartTimes);
    
    // Calculate rest time, properly accounting for the day difference
    let restMinutes = 0;
    
    // Minutes from the latest end time on previous day until midnight
    const minutesToMidnight = 24 * 60 - latestPrevEnd;
    
    // Minutes from midnight until the earliest start time on current day
    const minutesFromMidnight = earliestCurrentStart;
    
    // Total rest time is the sum of these two periods
    restMinutes = minutesToMidnight + minutesFromMidnight;
    
    return restMinutes / 60; // Convert to hours
  } catch (error) {
    console.error("Error calculating rest between days:", error);
    return 24; // Default to full rest on error
  }
};

// Calculate consecutive days worked
export const calculateConsecutiveDays = (activities: Activity[], currentDate: string): number => {
  try {
    if (!currentDate || !Array.isArray(activities)) {
      return 0;
    }
    
    // Validate date format
    if (!currentDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.error("Invalid date format:", currentDate);
      return 0;
    }
    
    // Parse the current date with noon time to avoid timezone issues
    const [year, month, day] = currentDate.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", currentDate);
      return 0;
    }
    
    let consecutiveDays = 0;
    
    // Check backwards from current date
    for (let i = 0; i < 30; i++) { // Check up to 30 days back
      const checkDate = new Date(date);
      checkDate.setDate(checkDate.getDate() - i);
      const checkDateStr = checkDate.toISOString().split('T')[0];
      
      const dayActivities = activities.filter(a => a.date === checkDateStr && a.type !== 'Other');
      if (dayActivities.length === 0) {
        break; // Break on first day with no activities
      }
      
      consecutiveDays++;
    }
    
    return consecutiveDays;
  } catch (error) {
    console.error("Error calculating consecutive days:", error);
    return 0;
  }
};

// Calculate weekly hours (Sunday 00:00 to Saturday 24:00)
export const calculateWeeklyHours = (activities: Activity[], date: string): number => {
  try {
    if (!date || !Array.isArray(activities)) {
      return 0;
    }
    
    // Validate date format
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.error("Invalid date format:", date);
      return 0;
    }
    
    // Parse the current date with noon time to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day, 12, 0, 0);
    
    if (isNaN(targetDate.getTime())) {
      console.error("Invalid date:", date);
      return 0;
    }
    
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Calculate the date of the Sunday that starts this week
    const sunday = new Date(targetDate);
    sunday.setDate(targetDate.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);
    
    // Calculate the date of the Saturday that ends this week
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);
    
    // Calculate hours for each day in the week, properly handling overnight activities
    let totalMinutes = 0;
    
    // Process each activity that starts within the week
    activities.forEach(activity => {
      if (activity.type === 'Other') return; // Skip 'Other' type activities
      
      try {
        // Validate date format
        if (!activity.date || !activity.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          console.error("Invalid activity date format:", activity.date);
          return;
        }
        
        // Parse the activity date with noon time to avoid timezone issues
        const [actYear, actMonth, actDay] = activity.date.split('-').map(Number);
        const activityDate = new Date(actYear, actMonth - 1, actDay, 12, 0, 0);
        
        if (isNaN(activityDate.getTime())) {
          console.error("Invalid activity date:", activity.date);
          return;
        }
        
        // Skip if activity date is outside the week
        if (activityDate < sunday || activityDate > saturday) return;
        
        const startMinutes = timeToMinutes(activity.startTime);
        let endMinutes = timeToMinutes(activity.endTime);
        const isOvernight = endMinutes < startMinutes;
        
        // Calculate pre/post minutes using separate values or legacy combined value
        let prePostMinutes = 0;
        if (activity.preValue !== undefined && activity.postValue !== undefined) {
          prePostMinutes = ['Flight', 'SIM'].includes(activity.type) ? (activity.preValue + activity.postValue) * 60 : 0;
        } else if (activity.prePostValue !== undefined) {
          prePostMinutes = ['Flight', 'SIM'].includes(activity.type) ? activity.prePostValue * 60 : 0;
        }
        
        if (isOvernight) {
          // For overnight activities, split the time between days
          
          // Minutes until midnight on start day
          const minutesUntilMidnight = 24 * 60 - startMinutes;
          
          // Add minutes from start time to midnight to the total
          totalMinutes += minutesUntilMidnight;
          
          // Add minutes from midnight to end time to the total
          totalMinutes += endMinutes;
          
          // Check if the next day is still in this week
          const nextDay = new Date(activityDate);
          nextDay.setDate(activityDate.getDate() + 1);
          
          // If next day is outside the week (e.g., Saturday to Sunday), don't count those hours
          if (nextDay > saturday) {
            // Remove the minutes that fall on the next day (outside the week)
            totalMinutes -= endMinutes;
          }
        } else {
          // Regular activity within the same day
          totalMinutes += endMinutes - startMinutes;
        }
        
        // Add pre/post time
        totalMinutes += prePostMinutes;
      } catch (error) {
        console.error("Error processing activity for weekly hours:", error);
      }
    });
    
    return totalMinutes / 60; // Convert to hours
  } catch (error) {
    console.error("Error calculating weekly hours:", error);
    return 0;
  }
};

// Calculate past 7 days hours (rolling 7 days including current day)
export const calculatePastSevenDaysHours = (activities: Activity[], date: string): number => {
  try {
    if (!date || !Array.isArray(activities)) {
      return 0;
    }
    
    // Validate date format
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.error("Invalid date format:", date);
      return 0;
    }
    
    // Parse the current date with noon time to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day, 12, 0, 0);
    
    if (isNaN(targetDate.getTime())) {
      console.error("Invalid date:", date);
      return 0;
    }
    
    // Calculate the date 7 days ago
    const sevenDaysAgo = new Date(targetDate);
    sevenDaysAgo.setDate(targetDate.getDate() - 6); // 6 days back + current day = 7 days
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    // Set end of current day
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Calculate hours for each day in the 7-day period, properly handling overnight activities
    let totalMinutes = 0;
    
    // Process each activity that starts within the 7-day period
    activities.forEach(activity => {
      if (activity.type === 'Other') return; // Skip 'Other' type activities
      
      try {
        // Validate date format
        if (!activity.date || !activity.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          console.error("Invalid activity date format:", activity.date);
          return;
        }
        
        // Parse the activity date with noon time to avoid timezone issues
        const [actYear, actMonth, actDay] = activity.date.split('-').map(Number);
        const activityDate = new Date(actYear, actMonth - 1, actDay, 12, 0, 0);
        
        if (isNaN(activityDate.getTime())) {
          console.error("Invalid activity date:", activity.date);
          return;
        }
        
        // Skip if activity date is outside the 7-day period
        if (activityDate < sevenDaysAgo || activityDate > endOfDay) return;
        
        const startMinutes = timeToMinutes(activity.startTime);
        let endMinutes = timeToMinutes(activity.endTime);
        const isOvernight = endMinutes < startMinutes;
        
        // Calculate pre/post minutes using separate values or legacy combined value
        let prePostMinutes = 0;
        if (activity.preValue !== undefined && activity.postValue !== undefined) {
          prePostMinutes = ['Flight', 'SIM'].includes(activity.type) ? (activity.preValue + activity.postValue) * 60 : 0;
        } else if (activity.prePostValue !== undefined) {
          prePostMinutes = ['Flight', 'SIM'].includes(activity.type) ? activity.prePostValue * 60 : 0;
        }
        
        if (isOvernight) {
          // For overnight activities, split the time between days
          
          // Minutes until midnight on start day
          const minutesUntilMidnight = 24 * 60 - startMinutes;
          
          // Add minutes from start time to midnight to the total
          totalMinutes += minutesUntilMidnight;
          
          // Add minutes from midnight to end time to the total
          totalMinutes += endMinutes;
          
          // Check if the next day is still in this 7-day period
          const nextDay = new Date(activityDate);
          nextDay.setDate(activityDate.getDate() + 1);
          
          // If next day is outside the period, don't count those hours
          if (nextDay > endOfDay) {
            // Remove the minutes that fall on the next day (outside the period)
            totalMinutes -= endMinutes;
          }
        } else {
          // Regular activity within the same day
          totalMinutes += endMinutes - startMinutes;
        }
        
        // Add pre/post time
        totalMinutes += prePostMinutes;
      } catch (error) {
        console.error("Error processing activity for past seven days:", error);
      }
    });
    
    return totalMinutes / 60; // Convert to hours
  } catch (error) {
    console.error("Error calculating past seven days hours:", error);
    return 0;
  }
};

// Calculate flight hours in a rolling 24-hour window
export const calculateRolling24HourFlightTime = (activities: Activity[], fromTime: Date): number => {
  try {
    if (!fromTime || !Array.isArray(activities)) {
      return 0;
    }
    
    if (!(fromTime instanceof Date) || isNaN(fromTime.getTime())) {
      console.error("Invalid fromTime:", fromTime);
      return 0;
    }
    
    // Create a copy of the date to avoid modifying the original
    const fromTimeCopy = new Date(fromTime.getTime());
    
    // Ensure we're using the exact time provided without timezone adjustments
    const twentyFourHoursAgo = new Date(fromTimeCopy.getTime() - (24 * 60 * 60 * 1000));
    
    let totalMinutes = 0;
    
    activities.forEach(activity => {
      if (activity.type !== 'Flight') return; // Only count flight activities
      
      try {
        // Validate date format
        if (!activity.date || !activity.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          console.error("Invalid activity date format:", activity.date);
          return;
        }
        
        // Parse the activity date with noon time to avoid timezone issues
        // Use the exact date string without timezone conversion
        const [year, month, day] = activity.date.split('-').map(Number);
        const activityDate = new Date(year, month - 1, day, 12, 0, 0);
        
        if (isNaN(activityDate.getTime())) {
          console.error("Invalid activity date:", activity.date);
          return;
        }
        
        const startDateTime = new Date(activityDate);
        const [startHours, startMinutes] = activity.startTime.split(':').map(Number);
        if (isNaN(startHours) || isNaN(startMinutes)) {
          console.error("Invalid start time:", activity.startTime);
          return;
        }
        startDateTime.setHours(startHours, startMinutes, 0, 0);
        
        const endDateTime = new Date(activityDate);
        const [endHours, endMinutes] = activity.endTime.split(':').map(Number);
        if (isNaN(endHours) || isNaN(endMinutes)) {
          console.error("Invalid end time:", activity.endTime);
          return;
        }
        endDateTime.setHours(endHours, endMinutes, 0, 0);
        
        // Handle overnight activities
        if (endDateTime < startDateTime) {
          endDateTime.setDate(endDateTime.getDate() + 1);
        }
        
        // For flight hours, only count actual flight time, not pre/post
        // Check if activity is within the 24-hour window
        if (endDateTime > twentyFourHoursAgo && startDateTime < fromTimeCopy) {
          // Calculate overlap with the 24-hour window
          const overlapStart = Math.max(startDateTime.getTime(), twentyFourHoursAgo.getTime());
          const overlapEnd = Math.min(endDateTime.getTime(), fromTimeCopy.getTime());
          
          if (overlapEnd > overlapStart) {
            const overlapMinutes = (overlapEnd - overlapStart) / 60000;
            totalMinutes += overlapMinutes;
          }
        }
      } catch (error) {
        console.error("Error calculating rolling 24-hour flight time for activity:", error);
      }
    });
    
    return totalMinutes / 60; // Convert to hours
  } catch (error) {
    console.error("Error calculating rolling 24-hour flight time:", error);
    return 0;
  }
};

// Check for time overlap between activities
export const checkTimeOverlap = (
  activities: Activity[], 
  newActivity: Omit<Activity, 'id'>, 
  editingId?: string
): boolean => {
  try {
    if (!Array.isArray(activities) || !newActivity) {
      return false;
    }
    
    // Filter activities on the same date, excluding the one being edited
    const sameDate = activities.filter(a => 
      a.date === newActivity.date && 
      (editingId ? a.id !== editingId : true)
    );
    
    if (sameDate.length === 0) return false; // No other activities on this date
    
    // Calculate new activity times including pre/post
    let preMinutes = 0;
    let postMinutes = 0;
    if (newActivity.preValue !== undefined && newActivity.postValue !== undefined) {
      preMinutes = ['Flight', 'SIM'].includes(newActivity.type) ? newActivity.preValue * 60 : 0;
      postMinutes = ['Flight', 'SIM'].includes(newActivity.type) ? newActivity.postValue * 60 : 0;
    } else if (newActivity.prePostValue !== undefined) {
      const prePostMinutes = newActivity.prePostValue * 60;
      preMinutes = ['Flight', 'SIM'].includes(newActivity.type) ? prePostMinutes / 2 : 0;
      postMinutes = ['Flight', 'SIM'].includes(newActivity.type) ? prePostMinutes / 2 : 0;
    }
    
    const newStartMinutes = timeToMinutes(newActivity.startTime) - preMinutes;
    const newEndMinutes = timeToMinutes(newActivity.endTime) + postMinutes;
    
    // Check for overlap with each existing activity
    for (const activity of sameDate) {
      let existingPreMinutes = 0;
      let existingPostMinutes = 0;
      if (activity.preValue !== undefined && activity.postValue !== undefined) {
        existingPreMinutes = ['Flight', 'SIM'].includes(activity.type) ? activity.preValue * 60 : 0;
        existingPostMinutes = ['Flight', 'SIM'].includes(activity.type) ? activity.postValue * 60 : 0;
      } else if (activity.prePostValue !== undefined) {
        const existingPrePostMinutes = activity.prePostValue * 60;
        existingPreMinutes = ['Flight', 'SIM'].includes(activity.type) ? existingPrePostMinutes / 2 : 0;
        existingPostMinutes = ['Flight', 'SIM'].includes(activity.type) ? existingPrePostMinutes / 2 : 0;
      }
      
      const existingStartMinutes = timeToMinutes(activity.startTime) - existingPreMinutes;
      const existingEndMinutes = timeToMinutes(activity.endTime) + existingPostMinutes;
      
      // Check if there's an overlap
      if (
        (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
        (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
        (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
      ) {
        return true; // Overlap detected
      }
    }
    
    return false; // No overlap
  } catch (error) {
    console.error("Error checking time overlap:", error);
    return false; // Default to no overlap on error
  }
};

// Get current time in HH:MM format
export const getCurrentTime = (): string => {
  try {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Error getting current time:", error);
    return "00:00";
  }
};

// Get current date in YYYY-MM-DD format using local time
export const getCurrentDate = (): string => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error getting current date:", error);
    // Fallback to manual date creation
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

// Format date for display (e.g., "Mon, May 3, 2023")
export const formatDate = (dateString: string, format: 'full' | 'short' = 'full'): string => {
  try {
    if (!dateString) {
      console.error("Invalid date string: empty string");
      return "Invalid date";
    }
    
    // Validate date format
    if (!dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.error("Invalid date format:", dateString);
      return "Invalid date format"; // Return a user-friendly message
    }
    
    // Parse the date with noon time to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "Invalid date"; // Return a user-friendly message
    }
    
    if (format === 'short') {
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
      });
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", error, "for date string:", dateString);
    return "Date error"; // Return a user-friendly message on error
  }
};

// Safe date parsing function to handle various date formats and always return a valid date or null
export const safeParseDate = (dateString: string): Date | null => {
  try {
    if (!dateString) {
      console.error("Empty date string");
      return null;
    }
    
    // Validate date format
    if (!dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.error("Invalid date format:", dateString);
      return null;
    }
    
    // Parse the date with noon time to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString);
      return null;
    }
    
    return date;
  } catch (error) {
    console.error("Error parsing date:", error, "for date string:", dateString);
    return null;
  }
};

// Format a date object to YYYY-MM-DD string using local time
export const formatDateToYYYYMMDD = (date: Date): string => {
  try {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Invalid date object:", date);
      return getCurrentDate(); // Fallback to current date
    }
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date to YYYY-MM-DD:", error);
    return getCurrentDate(); // Fallback to current date
  }
};