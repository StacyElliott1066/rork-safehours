export type TestType =
  | 'Private Pilot'
  | 'Instrument Rating'
  | 'Commercial Pilot'
  | 'Multi Engine Practical'
  | 'CFI'
  | 'CFII'
  | 'MEI Practical';

export type TestCategory = 'Written' | 'Practical';
export type TestResult = 'Pass' | 'Fail';

export interface FlightEndorsement {
  id: string;
  name?: string;
  date: string;
  text: string;
  imageUri?: string;
  createdAt: number;
}

export interface WrittenPracticalTest {
  id: string;
  studentName: string;
  date: string;
  testType: TestType;
  category: TestCategory;
  result: TestResult;
  createdAt: number;
}

export type SortField = 'date' | 'studentName' | 'testType' | 'result';
export type SortDirection = 'asc' | 'desc';
