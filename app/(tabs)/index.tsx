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
  calculateRollingContactTime,
  calculateDutyDay,
  calculateRestBetween,
  calculateConsecutiveDays,
  calculateWeeklyHours,
  calculatePastSevenDaysHours,
  formatDuration,
  calculateDuration,
  formatDate,
  calculateRolling24HourFlightTime,
  safeParseDate
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
  
  // Create a Date object for the end of the selected day
  const getEndOfDay = (dateString: string): Date => {
    const date = safeParseDate(dateString);
    if (!date) {
      console.error("Invalid date for getEndOfDay:", dateString);
      return new Date(); // Fallback to current date
    }
    
    // Set to end of day (23:59:59.999)
    date.setHours(23, 59, 59, 999);
    return date;
  };
  
  // Calculate maximum rolling 24-hour flight time for the current day
  const calculateMaxRolling24HourFlightTime = (): number => {
    // Get the end of the selected day
    const endOfDay = getEndOfDay(selectedDate);
    
    // Check every hour of the selected day to find the maximum rolling 24-hour value
    let maxRollingHours = 0;
    
    // Start at midnight and check each hour
    for (let hour = 0; hour <= 23; hour++) {
      const date = safeParseDate(selectedDate);
      if (!date) continue;
      
      date.setHours(hour, 0, 0, 0);
      
      const hoursAtThisTime = calculateRolling24HourFlightTime(activities, date);
      if (hoursAtThisTime > maxRollingHours) {
        maxRollingHours = hoursAtThisTime;
      }
    }
    
    // Also check the end of day
    const endOfDayHours = calculateRolling24HourFlightTime(activities, endOfDay);
    if (endOfDayHours > maxRollingHours) {
      maxRollingHours = endOfDayHours;
    }
    
    return maxRollingHours;
  };
  
  // Calculate maximum rolling contact time for the current day
  const calculateMaxRollingContactTime = (): number => {
    // Get the end of the selected day
    const endOfDay = getEndOfDay(selectedDate);
    
    // Check every hour of the selected day to find the maximum rolling 24-hour value
    let maxRollingHours = 0;
    
    // Start at midnight and check each hour
    for (let hour = 0; hour <= 23; hour++) {
      const date = safeParseDate(selectedDate);
      if (!date) continue;
      
      date.setHours(hour, 0, 0, 0);
      
      const hoursAtThisTime = calculateRollingContactTime(activities, date);
      if (hoursAtThisTime > maxRollingHours) {
        maxRollingHours = hoursAtThisTime;
      }
    }
    
    // Also check the end of day
    const endOfDayHours = calculateRollingContactTime(activities, endOfDay);
    if (endOfDayHours > maxRollingHours) {
      maxRollingHours = endOfDayHours;
    }
    
    return maxRollingHours;
  };
  
  // Calculate warning values
  const flightHours = calculateMaxRolling24HourFlightTime();
  const contactTime = calculateMaxRollingContactTime(); // Now using rolling 24-hour window
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
                        <Text style={styles.tableCell}>{(duration / 60).toFixed(2)}</Text>
                        <Text style={[styles.tableCell, styles.typeCell, { color: getTypeColor(activity.type) }]}>
                          {activity.type}
                        </Text>
                        <Text style={styles.tableCell}>{(activity.prePostValue || 0).toFixed(2)}</Text>
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
    case 'Other Internal': return COLORS.otherInternal;
    case 'Other External': return COLORS.otherExternal;
    case 'Other': return COLORS.other; // For backward compatibility
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