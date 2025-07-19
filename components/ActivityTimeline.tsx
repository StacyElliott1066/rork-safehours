import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Activity } from '@/types/activity';
import { COLORS } from '@/constants/colors';
import { timeToMinutes, safeParseDate } from '@/utils/time';

interface ActivityTimelineProps {
  activities: Activity[];
  date: string;
}

export default function ActivityTimeline({ activities, date }: ActivityTimelineProps) {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width - 32; // Accounting for padding
  const hourWidth = (screenWidth - 40) / 24; // Show all 24 positions (0-24) with adjustment to fit
  
  // Validate date format to prevent invalid date errors
  const isValidDate = (dateString: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = safeParseDate(dateString);
    return date !== null;
  };
  
  // Get activities for this date, including those that started the day before but end on this date
  const filteredActivities = activities.filter(activity => {
    // Skip activities with invalid dates
    if (!isValidDate(activity.date)) return false;
    
    // Include activities that start on this date
    if (activity.date === date) return true;
    
    try {
      // Include activities that started the day before but end on this date (overnight)
      const activityDate = safeParseDate(activity.date);
      if (!activityDate) return false;
      
      const nextDay = new Date(activityDate);
      nextDay.setDate(activityDate.getDate() + 1);
      
      // Format to YYYY-MM-DD using local time
      const nextDayStr = `${nextDay.getFullYear()}-${(nextDay.getMonth() + 1).toString().padStart(2, '0')}-${nextDay.getDate().toString().padStart(2, '0')}`;
      
      // Check if this activity is overnight and ends on our target date
      if (nextDayStr === date) {
        const startMinutes = timeToMinutes(activity.startTime);
        const endMinutes = timeToMinutes(activity.endTime);
        return endMinutes < startMinutes; // It's an overnight activity
      }
    } catch (error) {
      console.error("Error processing activity date:", error);
      return false;
    }
    
    return false;
  });
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Flight': return COLORS.flight;
      case 'Ground': return COLORS.ground;
      case 'SIM': return COLORS.sim;
      case 'Other': return COLORS.other;
      default: return COLORS.gray;
    }
  };
  
  const handleActivityPress = (activityId: string) => {
    router.push({
      pathname: '/activity/[id]',
      params: { id: activityId }
    });
  };
  
  const renderTimeMarkers = () => {
    const markers = [];
    // Render markers for every 3 hours: 0, 3, 6, 9, 12, 15, 18, 21, 24
    for (let i = 0; i <= 24; i += 3) {
      markers.push(
        <View key={i} style={[styles.timeMarker, { left: i * hourWidth }]}>
          <Text style={styles.timeMarkerText}>{i}</Text>
        </View>
      );
    }
    return markers;
  };
  
  const renderActivityBlocks = () => {
    return filteredActivities.map((activity) => {
      try {
        // Validate time formats to prevent errors
        if (!activity.startTime || !activity.endTime || 
            typeof activity.startTime !== 'string' || 
            typeof activity.endTime !== 'string' ||
            !activity.startTime.includes(':') || 
            !activity.endTime.includes(':')) {
          console.error("Invalid time format for activity:", activity.id);
          return null;
        }
        
        const startMinutes = timeToMinutes(activity.startTime);
        const endMinutes = timeToMinutes(activity.endTime);
        
        // Skip rendering if time conversion failed
        if (startMinutes === 0 && endMinutes === 0 && 
            (activity.startTime !== '00:00' || activity.endTime !== '00:00')) {
          console.error("Time conversion failed for activity:", activity.id);
          return null;
        }
        
        const isOvernight = endMinutes < startMinutes;
        
        // Calculate pre/post minutes using separate values or legacy combined value
        let preMinutes, postMinutes;
        if (activity.preValue !== undefined && activity.postValue !== undefined) {
          preMinutes = activity.preValue * 60;
          postMinutes = activity.postValue * 60;
        } else if (activity.prePostValue !== undefined) {
          // Fallback to legacy behavior - split evenly
          const prePostMinutes = activity.prePostValue * 60;
          preMinutes = prePostMinutes / 2;
          postMinutes = prePostMinutes / 2;
        } else {
          preMinutes = 0;
          postMinutes = 0;
        }
        
        // Determine if this is an activity that started on the previous day
        const isFromPreviousDay = activity.date !== date;
        
        // Calculate positions with pre/post time
        let activityStartMinutes, activityEndMinutes;
        let preStartMinutes, postEndMinutes;
        
        if (isFromPreviousDay) {
          // For activities from previous day, show only the portion from midnight to end
          activityStartMinutes = 0; // Start at midnight (00:00)
          activityEndMinutes = endMinutes;
          
          // No pre-time for activities from previous day (it was on previous day)
          preStartMinutes = 0;
          preMinutes = 0;
          
          // Post-time is normal
          postEndMinutes = Math.min(endMinutes + postMinutes, 24 * 60); // Cap at 24:00
        } else if (isOvernight) {
          // For overnight activities starting on this day, show only until midnight
          activityStartMinutes = startMinutes;
          activityEndMinutes = 24 * 60; // End at midnight (24:00)
          
          // Pre-time is normal
          preStartMinutes = Math.max(startMinutes - preMinutes, 0); // Ensure not negative
          
          // No post-time for overnight activities (it's on next day)
          postEndMinutes = 24 * 60;
          postMinutes = 0;
        } else {
          // Regular activity within the same day
          activityStartMinutes = startMinutes;
          activityEndMinutes = endMinutes;
          preStartMinutes = Math.max(startMinutes - preMinutes, 0); // Ensure not negative
          postEndMinutes = Math.min(endMinutes + postMinutes, 24 * 60); // Cap at 24:00
        }
        
        // Convert to positions on timeline
        const activityStartPosition = (activityStartMinutes / 60) * hourWidth;
        const activityWidth = ((activityEndMinutes - activityStartMinutes) / 60) * hourWidth;
        
        const preStartPosition = (preStartMinutes / 60) * hourWidth;
        const preWidth = (preMinutes / 60) * hourWidth;
        
        const postStartPosition = (activityEndMinutes / 60) * hourWidth;
        const postWidth = (postMinutes / 60) * hourWidth;
        
        const showPrePost = ['Flight', 'SIM'].includes(activity.type) && (
          (activity.prePostValue !== undefined && activity.prePostValue > 0) ||
          (activity.preValue !== undefined && activity.preValue > 0) ||
          (activity.postValue !== undefined && activity.postValue > 0)
        );
        
        // Check if notes exist and are not empty
        const hasNotes = activity.notes && activity.notes.trim() !== '';
        
        return (
          <View key={`${activity.id}-${isFromPreviousDay ? 'next' : 'current'}`}>
            {/* Pre-briefing block (before activity) */}
            {showPrePost && preMinutes > 0 ? (
              <View
                style={[
                  styles.prePostBlock,
                  {
                    left: preStartPosition,
                    width: preWidth,
                    backgroundColor: COLORS.primary, // Use primary color (green) for pre/post
                  },
                ]}
              />
            ) : null}
            
            {/* Main activity block - COMPLETELY EMPTY, NO TEXT */}
            <TouchableOpacity
              style={[
                styles.activityBlock,
                {
                  left: activityStartPosition,
                  width: Math.max(activityWidth, 10), // Ensure minimum width for visibility
                  backgroundColor: getTypeColor(activity.type),
                },
              ]}
              onPress={() => handleActivityPress(activity.id)}
            />
            
            {/* Arrow indicator for activities that go past midnight */}
            {isOvernight && !isFromPreviousDay ? (
              <View
                style={[
                  styles.arrowIndicator,
                  {
                    left: activityStartPosition + Math.max(activityWidth, 10) + 4, // Position outside the activity block
                  }
                ]}
              >
                <ChevronRight size={20} color={COLORS.black} />
              </View>
            ) : null}
            
            {/* Notes container - completely separate from the block */}
            {hasNotes ? (
              <View 
                style={[
                  styles.activityLabelContainer,
                  {
                    left: activityStartPosition,
                    width: Math.max(activityWidth, 60), // Ensure minimum width for text
                  }
                ]}
              >
                <Text 
                  style={styles.activityLabel}
                  numberOfLines={1}
                >
                  {activity.notes}
                </Text>
              </View>
            ) : null}
            
            {/* Post-briefing block (after activity) */}
            {showPrePost && postMinutes > 0 ? (
              <View
                style={[
                  styles.prePostBlock,
                  {
                    left: postStartPosition,
                    width: postWidth,
                    backgroundColor: COLORS.primary, // Use primary color (green) for pre/post
                  },
                ]}
              />
            ) : null}
          </View>
        );
      } catch (error) {
        console.error("Error rendering activity:", activity.id, error);
        return null; // Skip rendering this activity if there's an error
      }
    }).filter(Boolean); // Filter out any null values from errors
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Timeline</Text>
      
      <View style={styles.timelineContainer}>
        {/* Hour grid lines */}
        <View style={styles.gridContainer}>
          {Array.from({ length: 9 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.gridLine,
                { left: i * 3 * hourWidth },
                styles.majorGridLine,
              ]}
            />
          ))}
        </View>
        
        {/* Activity blocks */}
        <View style={styles.activitiesContainer}>
          {renderActivityBlocks()}
        </View>
        
        {/* Time markers - positioned below the grid lines */}
        <View style={styles.timeMarkersContainer}>
          {renderTimeMarkers()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  timelineContainer: {
    height: 100, // Increased from 80px to 100px to accommodate labels
    position: 'relative',
  },
  timeMarkersContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
  },
  timeMarker: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    width: 20, // Give it a width to center the text
    marginLeft: -10, // Offset to center under the line
  },
  timeMarkerText: {
    fontSize: 10,
    color: COLORS.gray,
    textAlign: 'center',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20, // Leave space for markers
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
  },
  majorGridLine: {
    backgroundColor: COLORS.lightGray,
  },
  activitiesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20, // Leave space for markers
  },
  activityBlock: {
    position: 'absolute',
    height: 24, // Height of the colored block
    top: 8, // Position from top
    borderRadius: 4,
    // Completely empty - no text, no content
  },
  activityLabelContainer: {
    position: 'absolute',
    top: 36, // Position below the activity block
    alignItems: 'center', // Center the text horizontally
    justifyContent: 'center',
  },
  activityLabel: {
    fontSize: 10,
    color: COLORS.black, // Black text as requested
    textAlign: 'center',
  },
  prePostBlock: {
    position: 'absolute',
    height: 12,
    top: 20,
    borderRadius: 2,
  },
  arrowIndicator: {
    position: 'absolute',
    top: 10, // Center vertically with the activity block
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});