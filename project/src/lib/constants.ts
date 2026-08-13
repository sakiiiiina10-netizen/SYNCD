export const CLASSES = [
  'Pre-Nursery', 'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12',
] as const;

export const SECTIONS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z',
] as const;

export const STREAMS = ['Science', 'Commerce/Humanities'] as const;

export const SCIENCE_GROUPS = ['PCB', 'PCM'] as const;

export const FEE_CATEGORIES = ['CIVILIAN', 'PAC/ POLICE', '4TH CLASS'] as const;

export const UNITS = [
  { number: 1, label: 'Unit 1', months: 'April to June', defaultDue: `${new Date().getFullYear()}-05-10` },
  { number: 2, label: 'Unit 2', months: 'July to September', defaultDue: `${new Date().getFullYear()}-08-10` },
  { number: 3, label: 'Unit 3', months: 'October to December', defaultDue: `${new Date().getFullYear()}-11-10` },
  { number: 4, label: 'Unit 4', months: 'January to March', defaultDue: `${new Date().getFullYear()}-02-10` },
] as const;

export const SCHOOL_NAME = 'POLICE MODERN SCHOOL';

export const ATTENDANCE_STATUS = {
  present: { label: 'Present', color: 'green' },
  absent: { label: 'Absent', color: 'red' },
  leave: { label: 'Leave', color: 'orange' },
} as const;

export function requiresStream(cls: string): boolean {
  return cls === 'Class 11' || cls === 'Class 12';
}

export function requiresSubjectGroup(cls: string, stream: string): boolean {
  return (cls === 'Class 11' || cls === 'Class 12') && stream === 'Science';
}
