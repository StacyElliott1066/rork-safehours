import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useActivityStore } from '@/store/activityStore';
import DateSelector from '@/components/DateSelector';
import WeeklyChart from '@/components/WeeklyChart';
import StatisticsCard from '@/components/StatisticsCard';
import MonthlyChart from '@/components/MonthlyChart';
import MonthlyStatisticsCard from '@/components/MonthlyStatisticsCard';
import { COLORS } from '@/constants/colors';

type ViewMode = 'weekly' | 'monthly';

export default function ChartsScreen() {
  const { activities, selectedDate, setSelectedDate } = useActivityStore();
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'weekly' && styles.weeklyActive]}
              onPress={() => setViewMode('weekly')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, viewMode === 'weekly' && styles.toggleTextActive]}>
                Weekly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'monthly' && styles.monthlyActive]}
              onPress={() => setViewMode('monthly')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, viewMode === 'monthly' && styles.toggleTextActive]}>
                Monthly
              </Text>
            </TouchableOpacity>
          </View>

          {viewMode === 'weekly' ? (
            <>
              <WeeklyChart
                activities={activities}
                date={selectedDate}
              />
              <StatisticsCard
                activities={activities}
                date={selectedDate}
              />
            </>
          ) : (
            <>
              <MonthlyChart
                activities={activities}
                date={selectedDate}
              />
              <MonthlyStatisticsCard
                activities={activities}
                date={selectedDate}
              />
            </>
          )}
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
    marginVertical: 12,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  weeklyActive: {
    backgroundColor: '#FF8C00',
  },
  monthlyActive: {
    backgroundColor: '#28A745',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
});
