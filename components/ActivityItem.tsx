import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Edit2, Trash2 } from 'lucide-react-native';
import { Activity } from '@/types/activity';
import { COLORS } from '@/constants/colors';
import { calculateDuration, formatDuration } from '@/utils/time';

interface ActivityItemProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

export default function ActivityItem({ activity, onEdit, onDelete }: ActivityItemProps) {
  const { id, type, startTime, endTime, prePostValue } = activity;
  
  const getTypeColor = () => {
    switch (type) {
      case 'Flight': return COLORS.flight;
      case 'Ground': return COLORS.ground;
      case 'SIM': return COLORS.sim;
      case 'Other': return COLORS.other;
    }
  };
  
  const duration = calculateDuration(startTime, endTime);
  const formattedDuration = formatDuration(duration);
  const totalTime = duration + (prePostValue * 60);
  const formattedTotalTime = formatDuration(totalTime);
  
  return (
    <View style={[styles.container, { borderLeftColor: getTypeColor() }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.typeIndicator, { backgroundColor: getTypeColor() }]}>
            <Text style={styles.typeText}>{type}</Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onEdit(activity)}
            >
              <Edit2 size={18} color={COLORS.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onDelete(id)}
            >
              <Trash2 size={18} color={COLORS.red} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.details}>
          <View style={styles.timeInfo}>
            <Text style={styles.timeLabel}>Start:</Text>
            <Text style={styles.timeValue}>{startTime}</Text>
          </View>
          
          <View style={styles.timeInfo}>
            <Text style={styles.timeLabel}>End:</Text>
            <Text style={styles.timeValue}>{endTime}</Text>
          </View>
          
          <View style={styles.timeInfo}>
            <Text style={styles.timeLabel}>Duration:</Text>
            <Text style={styles.timeValue}>{formattedDuration}</Text>
          </View>
          
          {(type === 'Flight' || type === 'SIM') && (
            <>
              <View style={styles.timeInfo}>
                <Text style={styles.timeLabel}>Pre/Post:</Text>
                <Text style={styles.timeValue}>{prePostValue}h</Text>
              </View>
              
              <View style={styles.timeInfo}>
                <Text style={styles.timeLabel}>Total:</Text>
                <Text style={styles.timeValue}>{formattedTotalTime}</Text>
              </View>
            </>
          )}
        </View>
        
        {activity.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{activity.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  details: {
    marginBottom: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timeLabel: {
    width: 80,
    fontWeight: '600',
  },
  timeValue: {
    flex: 1,
  },
  notes: {
    marginTop: 8,
    padding: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  notesLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
  },
});