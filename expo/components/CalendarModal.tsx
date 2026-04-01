import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export interface CalendarModalProps {
  visible: boolean;
  currentValue: string;
  onClose: () => void;
  onSelect: (date: string) => void;
}

export function CalendarModal({ visible, currentValue, onClose, onSelect }: CalendarModalProps) {
  const parseValue = (val: string) => {
    const parts = val.split('/');
    if (parts.length === 3) {
      const m = parseInt(parts[0], 10);
      const d = parseInt(parts[1], 10);
      const yy = parseInt(parts[2], 10);
      if (!isNaN(m) && !isNaN(d) && !isNaN(yy) && m >= 1 && m <= 12) {
        const year = yy < 50 ? 2000 + yy : 1900 + yy;
        return { month: m - 1, day: d, year };
      }
    }
    return null;
  };

  const now = new Date();
  const initialParsed = parseValue(currentValue);

  const [viewMonth, setViewMonth] = useState(initialParsed?.month ?? now.getMonth());
  const [viewYear, setViewYear] = useState(initialParsed?.year ?? now.getFullYear());

  useEffect(() => {
    if (visible) {
      const p = parseValue(currentValue);
      if (p) {
        setViewMonth(p.month);
        setViewYear(p.year);
      } else {
        const n = new Date();
        setViewMonth(n.getMonth());
        setViewYear(n.getFullYear());
      }
    }
  }, [visible, currentValue]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  const parsed = parseValue(currentValue);
  const selectedDay =
    parsed && parsed.month === viewMonth && parsed.year === viewYear
      ? parsed.day
      : null;

  const handleDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const yy = String(viewYear).slice(2);
    onSelect(`${mm}/${dd}/${yy}`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
              <ChevronLeft size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.monthYear}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity style={styles.navBtn} onPress={nextMonth}>
              <ChevronRight size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.dayNamesRow}>
            {DAY_NAMES.map((d) => (
              <View key={d} style={styles.dayNameCell}>
                <Text style={styles.dayName}>{d}</Text>
              </View>
            ))}
          </View>

          {rows.map((row, rIdx) => (
            <View key={rIdx} style={styles.gridRow}>
              {row.map((day, cIdx) => (
                <View key={cIdx} style={styles.gridCell}>
                  {day !== null ? (
                    <TouchableOpacity
                      style={[
                        styles.dayBtn,
                        selectedDay === day && styles.dayBtnSel,
                      ]}
                      onPress={() => handleDay(day)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          selectedDay === day && styles.dayTextSel,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
            </View>
          ))}

          <TouchableOpacity style={styles.cancelRow} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 340,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navBtn: {
    padding: 8,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.black,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: 4,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.gray,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  gridCell: {
    flex: 1,
    alignItems: 'center' as const,
    height: 38,
    justifyContent: 'center' as const,
  },
  dayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  dayBtnSel: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    fontSize: 14,
    color: COLORS.black,
  },
  dayTextSel: {
    color: COLORS.white,
    fontWeight: '600' as const,
  },
  cancelRow: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center' as const,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  cancelText: {
    fontSize: 15,
    color: COLORS.gray,
    fontWeight: '600' as const,
  },
});
