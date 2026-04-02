import React, { useLayoutEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useActivityStore } from '@/store/activityStore';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { warningThresholds, updateWarningThresholds, resetWarningThresholds } = useActivityStore();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
      title: '',
    });
  }, [navigation]);

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

  const renderEditableRow = (
    label: string,
    value: string,
    key: keyof typeof thresholds,
    unit: string,
    placeholder: string
  ) => (
    <View style={styles.row} key={key}>
      <View style={styles.labelCell}>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>

      <View style={styles.valueCell}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => setThresholds({ ...thresholds, [key]: text })}
          keyboardType="numeric"
          placeholder={placeholder}
          placeholderTextColor="#7a7a7a"
        />
      </View>

      <View style={styles.unitCell}>
        <Text style={styles.unitText}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageTitleWrap}>
          <Text style={styles.pageTitle}>Settings</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Warning Thresholds</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.rowTop}>
            <View style={styles.labelCell}>
              <Text style={styles.rowLabelTop}>
                Max Flight Instruction{'\n'}Hours <Text style={styles.rowLabelSmall}>(24h)</Text>
              </Text>
              <Text style={styles.uneditableText}>uneditable</Text>
            </View>

            <View style={styles.valueCell}>
              <View style={styles.fixedBox}>
                <Text style={styles.fixedBoxText}>8</Text>
              </View>
            </View>

            <View style={styles.unitCell}>
              <Text style={styles.unitText}>hours</Text>
              <Text style={styles.faaText}>FAA Limit</Text>
            </View>
          </View>

          {renderEditableRow(
            'Min Rest Between Days',
            thresholds.minRestBetweenDays,
            'minRestBetweenDays',
            'hours',
            '10'
          )}

          {renderEditableRow(
            'Max Contact Time',
            thresholds.maxContactTime,
            'maxContactTime',
            'hours',
            '10'
          )}

          {renderEditableRow(
            'Max Duty Day',
            thresholds.maxDutyDay,
            'maxDutyDay',
            'hours',
            '16'
          )}

          {renderEditableRow(
            'Max Consecutive Days',
            thresholds.maxConsecutiveDays,
            'maxConsecutiveDays',
            'days',
            '15'
          )}

          {renderEditableRow(
            'Max Weekly Hours',
            thresholds.maxWeeklyHours,
            'maxWeeklyHours',
            'hours',
            '40'
          )}

          {renderEditableRow(
            'Max Past 7 Days Hours',
            thresholds.maxPastSevenDaysHours,
            'maxPastSevenDaysHours',
            'hours',
            '50'
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.aboutHeader}>About</Text>
        <View style={styles.aboutBlock}>
          <Text style={styles.aboutTitle}>About SafeHours</Text>
          <Text style={styles.aboutSubtitle}>Version information and acknowledgments</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  pageTitleWrap: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 6,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2f5f2f',
  },
  sectionHeader: {
    backgroundColor: '#ececec',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d8d8d8',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#757b82',
  },
  card: {
    marginHorizontal: 10,
    marginTop: 8,
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  labelCell: {
    flex: 1,
    paddingRight: 8,
  },
  valueCell: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitCell: {
    width: 60,
    paddingLeft: 8,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rowLabelTop: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
    color: '#222222',
  },
  rowLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#222222',
  },
  rowLabelSmall: {
    fontSize: 13,
    fontWeight: '400',
    color: '#222222',
  },
  uneditableText: {
    marginTop: 1,
    fontSize: 11,
    fontStyle: 'italic',
    color: '#7d7d7d',
  },
  input: {
    width: 58,
    height: 32,
    borderWidth: 1,
    borderColor: '#d7d7d7',
    borderRadius: 4,
    backgroundColor: '#fbfbfb',
    textAlign: 'center',
    fontSize: 14,
    color: '#222222',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  fixedBox: {
    width: 58,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#e6e7e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixedBoxText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222222',
  },
  unitText: {
    fontSize: 14,
    color: '#7b8087',
  },
  faaText: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '700',
    color: '#e44747',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#e6e7e8',
    marginRight: 6,
  },
  saveButton: {
    backgroundColor: '#2f6a3b',
    marginLeft: 6,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  aboutHeader: {
    fontSize: 15,
    color: '#4c4c4c',
    marginTop: 2,
    marginBottom: 4,
    marginHorizontal: 0,
  },
  aboutBlock: {
    paddingBottom: 12,
  },
  aboutTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
  },
  aboutSubtitle: {
    fontSize: 12,
    color: '#7a7a7a',
    marginTop: 2,
  },
});