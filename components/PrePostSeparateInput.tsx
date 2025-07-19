import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '@/constants/colors';

interface PrePostSeparateInputProps {
  preValue: number;
  postValue: number;
  onPreChange: (value: number) => void;
  onPostChange: (value: number) => void;
  disabled?: boolean;
}

export default function PrePostSeparateInput({ 
  preValue, 
  postValue, 
  onPreChange, 
  onPostChange, 
  disabled = false 
}: PrePostSeparateInputProps) {
  const [showPreSelector, setShowPreSelector] = useState(false);
  const [showPostSelector, setShowPostSelector] = useState(false);
  
  // Generate values from 0.0 to 1.0 with 0.1 increments
  const generateValues = () => {
    const values = [];
    for (let i = 0; i <= 10; i++) {
      values.push(i / 10);
    }
    return values;
  };
  
  const values = generateValues();
  
  const handlePreSelect = (selectedValue: number) => {
    onPreChange(selectedValue);
    setShowPreSelector(false);
  };
  
  const handlePostSelect = (selectedValue: number) => {
    onPostChange(selectedValue);
    setShowPostSelector(false);
  };
  
  const renderValueSelector = (
    isVisible: boolean,
    onClose: () => void,
    onSelect: (value: number) => void,
    currentValue: number,
    title: string
  ) => {
    // Create chunks of 3 values for the grid layout (since we have fewer values now)
    const chunkedValues = [];
    for (let i = 0; i < values.length; i += 3) {
      chunkedValues.push(values.slice(i, i + 3));
    }
    
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectorContent}>
            <Text style={styles.selectorTitle}>{title}</Text>
            
            <View style={styles.valuesList}>
              {chunkedValues.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.valueRow}>
                  {row.map((item) => (
                    <TouchableOpacity
                      key={`value-${item}`}
                      style={[
                        styles.valueItem,
                        currentValue === item && styles.selectedValueItem
                      ]}
                      onPress={() => onSelect(item)}
                    >
                      <Text style={[
                        styles.valueItemText,
                        currentValue === item && styles.selectedValueItemText
                      ]}>
                        {item.toFixed(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  
  const totalPrePost = preValue + postValue;
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pre/Post Values (hours)</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Pre</Text>
          <TouchableOpacity
            style={[
              styles.input,
              disabled && styles.disabledInput
            ]}
            onPress={() => !disabled && setShowPreSelector(true)}
            disabled={disabled}
          >
            <Text style={[styles.inputText, disabled && styles.disabledText]}>
              {preValue.toFixed(1)}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Post</Text>
          <TouchableOpacity
            style={[
              styles.input,
              disabled && styles.disabledInput
            ]}
            onPress={() => !disabled && setShowPostSelector(true)}
            disabled={disabled}
          >
            <Text style={[styles.inputText, disabled && styles.disabledText]}>
              {postValue.toFixed(1)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Pre/Post: {totalPrePost.toFixed(1)} hours</Text>
      </View>
      
      <Text style={styles.helperText}>
        Enter values between 0 and 1 hour for each
      </Text>
      
      {renderValueSelector(
        showPreSelector,
        () => setShowPreSelector(false),
        handlePreSelect,
        preValue,
        'Select Pre Value'
      )}
      
      {renderValueSelector(
        showPostSelector,
        () => setShowPostSelector(false),
        handlePostSelect,
        postValue,
        'Select Post Value'
      )}
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
    marginBottom: 8,
    color: COLORS.black,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    color: COLORS.gray,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 16,
    fontWeight: '500',
  },
  disabledInput: {
    backgroundColor: COLORS.lightGray,
  },
  disabledText: {
    color: COLORS.gray,
  },
  totalContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 6,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: 'center',
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
    margin: 8,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    width: 70,
    height: 70,
    padding: 8,
  },
  selectedValueItem: {
    backgroundColor: COLORS.primary,
  },
  valueItemText: {
    fontSize: 18,
    fontWeight: '600',
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