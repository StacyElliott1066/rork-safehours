import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, AlertCircle, CheckCircle, Trash2 } from 'lucide-react-native';
import { useActivityStore } from '@/store/activityStore';
import DateSelector from '@/components/DateSelector';
import ActivityTimeline from '@/components/ActivityTimeline';
import { COLORS } from '@/constants/colors';
import { Activity } from '@/types/activity';
import {
  calculateContactTime,
  calculateDutyDay,
  calculateRestBetween,
  calculateConsecutiveDays,
  calculateWeeklyHours,
  calculatePastSevenDaysHours,
  formatDuration,
  calculateDuration,
  formatDate
} from '@/utils/time';

export default function ActivitiesScreen() {
  const router = useRouter();
  const { 
    activities, 
    selectedDate, 
    setSelectedDate, 
    warningThresholds,
    deleteActivity
  } = useActivityStore();
  
  // Calculate rolling 24-hour flight time for the current day
  const calculateRolling24HourFlightTime = (): number => {
    // Get the end of the selected day
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Check every hour of the selected day to find the maximum rolling 24-hour value
    let maxRollingHours = 0;
    
    // Start at midnight and check each hour
    for (let hour = 0; hour <= 23; hour++) {
      const checkTime = new Date(selectedDate);
      checkTime.setHours(hour, 0, 0, 0);
      
      const hoursAtThisTime = calculateHoursInLast24Hours(checkTime);
      if (hoursAtThisTime > maxRollingHours) {
        maxRollingHours = hoursAtThisTime;
      }
    }
    
    // Also check the end of day
    const endOfDayHours = calculateHoursInLast24Hours(endOfDay);
    if (endOfDayHours > maxRollingHours) {
      maxRollingHours = endOfDayHours;
    }
    
    return maxRollingHours;
  };
  
  // Calculate flight instruction hours in the last 24 hours from a given point in time
  const calculateHoursInLast24Hours = (fromTime: Date): number => {
    const twentyFourHoursAgo = new Date(fromTime.getTime() - (24 * 60 * 60 * 1000));
    
    let totalMinutes = 0;
    
    activities.forEach(activity => {
      if (activity.type !== 'Flight') return; // Only count flight activities
      
      const activityDate = new Date(activity.date);
      const startDateTime = new Date(activityDate);
      const [startHours, startMinutes] = activity.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);
      
      const endDateTime = new Date(activityDate);
      const [endHours, endMinutes] = activity.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
      
      // Handle overnight activities
      if (endDateTime < startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }
      
      // Add pre/post time
      const prePostMinutes = activity.prePostValue * 60;
      const preMinutes = prePostMinutes / 2;
      const postMinutes = prePostMinutes / 2;
      
      const adjustedStartDateTime = new Date(startDateTime.getTime() - (preMinutes * 60000));
      const adjustedEndDateTime = new Date(endDateTime.getTime() + (postMinutes * 60000));
      
      // Check if activity is within the 24-hour window
      if (adjustedEndDateTime > twentyFourHoursAgo && adjustedStartDateTime < fromTime) {
        // Calculate overlap with the 24-hour window
        const overlapStart = Math.max(adjustedStartDateTime.getTime(), twentyFourHoursAgo.getTime());
        const overlapEnd = Math.min(adjustedEndDateTime.getTime(), fromTime.getTime());
        
        if (overlapEnd > overlapStart) {
          const overlapMinutes = (overlapEnd - overlapStart) / 60000;
          totalMinutes += overlapMinutes;
        }
      }
    });
    
    return totalMinutes / 60; // Convert to hours
  };
  
  // Calculate warning values
  const flightHours = calculateRolling24HourFlightTime(); // Use rolling 24-hour calculation
  const contactTime = calculateContactTime(activities, selectedDate);
  const dutyDay = calculateDutyDay(activities, selectedDate);
  const restBetween = calculateRestBetween(activities, selectedDate);
  const consecutiveDays = calculateConsecutiveDays(activities, selectedDate);
  const weeklyHours = calculateWeeklyHours(activities, selectedDate);
  const pastSevenDaysHours = calculatePastSevenDaysHours(activities, selectedDate);
  
  // Check compliance
  const isFlightHoursCompliant = flightHours <= warningThresholds.maxFlightHours;
  const isRestBetweenCompliant = restBetween >= warningThresholds.minRestBetweenDays;
  const isContactTimeCompliant = contactTime <= warningThresholds.maxContactTime;
  const isDutyDayCompliant = dutyDay <= warningThresholds.maxDutyDay;
  const isConsecutiveDaysCompliant = consecutiveDays <= warningThresholds.maxConsecutiveDays;
  const isWeeklyHoursCompliant = weeklyHours <= warningThresholds.maxWeeklyHours;
  const isPastSevenDaysHoursCompliant = pastSevenDaysHours <= warningThresholds.maxPastSevenDaysHours;
  
  // Check if any warning is triggered
  const hasWarnings = !isFlightHoursCompliant || !isRestBetweenCompliant || 
                      !isContactTimeCompliant || !isDutyDayCompliant || 
                      !isConsecutiveDaysCompliant || !isWeeklyHoursCompliant ||
                      !isPastSevenDaysHoursCompliant;
  
  const handleAddActivity = () => {
    router.push('/activity/new');
  };
  
  const handleEditActivity = (activity: Activity) => {
    router.push({
      pathname: '/activity/[id]',
      params: { id: activity.id }
    });
  };
  
  const handleDeleteActivity = (id: string) => {
    deleteActivity(id);
  };
  
  const navigateToWarnings = () => {
    router.push('/warnings');
  };
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <DateSelector 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate} 
          />
          
          <ActivityTimeline 
            activities={activities} 
            date={selectedDate} 
          />
          
          <TouchableOpacity 
            style={[
              styles.masterWarningButton,
              hasWarnings ? styles.warningButton : styles.compliantButton
            ]}
            onPress={navigateToWarnings}
          >
            <View style={styles.warningButtonContent}>
              {hasWarnings ? (
                <AlertCircle size={24} color={COLORS.white} />
              ) : (
                <CheckCircle size={24} color={COLORS.white} />
              )}
              <Text style={styles.warningButtonText}>
                {hasWarnings ? "Warning" : "All Compliant"}
              </Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.activitiesContainer}>
            <View style={styles.activitiesHeader}>
              <Text style={styles.sectionTitle}>Activities</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddActivity}
              >
                <Plus size={20} color={COLORS.white} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            
            {activities.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No activities</Text>
                <TouchableOpacity 
                  style={styles.emptyStateButton}
                  onPress={handleAddActivity}
                >
                  <Text style={styles.emptyStateButtonText}>Add Activity</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderCell}>Date</Text>
                  <Text style={styles.tableHeaderCell}>Start</Text>
                  <Text style={styles.tableHeaderCell}>End</Text>
                  <Text style={styles.tableHeaderCell}>Dur.</Text>
                  <Text style={styles.tableHeaderCell}>Type</Text>
                  <Text style={styles.tableHeaderCell}>Pre/Post</Text>
                  <Text style={styles.tableHeaderCell}>Actions</Text>
                </View>
                
                {activities
                  .sort((a, b) => {
                    // Sort by date (newest first) then by start time
                    const dateCompare = b.date.localeCompare(a.date);
                    if (dateCompare !== 0) return dateCompare;
                    return a.startTime.localeCompare(b.startTime);
                  })
                  .map((activity) => {
                    const duration = calculateDuration(activity.startTime, activity.endTime);
                    const isTargetDate = activity.date === selectedDate;
                    
                    return (
                      <TouchableOpacity 
                        key={activity.id} 
                        style={[
                          styles.tableRow,
                          isTargetDate && styles.highlightedRow
                        ]}
                        onPress={() => handleEditActivity(activity)}
                      >
                        <Text style={styles.tableCell}>{formatDate(activity.date, 'short')}</Text>
                        <Text style={styles.tableCell}>{activity.startTime}</Text>
                        <Text style={styles.tableCell}>{activity.endTime}</Text>
                        <Text style={styles.tableCell}>{(duration / 60).toFixed(1)}</Text>
                        <Text style={[styles.tableCell, styles.typeCell, { color: getTypeColor(activity.type) }]}>
                          {activity.type}
                        </Text>
                        <Text style={styles.tableCell}>{activity.prePostValue.toFixed(1)}</Text>
                        <View style={styles.actionCell}>
                          <TouchableOpacity 
                            style={styles.actionButton} 
                            onPress={() => deleteActivity(activity.id)}
                          >
                            <Trash2 size={16} color={COLORS.red} />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                }
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Flight': return COLORS.flight;
    case 'Ground': return COLORS.ground;
    case 'SIM': return COLORS.sim;
    case 'Other': return COLORS.other;
    default: return COLORS.gray;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  masterWarningButton: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  warningButton: {
    backgroundColor: COLORS.red,
  },
  compliantButton: {
    backgroundColor: COLORS.green,
  },
  warningButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.black,
  },
  activitiesContainer: {
    marginBottom: 20,
  },
  activitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  tableContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  highlightedRow: {
    backgroundColor: 'rgba(173, 216, 230, 0.3)', // Light blue with 30% opacity
  },
  tableCell: {
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
  },
  typeCell: {
    fontWeight: 'bold',
  },
  actionCell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    paddingHorizontal: 4,
  },
});