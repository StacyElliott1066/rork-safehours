import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  ChevronLeft,
  Plus,
  Edit2,
  Trash2,
  X,
  Camera,
  ImageIcon,
  ArrowDown,
  ArrowUp,
  Calendar,
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useEndorsementStore } from '@/store/endorsementStore';
import { CalendarModal } from '@/components/CalendarModal';
import { FlightEndorsement } from '@/types/endorsement';

type EndorsementSortField = 'name' | 'date';
type SortDir = 'asc' | 'desc';

function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4, 6);
}

function parseDateForSort(dateStr: string): number {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return 0;
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const yearShort = parseInt(parts[2], 10);
  const year = yearShort < 50 ? 2000 + yearShort : 1900 + yearShort;
  return new Date(year, month - 1, day).getTime();
}

interface NameAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  allNames: string[];
}

function NameAutocompleteInput({ value, onChangeText, placeholder, allNames }: NameAutocompleteProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = useMemo(() => {
    if (!value.trim()) return [];
    return allNames.filter((n) => n.toLowerCase().includes(value.toLowerCase()));
  }, [value, allNames]);

  return (
    <View>
      <TextInput
        style={styles.modalInput}
        value={value}
        onChangeText={(t) => {
          onChangeText(t);
          setShowDropdown(true);
        }}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        onFocus={() => setShowDropdown(true)}
      />
      {showDropdown && filtered.length > 0 && (
        <View style={styles.autocompleteDropdown}>
          <ScrollView style={styles.autocompleteScroll} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {filtered.map((name) => (
              <TouchableOpacity
                key={name}
                style={styles.autocompleteItem}
                onPress={() => {
                  onChangeText(name);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.autocompleteText}>{name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

interface DatePickerInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

function DatePickerInput({ value, onChangeText, placeholder }: DatePickerInputProps) {
  const [showCal, setShowCal] = useState(false);
  return (
    <View>
      <View style={styles.dateRow}>
        <TextInput
          style={styles.dateInput}
          value={value}
          onChangeText={(t) => onChangeText(formatDateInput(t))}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray}
          keyboardType="number-pad"
          maxLength={8}
        />
        <TouchableOpacity style={styles.calIconBtn} onPress={() => setShowCal(true)}>
          <Calendar size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <CalendarModal
        visible={showCal}
        currentValue={value}
        onClose={() => setShowCal(false)}
        onSelect={(d) => { onChangeText(d); setShowCal(false); }}
      />
    </View>
  );
}

export default function FlightEndorsementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    flightEndorsements,
    addFlightEndorsement,
    updateFlightEndorsement,
    deleteFlightEndorsement,
    getAllNames,
  } = useEndorsementStore();

  const [sortField, setSortField] = useState<EndorsementSortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState('');

  const [editingId, setEditingId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formText, setFormText] = useState('');
  const [formImage, setFormImage] = useState<string | undefined>(undefined);

  const allNames = getAllNames();

  const sortedEndorsements = useMemo(() => {
    const sorted = [...flightEndorsements];
    sorted.sort((a, b) => {
      if (sortField === 'name') {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        const cmp = nameA.localeCompare(nameB);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const dateA = parseDateForSort(a.date);
      const dateB = parseDateForSort(b.date);
      return sortDir === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return sorted;
  }, [flightEndorsements, sortField, sortDir]);

  const toggleSort = useCallback(
    (field: EndorsementSortField) => {
      if (sortField === field) {
        setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('asc');
      }
    },
    [sortField]
  );

  const resetForm = useCallback(() => {
    setFormName('');
    setFormDate('');
    setFormText('');
    setFormImage(undefined);
  }, []);

  const handleAdd = useCallback(() => {
    if (!formDate.trim()) {
      Alert.alert('Required', 'Please enter a date.');
      return;
    }
    addFlightEndorsement({
      name: formName.trim() || undefined,
      date: formDate,
      text: formText,
      imageUri: formImage,
    });
    setShowAddModal(false);
    resetForm();
  }, [formName, formDate, formText, formImage, addFlightEndorsement, resetForm]);

  const openEdit = useCallback((item: FlightEndorsement) => {
    setEditingId(item.id);
    setFormName(item.name || '');
    setFormDate(item.date);
    setFormText(item.text);
    setFormImage(item.imageUri);
    setShowEditModal(true);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!formDate.trim()) {
      Alert.alert('Required', 'Please enter a date.');
      return;
    }
    updateFlightEndorsement(editingId, {
      name: formName.trim() || undefined,
      date: formDate,
      text: formText,
      imageUri: formImage,
    });
    setShowEditModal(false);
    resetForm();
  }, [editingId, formName, formDate, formText, formImage, updateFlightEndorsement, resetForm]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Delete Endorsement', 'Are you sure you want to delete this endorsement?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteFlightEndorsement(id) },
      ]);
    },
    [deleteFlightEndorsement]
  );

  const takePhoto = useCallback(async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Camera is not available on web. Use gallery instead.');
      return;
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setFormImage(result.assets[0].uri);
    }
  }, []);

  const pickImage = useCallback(async () => {
    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Photo library permission is needed.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setFormImage(result.assets[0].uri);
    }
  }, []);

  const renderSortButton = useCallback(
    (label: string, field: EndorsementSortField) => {
      const active = sortField === field;
      return (
        <TouchableOpacity
          style={[styles.sortButton, active && styles.sortButtonActive]}
          onPress={() => toggleSort(field)}
        >
          <Text style={[styles.sortButtonText, active && styles.sortButtonTextActive]}>{label}</Text>
          {active && (sortDir === 'asc' ? (
            <ArrowUp size={14} color={COLORS.white} />
          ) : (
            <ArrowDown size={14} color={COLORS.white} />
          ))}
        </TouchableOpacity>
      );
    },
    [sortField, sortDir, toggleSort]
  );

  const renderFormModal = useCallback(
    (visible: boolean, title: string, onClose: () => void, onSubmit: () => void, submitLabel: string) => (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={onClose}>
                  <ChevronLeft size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{title}</Text>
                <TouchableOpacity onPress={onClose}>
                  <X size={24} color={COLORS.gray} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
                <Text style={styles.fieldLabel}>Student Name</Text>
                <NameAutocompleteInput
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="Enter student name"
                  allNames={allNames}
                />

                <Text style={styles.fieldLabel}>Date (MM/DD/YY)</Text>
                <DatePickerInput
                  value={formDate}
                  onChangeText={setFormDate}
                  placeholder="MM/DD/YY"
                />

                <Text style={styles.fieldLabel}>Endorsement Text</Text>
                <TextInput
                  style={[styles.modalInput, styles.multilineInput]}
                  value={formText}
                  onChangeText={setFormText}
                  placeholder="Enter endorsement text"
                  placeholderTextColor={COLORS.gray}
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.fieldLabel}>Photo</Text>
                <View style={styles.photoButtons}>
                  <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                    <Camera size={18} color={COLORS.white} />
                    <Text style={styles.photoButtonText}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.photoButton, styles.galleryButton]} onPress={pickImage}>
                    <ImageIcon size={18} color={COLORS.white} />
                    <Text style={styles.photoButtonText}>Gallery</Text>
                  </TouchableOpacity>
                </View>

                {formImage ? (
                  <View style={styles.photoPreviewContainer}>
                    <Image source={{ uri: formImage }} style={styles.photoPreview} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => setFormImage(undefined)}
                    >
                      <X size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
                  <Text style={styles.submitButtonText}>{submitLabel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    ),
    [formName, formDate, formText, formImage, allNames, takePhoto, pickImage]
  );

  const renderEndorsementCard = useCallback(
    (item: FlightEndorsement) => (
      <View key={item.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.name || 'No Name'}</Text>
            <Text style={styles.cardDate}>{item.date}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => openEdit(item)}>
              <Edit2 size={16} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(item.id)}>
              <Trash2 size={16} color={COLORS.red} />
            </TouchableOpacity>
          </View>
        </View>
        {item.text ? <Text style={styles.cardText} numberOfLines={3}>{item.text}</Text> : null}
        {item.imageUri ? (
          <TouchableOpacity
            onPress={() => {
              setViewingPhoto(item.imageUri!);
              setShowPhotoViewer(true);
            }}
          >
            <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
          </TouchableOpacity>
        ) : null}
      </View>
    ),
    [openEdit, handleDelete]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => { if (router.canGoBack()) { router.back(); } else { router.navigate('/endorsements' as never); } }}>
          <ChevronLeft size={22} color={COLORS.white} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record Endorsements</Text>
        <View style={{ width: 70 }} />
      </View>

      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {renderSortButton('Name', 'name')}
        {renderSortButton('Date', 'date')}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setShowAddModal(true);
        }}
      >
        <Plus size={18} color={COLORS.white} />
        <Text style={styles.addButtonText}>Add Endorsement</Text>
      </TouchableOpacity>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {sortedEndorsements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No records yet</Text>
            <Text style={styles.emptySubtext}>Tap "+ Add Endorsement" to create your first record</Text>
          </View>
        ) : (
          sortedEndorsements.map(renderEndorsementCard)
        )}
      </ScrollView>

      {renderFormModal(
        showAddModal,
        'Add Endorsement',
        () => { setShowAddModal(false); resetForm(); },
        handleAdd,
        'Add'
      )}
      {renderFormModal(
        showEditModal,
        'Edit Endorsement',
        () => { setShowEditModal(false); resetForm(); },
        handleSaveEdit,
        'Save'
      )}

      <Modal visible={showPhotoViewer} transparent animationType="fade" onRequestClose={() => setShowPhotoViewer(false)}>
        <View style={styles.photoViewerOverlay}>
          <TouchableOpacity style={styles.photoViewerClose} onPress={() => setShowPhotoViewer(false)}>
            <X size={28} color={COLORS.white} />
          </TouchableOpacity>
          {viewingPhoto ? (
            <Image source={{ uri: viewingPhoto }} style={styles.photoViewerImage} resizeMode="contain" />
          ) : null}
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
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
  },
  backText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500' as const,
    marginLeft: 2,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    flex: 1,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sortLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginRight: 10,
    fontWeight: '500' as const,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginRight: 8,
    gap: 4,
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sortButtonText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600' as const,
  },
  sortButtonTextActive: {
    color: COLORS.white,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 28,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold' as const,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.black,
  },
  cardDate: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    padding: 6,
  },
  cardText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 6,
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: COLORS.gray,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 6,
    textAlign: 'center' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalKeyboard: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold' as const,
    color: COLORS.black,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    maxHeight: 420,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.darkGray,
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.black,
    backgroundColor: COLORS.background,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  autocompleteDropdown: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    marginTop: 2,
    zIndex: 10,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  autocompleteScroll: {
    maxHeight: 120,
  },
  autocompleteItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  autocompleteText: {
    fontSize: 15,
    color: COLORS.black,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  galleryButton: {
    backgroundColor: COLORS.secondary,
  },
  photoButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  photoPreviewContainer: {
    marginTop: 10,
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.gray,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.white,
  },
  photoViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoViewerClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  photoViewerImage: {
    width: '90%',
    height: '70%',
  },
  dateRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    overflow: 'hidden',
  },
  dateInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.black,
  },
  calIconBtn: {
    padding: 10,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.lightGray,
  },
});
