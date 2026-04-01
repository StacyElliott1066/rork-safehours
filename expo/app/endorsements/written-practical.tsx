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
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  X,
  Filter,
  ArrowDown,
  ArrowUp,
  Calendar,
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useEndorsementStore } from '@/store/endorsementStore';
import { CalendarModal } from '@/components/CalendarModal';
import {
  WrittenPracticalTest,
  TestType,
  TestCategory,
  TestResult,
  SortField,
  SortDirection,
} from '@/types/endorsement';

const TEST_TYPES: TestType[] = [
  'Private Pilot',
  'Instrument Rating',
  'Commercial Pilot',
  'Multi Engine Practical',
  'CFI',
  'CFII',
  'MEI Practical',
];

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
    <View style={{ zIndex: 10 }}>
      <TextInput
        style={localStyles.modalInput}
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
        <View style={localStyles.autocompleteDropdown}>
          <ScrollView style={localStyles.autocompleteScroll} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {filtered.map((name) => (
              <TouchableOpacity
                key={name}
                style={localStyles.autocompleteItem}
                onPress={() => {
                  onChangeText(name);
                  setShowDropdown(false);
                }}
              >
                <Text style={localStyles.autocompleteText}>{name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function DatePickerInput({ value, onChangeText, placeholder }: { value: string; onChangeText: (t: string) => void; placeholder: string }) {
  const [showCal, setShowCal] = useState(false);
  return (
    <View>
      <View style={localStyles.dateRow}>
        <TextInput
          style={localStyles.dateInput}
          value={value}
          onChangeText={(t) => onChangeText(formatDateInput(t))}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray}
          keyboardType="number-pad"
          maxLength={8}
        />
        <TouchableOpacity style={localStyles.calIconBtn} onPress={() => setShowCal(true)}>
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

export default function WrittenPracticalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    writtenPracticalTests,
    addWrittenPracticalTest,
    updateWrittenPracticalTest,
    deleteWrittenPracticalTest,
    getWrittenStats,
    getPracticalStats,
    getAllNames,
  } = useEndorsementStore();

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterTestType, setFilterTestType] = useState<TestType | 'All'>('All');
  const [filterResult, setFilterResult] = useState<TestResult | 'All'>('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTestTypeDropdown, setShowTestTypeDropdown] = useState(false);

  const [editingId, setEditingId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTestType, setFormTestType] = useState<TestType>('Private Pilot');
  const [formCategory, setFormCategory] = useState<TestCategory>('Written');
  const [formResult, setFormResult] = useState<TestResult>('Pass');

  const allNames = getAllNames();
  const writtenStats = getWrittenStats();
  const practicalStats = getPracticalStats();

  const filtersActive = filterName !== '' || filterTestType !== 'All' || filterResult !== 'All' || filterDateFrom !== '' || filterDateTo !== '';

  const filteredAndSorted = useMemo(() => {
    let list = [...writtenPracticalTests];

    if (filterName.trim()) {
      const lower = filterName.toLowerCase();
      list = list.filter((t) => t.studentName.toLowerCase().includes(lower));
    }
    if (filterTestType !== 'All') {
      list = list.filter((t) => t.testType === filterTestType);
    }
    if (filterResult !== 'All') {
      list = list.filter((t) => t.result === filterResult);
    }
    if (filterDateFrom) {
      const fromTs = parseDateForSort(filterDateFrom);
      if (fromTs > 0) list = list.filter((t) => parseDateForSort(t.date) >= fromTs);
    }
    if (filterDateTo) {
      const toTs = parseDateForSort(filterDateTo);
      if (toTs > 0) list = list.filter((t) => parseDateForSort(t.date) <= toTs);
    }

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'date':
          cmp = parseDateForSort(a.date) - parseDateForSort(b.date);
          break;
        case 'studentName':
          cmp = a.studentName.toLowerCase().localeCompare(b.studentName.toLowerCase());
          break;
        case 'testType':
          cmp = a.testType.localeCompare(b.testType);
          break;
        case 'result':
          cmp = a.result.localeCompare(b.result);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [writtenPracticalTests, filterName, filterTestType, filterResult, filterDateFrom, filterDateTo, sortField, sortDir]);

  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('asc');
      }
    },
    [sortField]
  );

  const clearFilters = useCallback(() => {
    setFilterName('');
    setFilterTestType('All');
    setFilterResult('All');
    setFilterDateFrom('');
    setFilterDateTo('');
  }, []);

  const resetForm = useCallback(() => {
    setFormName('');
    setFormDate('');
    setFormTestType('Private Pilot');
    setFormCategory('Written');
    setFormResult('Pass');
    setShowTestTypeDropdown(false);
  }, []);

  const handleTestTypeSelect = useCallback((type: TestType) => {
    setFormTestType(type);
    setShowTestTypeDropdown(false);
    if (type === 'Multi Engine Practical' || type === 'MEI Practical') {
      setFormCategory('Practical');
    }
  }, []);

  const handleAdd = useCallback(() => {
    if (!formName.trim()) {
      Alert.alert('Required', 'Please enter a student name.');
      return;
    }
    if (!formDate.trim()) {
      Alert.alert('Required', 'Please enter a date.');
      return;
    }
    addWrittenPracticalTest({
      studentName: formName.trim(),
      date: formDate,
      testType: formTestType,
      category: formCategory,
      result: formResult,
    });
    setShowAddModal(false);
    resetForm();
  }, [formName, formDate, formTestType, formCategory, formResult, addWrittenPracticalTest, resetForm]);

  const openEdit = useCallback((item: WrittenPracticalTest) => {
    setEditingId(item.id);
    setFormName(item.studentName);
    setFormDate(item.date);
    setFormTestType(item.testType);
    setFormCategory(item.category);
    setFormResult(item.result);
    setShowEditModal(true);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!formName.trim()) {
      Alert.alert('Required', 'Please enter a student name.');
      return;
    }
    if (!formDate.trim()) {
      Alert.alert('Required', 'Please enter a date.');
      return;
    }
    updateWrittenPracticalTest(editingId, {
      studentName: formName.trim(),
      date: formDate,
      testType: formTestType,
      category: formCategory,
      result: formResult,
    });
    setShowEditModal(false);
    resetForm();
  }, [editingId, formName, formDate, formTestType, formCategory, formResult, updateWrittenPracticalTest, resetForm]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Delete Test Record', 'Are you sure you want to delete this test record?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteWrittenPracticalTest(id) },
      ]);
    },
    [deleteWrittenPracticalTest]
  );

  const renderSortButton = useCallback(
    (label: string, field: SortField) => {
      const active = sortField === field;
      return (
        <TouchableOpacity
          style={[localStyles.sortButton, active && localStyles.sortButtonActive]}
          onPress={() => toggleSort(field)}
        >
          <Text style={[localStyles.sortButtonText, active && localStyles.sortButtonTextActive]}>{label}</Text>
          {active && (sortDir === 'asc' ? (
            <ArrowUp size={12} color={COLORS.white} />
          ) : (
            <ArrowDown size={12} color={COLORS.white} />
          ))}
        </TouchableOpacity>
      );
    },
    [sortField, sortDir, toggleSort]
  );

  const renderFilterChip = useCallback(
    (label: string, isActive: boolean, onPress: () => void) => (
      <TouchableOpacity
        key={label}
        style={[localStyles.filterChip, isActive && localStyles.filterChipActive]}
        onPress={onPress}
      >
        <Text style={[localStyles.filterChipText, isActive && localStyles.filterChipTextActive]}>{label}</Text>
      </TouchableOpacity>
    ),
    []
  );

  const renderFormModal = useCallback(
    (visible: boolean, title: string, onClose: () => void, onSubmit: () => void, submitLabel: string) => (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={localStyles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={localStyles.modalKeyboard}
          >
            <View style={localStyles.modalContent}>
              <View style={localStyles.modalHeader}>
                <TouchableOpacity onPress={onClose}>
                  <ChevronLeft size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={localStyles.modalTitle}>{title}</Text>
                <TouchableOpacity onPress={onClose}>
                  <X size={24} color={COLORS.gray} />
                </TouchableOpacity>
              </View>

              <ScrollView style={localStyles.modalBody} keyboardShouldPersistTaps="handled">
                <Text style={localStyles.fieldLabel}>Student Name</Text>
                <NameAutocompleteInput
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="Enter student name"
                  allNames={allNames}
                />

                <Text style={localStyles.fieldLabel}>Date (MM/DD/YY)</Text>
                <DatePickerInput value={formDate} onChangeText={setFormDate} placeholder="MM/DD/YY" />

                <Text style={localStyles.fieldLabel}>Test Type</Text>
                <TouchableOpacity
                  style={localStyles.dropdownButton}
                  onPress={() => setShowTestTypeDropdown((p) => !p)}
                >
                  <Text style={localStyles.dropdownButtonText}>{formTestType}</Text>
                  <ChevronDown size={18} color={COLORS.gray} />
                </TouchableOpacity>
                {showTestTypeDropdown && (
                  <View style={localStyles.dropdownList}>
                    {TEST_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[localStyles.dropdownItem, formTestType === type && localStyles.dropdownItemActive]}
                        onPress={() => handleTestTypeSelect(type)}
                      >
                        <Text
                          style={[
                            localStyles.dropdownItemText,
                            formTestType === type && localStyles.dropdownItemTextActive,
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <Text style={localStyles.fieldLabel}>Category</Text>
                <View style={localStyles.segmentedRow}>
                  {(['Written', 'Practical'] as TestCategory[]).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[localStyles.segmentButton, formCategory === cat && localStyles.segmentButtonActive]}
                      onPress={() => setFormCategory(cat)}
                    >
                      <Text
                        style={[
                          localStyles.segmentButtonText,
                          formCategory === cat && localStyles.segmentButtonTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={localStyles.fieldLabel}>Result</Text>
                <View style={localStyles.segmentedRow}>
                  {(['Pass', 'Fail'] as TestResult[]).map((res) => (
                    <TouchableOpacity
                      key={res}
                      style={[
                        localStyles.segmentButton,
                        formResult === res && (res === 'Pass' ? localStyles.segmentButtonActive : localStyles.segmentButtonFail),
                      ]}
                      onPress={() => setFormResult(res)}
                    >
                      <Text
                        style={[
                          localStyles.segmentButtonText,
                          formResult === res && localStyles.segmentButtonTextActive,
                        ]}
                      >
                        {res}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={localStyles.modalFooter}>
                <TouchableOpacity style={localStyles.cancelButton} onPress={onClose}>
                  <Text style={localStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={localStyles.submitButton} onPress={onSubmit}>
                  <Text style={localStyles.submitButtonText}>{submitLabel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    ),
    [formName, formDate, formTestType, formCategory, formResult, showTestTypeDropdown, allNames, handleTestTypeSelect]
  );

  return (
    <View style={localStyles.container}>
      <View style={[localStyles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={localStyles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={COLORS.white} />
          <Text style={localStyles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={localStyles.headerTitle}>Written & Practical Tests</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView style={localStyles.scrollView} contentContainerStyle={localStyles.scrollContent}>
        <View style={localStyles.statsRow}>
          <View style={localStyles.statCard}>
            <Text style={localStyles.statCount}>{writtenStats.total}</Text>
            <Text style={localStyles.statLabel}>Writtens</Text>
            <Text style={localStyles.statRate}>{writtenStats.passRate}% pass</Text>
            <Text style={localStyles.statSub}>Just for Fun</Text>
          </View>
          <View style={localStyles.statCard}>
            <Text style={localStyles.statCount}>{practicalStats.total}</Text>
            <Text style={localStyles.statLabel}>Practicals</Text>
            <Text style={localStyles.statRate}>{practicalStats.passRate}% pass</Text>
            <Text style={localStyles.statSub}>Official Rate</Text>
          </View>
        </View>

        <View style={localStyles.actionRow}>
          <TouchableOpacity
            style={localStyles.addButton}
            onPress={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <Plus size={16} color={COLORS.white} />
            <Text style={localStyles.addButtonText}>Add Test Record</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[localStyles.filterToggle, filtersActive && localStyles.filterToggleActive]}
            onPress={() => setShowFilters((p) => !p)}
          >
            <Filter size={16} color={filtersActive ? COLORS.white : COLORS.primary} />
            {filtersActive && <Text style={localStyles.filterToggleText}>Applied</Text>}
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={localStyles.filtersPanel}>
            <Text style={localStyles.filterSectionLabel}>Student Name</Text>
            <TextInput
              style={localStyles.filterInput}
              value={filterName}
              onChangeText={setFilterName}
              placeholder="Search by name"
              placeholderTextColor={COLORS.gray}
            />

            <Text style={localStyles.filterSectionLabel}>Test Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={localStyles.chipScroll}>
              {renderFilterChip('All', filterTestType === 'All', () => setFilterTestType('All'))}
              {TEST_TYPES.map((type) =>
                renderFilterChip(type, filterTestType === type, () => setFilterTestType(type))
              )}
            </ScrollView>

            <Text style={localStyles.filterSectionLabel}>Result</Text>
            <View style={localStyles.chipRow}>
              {renderFilterChip('All', filterResult === 'All', () => setFilterResult('All'))}
              {renderFilterChip('Pass', filterResult === 'Pass', () => setFilterResult('Pass'))}
              {renderFilterChip('Fail', filterResult === 'Fail', () => setFilterResult('Fail'))}
            </View>

            <Text style={localStyles.filterSectionLabel}>Date Range</Text>
            <View style={localStyles.dateRangeRow}>
              <View style={localStyles.dateRangeField}>
                <Text style={localStyles.dateRangeLabel}>From</Text>
                <DatePickerInput value={filterDateFrom} onChangeText={setFilterDateFrom} placeholder="MM/DD/YY" />
              </View>
              <View style={localStyles.dateRangeField}>
                <Text style={localStyles.dateRangeLabel}>To</Text>
                <DatePickerInput value={filterDateTo} onChangeText={setFilterDateTo} placeholder="MM/DD/YY" />
              </View>
            </View>

            <View style={localStyles.filterActions}>
              <TouchableOpacity style={localStyles.clearFiltersButton} onPress={clearFilters}>
                <Text style={localStyles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity style={localStyles.goToSortButton} onPress={() => setShowFilters(false)}>
                <Text style={localStyles.goToSortText}>Go to Sort</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={localStyles.sortBar}>
          <Text style={localStyles.sortLabel}>Sort:</Text>
          {renderSortButton('Date', 'date')}
          {renderSortButton('Name', 'studentName')}
          {renderSortButton('Test', 'testType')}
          {renderSortButton('Result', 'result')}
        </View>

        {filteredAndSorted.length === 0 ? (
          <View style={localStyles.emptyState}>
            <Text style={localStyles.emptyTitle}>No records yet</Text>
            <Text style={localStyles.emptySubtext}>Tap "+ Add Test Record" to get started</Text>
          </View>
        ) : (
          filteredAndSorted.map((item) => (
            <View key={item.id} style={localStyles.card}>
              <View style={localStyles.cardHeader}>
                <View style={localStyles.cardInfo}>
                  <Text style={localStyles.cardName}>{item.studentName}</Text>
                  <Text style={localStyles.cardDate}>{item.date}</Text>
                </View>
                <View style={localStyles.cardActions}>
                  <TouchableOpacity style={localStyles.iconButton} onPress={() => openEdit(item)}>
                    <Edit2 size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={localStyles.iconButton} onPress={() => handleDelete(item.id)}>
                    <Trash2 size={16} color={COLORS.red} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={localStyles.cardBadgeRow}>
                <View style={[localStyles.badge, item.category === 'Written' ? localStyles.badgeWritten : localStyles.badgePractical]}>
                  <Text style={localStyles.badgeText}>{item.category}</Text>
                </View>
                <Text style={localStyles.cardTestType}>{item.testType}</Text>
                <View style={[localStyles.badge, item.result === 'Pass' ? localStyles.badgePass : localStyles.badgeFail]}>
                  <Text style={localStyles.badgeText}>{item.result}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {renderFormModal(
        showAddModal,
        'Add Test Record',
        () => { setShowAddModal(false); resetForm(); },
        handleAdd,
        'Add'
      )}
      {renderFormModal(
        showEditModal,
        'Edit Test Record',
        () => { setShowEditModal(false); resetForm(); },
        handleSaveEdit,
        'Save'
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center' as const,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statCount: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.black,
    marginTop: 2,
  },
  statRate: {
    fontSize: 13,
    color: COLORS.green,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  statSub: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 10,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: 10,
    gap: 6,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 4,
  },
  filterToggleActive: {
    backgroundColor: COLORS.primary,
  },
  filterToggleText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  filtersPanel: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    padding: 14,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  filterSectionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: COLORS.darkGray,
    marginBottom: 6,
    marginTop: 10,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.black,
    backgroundColor: COLORS.background,
  },
  chipScroll: {
    flexDirection: 'row',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginRight: 6,
    marginBottom: 4,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500' as const,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  dateRangeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateRangeField: {
    flex: 1,
  },
  dateRangeLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 10,
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.red,
    alignItems: 'center' as const,
  },
  clearFiltersText: {
    color: COLORS.red,
    fontWeight: '600' as const,
    fontSize: 13,
  },
  goToSortButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center' as const,
  },
  goToSortText: {
    color: COLORS.white,
    fontWeight: '600' as const,
    fontSize: 13,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexWrap: 'wrap',
    gap: 4,
  },
  sortLabel: {
    fontSize: 13,
    color: COLORS.gray,
    marginRight: 6,
    fontWeight: '500' as const,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 3,
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sortButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600' as const,
  },
  sortButtonTextActive: {
    color: COLORS.white,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
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
    marginBottom: 8,
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
  cardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeWritten: {
    backgroundColor: '#1976D2',
  },
  badgePractical: {
    backgroundColor: '#E65100',
  },
  badgePass: {
    backgroundColor: COLORS.green,
  },
  badgeFail: {
    backgroundColor: COLORS.red,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.white,
  },
  cardTestType: {
    fontSize: 13,
    color: COLORS.darkGray,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center' as const,
    marginTop: 40,
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
    paddingTop: 10,
    maxHeight: 440,
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
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: COLORS.background,
  },
  dropdownButtonText: {
    fontSize: 15,
    color: COLORS.black,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    marginTop: 2,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primary,
  },
  dropdownItemText: {
    fontSize: 14,
    color: COLORS.black,
  },
  dropdownItemTextActive: {
    color: COLORS.white,
    fontWeight: '600' as const,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center' as const,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.primary,
  },
  segmentButtonFail: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },
  segmentButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600' as const,
  },
  segmentButtonTextActive: {
    color: COLORS.white,
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
    alignItems: 'center' as const,
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
    alignItems: 'center' as const,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.white,
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
