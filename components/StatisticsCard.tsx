import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity } from '@/types/activity';
import { COLORS } from '@/constants/colors';

interface StatisticsCardProps {
  activities: Activity[];
  date: string;
}

export default function StatisticsCard({ activities, date }: StatisticsCardProps) {
  // Get the week dates for the selected date (Sunday to Saturday)
  const getWeekDates = (dateString: string) => {
    // Parse the date with noon time to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    
    if (isNaN(date.getTime())) {
      console.error("Invalid date in getWeekDates:", dateString);
      return [];
    }
    
    const day_of_week = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Calculate the date of the Sunday that starts this week
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - day_of_week);
    sunday.setHours(0, 0, 0, 0); // Set to midnight to ensure correct day
    
    // Generate an array of dates for the week (Sunday to Saturday)
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(sunday);
      currentDate.setDate(sunday.getDate() + i);
      
      // Format as YYYY-MM-DD
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      weekDates.push(`${year}-${month}-${day}`);
    }
    
    return weekDates;
  };
  
  const weekDates = getWeekDates(date);
  
  // Filter activities for the current week (excluding 'Other' type)
  const weekActivities = activities.filter(activity => 
    weekDates.includes(activity.date) && 
    activity.type !== 'Other'
  );
  
  // Count activities by type
  const countActivitiesByType = (type: string) => {
    return weekActivities.filter(activity => activity.type === type).length;
  };
  
  const flightCount = countActivitiesByType('Flight');
  const groundCount = countActivitiesByType('Ground');
  const simCount = countActivitiesByType('SIM');
  const totalCount = flightCount + groundCount + simCount;
  
  // Get date range for the week
  const getWeekDateRange = () => {
    if (weekDates.length === 0) return '';
    
    const startDate = new Date(weekDates[0]);
    const endDate = new Date(weekDates[6]);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{getWeekDateRange()}</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statsColumn}>
          <Text style={styles.statsHeader}>Activity Count</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Flight:</Text>
            <Text style={styles.statValue}>{flightCount}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Ground:</Text>
            <Text style={styles.statValue}>{groundCount}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>SIM:</Text>
            <Text style={styles.statValue}>{simCount}</Text>
          </View>
          
          <View style={[styles.statRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{totalCount}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginVertical: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statsColumn: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 16,
  },
  statsHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});