import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useActivityStore } from '@/store/activityStore';
import { COLORS } from '@/constants/colors';
import { Activity } from '@/types/activity';
import { calculateDuration, timeToMinutes } from '@/utils/time';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react-native';

const LIMIT_HOURS = 8; // 8-hour limit
const INTERVAL_MINUTES = 15; // 15-minute intervals for the chart

export default function ShieldScreen() {
  const { activities } = useActivityStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timePoints, setTimePoints] = useState<{ time: Date; hours: number }[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<{ time: Date; hours: number } | null>(null);
  const [maxHours, setMaxHours] = useState(10); // Default max for y-axis
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Generate time points and calculate hours for each point
  useEffect(() => {
    generateTimePoints();
  }, [activities, currentTime]);
  
  // Scroll to current time when component mounts
  useEffect(() => {
    if (timePoints.length > 0 && scrollViewRef.current) {
      // Wait for layout to complete
      setTimeout(() => {
        const screenWidth = Dimensions.get('window').width;
        const pointWidth = 20; // Width of each point in the chart
        
        // Find index closest to current time
        const currentTimeIndex = timePoints.findIndex(point => {
          return Math.abs(point.time.getTime() - currentTime.getTime()) < INTERVAL_MINUTES * 60000;
        });
        
        const indexToScrollTo = currentTimeIndex !== -1 ? currentTimeIndex : timePoints.length - 1;
        
        // Calculate position to center the current time
        const scrollPosition = Math.max(0, (indexToScrollTo * pointWidth) - (screenWidth / 2) + pointWidth);
        
        scrollViewRef.current?.scrollTo({ x: scrollPosition, animated: true });
      }, 500);
    }
  }, [timePoints]);
  
  const generateTimePoints = () => {
    if (activities.length === 0) {
      setTimePoints([]);
      return;
    }
    
    // Find earliest and latest activity dates
    let earliestDate = new Date();
    let latestDate = new Date(0); // Jan 1, 1970
    
    activities.forEach(activity => {
      if (activity.type === 'Flight') {
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
        
        if (startDateTime < earliestDate) {
          earliestDate = new Date(startDateTime);
        }
        
        if (endDateTime > latestDate) {
          latestDate = new Date(endDateTime);
        }
      }
    });
    
    // If no flight activities found, use current time
    if (latestDate.getTime() === 0) {
      setTimePoints([{ time: currentTime, hours: 0 }]);
      return;
    }
    
    // Ensure we include current time if it's after the latest activity
    if (currentTime > latestDate) {
      latestDate = new Date(currentTime);
    }
    
    // Add buffer time before earliest and after latest
    earliestDate.setHours(earliestDate.getHours() - 24);
    latestDate.setHours(latestDate.getHours() + 1);
    
    const points: { time: Date; hours: number }[] = [];
    
    // Generate points from earliest to latest at 15-minute intervals
    let currentPoint = new Date(earliestDate);
    while (currentPoint <= latestDate) {
      const hoursInLast24 = calculateHoursInLast24Hours(currentPoint);
      points.push({ time: new Date(currentPoint), hours: hoursInLast24 });
      
      // Move to next interval
      currentPoint.setMinutes(currentPoint.getMinutes() + INTERVAL_MINUTES);
    }
    
    // Find the maximum hours to adjust the y-axis scale
    const maxCalculatedHours = Math.max(...points.map(p => p.hours), LIMIT_HOURS);
    // Round up to the nearest 2 for a clean scale
    const newMaxHours = Math.ceil(maxCalculatedHours / 2) * 2;
    setMaxHours(Math.max(10, newMaxHours)); // At least 10 hours for the scale
    
    setTimePoints(points);
    
    // Set the current time point as selected by default
    const currentTimeIndex = points.findIndex(point => {
      return Math.abs(point.time.getTime() - currentTime.getTime()) < INTERVAL_MINUTES * 60000;
    });
    
    if (currentTimeIndex !== -1) {
      setSelectedPoint(points[currentTimeIndex]);
    } else if (points.length > 0) {
      setSelectedPoint(points[points.length - 1]);
    }
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
  
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    return `${day}-${month}`;
  };
  
  const getPointColor = (hours: number): string => {
    return hours > LIMIT_HOURS ? COLORS.red : COLORS.primary;
  };
  
  const handlePointPress = (point: { time: Date; hours: number }) => {
    setSelectedPoint(point);
  };
  
  const renderYAxisLabels = () => {
    const labels = [];
    const step = 2; // 2-hour step for y-axis
    
    for (let i = 0; i <= maxHours; i += step) {
      labels.push(
        <Text 
          key={`y-${i}`} 
          style={[
            styles.axisLabel, 
            { bottom: (i / maxHours) * 200 - 10 },
            i === LIMIT_HOURS && styles.limitLabel
          ]}
        >
          {i}h
        </Text>
      );
    }
    
    return labels;
  };
  
  const renderChart = () => {
    if (timePoints.length === 0) return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyChartText}>No flight activities found</Text>
      </View>
    );
    
    // Use 20px per point for better spacing
    const pointWidth = 20;
    const chartWidth = timePoints.length * pointWidth;
    
    return (
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          {renderYAxisLabels()}
        </View>
        
        {/* Chart area */}
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={true}
          style={styles.chartScrollView}
          contentContainerStyle={[styles.chartContent, { width: chartWidth }]}
        >
          {/* 8-hour limit line - aligned with the 8h label */}
          <View 
            style={[
              styles.limitLine, 
              { bottom: (LIMIT_HOURS / maxHours) * 200 + 65 }
            ]} 
          />
          
          {/* Points */}
          {timePoints.map((point, index) => {
            const isSelected = selectedPoint && 
                              selectedPoint.time.getTime() === point.time.getTime();
            const isCurrent = Math.abs(point.time.getTime() - currentTime.getTime()) < INTERVAL_MINUTES * 60000;
            const pointColor = getPointColor(point.hours);
            
            // Only show time label for every 4th point (hourly)
            const showTimeLabel = index % 4 === 0;
            
            // Show date label for first point of the day
            const showDateLabel = index === 0 || 
                                (index > 0 && 
                                 point.time.getDate() !== timePoints[index-1].time.getDate());
            
            return (
              <View
                key={`point-${index}`}
                style={[
                  styles.pointColumn,
                  { left: index * pointWidth }
                ]}
              >
                {/* Hours value bubble - only show for selected point */}
                {isSelected && (
                  <View style={styles.hoursBubble}>
                    <Text style={styles.hoursValue}>
                      {point.hours.toFixed(1)}h
                    </Text>
                  </View>
                )}
                
                {/* Point dot */}
                <TouchableOpacity
                  style={styles.pointTouchable}
                  onPress={() => handlePointPress(point)}
                >
                  <View 
                    style={[
                      styles.chartPoint, 
                      { 
                        bottom: (point.hours / maxHours) * 200,
                        backgroundColor: pointColor,
                      },
                      isSelected && styles.selectedPoint,
                      isCurrent && styles.currentPoint
                    ]}
                  />
                </TouchableOpacity>
                
                {/* Time label - only show for every 4th point (hourly) */}
                {showTimeLabel && (
                  <Text style={styles.timeLabel}>
                    {formatTime(point.time)}
                  </Text>
                )}
                
                {/* Date label - only show for first point of each day */}
                {showDateLabel && (
                  <Text style={styles.dateLabel}>
                    {formatDate(point.time)}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };
  
  // Get current hours in last 24 hours
  const currentHours = timePoints.length > 0 ? 
    (selectedPoint ? selectedPoint.hours : timePoints[timePoints.length - 1].hours) : 
    calculateHoursInLast24Hours(new Date());
  
  const isOverLimit = currentHours > LIMIT_HOURS;
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Status card */}
          <View style={[
            styles.statusCard,
            isOverLimit ? styles.warningCard : styles.safeCard
          ]}>
            <View style={styles.statusHeader}>
              {isOverLimit ? (
                <AlertCircle size={24} color={COLORS.white} />
              ) : (
                <CheckCircle size={24} color={COLORS.white} />
              )}
              <Text style={styles.statusTitle}>
                {isOverLimit ? "Limit Exceeded" : "Within Limit"}
              </Text>
            </View>
            
            <View style={styles.statusContent}>
              <Text style={styles.statusValue}>
                {currentHours.toFixed(1)}h
              </Text>
              <Text style={styles.statusLabel}>
                in the last 24 hours
                {selectedPoint && selectedPoint.time.getTime() !== currentTime.getTime() && 
                  ` (at ${formatTime(selectedPoint.time)})`}
              </Text>
            </View>
            
            <View style={styles.statusFooter}>
              <Text style={styles.statusFooterText}>
                {isOverLimit 
                  ? `You are ${(currentHours - LIMIT_HOURS).toFixed(1)} hours over the 8-hour limit`
                  : `You have ${(LIMIT_HOURS - currentHours).toFixed(1)} hours remaining`
                }
              </Text>
            </View>
          </View>
          
          {/* Chart section */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>8-Hour Shield Timeline</Text>
            <Text style={styles.chartSubtitle}>
              Each dot shows flight instruction hours in the previous 24 hours at that point in time
            </Text>
            
            {renderChart()}
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>About 8-Hour Shield</Text>
            <Text style={styles.infoText}>
              The 8-Hour Shield tracks your flight instruction hours in a rolling 24-hour window across your entire activity history. This helps ensure compliance with regulations that limit flight instruction time to 8 hours in any 24-hour period.
            </Text>
            <Text style={styles.infoText}>
              The chart shows your flight instruction hours at 15-minute intervals. Tap any point to see details for that specific time.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

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
  statusCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  warningCard: {
    backgroundColor: COLORS.red,
  },
  safeCard: {
    backgroundColor: COLORS.green,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 8,
  },
  statusContent: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statusValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statusLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  statusFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 12,
  },
  statusFooterText: {
    fontSize: 14,
    color: COLORS.white,
    textAlign: 'center',
  },
  chartSection: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chartSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 260, // Increased height to accommodate labels
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  emptyChartText: {
    color: COLORS.gray,
    fontSize: 16,
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
  limitLabel: {
    color: COLORS.red,
    fontWeight: 'bold',
  },
  chartScrollView: {
    flex: 1,
    height: 260,
  },
  chartContent: {
    height: 260,
    position: 'relative',
  },
  limitLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.red,
    zIndex: 10,
  },
  pointColumn: {
    position: 'absolute',
    width: 20,
    height: 260,
    alignItems: 'center',
  },
  pointTouchable: {
    position: 'absolute',
    width: 20,
    height: 200,
    alignItems: 'center',
  },
  chartPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    zIndex: 15,
  },
  selectedPoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  currentPoint: {
    borderWidth: 1,
    borderColor: COLORS.black,
  },
  hoursBubble: {
    position: 'absolute',
    bottom: 220, // Position above the chart area
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 20,
    width: 70, // Increased from 60px to 70px to accommodate longer text on one line
    alignItems: 'center', // Center the text horizontally
  },
  hoursValue: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeLabel: {
    position: 'absolute',
    bottom: 40,
    fontSize: 10,
    color: COLORS.black,
    backgroundColor: COLORS.white,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    zIndex: 20,
    width: 50, // Increased width from 40px to 50px
    textAlign: 'center',
  },
  dateLabel: {
    position: 'absolute',
    bottom: 10,
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.black,
    backgroundColor: COLORS.white,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    zIndex: 20,
    width: 50, // Increased width from 40px to 50px
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
    lineHeight: 20,
  },
});