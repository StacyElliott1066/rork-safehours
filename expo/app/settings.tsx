import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useActivityStore } from '@/store/activityStore';
import { COLORS } from '@/constants/colors';

export default function SettingsScreen() {
  const { warningThresholds, updateWarningThresholds, resetWarningThresholds } = useActivityStore();

  const [thresholds, setThresholds] = useState({
    maxFlightHours: warningThresholds.maxFlightHours.toString(),
    minRestBetweenDays: warningThresholds.minRestBetweenDays.toString(),
    maxContactTime: warningThresholds.maxContactTime.toString(),
    maxDutyDay: warningThresholds.maxDutyDay.toString(),
    maxConsecutiveDays: warningThresholds.maxConsecutiveDays.toString(),
    maxWeeklyHours: warningThresholds.maxWeeklyHours.toString(),
    maxPastSevenDaysHours: warningThresholds.maxPastSevenDaysHours.toString(),
  });

  const handleSave = () => {
    const numericValues = {
      maxFlightHours: 8,
      minRestBetweenDays: parseFloat(thresholds.minRestBetweenDays),
      maxContactTime: parseFloat(thresholds.maxContactTime),
      maxDutyDay: parseFloat(thresholds.maxDutyDay),
      maxConsecutiveDays: parseInt(thresholds.maxConsecutiveDays, 10),
      maxWeeklyHours: parseFloat(thresholds.maxWeeklyHours),
      maxPastSevenDaysHours: parseFloat(thresholds.maxPastSevenDaysHours),
    };

    if (
      [
        numericValues.minRestBetweenDays,
        numericValues.maxContactTime,
        numericValues.maxDutyDay,
        numericValues.maxConsecutiveDays,
        numericValues.maxWeeklyHours,
        numericValues.maxPastSevenDaysHours,
      ].some(isNaN)
    ) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for all thresholds.');
      return;
    }

    updateWarningThresholds(numericValues);
    Alert.alert('Success', 'Warning thresholds updated successfully.');
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Thresholds',
      'Are you sure you want to reset all warning thresholds to default values?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: () => {
            resetWarningThresholds();
            setThresholds({
              maxFlightHours: '8',
              minRestBetweenDays: '10',
              maxContactTime: '10',
              maxDutyDay: '16',
              maxConsecutiveDays: '15',
              maxWeeklyHours: '40',
              maxPastSevenDaysHours: '50',
            });
            Alert.alert('Success', 'Warning thresholds reset to defaults.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Settings</Text>
          </View>

          <Text style={styles.title}>Warning Thresholds</Text>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <View style={styles.labelWrap}>
                <Text style={styles.label}>
                  Max Flight Instruction Hours <Text style={styles.labelSmall}>(24h)</Text>
                </Text>
                <Text style={styles.uneditableText}>uneditable</Text>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.fixedValueContainer}>
                  <Text style={styles.fixedValue}>8</Text>
                </View>

                <View style={styles.unitWrap}>
                  <Text style={styles.unit}>hours</Text>
                  <Text style={styles.faaNote}>FAA Limit</Text>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelWrap}>
                <Text style={styles.label}>Min Rest Between Days</Text>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={thresholds.minRestBetweenDays}
                  onChangeText={(text) => setThresholds({ ...thresholds, minRestBetweenDays: text })}
                  keyboardType="numeric"
                  placeholder="10"
                />
                <View style={styles.unitWrap}>
                  <Text style={styles.unit}>hours</Text>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelWrap}>
                <Text style={styles.label}>Max Contact Time</Text>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={thresholds.maxContactTime}
                  onChangeText={(text) => setThresholds({ ...thresholds, maxContactTime: text })}
                  keyboardType="numeric"
                  placeholder="10"
                />
                <View style={styles.unitWrap}>
                  <Text style={styles.unit}>hours</Text>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelWrap}>
                <Text style={styles.label}>Max Duty Day</Text>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={thresholds.maxDutyDay}
                  onChangeText={(text) => setThresholds({ ...thresholds, maxDutyDay: text })}
                  keyboardType="numeric"
                  placeholder="16"
                />
                <View style={styles.unitWrap}>
                  <Text style={styles.unit}>hours</Text>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelWrap}>
                <Text style={styles.label}>Max Consecutive Days</Text>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={thresholds.maxConsecutiveDays}
                  onChangeText={(text) => setThresholds({ ...thresholds, maxConsecutiveDays: text })}
                  keyboardType="numeric"
                  placeholder="15"
                />
                <View style={styles.unitWrap}>
                  <Text style={styles.unit}>days</Text>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelWrap}>
                <Text style={styles.label}>Max Weekly Hours</Text>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={thresholds.maxWeeklyHours}
                  onChangeText={(text) => setThresholds({ ...thresholds, maxWeeklyHours: text })}
                  keyboardType="numeric"
                  placeholder="40"
                />
                <View style={styles.unitWrap}>
                  <Text style={styles.unit}>hours</Text>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelWrap}>
                <Text style={styles.label}>Max Past 7 Days Hours</Text>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={thresholds.maxPastSevenDaysHours}
                  onChangeText={(text) => setThresholds({ ...thresholds, maxPastSevenDaysHours: text })}
                  keyboardType="numeric"
                  placeholder="50"
                />
                <View style={styles.unitWrap}>
                  <Text style={styles.unit}>hours</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset to Defaults</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.aboutSectionHeader}>About</Text>
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitle}>About SafeHours</Text>
            <Text style={styles.aboutSubText}>Version information and acknowledgments</Text>
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.black,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 20,
  },
  aboutSectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
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
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  labelWrap: {
    width: '58%',
    paddingRight: 10,
  },
  inputRow: {
    width: '42%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.black,
    lineHeight: 20,
  },
  labelSmall: {
    fontSize: 14,
    fontWeight: '400',
  },
  uneditableText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.gray,
    marginTop: 2,
  },
  input: {
    width: 50,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: 'center',
    fontSize: 15,
    backgroundColor: COLORS.white,
  },
  fixedValueContainer: {
    width: 50,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixedValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
  },
  unitWrap: {
    width: 56,
    marginLeft: 8,
    alignItems: 'flex-start',
  },
  faaNote: {
    fontSize: 11,
    color: COLORS.red,
    fontWeight: 'bold',
    marginTop: 2,
  },
  unit: {
    fontSize: 14,
    color: COLORS.gray,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  resetButtonText: {
    color: COLORS.black,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  aboutContainer: {
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
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  aboutSubText: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 8,
  },
});