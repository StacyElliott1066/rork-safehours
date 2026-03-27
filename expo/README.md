# SafeHours - Pilot Duty Time Tracker

## Detailed App Specification

### File Structure
```
/
├── app/
│   ├── _layout.tsx                 # Root layout with error boundary
│   ├── error-boundary.tsx          # Error handling component
│   ├── (tabs)/                     # Tab-based navigation
│   │   ├── _layout.tsx             # Tab configuration
│   │   ├── index.tsx               # Activities screen (main screen)
│   │   ├── charts.tsx              # Weekly statistics screen
│   │   ├── data.tsx                # Data management screen
│   │   └── settings.tsx            # Settings screen
│   ├── activity/                   # Activity screens
│   │   ├── new.tsx                 # Add new activity
│   │   └── [id].tsx                # Edit activity (dynamic route)
│   ├── warnings.tsx                # Warnings detail screen
│   ├── modal.tsx                   # Modal screen template
│   ├── +not-found.tsx              # 404 page
│   └── settings.tsx                # Settings screen (duplicate)
├── components/                     # Reusable components
│   ├── ActivityItem.tsx            # Activity list item
│   ├── ActivityTimeline.tsx        # Daily timeline visualization
│   ├── ActivityTypeSelector.tsx    # Activity type selection component
│   ├── DateSelector.tsx            # Date picker component
│   ├── PrePostValueInput.tsx       # Pre/Post value input component
│   ├── StatisticsCard.tsx          # Weekly statistics card
│   ├── TimeInput.tsx               # Time input component
│   ├── WarningIndicator.tsx        # Warning indicator component
│   ├── WarningModal.tsx            # Warning details modal
│   └── WeeklyChart.tsx             # Weekly hours chart
├── constants/                      # App constants
│   └── colors.ts                   # Color definitions
├── store/                          # State management
│   └── activityStore.ts            # Zustand store for activities
├── types/                          # TypeScript type definitions
│   └── activity.ts                 # Activity and warning types
├── utils/                          # Utility functions
│   ├── csv.ts                      # CSV import/export utilities
│   └── time.ts                     # Time calculation utilities
└── assets/                         # Static assets
    └── images/                     # App icons and images
```

### Color Scheme
```typescript
// From constants/colors.ts
export const COLORS = {
  primary: '#2C5530', // Hunter Green
  secondary: '#CC5500', // Burnt Orange
  background: '#F8F9FA',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6C757D',
  lightGray: '#E9ECEF',
  red: '#DC3545',
  green: '#28A745',
  
  // Activity colors
  flight: '#3498DB', // Blue
  ground: '#8B4513', // Brown
  sim: '#9B59B6', // Purple
  class: '#2ECC71', // Green
  other: '#95A5A6', // Gray
};
```

### Typography
- **Title**: 18-20px, bold
- **Subtitle**: 16px, semi-bold
- **Body Text**: 14px, regular
- **Small Text**: 12px, regular
- **Tiny Text**: 10px, regular (used in timeline)
- **Button Text**: 16px, bold
- **Input Text**: 14-16px, regular

### Component Specifications

#### DateSelector
- **Height**: Variable based on content
- **Date Button**: Rounded rectangle with light gray background
- **Calendar Modal**: Full-screen modal with month/year header, weekday labels, and day grid
- **Day Buttons**: 40px × 40px, circular when selected
- **Selected Day**: Primary color background with white text
- **Today**: Primary color border with primary color text

#### ActivityTimeline
- **Height**: 80px (reduced from 100px)
- **Width**: Full width of container
- **Hour Markers**: 0-24 hours, positioned at bottom
- **Grid Lines**: Vertical lines at 2-hour intervals
- **Activity Blocks**:
  - Height: 24px (reduced from 30px)
  - Min Width: 40px
  - Color: Based on activity type
  - Text: 10px, white, bold
- **Pre/Post Blocks**:
  - Height: 12px (reduced from 15px)
  - Color: Activity type color with 50% opacity
  - Position: Before and after main activity block

#### ActivityTypeSelector
- **Button Size**: 48% width, flexible height
- **Border**: 2px, activity type color
- **Selected State**: Filled background with white text
- **Unselected State**: White background with black text

#### TimeInput
- **Input Height**: 40px
- **Border**: 1px light gray
- **Icon Button**: Clock icon on right side
- **Time Picker Modal**: Custom scrollable hour/minute picker

#### PrePostValueInput
- **Input Height**: 40px
- **Border**: 1px light gray
- **Value Selector Modal**: Grid of values from 0.0 to 2.0 in 0.1 increments
- **Value Buttons**: 50px × 50px, 14px font size
- **Selected Value**: Primary color background with white text

#### WeeklyChart
- **Height**: 220px (chart area: 200px)
- **Bar Width**: 20px
- **Bar Colors**: Based on activity type
- **Day Labels**: 12px, gray (bold for current day)
- **Average Line**: Dashed line at average hours height
- **Y-Axis Labels**: Hour values at 25% intervals

#### StatisticsCard
- **Layout**: Two columns (Activity Count and Hours)
- **Row Height**: Variable based on content
- **Divider**: 1px light gray vertical line between columns
- **Total Row**: Bold with primary color value

### Screen Specifications

#### Activities Screen (Main)
- **Date Selector**: At top
- **Timeline**: Below date selector, 80px height
- **Warning Button**: Below timeline, red when warnings exist, green when compliant
- **Activities Table**:
  - Header: Light gray background
  - Rows: White background with light gray border
  - Highlighted Row: Light blue background for selected date
  - Columns: Date, Start, End, Dur., Type, Pre/Post, Actions
  - Actions: Delete button

