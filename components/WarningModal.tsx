import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AlertCircle, CheckCircle, X } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

interface WarningModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  isCompliant: boolean;
  value: string;
  threshold: string;
  description: string;
  details?: string;
}

export default function WarningModal({
  visible,
  onClose,
  title,
  isCompliant,
  value,
  threshold,
  description,
  details,
}: WarningModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.statusContainer}>
              {isCompliant ? (
                <>
                  <CheckCircle size={40} color={COLORS.green} />
                  <Text style={[styles.statusText, styles.compliantText]}>Compliant</Text>
                </>
              ) : (
                <>
                  <AlertCircle size={40} color={COLORS.red} />
                  <Text style={[styles.statusText, styles.warningText]}>Warning</Text>
                </>
              )}
            </View>
            
            <View style={styles.valueContainer}>
              <Text style={styles.valueLabel}>Current Value:</Text>
              <Text style={styles.valueText}>{value}</Text>
            </View>
            
            <View style={styles.valueContainer}>
              <Text style={styles.valueLabel}>Threshold:</Text>
              <Text style={styles.valueText}>{threshold}</Text>
            </View>
            
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description:</Text>
              <Text style={styles.descriptionText}>{description}</Text>
            </View>
            
            {details && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Details:</Text>
                <Text style={styles.detailsText}>{details}</Text>
              </View>
            )}
          </ScrollView>
          
          <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
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
    width: '85%', // Reduced from 90%
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
    maxHeight: 400,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  compliantText: {
    color: COLORS.green,
  },
  warningText: {
    color: COLORS.red,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  valueLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  valueText: {
    fontSize: 16,
  },
  descriptionContainer: {
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailsContainer: {
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 16,
    lineHeight: 24,
  },
  closeModalButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});