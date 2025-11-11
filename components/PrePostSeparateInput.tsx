import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Keyboard, TouchableWithoutFeedback, InputAccessoryView, Platform } from 'react-native';
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
  
  const [customPreValue, setCustomPreValue] = useState('');
  const [customPostValue, setCustomPostValue] = useState('');
  const [customPreError, setCustomPreError] = useState('');
  const [customPostError, setCustomPostError] = useState('');
  
  const handleCustomPreSubmit = () => {
    const numValue = parseFloat(customPreValue);
    if (isNaN(numValue)) {
      setCustomPreError('Please enter a valid number');
      return;
    }
    if (numValue < 0 || numValue > 3) {
      setCustomPreError('Value must be between 0 and 3');
      return;
    }
    onPreChange(numValue);
    setCustomPreValue('');
    setCustomPreError('');
    setShowPreSelector(false);
  };
  
  const handleCustomPostSubmit = () => {
    const numValue = parseFloat(customPostValue);
    if (isNaN(numValue)) {
      setCustomPostError('Please enter a valid number');
      return;
    }
    if (numValue < 0 || numValue > 3) {
      setCustomPostError('Value must be between 0 and 3');
      return;
    }
    onPostChange(numValue);
    setCustomPostValue('');
    setCustomPostError('');
    setShowPostSelector(false);
  };
  
  const renderValueSelector = (
    isVisible: boolean,
    onClose: () => void,
    onSelect: (value: number) => void,
    currentValue: number,
    title: string,
    isPre: boolean
  ) => {
    // Create chunks of 3 values for the grid layout (since we have fewer values now)
    const chunkedValues = [];
    for (let i = 0; i < values.length; i += 3) {
      chunkedValues.push(values.slice(i, i + 3));
    }
    
    const customValue = isPre ? customPreValue : customPostValue;
    const setCustomValue = isPre ? setCustomPreValue : setCustomPostValue;
    const handleCustomSubmit = isPre ? handleCustomPreSubmit : handleCustomPostSubmit;
    const customError = isPre ? customPreError : customPostError;
    const setCustomError = isPre ? setCustomPreError : setCustomPostError;
    
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                        {item.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
            
            <View style={styles.customInputContainer}>
              <Text style={styles.customInputLabel}>Or enter a custom value 0-3 hours:</Text>
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customInput}
                  value={customValue}
                  onChangeText={(text) => {
                    setCustomValue(text);
                    setCustomError('');
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={COLORS.gray}
                  onSubmitEditing={handleCustomSubmit}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  inputAccessoryViewID={isPre ? "preInputAccessory" : "postInputAccessory"}
                />
                <TouchableOpacity
                  style={styles.customSubmitButton}
                  onPress={handleCustomSubmit}
                >
                  <Text style={styles.customSubmitButtonText}>Set</Text>
                </TouchableOpacity>
              </View>
              {customError ? <Text style={styles.errorText}>{customError}</Text> : null}
            </View>
            
            {Platform.OS === 'ios' && (
              <InputAccessoryView nativeID={isPre ? "preInputAccessory" : "postInputAccessory"}>
                <View style={styles.inputAccessoryView}>
                  <Text style={styles.inputAccessoryText}>
                    {customValue || '0'}
                  </Text>
                  <TouchableOpacity
                    style={styles.inputAccessoryDoneButton}
                    onPress={() => Keyboard.dismiss()}
                  >
                    <Text style={styles.inputAccessoryDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </InputAccessoryView>
            )}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          </View>
        </TouchableWithoutFeedback>
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
              {preValue.toFixed(2)}
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
              {postValue.toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Pre/Post: {totalPrePost.toFixed(2)} hours</Text>
      </View>
      
      <Text style={styles.helperText}>
        Enter values between 0 and 3 hours for each
      </Text>
      
      {renderValueSelector(
        showPreSelector,
        () => setShowPreSelector(false),
        handlePreSelect,
        preValue,
        'Select Pre Value',
        true
      )}
      
      {renderValueSelector(
        showPostSelector,
        () => setShowPostSelector(false),
        handlePostSelect,
        postValue,
        'Select Post Value',
        false
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
  customInputContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  customInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.gray,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  customSubmitButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customSubmitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  errorText: {
    fontSize: 12,
    color: '#ff4444',
    marginTop: 4,
  },

  inputAccessoryView: {
    backgroundColor: '#F0F0F5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#C8C8CC',
  },
  inputAccessoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  inputAccessoryDoneButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  inputAccessoryDoneText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
});