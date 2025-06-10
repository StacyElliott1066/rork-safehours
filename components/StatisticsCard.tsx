import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity } from '@/types/activity';
import { COLORS } from '@/constants/colors';
import { calculateDuration } from '@/utils/time';

interface StatisticsCardProps {
  activities: Activity[];
  date: string;
}

export default function StatisticsCard({ activities, date }: StatisticsCardProps) {
  // Get the start of the week (Sunday) for the selected date
  const getWeekDates = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Calculate the date of the Sunday that starts this week
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - day);
    
    // Generate an array of dates for the week
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(sunday);
      currentDate.setDate(sunday.getDate() + i);
      weekDates.push(currentDate.toISOString().split('T')[0]);
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