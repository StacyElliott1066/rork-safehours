import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ActivityType } from '@/types/activity';
import { COLORS } from '@/constants/colors';

interface ActivityTypeSelectorProps {
  selectedType: ActivityType;
  onTypeChange: (type: ActivityType) => void;
}

export default function ActivityTypeSelector({ selectedType, onTypeChange }: ActivityTypeSelectorProps) {
  const activityTypes: ActivityType[] = ['Flight', 'Ground', 'SIM', 'Other Internal', 'Other External'];
  
  const getTypeColor = (type: ActivityType) => {
    switch (type) {
      case 'Flight': return COLORS.flight;
      case 'Ground': return COLORS.ground;
      case 'SIM': return COLORS.sim;
      case 'Other Internal': return COLORS.otherInternal;
      case 'Other External': return COLORS.otherExternal;
    }
  };
  
  const getTypeLabel = (type: ActivityType) => {
    switch (type) {
      case 'Other Internal': return 'SOF, office, etc.';
      case 'Other External': return 'Job, Class, etc.';
      default: return '';
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Activity Type</Text>
      <View style={styles.buttonContainer}>
        {activityTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              { borderColor: getTypeColor(type) },
              selectedType === type && { backgroundColor: getTypeColor(type) }
            ]}
            onPress={() => onTypeChange(type)}
          >
            <Text
              style={[
                styles.typeText,
                selectedType === type && styles.selectedTypeText
              ]}
            >
              {type}
            </Text>
            {getTypeLabel(type) && (
              <Text
                style={[
                  styles.labelText,
                  selectedType === type && styles.selectedLabelText
                ]}
              >
                {getTypeLabel(type)}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.black,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 10,
    minWidth: '48%',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedTypeText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  labelText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  selectedLabelText: {
    color: COLORS.white,
  },
});