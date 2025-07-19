import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

interface MidnightConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  startTime: string;
  endTime: string;
  date: string;
}

export default function MidnightConfirmationModal({
  visible,
  onConfirm,
  onCancel,
  startTime,
  endTime,
  date,
}: MidnightConfirmationModalProps) {
  const formatDate = (dateString: string): string => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getNextDay = (dateString: string): string => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      date.setDate(date.getDate() + 1);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Next Day';
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <AlertCircle size={48} color={COLORS.orange} />
          </View>
          
          <Text style={styles.title}>Activity Crosses Midnight</Text>
          
          <Text style={styles.message}>
            This activity will extend into the next day:
          </Text>
          
          <View style={styles.timeContainer}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Start:</Text>
              <Text style={styles.timeValue}>
                {startTime} on {formatDate(date)}
              </Text>
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>End:</Text>
              <Text style={styles.timeValue}>
                {endTime} on {getNextDay(date)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.confirmText}>
            Do you want to continue with this overnight activity?
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: COLORS.black,
  },
  message: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: COLORS.gray,
  },
  timeContainer: {
    width: '100%',
    backgroundColor: COLORS.lightGray + '40',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  timeValue: {
    fontSize: 16,
    color: COLORS.black,
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: COLORS.black,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
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
    fontSize: 16,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
});