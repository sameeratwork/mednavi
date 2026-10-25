export type VisitEventType =
  | 'appointment'
  | 'follow_up'
  | 'test_results'
  | 'vaccination'
  | 'refill'
  | 'other';

export interface VisitEventTypeConfig {
  labelEn: string;
  labelJa: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}

export const VISIT_EVENT_TYPES: Record<VisitEventType, VisitEventTypeConfig> = {
  appointment: {
    labelEn: 'Appointment',
    labelJa: '初診・再診予約',
    badgeBg: 'bg-brand-50 border-brand-200',
    badgeText: 'text-brand-800',
    dotColor: '#0d9488',
  },
  follow_up: {
    labelEn: 'Follow-up check-up',
    labelJa: '経過観察・再診',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-800',
    dotColor: '#2563eb',
  },
  test_results: {
    labelEn: 'Test or results day',
    labelJa: '検査・検査結果確認',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-800',
    dotColor: '#d97706',
  },
  vaccination: {
    labelEn: 'Vaccination',
    labelJa: '予防接種',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-800',
    dotColor: '#059669',
  },
  refill: {
    labelEn: 'Medicine refill',
    labelJa: '処方箋・薬の受け取り',
    badgeBg: 'bg-purple-50 border-purple-200',
    badgeText: 'text-purple-800',
    dotColor: '#7c3aed',
  },
  other: {
    labelEn: 'Other',
    labelJa: 'その他',
    badgeBg: 'bg-navy-50 border-navy-200',
    badgeText: 'text-navy-800',
    dotColor: '#475569',
  },
};

export type ReminderOption = '1_day_before' | '2_hours_before' | 'none';

export const REMINDER_OPTIONS: Record<ReminderOption, { labelEn: string; labelJa: string }> = {
  '1_day_before': {
    labelEn: '1 day before',
    labelJa: '前日リマインダー',
  },
  '2_hours_before': {
    labelEn: '2 hours before',
    labelJa: '2時間前リマインダー',
  },
  none: {
    labelEn: 'None',
    labelJa: 'なし',
  },
};

export interface VisitEvent {
  id: string;
  type: VisitEventType;
  title: string;
  clinic: string;
  address?: string;
  department: string;
  doctorName?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  reminder: ReminderOption;
  notes?: string;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VisitEventFormData {
  type: VisitEventType;
  title: string;
  clinic: string;
  address?: string;
  department: string;
  doctorName?: string;
  date: string;
  time: string;
  reminder: ReminderOption;
  notes?: string;
}
