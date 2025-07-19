import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useActivityStore } from '@/store/activityStore';
import { COLORS } from '@/constants/colors';
import { Activity } from '@/types/activity';
import { calculateDuration, timeToMinutes, calculateRollingContactTime, safeParseDate } from '@/utils/time';
import { Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react-native';

const FLIGHT_LIMIT_HOURS = 8; // 8-hour flight instruction limit
const CONTACT_LIMIT_HOURS = 10; // 10-hour contact time limit (example, use actual value from settings)
const INTERVAL_MINUTES = 15; // 15-minute intervals for the chart

export default function ShieldScreen() {
  const { activities, warningThresholds } = useActivityStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timePoints, setTimePoints] = useState<{ time: Date; flightHours: number; contactHours: number }[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<{ time: Date; flightHours: number; contactHours: number } | null>(null);
  const [maxHours, setMaxHours] = useState(10); // Default max for y-axis
  const [activeChart, setActiveChart] = useState<'flight' | 'contact'>('flight');
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
  }, [activities, currentTime, warningThresholds]);
  
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
      if (activity.type !== 'Other') {
        const activityDate = safeParseDate(activity.date);
        if (!activityDate) return;
        
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
    
    // If no activities found, use current time
    if (latestDate.getTime() === 0) {
      setTimePoints([{ time: currentTime, flightHours: 0, contactHours: 0 }]);
      return;
    }
    
    // Ensure we include current time if it's after the latest activity
    if (currentTime > latestDate) {
      latestDate = new Date(currentTime);
    }
    
    // Add buffer time before earliest and after latest
    earliestDate.setHours(earliestDate.getHours() - 24);
    latestDate.setHours(latestDate.getHours() + 1);
    
    const points: { time: Date; flightHours: number; contactHours: number }[] = [];
    
    // Generate points from earliest to latest at 15-minute intervals
    let currentPoint = new Date(earliestDate);
    while (currentPoint <= latestDate) {
      const flightHoursInLast24 = calculateHoursInLast24Hours(currentPoint);
      const contactHoursInLast24 = calculateRollingContactTime(activities, currentPoint);
      points.push({ 
        time: new Date(currentPoint), 
        flightHours: flightHoursInLast24,
        contactHours: contactHoursInLast24
      });
      
      // Move to next interval
      currentPoint.setMinutes(currentPoint.getMinutes() + INTERVAL_MINUTES);
    }
    
    // Find the maximum hours to adjust the y-axis scale
    const maxFlightHours = Math.max(...points.map(p => p.flightHours), FLIGHT_LIMIT_HOURS);
    const maxContactHours = Math.max(...points.map(p => p.contactHours), warningThresholds.maxContactTime);
    const maxCalculatedHours = Math.max(maxFlightHours, maxContactHours);
    
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
      
      const activityDate = safeParseDate(activity.date);
      if (!activityDate) return;
      
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
      
      // For flight hours, only count actual flight time, not pre/post
      // Check if activity is within the 24-hour window
      if (endDateTime > twentyFourHoursAgo && startDateTime < fromTime) {
        // Calculate overlap with the 24-hour window
        const overlapStart = Math.max(startDateTime.getTime(), twentyFourHoursAgo.getTime());
        const overlapEnd = Math.min(endDateTime.getTime(), fromTime.getTime());
        
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
  
  const getPointColor = (hours: number, type: 'flight' | 'contact'): string => {
    const limit = type === 'flight' ? FLIGHT_LIMIT_HOURS : warningThresholds.maxContactTime;
    return hours > limit ? COLORS.red : (type === 'flight' ? COLORS.primary : COLORS.secondary || '#4CAF50');
  };
  
  const handlePointPress = (point: { time: Date; flightHours: number; contactHours: number }) => {
    setSelectedPoint(point);
  };
  
  const toggleChartType = () => {
    setActiveChart(activeChart === 'flight' ? 'contact' : 'flight');
  };
  
  const renderYAxisLabels = () => {
    const labels = [];
    const step = 2; // 2-hour step for y-axis
    
    for (let i = 0; i <= maxHours; i += step) {
      const isFlightLimit = i === FLIGHT_LIMIT_HOURS;
      const isContactLimit = i === warningThresholds.maxContactTime;
      const isLimit = (activeChart === 'flight' && isFlightLimit) || 
                      (activeChart === 'contact' && isContactLimit);
      
      labels.push(
        <Text 
          key={`y-${i}`} 
          style={[
            styles.axisLabel, 
            { bottom: (i / maxHours) * 200 - 10 },
            isLimit && styles.limitLabel
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
        <Text style={styles.emptyChartText}>No activities found</Text>
      </View>
    );
    
    // Use 20px per point for better spacing
    const pointWidth = 20;
    const chartWidth = timePoints.length * pointWidth;
    const limitValue = activeChart === 'flight' ? FLIGHT_LIMIT_HOURS : warningThresholds.maxContactTime;
    
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
          {/* Limit line */}
          <View 
            style={[
              styles.limitLine, 
              { 
                bottom: (limitValue / maxHours) * 200 + 65,
                backgroundColor: activeChart === 'flight' ? COLORS.red : COLORS.secondary || '#4CAF50'
              }
            ]} 
          />
          
          {/* Points */}
          {timePoints.map((point, index) => {
            const isSelected = selectedPoint && 
                              selectedPoint.time.getTime() === point.time.getTime();
            const isCurrent = Math.abs(point.time.getTime() - currentTime.getTime()) < INTERVAL_MINUTES * 60000;
            const hours = activeChart === 'flight' ? point.flightHours : point.contactHours;
            const pointColor = getPointColor(hours, activeChart);
            
            // Show time label for every 4th point (hourly)
            const showTimeLabel = index % 4 === 0;
            
            // Show date label for first point of the day or every 12th point (every 3 hours)
            const showDateLabel = index === 0 || 
                                (index > 0 && 
                                 (point.time.getDate() !== timePoints[index-1].time.getDate() || 
                                  index % 12 === 0)); // Every 3 hours (12 * 15min = 3h)
            
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
                  <View style={[
                    styles.hoursBubble,
                    { backgroundColor: activeChart === 'flight' ? COLORS.primary : COLORS.secondary || '#4CAF50' }
                  ]}>
                    <Text style={styles.hoursValue}>
                      {hours.toFixed(1)}h
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
                        bottom: (hours / maxHours) * 200,
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
                
                {/* Date label - only show for first point of each day or every 3 hours */}
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
  const currentFlightHours = timePoints.length > 0 ? 
    (selectedPoint ? selectedPoint.flightHours : timePoints[timePoints.length - 1].flightHours) : 
    calculateHoursInLast24Hours(new Date());
  
  const currentContactHours = timePoints.length > 0 ? 
    (selectedPoint ? selectedPoint.contactHours : timePoints[timePoints.length - 1].contactHours) : 
    calculateRollingContactTime(activities, new Date());
  
  const isFlightOverLimit = currentFlightHours > FLIGHT_LIMIT_HOURS;
  const isContactOverLimit = currentContactHours > warningThresholds.maxContactTime;
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Chart toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[
                styles.toggleButton, 
                activeChart === 'flight' && styles.activeToggle
              ]}
              onPress={() => setActiveChart('flight')}
            >
              <Shield size={16} color={activeChart === 'flight' ? COLORS.white : COLORS.gray} />
              <Text style={[
                styles.toggleText,
                activeChart === 'flight' && styles.activeToggleText
              ]}>
                Flight Hours
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.toggleButton, 
                activeChart === 'contact' && styles.activeToggleContact
              ]}
              onPress={() => setActiveChart('contact')}
            >
              <Clock size={16} color={activeChart === 'contact' ? COLORS.white : COLORS.gray} />
              <Text style={[
                styles.toggleText,
                activeChart === 'contact' && styles.activeToggleText
              ]}>
                Contact Time
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Status cards */}
          <View style={styles.statusCardsContainer}>
            {/* Flight Hours Status */}
            <View style={[
              styles.statusCard,
              styles.halfCard,
              isFlightOverLimit ? styles.warningCard : styles.safeCard,
              activeChart === 'flight' && styles.activeCard
            ]}>
              <View style={styles.statusHeader}>
                {isFlightOverLimit ? (
                  <AlertCircle size={18} color={COLORS.white} />
                ) : (
                  <CheckCircle size={18} color={COLORS.white} />
                )}
                <Text style={styles.statusTitle}>
                  Flight Hours
                </Text>
              </View>
              
              <View style={styles.statusContent}>
                <Text style={styles.statusValue}>
                  {currentFlightHours.toFixed(1)}h
                </Text>
                <Text style={styles.statusLabel}>
                  / {FLIGHT_LIMIT_HOURS}h limit
                </Text>
              </View>
            </View>
            
            {/* Contact Time Status */}
            <View style={[
              styles.statusCard,
              styles.halfCard,
              isContactOverLimit ? styles.warningCard : styles.safeContactCard,
              activeChart === 'contact' && styles.activeCard
            ]}>
              <View style={styles.statusHeader}>
                {isContactOverLimit ? (
                  <AlertCircle size={18} color={COLORS.white} />
                ) : (
                  <CheckCircle size={18} color={COLORS.white} />
                )}
                <Text style={styles.statusTitle}>
                  Contact Time
                </Text>
              </View>
              
              <View style={styles.statusContent}>
                <Text style={styles.statusValue}>
                  {currentContactHours.toFixed(1)}h
                </Text>
                <Text style={styles.statusLabel}>
                  / {warningThresholds.maxContactTime}h limit
                </Text>
              </View>
            </View>
          </View>
          
          {/* Chart section */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>
              {activeChart === 'flight' ? 'Flight Hours Timeline' : 'Contact Time Timeline'}
            </Text>
            <Text style={styles.chartSubtitle}>
              Each dot shows {activeChart === 'flight' ? 'flight instruction hours' : 'contact time'} in the previous 24 hours at that point in time
            </Text>
            
            {renderChart()}
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>About Rolling 24-Hour Limits</Text>
            <Text style={styles.infoText}>
              This chart tracks both flight instruction hours and total contact time in a rolling 24-hour window across your entire activity history. This helps ensure compliance with regulations that limit:
            </Text>
            <Text style={styles.infoText}>
              • Flight instruction time to 8 hours in any 24-hour period
            </Text>
            <Text style={styles.infoText}>
              • Total contact time to {warningThresholds.maxContactTime} hours in any 24-hour period
            </Text>
            <Text style={styles.infoText}>
              The chart shows your hours at 15-minute intervals. Tap any point to see details for that specific time.
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
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGray,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  activeToggle: {
    backgroundColor: COLORS.primary,
  },
  activeToggleContact: {
    backgroundColor: COLORS.secondary || '#4CAF50',
  },
  toggleText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.gray,
  },
  activeToggleText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  statusCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusCard: {
    borderRadius: 8,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  halfCard: {
    width: '48%',
  },
  activeCard: {
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  warningCard: {
    backgroundColor: COLORS.red,
  },
  safeCard: {
    backgroundColor: COLORS.primary,
  },
  safeContactCard: {
    backgroundColor: COLORS.secondary || '#4CAF50',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 6,
  },
  statusContent: {
    alignItems: 'center',
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
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