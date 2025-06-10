import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ActivityType } from '@/types/activity';
import { COLORS } from '@/constants/colors';

interface ActivityTypeSelectorProps {
  selectedType: ActivityType;
  onTypeChange: (type: ActivityType) => void;
}

export default function ActivityTypeSelector({ selectedType, onTypeChange }: ActivityTypeSelectorProps) {
  const activityTypes: ActivityType[] = ['Flight', 'Ground', 'SIM', 'Other'];
  
  const getTypeColor = (type: ActivityType) => {
    switch (type) {
      case 'Flight': return COLORS.flight;
      case 'Ground': return COLORS.ground;
      case 'SIM': return COLORS.sim;
      case 'Other': return COLORS.other;
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
});