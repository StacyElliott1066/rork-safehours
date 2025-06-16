import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Activity } from '@/types/activity';
import { COLORS } from '@/constants/colors';
import { timeToMinutes } from '@/utils/time';

interface WeeklyChartProps {
  activities: Activity[];
  date: string;
}

export default function WeeklyChart({ activities, date }: WeeklyChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const barWidth = (screenWidth - 60) / 7; // 7 days of the week
  
  // Get the start of the week (Sunday) for the selected date
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
  
  // Calculate hours by activity type for each day, properly handling overnight activities
  const calculateDailyHours = (dateString: string, type: string) => {
    let totalMinutes = 0;
    
    activities.forEach(activity => {
      if (activity.type !== type) return;
      
      const activityDate = activity.date;
      
      // If this activity starts on this date
      if (activityDate === dateString) {
        const startMinutes = timeToMinutes(activity.startTime);
        let endMinutes = timeToMinutes(activity.endTime);
        const isOvernight = endMinutes < startMinutes;
        
        if (isOvernight) {
          // For overnight activities, only count hours until midnight
          const minutesUntilMidnight = 24 * 60 - startMinutes;
          totalMinutes += minutesUntilMidnight;
        } else {
          // Regular activity within the same day
          totalMinutes += endMinutes - startMinutes;
        }
      } 
      // If this activity ends on this date (started the day before)
      else if (isNextDay(activity.date, dateString) && timeToMinutes(activity.endTime) < timeToMinutes(activity.startTime)) {
        // Only count hours from midnight to end time
        totalMinutes += timeToMinutes(activity.endTime);
      }
    });
    
    return totalMinutes / 60; // Convert to hours
  };
  
  // Check if date2 is the day after date1
  const isNextDay = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setDate(d1.getDate() + 1);
    return d1.toISOString().split('T')[0] === date2;
  };
  
  // Calculate pre/post hours for a day, properly handling overnight activities
  const calculateDailyPrePostHours = (dateString: string) => {
    let totalMinutes = 0;
    
    activities.forEach(activity => {
      if (!['Flight', 'SIM'].includes(activity.type) || activity.prePostValue === 0) return;
      
      const activityDate = activity.date;
      const prePostMinutes = activity.prePostValue * 60;
      const preMinutes = prePostMinutes / 2;
      const postMinutes = prePostMinutes / 2;
      
      // If this activity starts on this date
      if (activityDate === dateString) {
        const startMinutes = timeToMinutes(activity.startTime);
        let endMinutes = timeToMinutes(activity.endTime);
        const isOvernight = endMinutes < startMinutes;
        
        if (isOvernight) {
          // For overnight activities, add pre-time and proportional post-time
          // Pre-time is fully on this day
          totalMinutes += preMinutes;
          
          // For post-time, calculate proportion based on activity duration on this day
          const minutesUntilMidnight = 24 * 60 - startMinutes;
          const totalActivityMinutes = minutesUntilMidnight + endMinutes;
          const proportionOnThisDay = minutesUntilMidnight / totalActivityMinutes;
          
          // Add proportional post-time
          totalMinutes += postMinutes * proportionOnThisDay;
        } else {
          // Regular activity within the same day - add all pre/post time
          totalMinutes += preMinutes + postMinutes;
        }
      } 
      // If this activity ends on this date (started the day before)
      else if (isNextDay(activity.date, dateString) && timeToMinutes(activity.endTime) < timeToMinutes(activity.startTime)) {
        // Add proportional pre-time and full post-time
        const startMinutes = timeToMinutes(activity.startTime);
        let endMinutes = timeToMinutes(activity.endTime);
        const minutesUntilMidnight = 24 * 60 - startMinutes;
        const totalActivityMinutes = minutesUntilMidnight + endMinutes;
        const proportionOnThisDay = endMinutes / totalActivityMinutes;
        
        // Add proportional pre-time
        totalMinutes += preMinutes * proportionOnThisDay;
        
        // Post-time is fully on this day
        totalMinutes += postMinutes;
      }
    });
    
    return totalMinutes / 60; // Convert to hours
  };
  
  // Get the maximum hours in a day for scaling
  const getMaxHours = () => {
    let max = 0;
    
    weekDates.forEach(dateString => {
      const flightHours = calculateDailyHours(dateString, 'Flight');
      const groundHours = calculateDailyHours(dateString, 'Ground');
      const simHours = calculateDailyHours(dateString, 'SIM');
      const prePostHours = calculateDailyPrePostHours(dateString);
      
      const total = flightHours + groundHours + simHours + prePostHours;
      if (total > max) max = total;
    });
    
    // Round up to the nearest integer for better visualization
    return Math.ceil(max) || 8; // Default to 8 if no activities
  };
  
  const maxHours = getMaxHours();
  const chartHeight = 200; // Fixed chart height
  const pixelsPerHour = chartHeight / maxHours; // Exact pixels per hour for precise scaling
  
  // Calculate total hours for the week by type
  const calculateWeeklyHoursByType = (type: string) => {
    return weekDates.reduce((total, dateString) => {
      return total + calculateDailyHours(dateString, type);
    }, 0);
  };
  
  // Calculate total pre/post hours for the week
  const calculateWeeklyPrePostHours = () => {
    return weekDates.reduce((total, dateString) => {
      return total + calculateDailyPrePostHours(dateString);
    }, 0);
  };
  
  const totalFlightHours = calculateWeeklyHoursByType('Flight');
  const totalGroundHours = calculateWeeklyHoursByType('Ground');
  const totalSimHours = calculateWeeklyHoursByType('SIM');
  const totalPrePostHours = calculateWeeklyPrePostHours();
  const totalWeeklyHours = totalFlightHours + totalGroundHours + totalSimHours + totalPrePostHours;
  
  // Count days with activities
  const daysWithActivities = weekDates.filter(dateString => {
    return activities.some(activity => {
      // Check for activities that start on this date
      if (activity.date === dateString && 
          (activity.type === 'Flight' || activity.type === 'Ground' || activity.type === 'SIM')) {
        return true;
      }
      
      // Check for overnight activities that end on this date
      if (isNextDay(activity.date, dateString) && 
          (activity.type === 'Flight' || activity.type === 'Ground' || activity.type === 'SIM') &&
          timeToMinutes(activity.endTime) < timeToMinutes(activity.startTime)) {
        return true;
      }
      
      return false;
    });
  }).length;
  
  // Calculate average hours per day (only for days with activities)
  const averageHoursPerDay = daysWithActivities > 0 ? totalWeeklyHours / daysWithActivities : 0;
  const averageHeight = averageHoursPerDay * pixelsPerHour;
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Weekly Statistics</Text>
      </View>
      
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          {Array.from({ length: maxHours + 1 }).map((_, i) => {
            // Only show labels for integer hours
            if (i % 1 === 0) {
              return (
                <Text 
                  key={i} 
                  style={[
                    styles.axisLabel,
                    { bottom: i * pixelsPerHour - 10 } // Position at exact hour mark
                  ]}
                >
                  {i}
                </Text>
              );
            }
            return null;
          })}
          {averageHoursPerDay > 0 ? (
            <Text 
              style={[
                styles.axisLabel, 
                styles.averageLabel, 
                { bottom: averageHeight - 10 }
              ]}
            >
              Ave.
            </Text>
          ) : null}
        </View>
        
        {/* Chart bars */}
        <View style={styles.barsContainer}>
          {/* Hour grid lines */}
          {Array.from({ length: maxHours + 1 }).map((_, i) => {
            if (i % 1 === 0) { // Only show lines for integer hours
              return (
                <View 
                  key={`grid-${i}`}
                  style={[
                    styles.gridLine,
                    { bottom: i * pixelsPerHour }
                  ]}
                />
              );
            }
            return null;
          })}
          
          {/* Average line */}
          {averageHoursPerDay > 0 ? (
            <View 
              style={[
                styles.averageLine, 
                { bottom: averageHeight }
              ]} 
            />
          ) : null}
          
          {weekDates.map((dateString, index) => {
            const flightHours = calculateDailyHours(dateString, 'Flight');
            const groundHours = calculateDailyHours(dateString, 'Ground');
            const simHours = calculateDailyHours(dateString, 'SIM');
            const prePostHours = calculateDailyPrePostHours(dateString);
            
            // Calculate heights for stacked bars
            const flightHeight = flightHours * pixelsPerHour;
            const groundHeight = groundHours * pixelsPerHour;
            const simHeight = simHours * pixelsPerHour;
            const prePostHeight = prePostHours * pixelsPerHour;
            
            // Calculate bottom positions for stacked bars
            const groundBottom = flightHeight;
            const simBottom = flightHeight + groundHeight;
            const prePostBottom = flightHeight + groundHeight + simHeight;
            
            return (
              <View key={dateString} style={styles.barColumn}>
                <View style={styles.barGroup}>
                  {/* Flight hours */}
                  {flightHours > 0 && (
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: flightHeight,
                          bottom: 0,
                          backgroundColor: COLORS.flight 
                        }
                      ]} 
                    />
                  )}
                  
                  {/* Ground hours */}
                  {groundHours > 0 && (
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: groundHeight,
                          bottom: groundBottom,
                          backgroundColor: COLORS.ground 
                        }
                      ]} 
                    />
                  )}
                  
                  {/* SIM hours */}
                  {simHours > 0 && (
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: simHeight,
                          bottom: simBottom,
                          backgroundColor: COLORS.sim 
                        }
                      ]} 
                    />
                  )}
                  
                  {/* Pre/Post hours */}
                  {prePostHours > 0 && (
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: prePostHeight,
                          bottom: prePostBottom,
                          backgroundColor: COLORS.primary 
                        }
                      ]} 
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
      
      {/* Day labels section removed as requested */}
      
      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.flight }]} />
          <Text style={styles.legendText}>Flight: {totalFlightHours.toFixed(1)}h</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.ground }]} />
          <Text style={styles.legendText}>Ground: {totalGroundHours.toFixed(1)}h</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.sim }]} />
          <Text style={styles.legendText}>SIM: {totalSimHours.toFixed(1)}h</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Pre/Post: {totalPrePostHours.toFixed(1)}h</Text>
        </View>
      </View>
      
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Weekly Hours:</Text>
        <Text style={[
          styles.totalValue,
          totalWeeklyHours > 40 ? styles.warningValue : null
        ]}>
          {totalWeeklyHours.toFixed(1)}h
        </Text>
      </View>
      
      {daysWithActivities > 0 ? (
        <View style={styles.averageContainer}>
          <Text style={styles.averageText}>
            Average: {averageHoursPerDay.toFixed(1)}h per day ({daysWithActivities} days worked)
          </Text>
        </View>
      ) : null}
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
  averageLabel: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  averageLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    zIndex: 1,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barGroup: {
    width: 20,
    height: 200,
    position: 'relative',
  },
  bar: {
    width: 20,
    position: 'absolute',
    left: 0,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  // dayLabelsContainer and dayLabelColumn styles removed
  // dayLabel style removed
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
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
  warningValue: {
    color: COLORS.red,
  },
  averageContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  averageText: {
    fontSize: 14,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
});