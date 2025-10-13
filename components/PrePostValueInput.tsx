import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { COLORS } from '@/constants/colors';

interface PrePostValueInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function PrePostValueInput({ value, onChange, disabled = false }: PrePostValueInputProps) {
  const [showSelector, setShowSelector] = useState(false);
  
  // Generate values from 0.0 to 2.0 with 0.1 increments
  const generateValues = () => {
    const values = [];
    for (let i = 0; i <= 20; i++) {
      values.push(i / 10);
    }
    return values;
  };
  
  const values = generateValues();
  
  const handleSelect = (selectedValue: number) => {
    onChange(selectedValue);
    setShowSelector(false);
  };
  
  const renderValueSelector = () => {
    // Create chunks of 4 values for the grid layout
    const chunkedValues = [];
    for (let i = 0; i < values.length; i += 4) {
      chunkedValues.push(values.slice(i, i + 4));
    }
    
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSelector}
        onRequestClose={() => setShowSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectorContent}>
            <Text style={styles.selectorTitle}>Select Pre/Post Value</Text>
            <Text style={styles.selectorDescription}>
              Time split evenly before and after the activity
            </Text>
            
            <View style={styles.valuesList}>
              {chunkedValues.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.valueRow}>
                  {row.map((item) => (
                    <TouchableOpacity
                      key={`value-${item}`}
                      style={[
                        styles.valueItem,
                        value === item && styles.selectedValueItem
                      ]}
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={[
                        styles.valueItemText,
                        value === item && styles.selectedValueItemText
                      ]}>
                        {item.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSelector(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pre/Post Value (hours)</Text>
      <Text style={styles.description}>
        Time split evenly before and after the activity
      </Text>
      
      <TouchableOpacity
        style={[
          styles.input,
          disabled && styles.disabledInput
        ]}
        onPress={() => !disabled && setShowSelector(true)}
        disabled={disabled}
      >
        <Text style={[styles.inputText, disabled && styles.disabledText]}>
          {value.toFixed(2)}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.helperText}>
        Enter a value between 0 and 2 hours
      </Text>
      
      {showSelector && renderValueSelector()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: COLORS.black,
  },
  description: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: COLORS.lightGray,
  },
  disabledText: {
    color: COLORS.gray,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorContent: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  selectorDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
    textAlign: 'center',
  },
  valuesList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    width: '100%',
  },
  valueItem: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    width: 50,
    height: 50,
    padding: 5,
  },
  selectedValueItem: {
    backgroundColor: COLORS.primary,
  },
  valueItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedValueItemText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    alignSelf: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});