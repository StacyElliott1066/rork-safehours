import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, ActivityType, WarningThresholds, WarningStatus } from '@/types/activity';
import { getCurrentDate, getCurrentTime, checkTimeOverlap } from '@/utils/time';

interface ActivityState {
  activities: Activity[];
  selectedDate: string;
  warningThresholds: WarningThresholds;
  warningStatus: WarningStatus;
  
  // Actions
  addActivity: (activity: Omit<Activity, 'id'>) => Promise<{ success: boolean; message?: string }>;
  updateActivity: (activity: Activity) => Promise<{ success: boolean; message?: string }>;
  deleteActivity: (id: string) => void;
  setSelectedDate: (date: string) => void;
  updateWarningThresholds: (thresholds: Partial<WarningThresholds>) => void;
  resetWarningThresholds: () => void;
  updateWarningStatus: (status: Partial<WarningStatus>) => void;
  clearAllActivities: () => void;
  importActivities: (activities: Activity[]) => void;
}

// Default warning thresholds
const DEFAULT_WARNING_THRESHOLDS: WarningThresholds = {
  maxFlightHours: 8, // FAA mandatory limit - cannot be changed
  minRestBetweenDays: 10,
  maxContactTime: 10,
  maxDutyDay: 16,
  maxConsecutiveDays: 15,
  maxWeeklyHours: 40,
  maxPastSevenDaysHours: 50,
};

// Default warning status (all compliant)
const DEFAULT_WARNING_STATUS: WarningStatus = {
  maxFlightHours: true,
  minRestBetweenDays: true,
  maxContactTime: true,
  maxDutyDay: true,
  maxConsecutiveDays: true,
  maxWeeklyHours: true,
  maxPastSevenDaysHours: true,
};

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],
      selectedDate: getCurrentDate(),
      warningThresholds: { ...DEFAULT_WARNING_THRESHOLDS },
      warningStatus: { ...DEFAULT_WARNING_STATUS },
      
      addActivity: async (activityData) => {
        // Validate time formats
        if (!activityData.startTime || !activityData.endTime || 
            typeof activityData.startTime !== 'string' || 
            typeof activityData.endTime !== 'string' ||
            !activityData.startTime.includes(':') || 
            !activityData.endTime.includes(':')) {
          return { 
            success: false, 
            message: 'Invalid Time Format: Please enter times in HH:MM format.' 
          };
        }
        
        // Check for time overlap
        const hasOverlap = checkTimeOverlap(get().activities, activityData);
        if (hasOverlap) {
          return { 
            success: false, 
            message: 'Time Overlap Detected: This activity overlaps with an existing activity (including pre/post time).' 
          };
        }
        
        const newActivity: Activity = {
          ...activityData,
          id: Date.now().toString(),
        };
        
        set((state) => ({
          activities: [...state.activities, newActivity],
        }));
        
        return { success: true };
      },
      
      updateActivity: async (updatedActivity) => {
        // Validate time formats
        if (!updatedActivity.startTime || !updatedActivity.endTime || 
            typeof updatedActivity.startTime !== 'string' || 
            typeof updatedActivity.endTime !== 'string' ||
            !updatedActivity.startTime.includes(':') || 
            !updatedActivity.endTime.includes(':')) {
          return { 
            success: false, 
            message: 'Invalid Time Format: Please enter times in HH:MM format.' 
          };
        }
        
        // Check for time overlap, excluding the activity being edited
        const hasOverlap = checkTimeOverlap(
          get().activities, 
          updatedActivity, 
          updatedActivity.id
        );
        
        if (hasOverlap) {
          return { 
            success: false, 
            message: 'Time Overlap Detected: This activity overlaps with an existing activity (including pre/post time).' 
          };
        }
        
        set((state) => ({
          activities: state.activities.map((activity) => 
            activity.id === updatedActivity.id ? updatedActivity : activity
          ),
        }));
        
        return { success: true };
      },
      
      deleteActivity: (id) => {
        set((state) => ({
          activities: state.activities.filter((activity) => activity.id !== id),
        }));
      },
      
      setSelectedDate: (date) => {
        set({ selectedDate: date });
      },
      
      updateWarningThresholds: (thresholds) => {
        // Ensure maxFlightHours is always 8 (FAA mandatory limit)
        const updatedThresholds = {
          ...thresholds,
          maxFlightHours: 8
        };
        
        set((state) => ({
          warningThresholds: { ...state.warningThresholds, ...updatedThresholds },
        }));
      },
      
      resetWarningThresholds: () => {
        set({ warningThresholds: { ...DEFAULT_WARNING_THRESHOLDS } });
      },
      
      updateWarningStatus: (status) => {
        set((state) => ({
          warningStatus: { ...state.warningStatus, ...status },
        }));
      },
      
      clearAllActivities: () => {
        set({ activities: [] });
      },
      
      importActivities: (activities) => {
        set({ activities });
      },
    }),
    {
      name: 'safehours-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);