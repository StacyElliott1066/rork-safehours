import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
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
        { text: 'Cancel', style: 'cancel' },
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Settings</Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Warning Thresholds</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.labelColumn}>
                <Text style={styles.label}>
                  Max Flight Instruction{'\n'}Hours <Text style={styles.labelSmall}>(24h)</Text>
                </Text>
                <Text style={styles.uneditableText}>uneditable</Text>
              </View>

              <View style={styles.valueColumn}>
                <View style={styles.fixedValueContainer}>
                  <Text style={styles.fixedValue}>8</Text>
                </View>
                <Text style={styles.unit}>hours</Text>
              </View>

              <View style={styles.noteColumn}>
                <Text style={styles.faaNote}>FAA Limit</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.labelColumn}>
                <Text style={styles.labelSingle}>Min Rest Between Days</Text>
              </View>
              <View style={styles.valueColumn}>
                <TextInput
                  style={styles.input}
                  value={thresholds.minRestBetweenDays}
                  onChangeText={(text) => setThresholds({ ...thresholds, minRestBetweenDays: text })}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor={COLORS.gray}
                />
                <Text style={styles.unit}>hours</Text>
              </View>
              <View style={styles.noteColumn} />
            </View>

            <View style={styles.row}>
              <View style={styles.labelColumn}>
                <Text style={styles.labelSingle}>Max Contact Time</Text>
              </View>
              <View style={styles.valueColumn}>
                <TextInput
                  style={styles.input}
                  value={thresholds.maxContactTime}
                  onChangeText={(text) => setThresholds({ ...thresholds, maxContactTime: text })}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor={COLORS.gray}
                />
                <Text style={styles.unit}>hours</Text>
              </View>
              <View style={styles.noteColumn} />
            </View>

            <View style={styles.row}>
              <View style={styles.labelColumn}>
                <Text style={styles.labelSingle}>Max Duty Day</Text>
              </View>
              <View style={styles.valueColumn}>
                <TextInput
                  style={styles.input}
                  value={thresholds.maxDutyDay}
                  onChangeText={(text) => setThresholds({ ...thresholds, maxDutyDay: text })}
                  keyboardType="numeric"
                  placeholder="16"
                  placeholderTextColor={COLORS.gray}
                />
                <Text style={styles.unit}>hours</Text>
              </View>
              <View style={styles.noteColumn} />
            </View>

            <View style={styles.row}>
              <View style={styles.labelColumn}>
                <Text style={styles.labelSingle}>Max Consecutive Days</Text>
              </View>
              <View style={styles.valueColumn}>
                <TextInput
                  style={styles.input}
                  value={thresholds.maxConsecutiveDays}
                  onChangeText={(text) => setThresholds({ ...thresholds, maxConsecutiveDays: text })}
                  keyboardType="numeric"
                  placeholder="15"
                  placeholderTextColor={COLORS.gray}
                />
                <Text style={styles.unit}>days</Text>
              </View>
              <View style={styles.noteColumn} />
            </View>

            <View style={styles.row}>
              <View style={styles.labelColumn}>
                <Text style={styles.labelSingle}>Max Weekly Hours</Text>
              </View>
              <View style={styles.valueColumn}>
                <TextInput
                  style={styles.input}
                  value={thresholds.maxWeeklyHours}
                  onChangeText={(text) => setThresholds({ ...thresholds, maxWeeklyHours: text })}
                  keyboardType="numeric"
                  placeholder="40"
                  placeholderTextColor={COLORS.gray}
                />
                <Text style={styles.unit}>hours</Text>
              </View>
              <View style={styles.noteColumn} />
            </View>

            <View style={[styles.row, styles.lastRow]}>
              <View style={styles.labelColumn}>
                <Text style={styles.labelSingle}>Max Past 7 Days Hours</Text>
              </View>
              <View style={styles.valueColumn}>
                <TextInput
                  style={styles.input}
                  value={thresholds.maxPastSevenDaysHours}
                  onChangeText={(text) =>
                    setThresholds({ ...thresholds, maxPastSevenDaysHours: text })
                  }
                  keyboardType="numeric"
                  placeholder="50"
                  placeholderTextColor={COLORS.gray}
                />
                <Text style={styles.unit}>hours</Text>
              </View>
              <View style={styles.noteColumn} />
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
    backgroundColor: '#f2f2f2',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 0,
    paddingTop: 6,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2f5f2f',
  },
  sectionHeader: {
    backgroundColor: '#e9e9e9',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d6d6d6',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6f7780',
  },
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  lastRow: {
    paddingBottom: 4,
  },
  labelColumn: {
    flex: 1.55,
    paddingRight: 8,
  },
  valueColumn: {
    width: 118,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  noteColumn: {
    width: 62,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '700',
    color: '#222222',
  },
  labelSingle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#222222',
  },
  labelSmall: {
    fontSize: 13,
    fontWeight: '400',
    color: '#222222',
  },
  uneditableText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#7b7b7b',
    marginTop: 2,
  },
  input: {
    width: 58,
    height: 34,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 4,
    backgroundColor: '#fbfbfb',
    textAlign: 'center',
    fontSize: 15,
    color: '#222222',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  fixedValueContainer: {
    width: 58,
    height: 34,
    borderRadius: 4,
    backgroundColor: '#e6e7e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixedValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222222',
  },
  unit: {
    marginLeft: 8,
    fontSize: 14,
    color: '#7a7f86',
    width: 46,
  },
  faaNote: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e44343',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 14,
  },
  button: {
    flex: 1,
    height: 42,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#e6e7e8',
    marginRight: 6,
  },
  saveButton: {
    backgroundColor: '#2f6b3c',
    marginLeft: 6,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  aboutSectionHeader: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4d4d4d',
    marginBottom: 4,
    paddingHorizontal: 0,
    marginTop: 2,
  },
  aboutContainer: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  aboutSubText: {
    fontSize: 13,
    color: '#7a7a7a',
    marginTop: 2,
  },
});