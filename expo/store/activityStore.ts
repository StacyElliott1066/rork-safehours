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
  clearAllActivities: () => Promise<void>;
  importActivities: (activities: Activity[]) => void;
}

// Default warning thresholds
const DEFAULT_WARNING_THRESHOLDS: WarningThresholds = {
  maxFlightHours: 8, // FAA mandatory limit - cannot be changed
  minRestBetweenDays: 10,
  maxContactTime: 10, // Now a rolling 24-hour limit
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
          // Ensure both new and legacy fields are set for compatibility
          preValue: activityData.preValue || 0,
          postValue: activityData.postValue || 0,
          prePostValue: activityData.prePostValue || (activityData.preValue || 0) + (activityData.postValue || 0),
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
        
        const activityWithCompatibility = {
          ...updatedActivity,
          // Ensure both new and legacy fields are set for compatibility
          preValue: updatedActivity.preValue || 0,
          postValue: updatedActivity.postValue || 0,
          prePostValue: updatedActivity.prePostValue || (updatedActivity.preValue || 0) + (updatedActivity.postValue || 0),
        };
        
        set((state) => ({
          activities: state.activities.map((activity) => 
            activity.id === updatedActivity.id ? activityWithCompatibility : activity
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
      
      clearAllActivities: async () => {
        console.log('clearAllActivities called in store');
        try {
          // Reset the state first
          set({ 
            activities: [],
            selectedDate: getCurrentDate(),
            warningThresholds: { ...DEFAULT_WARNING_THRESHOLDS },
            warningStatus: { ...DEFAULT_WARNING_STATUS }
          });
          console.log('State cleared - activities set to empty array');
          
          // Clear from AsyncStorage to ensure persistence
          await AsyncStorage.removeItem('safehours-storage');
          console.log('AsyncStorage cleared');
          
          console.log('clearAllActivities completed successfully');
        } catch (error) {
          console.error('Error clearing activities:', error);
          // Ensure state is cleared even if AsyncStorage fails
          set({ 
            activities: [],
            selectedDate: getCurrentDate(),
            warningThresholds: { ...DEFAULT_WARNING_THRESHOLDS },
            warningStatus: { ...DEFAULT_WARNING_STATUS }
          });
        }
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