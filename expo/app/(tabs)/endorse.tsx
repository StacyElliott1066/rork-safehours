import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, FileText } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

export default function EndorseTab() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => router.push('/endorsements/flight' as never)}
        >
          <View style={[styles.iconCircle, { backgroundColor: COLORS.primary }]}>
            <BookOpen size={28} color={COLORS.white} />
          </View>
          <Text style={styles.cardTitle}>Record Endorsements</Text>
          <Text style={styles.cardDescription}>
            Track flight endorsements with student names, dates, and photos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => router.push('/endorsements/written-practical' as never)}
        >
          <View style={[styles.iconCircle, { backgroundColor: COLORS.secondary }]}>
            <FileText size={28} color={COLORS.white} />
          </View>
          <Text style={styles.cardTitle}>Record Written & Practical Statistics</Text>
          <Text style={styles.cardDescription}>
            Log written and practical test results, track pass rates and statistics
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
    marginTop: -40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center' as const,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold' as const,
    color: COLORS.black,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
});
