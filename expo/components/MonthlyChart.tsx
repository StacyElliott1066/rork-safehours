import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Activity } from '@/types/activity';
import { COLORS } from '@/constants/colors';
import { timeToMinutes } from '@/utils/time';

interface MonthlyChartProps {
  activities: Activity[];
  date: string;
}

interface WeekRange {
  dates: string[];
  label: string;
}

export default function MonthlyChart({ activities, date }: MonthlyChartProps) {
  const screenWidth = Dimensions.get('window').width;

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

  const formatWeekLabel = (dates: string[]): string => {
    if (dates.length === 0) return '';
    const start = dates[0];
    const end = dates[6];
    const [, sm, sd] = start.split('-').map(Number);
    const [, em, ed] = end.split('-').map(Number);
    return `${sm}/${sd}-${em}/${ed}`;
  };

  const getFourWeeks = (targetDate: string): WeekRange[] => {
    const week4Dates = getWeekDates(targetDate);
    if (week4Dates.length === 0) return [];

    const weeks: WeekRange[] = [];
    for (let w = 3; w >= 0; w--) {
      const sunday = new Date(
        Number(week4Dates[0].split('-')[0]),
        Number(week4Dates[0].split('-')[1]) - 1,
        Number(week4Dates[0].split('-')[2]),
        12, 0, 0
      );
      sunday.setDate(sunday.getDate() - w * 7);
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
      weeks.push({ dates: weekDates, label: formatWeekLabel(weekDates) });
    }
    return weeks;
  };

  const isNextDay = (date1: string, date2: string): boolean => {
    const d1 = new Date(date1);
    d1.setDate(d1.getDate() + 1);
    return d1.toISOString().split('T')[0] === date2;
  };

  const calculateDailyHours = (dateString: string, type: string): number => {
    let totalMinutes = 0;
    activities.forEach(activity => {
      if (activity.type !== type) return;
      if (activity.date === dateString) {
        const startMin = timeToMinutes(activity.startTime);
        const endMin = timeToMinutes(activity.endTime);
        const overnight = endMin < startMin;
        if (overnight) {
          totalMinutes += 24 * 60 - startMin;
        } else {
          totalMinutes += endMin - startMin;
        }
      } else if (
        isNextDay(activity.date, dateString) &&
        timeToMinutes(activity.endTime) < timeToMinutes(activity.startTime)
      ) {
        totalMinutes += timeToMinutes(activity.endTime);
      }
    });
    return totalMinutes / 60;
  };

  const calculateDailyPrePostHours = (dateString: string): number => {
    let totalMinutes = 0;
    activities.forEach(activity => {
      if (!['Flight', 'SIM'].includes(activity.type)) return;
      const prePostValue = activity.prePostValue ?? 0;
      if (prePostValue === 0) return;
      const prePostMinutes = prePostValue * 60;
      const preMinutes = prePostMinutes / 2;
      const postMinutes = prePostMinutes / 2;
      if (activity.date === dateString) {
        const startMin = timeToMinutes(activity.startTime);
        const endMin = timeToMinutes(activity.endTime);
        const overnight = endMin < startMin;
        if (overnight) {
          totalMinutes += preMinutes;
          const minutesUntilMidnight = 24 * 60 - startMin;
          const totalActivityMinutes = minutesUntilMidnight + endMin;
          totalMinutes += postMinutes * (minutesUntilMidnight / totalActivityMinutes);
        } else {
          totalMinutes += preMinutes + postMinutes;
        }
      } else if (
        isNextDay(activity.date, dateString) &&
        timeToMinutes(activity.endTime) < timeToMinutes(activity.startTime)
      ) {
        const startMin = timeToMinutes(activity.startTime);
        const endMin = timeToMinutes(activity.endTime);
        const minutesUntilMidnight = 24 * 60 - startMin;
        const totalActivityMinutes = minutesUntilMidnight + endMin;
        totalMinutes += preMinutes * (endMin / totalActivityMinutes);
        totalMinutes += postMinutes;
      }
    });
    return totalMinutes / 60;
  };

  const calculateWeekHours = (weekDates: string[], type: string): number => {
    return weekDates.reduce((total, d) => total + calculateDailyHours(d, type), 0);
  };

  const calculateWeekPrePostHours = (weekDates: string[]): number => {
    return weekDates.reduce((total, d) => total + calculateDailyPrePostHours(d), 0);
  };

  const fourWeeks = getFourWeeks(date);

  const weekData = fourWeeks.map(week => {
    const flight = calculateWeekHours(week.dates, 'Flight');
    const ground = calculateWeekHours(week.dates, 'Ground');
    const sim = calculateWeekHours(week.dates, 'SIM');
    const prepost = calculateWeekPrePostHours(week.dates);
    return { flight, ground, sim, prepost, total: flight + ground + sim + prepost, label: week.label };
  });

  const maxHours = Math.ceil(Math.max(...weekData.map(w => w.total), 1));
  const chartHeight = 200;
  const pixelsPerHour = chartHeight / maxHours;
  const totalMonthFlight = weekData.reduce((s, w) => s + w.flight, 0);
  const totalMonthGround = weekData.reduce((s, w) => s + w.ground, 0);
  const totalMonthSim = weekData.reduce((s, w) => s + w.sim, 0);
  const totalMonthPrePost = weekData.reduce((s, w) => s + w.prepost, 0);
  const totalMonthHours = totalMonthFlight + totalMonthGround + totalMonthSim + totalMonthPrePost;

  const barAreaWidth = screenWidth - 60 - 32;
  const barWidth = Math.floor(barAreaWidth / 4) - 8;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Monthly Statistics (4 Weeks)</Text>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.yAxisLabels}>
          {Array.from({ length: maxHours + 1 }).map((_, i) => (
            <Text
              key={i}
              style={[styles.axisLabel, { bottom: i * pixelsPerHour - 10 }]}
            >
              {i}
            </Text>
          ))}
        </View>

        <View style={styles.barsContainer}>
          {Array.from({ length: maxHours + 1 }).map((_, i) => (
            <View
              key={`grid-${i}`}
              style={[styles.gridLine, { bottom: i * pixelsPerHour }]}
            />
          ))}

          {weekData.map((week, index) => {
            const flightH = week.flight * pixelsPerHour;
            const groundH = week.ground * pixelsPerHour;
            const simH = week.sim * pixelsPerHour;
            const prePostH = week.prepost * pixelsPerHour;
            const groundBottom = flightH;
            const simBottom = flightH + groundH;
            const prePostBottom = flightH + groundH + simH;

            return (
              <View key={`week-${index}`} style={styles.barColumn}>
                <View style={[styles.barGroup, { width: barWidth }]}>
                  {week.flight > 0 && (
                    <View style={[styles.bar, { height: flightH, bottom: 0, width: barWidth, backgroundColor: COLORS.flight }]} />
                  )}
                  {week.ground > 0 && (
                    <View style={[styles.bar, { height: groundH, bottom: groundBottom, width: barWidth, backgroundColor: COLORS.ground }]} />
                  )}
                  {week.sim > 0 && (
                    <View style={[styles.bar, { height: simH, bottom: simBottom, width: barWidth, backgroundColor: COLORS.sim }]} />
                  )}
                  {week.prepost > 0 && (
                    <View style={[styles.bar, { height: prePostH, bottom: prePostBottom, width: barWidth, backgroundColor: COLORS.primary }]} />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.weekLabelsContainer}>
        {weekData.map((week, index) => (
          <View key={`label-${index}`} style={styles.weekLabelColumn}>
            <Text style={styles.weekLabel}>{week.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.flight }]} />
          <Text style={styles.legendText}>Flight: {totalMonthFlight.toFixed(2)}h</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.ground }]} />
          <Text style={styles.legendText}>Ground: {totalMonthGround.toFixed(2)}h</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.sim }]} />
          <Text style={styles.legendText}>SIM: {totalMonthSim.toFixed(2)}h</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Pre/Post: {totalMonthPrePost.toFixed(2)}h</Text>
        </View>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Monthly Hours:</Text>
        <Text style={styles.totalValue}>{totalMonthHours.toFixed(2)}h</Text>
      </View>

      <View style={styles.weekBreakdownContainer}>
        {weekData.map((week, index) => (
          <View key={`breakdown-${index}`} style={styles.weekBreakdownRow}>
            <Text style={styles.weekBreakdownLabel}>Wk {index + 1} ({week.label}):</Text>
            <Text style={styles.weekBreakdownValue}>{week.total.toFixed(2)}h</Text>
          </View>
        ))}
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
  headerContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 220,
    marginBottom: 5,
  },
  yAxisLabels: {
    width: 30,
    height: 200,
    position: 'relative',
  },
  axisLabel: {
    fontSize: 10,
    color: COLORS.gray,
    position: 'absolute',
    right: 5,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.lightGray,
    opacity: 0.5,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: 200,
    justifyContent: 'flex-end',
  },
  barGroup: {
    height: 200,
    position: 'relative',
  },
  bar: {
    position: 'absolute',
    left: 0,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  weekLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 30,
    marginBottom: 10,
  },
  weekLabelColumn: {
    flex: 1,
    alignItems: 'center',
  },
  weekLabel: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: '500',
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 8,
    minWidth: '45%',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 10,
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  weekBreakdownContainer: {
    marginTop: 4,
  },
  weekBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  weekBreakdownLabel: {
    fontSize: 13,
    color: COLORS.darkGray,
  },
  weekBreakdownValue: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary,
  },
});
