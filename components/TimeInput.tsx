import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Platform, ScrollView } from 'react-native';
import { Clock } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { getCurrentTime, parseTimeInput } from '@/utils/time';

interface TimeInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}

export default function TimeInput({ label, value, onChangeText }: TimeInputProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [hours, setHours] = useState(value?.split(':')[0] || '00');
  const [minutes, setMinutes] = useState(value?.split(':')[1] || '00');
  const [directInput, setDirectInput] = useState('');
  const [isDirectEditing, setIsDirectEditing] = useState(false);
  
  const hoursScrollViewRef = useRef<ScrollView>(null);
  const minutesScrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Update hours and minutes when value changes (for edit mode)
  useEffect(() => {
    if (value) {
      const parts = value.split(':');
      if (parts.length === 2) {
        setHours(parts[0] || '00');
        setMinutes(parts[1] || '00');
      }
    }
  }, [value]);

  const handleDirectInputChange = (text: string) => {
    setDirectInput(text);
  };

  const handleDirectInputBlur = () => {
    setIsDirectEditing(false);
    
    if (directInput) {
      const formattedTime = parseTimeInput(directInput);
      if (formattedTime) {
        onChangeText(formattedTime);
      }
    }
    
    setDirectInput('');
  };

  const handleDirectInputFocus = () => {
    setIsDirectEditing(true);
    // Set the raw value for editing
    setDirectInput(value || '');
    
    // Select all text when focused - only on native platforms
    if (Platform.OS !== 'web' && inputRef.current) {
      // Small delay to ensure selection works
      setTimeout(() => {
        if (inputRef.current) {
          // Check if setSelection exists before calling it
          try {
            // Only call setSelection on native platforms
            if (Platform.OS !== 'web') {
              // On native platforms, we can use the selection prop instead
              // This is safer than trying to call setSelection directly
              inputRef.current.focus();
            }
          } catch (error) {
            console.log('Selection not supported on this platform');
          }
        }
      }, 50);
    }
  };

  const generateTimeOptions = (max: number) => {
    const options = [];
    for (let i = 0; i < max; i++) {
      options.push(i.toString().padStart(2, '0'));
    }
    return options;
  };

  const hourOptions = generateTimeOptions(24);
  const minuteOptions = generateTimeOptions(60);

  const confirmTime = () => {
    const formattedTime = `${hours}:${minutes}`;
    onChangeText(formattedTime);
    setModalVisible(false);
  };

  const openTimePicker = () => {
    // Use current time if value is empty
    if (!value) {
      const currentTime = getCurrentTime();
      const [currentHours, currentMinutes] = currentTime.split(':');
      setHours(currentHours);
      setMinutes(currentMinutes);
    } else {
      // Use existing value
      const parts = value.split(':');
      if (parts.length === 2) {
        setHours(parts[0] || '00');
        setMinutes(parts[1] || '00');
      } else {
        // Handle invalid value
        const currentTime = getCurrentTime();
        const [currentHours, currentMinutes] = currentTime.split(':');
        setHours(currentHours);
        setMinutes(currentMinutes);
      }
    }
    setModalVisible(true);
    
    // Schedule scrolling to the selected values after the modal is visible
    setTimeout(() => {
      scrollToSelectedTime();
    }, 300);
  };
  
  const scrollToSelectedTime = () => {
    // Scroll to selected hour
    if (hoursScrollViewRef.current) {
      const hourIndex = hourOptions.indexOf(hours);
      if (hourIndex !== -1) {
        hoursScrollViewRef.current.scrollTo({ 
          y: hourIndex * 50 - 50, // 50 is the height of each item, subtract 50 to center
          animated: false 
        });
      }
    }
    
    // Scroll to selected minute
    if (minutesScrollViewRef.current) {
      const minuteIndex = minuteOptions.indexOf(minutes);
      if (minuteIndex !== -1) {
        minutesScrollViewRef.current.scrollTo({ 
          y: minuteIndex * 50 - 50, 
          animated: false 
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.timeTextContainer}
          onPress={() => inputRef.current?.focus()}
        >
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={isDirectEditing ? directInput : value}
            onChangeText={handleDirectInputChange}
            placeholder="HH:MM"
            keyboardType="numeric"
            onFocus={handleDirectInputFocus}
            onBlur={handleDirectInputBlur}
            selectTextOnFocus={true}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={openTimePicker}
        >
          <Clock color={COLORS.primary} size={20} />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>
            
            <View style={styles.timePickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Hours</Text>
                <View style={styles.pickerWrapper}>
                  <ScrollView 
                    ref={hoursScrollViewRef}
                    style={styles.picker}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.pickerContent}
                  >
                    {hourOptions.map((hour) => (
                      <TouchableOpacity
                        key={`hour-${hour}`}
                        style={[
                          styles.pickerItem,
                          hours === hour && styles.selectedPickerItem
                        ]}
                        onPress={() => setHours(hour)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          hours === hour && styles.selectedPickerItemText
                        ]}>
                          {hour}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              <Text style={styles.timeSeparator}>:</Text>
              
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Minutes</Text>
                <View style={styles.pickerWrapper}>
                  <ScrollView 
                    ref={minutesScrollViewRef}
                    style={styles.picker}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.pickerContent}
                  >
                    {minuteOptions.map((minute) => (
                      <TouchableOpacity
                        key={`minute-${minute}`}
                        style={[
                          styles.pickerItem,
                          minutes === minute && styles.selectedPickerItem
                        ]}
                        onPress={() => setMinutes(minute)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          minutes === minute && styles.selectedPickerItemText
                        ]}>
                          {minute}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={confirmTime}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.black,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    overflow: 'hidden',
  },
  timeTextContainer: {
    flex: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  iconButton: {
    padding: 10,
    backgroundColor: COLORS.lightGray,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: COLORS.gray,
  },
  pickerWrapper: {
    height: 150,
    width: 60,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 150,
  },
  pickerContent: {
    paddingVertical: 50, // Add padding to allow scrolling to first and last items
  },
  pickerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPickerItem: {
    backgroundColor: COLORS.primary + '20', // 20% opacity
  },
  pickerItemText: {
    fontSize: 20,
  },
  selectedPickerItemText: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  timeSeparator: {
    fontSize: 24,
    marginHorizontal: 10,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.black,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});