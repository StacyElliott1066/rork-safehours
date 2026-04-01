import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, FileText, ChevronLeft } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

export default function EndorsementsHub() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.navigate('/data' as never)} activeOpacity={0.7}>
          <ChevronLeft size={20} color={COLORS.white} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Endorsements</Text>
        <View style={styles.headerRight} />
      </View>

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
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  backButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    width: 70,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  headerRight: {
    width: 70,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    flex: 1,
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
