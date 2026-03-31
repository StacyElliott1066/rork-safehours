import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity } from '@/types/activity';
import { COLORS } from '@/constants/colors';

interface MonthlyStatisticsCardProps {
  activities: Activity[];
  date: string;
}

export default function MonthlyStatisticsCard({ activities, date }: MonthlyStatisticsCardProps) {
  const getWeekDates = (dateString: string): string[] => {
    const [year, month, day] = dateString.split('-').map(Number);
    const d = new Date(year, month - 1, day, 12, 0, 0);
    if (isNaN(d.getTime())) return [];
    const dayOfWeek = d.getDay();
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(sunday);
      cur.setDate(sunday.getDate() + i);
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const dd = String(cur.getDate()).padStart(2, '0');
      weekDates.push(`${y}-${m}-${dd}`);
    }
    return weekDates;
  };

  const getFourWeeksDates = (targetDate: string): string[] => {
    const week4Dates = getWeekDates(targetDate);
    if (week4Dates.length === 0) return [];
    const allDates: string[] = [];
    for (let w = 3; w >= 0; w--) {
      const sunday = new Date(
        Number(week4Dates[0].split('-')[0]),
        Number(week4Dates[0].split('-')[1]) - 1,
        Number(week4Dates[0].split('-')[2]),
        12, 0, 0
      );
      sunday.setDate(sunday.getDate() - w * 7);
      sunday.setHours(0, 0, 0, 0);
      for (let i = 0; i < 7; i++) {
        const cur = new Date(sunday);
        cur.setDate(sunday.getDate() + i);
        const y = cur.getFullYear();
        const m = String(cur.getMonth() + 1).padStart(2, '0');
        const dd = String(cur.getDate()).padStart(2, '0');
        allDates.push(`${y}-${m}-${dd}`);
      }
    }
    return allDates;
  };

  const monthDates = getFourWeeksDates(date);

  const monthActivities = activities.filter(activity =>
    monthDates.includes(activity.date) &&
    activity.type !== 'Other Internal' &&
    activity.type !== 'Other External'
  );

  const countByType = (type: string): number =>
    monthActivities.filter(a => a.type === type).length;

  const flightCount = countByType('Flight');
  const groundCount = countByType('Ground');
  const simCount = countByType('SIM');
  const totalCount = flightCount + groundCount + simCount;

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statsColumn}>
          <Text style={styles.statsHeader}>Activity Count (4 Weeks)</Text>

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
  statsContainer: {
    flexDirection: 'row',
  },
  statsColumn: {
    flex: 1,
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