#### Weekly Statistics Screen
- **Date Selector**: At top
- **Weekly Chart**: Bar chart showing hours by day
- **Statistics Card**: Numerical breakdown of activities and hours

#### Data Management Screen
- **Export Card**: Description and export button
- **Export Button**: Primary color with white text

#### Settings Screen
- **Warning Thresholds**: Input fields for each threshold
- **Save/Reset Buttons**: At bottom of thresholds section
- **About Section**: App information and version

#### Add/Edit Activity Screen
- **Date Selector**: At top
- **Type Selector**: Below date
- **Time Inputs**: Start and end time side by side
- **Pre/Post Input**: Below time inputs
- **Notes**: Optional text input
- **Button Bar**: At bottom, fixed position
  - Add: Cancel and Save buttons
  - Edit: Delete, Cancel, and Save buttons

### Logic and Calculations

#### Time Calculations
- **Duration**: End time - start time (handles overnight activities)
- **Flight Hours**: Sum of flight activity durations + pre/post time
- **Contact Time**: Sum of all activity durations + pre/post time for Flight and SIM
- **Duty Day**: First activity start (minus half pre/post) to last activity end (plus half pre/post)
- **Rest Between**: Time between last activity end (plus half pre/post) and first activity start (minus half pre/post) of next day
- **Consecutive Days**: Count of consecutive days with activities
- **Weekly Hours**: Sum of all activity durations in calendar week (Sunday-Saturday)
- **Past 7 Days Hours**: Sum of all activity durations in rolling 7-day period

#### Warning Thresholds
- **Max Flight Hours**: 8 hours (default)
- **Min Rest Between Days**: 10 hours (default)
- **Max Contact Time**: 10 hours (default)
- **Max Duty Day**: 16 hours (default)
- **Max Consecutive Days**: 15 days (default)
- **Max Weekly Hours**: 40 hours (default)
- **Max Past Seven Days Hours**: 50 hours (default)

### State Management
- **Zustand Store**: Central state management with persistence
- **AsyncStorage**: Local storage for persisting data
- **Store Structure**:
  ```typescript
  {
    activities: Activity[],
    selectedDate: string,
    warningThresholds: WarningThresholds,
    warningStatus: WarningStatus,
    
    // Actions
    addActivity: (activity: Omit<Activity, 'id'>) => Promise<{ success: boolean; message?: string }>,
    updateActivity: (activity: Activity) => Promise<{ success: boolean; message?: string }>,
    deleteActivity: (id: string) => void,
    setSelectedDate: (date: string) => void,
    updateWarningThresholds: (thresholds: Partial<WarningThresholds>) => void,
    resetWarningThresholds: () => void,
    updateWarningStatus: (status: Partial<WarningStatus>) => void,
    clearAllActivities: () => void,
    importActivities: (activities: Activity[]) => void,
  }
  ```

### Data Types
```typescript
export type ActivityType = 'Flight' | 'Ground' | 'SIM' | 'Other';

export interface Activity {
  id: string;
  type: ActivityType;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  prePostValue: number; // 0-2 hours in 0.1 increments
  notes?: string;
}

export interface WarningThresholds {
  maxFlightHours: number;
  minRestBetweenDays: number;
  maxContactTime: number;
  maxDutyDay: number;
  maxConsecutiveDays: number;
  maxWeeklyHours: number;
  maxPastSevenDaysHours: number;
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
```

### Navigation Flow
1. **Main Tab**: Activities list and timeline
   - Add Activity → New Activity Screen
   - Edit Activity → Edit Activity Screen
   - Warning Button → Warnings Screen
2. **Weekly Statistics Tab**: Charts and statistics
3. **Data Management Tab**: Export functionality
4. **Settings Tab**: Warning thresholds and app info

### Interaction Details
- **Timeline**: Tap on activity block to edit
- **Activities Table**: Tap on row to edit activity
- **Date Selection**: 
  - Left/right arrows to change date
  - Tap date to open calendar modal
- **Pre/Post Value**: Tap to open grid selector
- **Time Input**: 
  - Direct text input in HH:MM format
  - Tap clock icon to open time picker

### CSV Import/Export Format
```
id,type,date,startTime,endTime,prePostValue,notes
1234567890,Flight,2023-05-01,08:00,10:30,0.5,"This is a note with commas, and quotes"
```

### Error Handling
- **Time Overlap**: Prevents activities from overlapping (including pre/post time)
- **Invalid Input**: Validates all inputs before saving
- **Empty State**: Shows appropriate messages when no activities exist

### Weekly Statistics Calculations
- **Activity Hours**: Shows only the activity duration without pre/post time
- **Pre/Post Hours**: Shown separately in the statistics
- **Total Hours**: Sum of Flight + Ground + SIM + Pre/Post (excludes Other)
- **Average Hours**: Total Hours / Days with activities
- **Days Worked**: Count of days with Flight, Ground, or SIM activities

### Timeline Specifications
- **Timeline Height**: 80px (reduced from original 100px)
- **Activity Block Height**: 24px (reduced from 30px)
- **Pre/Post Block Height**: 12px (reduced from 15px)
- **Pre/Post Display**: Half of pre/post time shown before activity start, half after activity end
- **Activity Block Click**: Opens edit screen for that activity

This detailed specification should provide all the information needed to reconstruct the SafeHours app with another AI or developer. It includes file structure, component specifications, logic details, state management, and interaction patterns.