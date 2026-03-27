import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { useActivityStore } from '@/store/activityStore';
import { COLORS } from '@/constants/colors';
import {
  calculateRollingContactTime,
  calculateDutyDay,
  calculateRestBetween,
  calculateConsecutiveDays,
  calculateWeeklyHours,
  calculatePastSevenDaysHours,
  calculateRolling24HourFlightTime,
  safeParseDate,
} from '@/utils/time';

export default function WarningsScreen() {
  const router = useRouter();
  const { 
    activities, 
    selectedDate, 
    warningThresholds 
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
  
  // Calculate rolling 24-hour flight time for the current day
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
  
  // Check if previous day exists
  const hasPreviousDay = () => {
    const date = safeParseDate(selectedDate);
    if (!date) return false;
    
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
            value={`${flightHours.toFixed(2)}h`}
            threshold={`${warningThresholds.maxFlightHours}h max`}
            description="Maximum flight instruction hours in any rolling 24-hour period."
          />
          
          <WarningItem 
            title="Contact Time (24h)"
            isCompliant={isContactTimeCompliant}
            value={`${contactTime.toFixed(2)}h`}
            threshold={`${warningThresholds.maxContactTime}h max`}
            description="Maximum total contact hours in any rolling 24-hour period."
          />
          
          <WarningItem 
            title="Rest Between Days"
            isCompliant={isRestBetweenCompliant}
            value={hasPreviousDay() ? `${restBetween.toFixed(2)}h` : "No previous day data"}
            threshold={`${warningThresholds.minRestBetweenDays}h min`}
            description="Minimum rest required between duty days."
            isWarning={!hasPreviousDay()}
          />
          
          <WarningItem 
            title="Duty Day"
            isCompliant={isDutyDayCompliant}
            value={`${dutyDay.toFixed(2)}h`}
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
            value={`${weeklyHours.toFixed(2)}h`}
            threshold={`${warningThresholds.maxWeeklyHours}h max`}
            description="Maximum hours Sunday - Saturday."
          />
          
          <WarningItem 
            title="Past 7 Days"
            isCompliant={isPastSevenDaysHoursCompliant}
            value={`${pastSevenDaysHours.toFixed(2)}h`}
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
    alignItems: 'center', // Center the content
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
    width: '80%', // Reduced width by 20%
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
    width: '80%', // Reduced width by 20%
  },
  warningItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
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
    marginBottom: 4,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  warningValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 12,
    marginRight: 4,
    color: COLORS.gray,
  },
  valueText: {
    fontSize: 12,
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
    fontSize: 11,
    color: COLORS.gray,
  },
});