import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircle, CheckCircle } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

interface WarningIndicatorProps {
  title: string;
  isCompliant: boolean;
  value: string;
  threshold: string;
  onPress: () => void;
}

export default function WarningIndicator({ 
  title, 
  isCompliant, 
  value, 
  threshold,
  onPress 
}: WarningIndicatorProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isCompliant ? styles.compliantContainer : styles.warningContainer
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        {isCompliant ? (
          <CheckCircle size={24} color={COLORS.green} />
        ) : (
          <AlertCircle size={24} color={COLORS.red} />
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.details}>
          {value} / {threshold}
        </Text>
      </View>
      
      <Text style={styles.clickText}>click</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compliantContainer: {
    backgroundColor: COLORS.white,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.green,
  },
  warningContainer: {
    backgroundColor: COLORS.white,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.red,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: COLORS.gray,
  },
  clickText: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
});