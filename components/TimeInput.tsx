import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Keyboard } from 'react-native';
import { Clock } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { parseTimeInput } from '@/utils/time';

interface TimeInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
}

export default function TimeInput({ label, value, onChangeText, onFocus }: TimeInputProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const customInputRef = useRef<TextInput>(null);



  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        options.push(`${h}:${m}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleTimeSelect = (time: string) => {
    onChangeText(time);
    setModalVisible(false);
  };

  const handleCustomInputSubmit = () => {
    if (customInput) {
      const formattedTime = parseTimeInput(customInput);
      if (formattedTime) {
        onChangeText(formattedTime);
        setModalVisible(false);
        setShowCustomInput(false);
        setCustomInput('');
      }
    }
    Keyboard.dismiss();
  };

  const openTimePicker = () => {
    onFocus?.();
    setModalVisible(true);
    setShowCustomInput(false);
    setCustomInput('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.inputContainer}
        onPress={openTimePicker}
      >
        <Text style={styles.inputText}>
          {value || 'HH:MM'}
        </Text>
        <Clock color={COLORS.primary} size={20} />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>
            
            {!showCustomInput ? (
              <>
                <ScrollView 
                  style={styles.timeScroll}
                  contentContainerStyle={styles.timeScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.timeGrid}>
                    {timeOptions.map((time) => {
                      const timeChunks = [];
                      for (let i = 0; i < timeOptions.length; i += 4) {
                        timeChunks.push(timeOptions.slice(i, i + 4));
                      }
                      return null;
                    })}
                    {(() => {
                      const timeChunks = [];
                      for (let i = 0; i < timeOptions.length; i += 4) {
                        timeChunks.push(timeOptions.slice(i, i + 4));
                      }
                      return timeChunks.map((row, rowIndex) => (
                        <View key={`row-${rowIndex}`} style={styles.timeRow}>
                          {row.map((time) => (
                            <TouchableOpacity
                              key={time}
                              style={[
                                styles.timeItem,
                                value === time && styles.selectedTimeItem
                              ]}
                              onPress={() => handleTimeSelect(time)}
                            >
                              <Text style={[
                                styles.timeItemText,
                                value === time && styles.selectedTimeItemText
                              ]}>
                                {time}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ));
                    })()}
                  </View>
                </ScrollView>
                
                <TouchableOpacity
                  style={styles.customInputButton}
                  onPress={() => setShowCustomInput(true)}
                >
                  <Text style={styles.customInputButtonText}>
                    Or enter a custom time:
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.customInputLabel}>Enter time (HH:MM or HHMM):</Text>
                <TextInput
                  ref={customInputRef}
                  style={styles.customInput}
                  value={customInput}
                  onChangeText={setCustomInput}
                  placeholder="e.g., 14:30 or 1430"
                  keyboardType="numeric"
                  autoFocus
                />
                
                <View style={styles.customInputButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.backButton]}
                    onPress={() => {
                      setShowCustomInput(false);
                      setCustomInput('');
                      Keyboard.dismiss();
                    }}
                  >
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.button, styles.submitButton]}
                    onPress={handleCustomInputSubmit}
                  >
                    <Text style={styles.submitButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  inputText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  timeScroll: {
    maxHeight: 400,
  },
  timeScrollContent: {
    paddingBottom: 10,
  },
  timeGrid: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    width: '100%',
  },
  timeItem: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    width: 60,
    height: 45,
    padding: 5,
  },
  selectedTimeItem: {
    backgroundColor: COLORS.primary,
  },
  timeItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTimeItemText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  customInputButton: {
    marginTop: 16,
    marginBottom: 10,
    alignSelf: 'center',
  },
  customInputButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  customInputLabel: {
    fontSize: 14,
    marginBottom: 10,
    color: COLORS.gray,
    textAlign: 'center',
  },
  customInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  customInputButtons: {
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
  backButton: {
    backgroundColor: COLORS.lightGray,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  backButtonText: {
    color: COLORS.black,
    fontWeight: '600',
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    alignSelf: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});