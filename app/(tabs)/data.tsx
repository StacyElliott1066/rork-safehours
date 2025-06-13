import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform, ActivityIndicator, Modal } from 'react-native';
import { FileDown, FileUp, Trash2, AlertTriangle, Calendar } from 'lucide-react-native';
import { useActivityStore } from '@/store/activityStore';
import { exportActivities, importActivities } from '@/utils/csv';
import { exportActivitiesToICS } from '@/utils/export';
import { importActivitiesFromICS } from '@/utils/export';
import { COLORS } from '@/constants/colors';

export default function DataScreen() {
  const { activities, importActivities: storeImportActivities, clearAllActivities } = useActivityStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingICS, setIsExportingICS] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportingICS, setIsImportingICS] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const handleExport = async () => {
    if (activities.length === 0) {
      Alert.alert('No Data', 'There are no activities to export.');
      return;
    }
    
    setIsExporting(true);
    try {
      const success = await exportActivities(activities);
      if (success) {
        Alert.alert('Success', 'Activities exported successfully.');
      } else {
        Alert.alert('Error', 'Failed to export activities.');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'An error occurred while exporting activities.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExportICS = async () => {
    if (activities.length === 0) {
      Alert.alert('No Data', 'There are no activities to export.');
      return;
    }
    
    setIsExportingICS(true);
    try {
      const success = await exportActivitiesToICS(activities);
      if (success) {
        Alert.alert('Success', 'Activities exported to iCalendar format successfully.');
      } else {
        Alert.alert('Error', 'Failed to export activities to iCalendar format.');
      }
    } catch (error) {
      console.error('iCalendar export error:', error);
      Alert.alert('Error', 'An error occurred while exporting activities to iCalendar format.');
    } finally {
      setIsExportingICS(false);
    }
  };
  
  const handleImport = async () => {
    setIsImporting(true);
    try {
      const importedActivities = await importActivities();
      
      if (!importedActivities) {
        // User cancelled or no file selected
        setIsImporting(false);
        return;
      }
      
      if (importedActivities.length === 0) {
        Alert.alert('Import Error', 'No valid activities found in the CSV file.');
        setIsImporting(false);
        return;
      }
      
      // Ask user if they want to replace or append
      if (activities.length > 0) {
        Alert.alert(
          'Import Options',
          `You have ${importedActivities.length} activities to import. What would you like to do?`,
          [
            {
              text: 'Replace All',
              onPress: () => {
                storeImportActivities(importedActivities);
                Alert.alert('Success', `Imported ${importedActivities.length} activities, replacing existing data.`);
              },
              style: 'destructive'
            },
            {
              text: 'Append',
              onPress: () => {
                // Combine existing and new activities
                const combinedActivities = [...activities, ...importedActivities];
                storeImportActivities(combinedActivities);
                Alert.alert('Success', `Appended ${importedActivities.length} activities to your existing data.`);
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      } else {
        // No existing activities, just import
        storeImportActivities(importedActivities);
        Alert.alert('Success', `Imported ${importedActivities.length} activities.`);
      }
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Import Error', 'Failed to import activities. Please check your CSV file format.');
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleImportICS = async () => {
    setIsImportingICS(true);
    try {
      const importedActivities = await importActivitiesFromICS();
      
      if (!importedActivities) {
        // User cancelled or no file selected
        setIsImportingICS(false);
        return;
      }
      
      if (importedActivities.length === 0) {
        Alert.alert('Import Error', 'No valid activities found in the iCalendar file.');
        setIsImportingICS(false);
        return;
      }
      
      // Ask user if they want to replace or append
      if (activities.length > 0) {
        Alert.alert(
          'Import Options',
          `You have ${importedActivities.length} activities to import. What would you like to do?`,
          [
            {
              text: 'Replace All',
              onPress: () => {
                storeImportActivities(importedActivities);
                Alert.alert('Success', `Imported ${importedActivities.length} activities, replacing existing data.`);
              },
              style: 'destructive'
            },
            {
              text: 'Append',
              onPress: () => {
                // Combine existing and new activities
                const combinedActivities = [...activities, ...importedActivities];
                storeImportActivities(combinedActivities);
                Alert.alert('Success', `Appended ${importedActivities.length} activities to your existing data.`);
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      } else {
        // No existing activities, just import
        storeImportActivities(importedActivities);
        Alert.alert('Success', `Imported ${importedActivities.length} activities.`);
      }
    } catch (error) {
      console.error('iCalendar import error:', error);
      Alert.alert('Import Error', 'Failed to import activities. Please check your iCalendar file format.');
    } finally {
      setIsImportingICS(false);
    }
  };
  
  const handleClearData = () => {
    if (activities.length === 0) {
      Alert.alert('No Data', 'There are no activities to clear.');
      return;
    }
    
    // First confirmation
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all activities? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Continue',
          onPress: () => setShowConfirmModal(true),
          style: 'destructive'
        }
      ]
    );
  };
  
  const executeDataClear = () => {
    clearAllActivities();
    setShowConfirmModal(false);
    Alert.alert('Success', 'All activities have been deleted.');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Export Data</Text>
          <Text style={styles.cardDescription}>
            Export all your activities to a CSV file that you can save or share.
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <FileDown size={20} color={COLORS.white} />
                <Text style={styles.buttonText}>Export to CSV</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Export to Calendar</Text>
          <Text style={styles.cardDescription}>
            Export all your activities to iCalendar format (.ics) that you can import into calendar apps.
          </Text>
          <TouchableOpacity 
            style={[styles.button, styles.calendarButton]}
            onPress={handleExportICS}
            disabled={isExportingICS}
          >
            {isExportingICS ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Calendar size={20} color={COLORS.white} />
                <Text style={styles.buttonText}>Export to iCalendar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Import Data</Text>
          <Text style={styles.cardDescription}>
            Import activities from a CSV file. The file should have columns for type, date, startTime, endTime, and prePostValue.
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleImport}
            disabled={isImporting}
          >
            {isImporting ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <FileUp size={20} color={COLORS.white} />
                <Text style={styles.buttonText}>Import from CSV</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Import from Calendar</Text>
          <Text style={styles.cardDescription}>
            Import activities from an iCalendar file (.ics) exported from calendar apps or SafeHours.
          </Text>
          <TouchableOpacity 
            style={[styles.button, styles.calendarButton]}
            onPress={handleImportICS}
            disabled={isImportingICS}
          >
            {isImportingICS ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Calendar size={20} color={COLORS.white} />
                <Text style={styles.buttonText}>Import from iCalendar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Clear Data</Text>
          <Text style={styles.cardDescription}>
            Delete all activities. This action cannot be undone. Consider exporting your data first.
          </Text>
          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]}
            onPress={handleClearData}
          >
            <Trash2 size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Second confirmation modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.warningIconContainer}>
              <AlertTriangle size={40} color={COLORS.red} />
            </View>
            
            <Text style={styles.modalTitle}>Final Warning</Text>
            <Text style={styles.modalDescription}>
              You are about to permanently delete all your activity data. This action cannot be undone.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalDeleteButton}
                onPress={executeDataClear}
              >
                <Text style={styles.modalDeleteButtonText}>Delete All Data</Text>
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
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  calendarButton: {
    backgroundColor: COLORS.secondary || '#4CAF50',
  },
  dangerButton: {
    backgroundColor: COLORS.red,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  warningIconContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontWeight: 'bold',
    color: COLORS.gray,
  },
  modalDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: COLORS.red,
    alignItems: 'center',
  },
  modalDeleteButtonText: {
    fontWeight: 'bold',
    color: COLORS.white,
  },
});