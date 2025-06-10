import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useActivityStore } from '@/store/activityStore';
import DateSelector from '@/components/DateSelector';
import WeeklyChart from '@/components/WeeklyChart';
import StatisticsCard from '@/components/StatisticsCard';
import { COLORS } from '@/constants/colors';

export default function ChartsScreen() {
  const { activities, selectedDate, setSelectedDate } = useActivityStore();
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <DateSelector 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate} 
          />
          
          <WeeklyChart 
            activities={activities} 
            date={selectedDate} 
          />
          
          <StatisticsCard 
            activities={activities} 
            date={selectedDate} 
          />
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
});