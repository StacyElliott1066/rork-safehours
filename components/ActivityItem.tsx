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
  const { id, type, startTime, endTime, preValue, postValue, prePostValue } = activity;
  
  const getTypeColor = () => {
    switch (type) {
      case 'Flight': return COLORS.flight;
      case 'Ground': return COLORS.ground;
      case 'SIM': return COLORS.sim;
      case 'Other Internal': return COLORS.otherInternal;
      case 'Other External': return COLORS.otherExternal;
      default: return COLORS.gray;
    }
  };
  
  const duration = calculateDuration(startTime, endTime);
  const formattedDuration = formatDuration(duration);
  
  // Calculate total pre/post time using separate values or legacy combined value
  let totalPrePostMinutes = 0;
  if (preValue !== undefined && postValue !== undefined) {
    totalPrePostMinutes = (preValue + postValue) * 60;
  } else if (prePostValue !== undefined) {
    totalPrePostMinutes = prePostValue * 60;
  }
  
  const totalTime = duration + totalPrePostMinutes;
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
              {preValue !== undefined && postValue !== undefined ? (
                <>
                  <View style={styles.timeInfo}>
                    <Text style={styles.timeLabel}>Pre:</Text>
                    <Text style={styles.timeValue}>{preValue.toFixed(1)}h</Text>
                  </View>
                  
                  <View style={styles.timeInfo}>
                    <Text style={styles.timeLabel}>Post:</Text>
                    <Text style={styles.timeValue}>{postValue.toFixed(1)}h</Text>
                  </View>
                  
                  <View style={styles.timeInfo}>
                    <Text style={styles.timeLabel}>Pre/Post Total:</Text>
                    <Text style={styles.timeValue}>{(preValue + postValue).toFixed(1)}h</Text>
                  </View>
                </>
              ) : (
                <View style={styles.timeInfo}>
                  <Text style={styles.timeLabel}>Pre/Post:</Text>
                  <Text style={styles.timeValue}>{prePostValue?.toFixed(1) || '0.0'}h</Text>
                </View>
              )}
              
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