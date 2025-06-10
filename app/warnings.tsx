import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { useActivityStore } from '@/store/activityStore';
import { COLORS } from '@/constants/colors';
import {
  calculateContactTime,
  calculateDutyDay,
  calculateRestBetween,
  calculateConsecutiveDays,
  calculateWeeklyHours,
  calculatePastSevenDaysHours,
} from '@/utils/time';

export default function WarningsScreen() {
  const router = useRouter();
  const { 
    activities, 
    selectedDate, 
    warningThresholds 
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
  
  // Check if previous day exists
  const hasPreviousDay = () => {
    const date = new Date(selectedDate);
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    
    return activities.some(a => a.date === prevDateStr);
  };
  
  // Check compliance
  const isFlightHoursCompliant = flightHours <= warningThresholds.maxFlightHours;
  const isRestBetweenCompliant = hasPreviousDay() ? restBetween >= warningThresholds.minRestBetweenDays : true;
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
  
  const goBack = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Compliance Status',
          headerLeft: () => (
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.content}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryIconContainer}>
            {hasWarnings ? (
              <AlertCircle size={40} color={COLORS.red} />
            ) : (
              <CheckCircle size={40} color={COLORS.green} />
            )}
          </View>
          <Text style={styles.summaryText}>
            {hasWarnings 
              ? "Warning: Some compliance limits exceeded" 
              : "All compliance limits are within acceptable ranges"}
          </Text>
        </View>
        
        <View style={styles.warningsContainer}>
          <WarningItem 
            title="Flight Instruction Hours (24h)"
            isCompliant={isFlightHoursCompliant}
            value={`${flightHours.toFixed(1)}h`}
            threshold={`${warningThresholds.maxFlightHours}h max`}
            description="Maximum flight instruction hours in any rolling 24-hour period."
          />
          
          <WarningItem 
            title="Rest Between Days"
            isCompliant={isRestBetweenCompliant}
            value={hasPreviousDay() ? `${restBetween.toFixed(1)}h` : "No previous day data"}
            threshold={`${warningThresholds.minRestBetweenDays}h min`}
            description="Minimum rest required between duty days."
            isWarning={!hasPreviousDay()}
          />
          
          <WarningItem 
            title="Contact Time"
            isCompliant={isContactTimeCompliant}
            value={`${contactTime.toFixed(1)}h`}
            threshold={`${warningThresholds.maxContactTime}h max`}
            description="Maximum total contact hours in a day."
          />
          
          <WarningItem 
            title="Duty Day"
            isCompliant={isDutyDayCompliant}
            value={`${dutyDay.toFixed(1)}h`}
            threshold={`${warningThresholds.maxDutyDay}h max`}
            description="Maximum duty day length."
          />
          
          <WarningItem 
            title="Consecutive Days"
            isCompliant={isConsecutiveDaysCompliant}
            value={`${consecutiveDays} days`}
            threshold={`${warningThresholds.maxConsecutiveDays} days max`}
            description="Maximum consecutive days with activities."
          />
          
          <WarningItem 
            title="Weekly Hours"
            isCompliant={isWeeklyHoursCompliant}
            value={`${weeklyHours.toFixed(1)}h`}
            threshold={`${warningThresholds.maxWeeklyHours}h max`}
            description="Maximum hours Sunday - Saturday."
          />
          
          <WarningItem 
            title="Past 7 Days"
            isCompliant={isPastSevenDaysHoursCompliant}
            value={`${pastSevenDaysHours.toFixed(1)}h`}
            threshold={`${warningThresholds.maxPastSevenDaysHours}h max`}
            description="Maximum hours the past 7 days."
          />
        </View>
      </View>
    </View>
  );
}

interface WarningItemProps {
  title: string;
  isCompliant: boolean;
  value: string;
  threshold: string;
  description: string;
  isWarning?: boolean;
}

function WarningItem({ title, isCompliant, value, threshold, description, isWarning = false }: WarningItemProps) {
  return (
    <View 
      style={[
        styles.warningItem,
        isCompliant ? styles.compliantItem : styles.warningTriggeredItem,
        isWarning && styles.warningStatusItem
      ]}
    >
      <View style={styles.warningHeader}>
        <Text style={styles.warningTitle}>{title}</Text>
        {isCompliant ? (
          <CheckCircle size={16} color={COLORS.green} />
        ) : (
          <AlertCircle size={16} color={COLORS.red} />
        )}
      </View>
      
      <View style={styles.warningValues}>
        <View style={styles.valueContainer}>
          <Text style={styles.valueLabel}>Current:</Text>
          <Text 
            style={[
              styles.valueText,
              !isCompliant && styles.warningValueText,
              isWarning && styles.warningText
            ]}
          >
            {value}
          </Text>
        </View>
        
        <View style={styles.valueContainer}>
          <Text style={styles.valueLabel}>Limit:</Text>
          <Text style={styles.valueText}>{threshold}</Text>
        </View>
      </View>
      
      <Text style={styles.descriptionText}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 8,
  },
  content: {
    padding: 12,
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryIconContainer: {
    marginRight: 12,
  },
  summaryText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  warningsContainer: {
    marginBottom: 20,
  },
  warningItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 6,
    marginBottom: 6,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
  },
  compliantItem: {
    borderLeftColor: COLORS.green,
  },
  warningTriggeredItem: {
    borderLeftColor: COLORS.red,
  },
  warningStatusItem: {
    borderLeftColor: '#FFC107', // Yellow for warning
  },
  warningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  warningValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 11,
    marginRight: 4,
    color: COLORS.gray,
  },
  valueText: {
    fontSize: 11,
    fontWeight: '500',
  },
  warningValueText: {
    color: COLORS.red,
    fontWeight: 'bold',
  },
  warningText: {
    color: '#FFC107', // Yellow for warning
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 10,
    color: COLORS.gray,
  },
});