export type ActivityType = 'Flight' | 'Ground' | 'SIM' | 'Other';

export interface Activity {
  id: string;
  type: ActivityType;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  preValue: number; // 0-2 hours
  postValue: number; // 0-2 hours
  prePostValue?: number; // Legacy field for backward compatibility
  notes?: string;
}

export interface WarningThresholds {
  maxFlightHours: number; // Default 8 hours
  minRestBetweenDays: number; // Default 10 hours
  maxContactTime: number; // Default 10 hours
  maxDutyDay: number; // Default 16 hours
  maxConsecutiveDays: number; // Default 15 days
  maxWeeklyHours: number; // Default 40 hours (Sunday-Saturday)
  maxPastSevenDaysHours: number; // Default 50 hours (rolling 7 days)
}

export interface WarningStatus {
  maxFlightHours: boolean;
  minRestBetweenDays: boolean;
  maxContactTime: boolean;
  maxDutyDay: boolean;
  maxConsecutiveDays: boolean;
  maxWeeklyHours: boolean;
  maxPastSevenDaysHours: boolean;
}