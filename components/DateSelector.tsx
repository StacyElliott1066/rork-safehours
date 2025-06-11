import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { formatDate, formatDateToYYYYMMDD, getCurrentDate } from '@/utils/time';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Validate and parse the selected date string to a Date object
  let selectedDateObj: Date;
  
  try {
    // Validate date format
    if (!selectedDate || !selectedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.warn(`Invalid date format: ${selectedDate}, using current date instead`);
      selectedDate = getCurrentDate();
    }
    
    // Parse the date with noon time to avoid timezone issues
    selectedDateObj = new Date(selectedDate + 'T12:00:00');
    
    // Check if the date is valid
    if (isNaN(selectedDateObj.getTime())) {
      console.warn(`Invalid date: ${selectedDate}, using current date instead`);
      selectedDate = getCurrentDate();
      selectedDateObj = new Date(selectedDate + 'T12:00:00');
    }
  } catch (error) {
    console.error("Error parsing date:", error);
    selectedDate = getCurrentDate();
    selectedDateObj = new Date(selectedDate + 'T12:00:00');
  }
  
  const [tempYear, setTempYear] = useState(selectedDateObj.getFullYear());
  const [tempMonth, setTempMonth] = useState(selectedDateObj.getMonth());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const goToPreviousDay = () => {
    try {
      // Create a date object from the selected date string with a noon time to avoid timezone issues
      const date = new Date(selectedDate + 'T12:00:00');
      if (isNaN(date.getTime())) {
        console.error("Invalid date for previous day:", selectedDate);
        return;
      }
      
      date.setDate(date.getDate() - 1);
      onDateChange(formatDateToYYYYMMDD(date));
    } catch (error) {
      console.error("Error going to previous day:", error);
    }
  };

  const goToNextDay = () => {
    try {
      // Create a date object from the selected date string with a noon time to avoid timezone issues
      const date = new Date(selectedDate + 'T12:00:00');
      if (isNaN(date.getTime())) {
        console.error("Invalid date for next day:", selectedDate);
        return;
      }
      
      date.setDate(date.getDate() + 1);
      onDateChange(formatDateToYYYYMMDD(date));
    } catch (error) {
      console.error("Error going to next day:", error);
    }
  };

  const goToToday = () => {
    const today = new Date();
    onDateChange(formatDateToYYYYMMDD(today));
  };

  const goToPreviousMonth = () => {
    if (tempMonth === 0) {
      setTempMonth(11);
      setTempYear(tempYear - 1);
    } else {
      setTempMonth(tempMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (tempMonth === 11) {
      setTempMonth(0);
      setTempYear(tempYear + 1);
    } else {
      setTempMonth(tempMonth + 1);
    }
  };

  const selectDate = (day: number) => {
    // Create a date object using local time
    const newDate = new Date(tempYear, tempMonth, day, 12, 0, 0);
    onDateChange(formatDateToYYYYMMDD(newDate));
    setModalVisible(false);
  };

  // Check if selected date is today
  const isToday = (dateString: string): boolean => {
    const today = new Date();
    const todayString = formatDateToYYYYMMDD(today);
    return dateString === todayString;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(tempYear, tempMonth);
    const firstDay = getFirstDayOfMonth(tempYear, tempMonth);
    
    const days = [];
    // Add empty spaces for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ key: `empty-${i}`, day: 0 });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ key: `day-${i}`, day: i });
    }

    // Weekday labels
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <ChevronLeft color={COLORS.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.monthYearText}>{months[tempMonth]} {tempYear}</Text>
          <TouchableOpacity onPress={goToNextMonth}>
            <ChevronRight color={COLORS.primary} size={24} />
          </TouchableOpacity>
        </View>
        
        {/* Calendar grid with fixed width cells */}
        <View style={styles.calendarGrid}>
          {/* Weekday headers */}
          <View style={styles.weekdaysRow}>
            {weekdays.map((day, index) => (
              <View key={day} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{day}</Text>
              </View>
            ))}
          </View>
          
          {/* Calendar days */}
          <View style={styles.daysGrid}>
            {days.map((item) => {
              if (item.day === 0) {
                return <View key={item.key} style={styles.dayCell} />;
              }
              
              // Create date string for the current calendar day
              const calendarDate = new Date(tempYear, tempMonth, item.day, 12, 0, 0);
              const dateString = formatDateToYYYYMMDD(calendarDate);
              
              // Check if this day is the selected date
              const isSelected = dateString === selectedDate;
              const isCurrentDay = isToday(dateString);
              
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDay,
                    isCurrentDay && styles.todayDay
                  ]}
                  onPress={() => selectDate(item.day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.selectedDayText,
                      isCurrentDay && styles.todayDayText
                    ]}
                  >
                    {item.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Format the date for display, with fallback to current date
  const displayDate = () => {
    try {
      if (!selectedDate || !selectedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return formatDate(getCurrentDate());
      }
      
      // Create a formatted date string
      const formattedDate = formatDate(selectedDate);
      
      // Check if the formatted date is valid
      if (formattedDate === "Invalid date" || formattedDate === "Date error") {
        console.warn("Invalid formatted date, using current date instead");
        return formatDate(getCurrentDate());
      }
      
      return formattedDate;
    } catch (error) {
      console.error("Error formatting date for display:", error);
      return formatDate(getCurrentDate());
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <TouchableOpacity onPress={goToPreviousDay}>
          <ChevronLeft color={COLORS.primary} size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>
            {displayDate()}
          </Text>
          <Calendar color={COLORS.primary} size={18} style={styles.calendarIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={goToNextDay}>
          <ChevronRight color={COLORS.primary} size={24} />
        </TouchableOpacity>
      </View>
      
      {/* Target Date label */}
      <Text style={styles.dayOfWeekLabel}>Target Date</Text>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            
            {renderCalendar()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginRight: 8,
  },
  calendarIcon: {
    marginLeft: 4,
  },
  dayOfWeekLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
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
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  closeButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  calendarContainer: {
    width: '100%',
    marginTop: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  calendarGrid: {
    width: '100%',
  },
  weekdaysRow: {
    flexDirection: 'row',
    width: '100%',
  },
  weekdayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontWeight: '600',
    color: COLORS.gray,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  selectedDayText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  todayDay: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
  },
  todayDayText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  todayButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  todayButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});