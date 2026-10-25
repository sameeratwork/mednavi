'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Building2, Stethoscope, User, AlertCircle, Bell, FileText } from 'lucide-react';
import { VisitEvent, VisitEventFormData, VisitEventType, ReminderOption, VISIT_EVENT_TYPES, REMINDER_OPTIONS } from '@/lib/calendar/types';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: VisitEventFormData, eventId?: string) => void;
  initialEvent?: VisitEvent | null;
  defaultClinicName?: string;
  defaultDepartment?: string;
  defaultDate?: string;
}

export default function EventFormModal({
  isOpen,
  onClose,
  onSave,
  initialEvent,
  defaultClinicName = '',
  defaultDepartment = '',
  defaultDate = '',
}: EventFormModalProps) {
  const getTodayTokyo = () => {
    try {
      return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' });
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const [formData, setFormData] = useState<VisitEventFormData>({
    type: 'appointment',
    title: '',
    clinic: '',
    department: '',
    doctorName: '',
    date: getTodayTokyo(),
    time: '10:00',
    reminder: '1_day_before',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialEvent) {
      setFormData({
        type: initialEvent.type,
        title: initialEvent.title,
        clinic: initialEvent.clinic,
        department: initialEvent.department,
        doctorName: initialEvent.doctorName || '',
        date: initialEvent.date,
        time: initialEvent.time,
        reminder: initialEvent.reminder,
        notes: initialEvent.notes || '',
      });
      setErrors({});
    } else {
      setFormData({
        type: 'appointment',
        title: defaultDepartment ? `${defaultDepartment} Consultation` : 'Clinic Consultation',
        clinic: defaultClinicName || '',
        department: defaultDepartment || '',
        doctorName: '',
        date: defaultDate || getTodayTokyo(),
        time: '10:00',
        reminder: '1_day_before',
        notes: '',
      });
      setErrors({});
    }
  }, [initialEvent, defaultClinicName, defaultDepartment, defaultDate, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const today = getTodayTokyo();

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.clinic.trim()) {
      newErrors.clinic = 'Clinic name is required';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Medical department is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (!initialEvent && formData.date < today) {
      newErrors.date = 'Visits cannot be scheduled in the past';
    }
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData, initialEvent?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-navy-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-navy-100 bg-navy-50/50">
          <div>
            <h2 id="calendar-modal-title" className="font-heading font-extrabold text-lg text-navy-950">
              {initialEvent ? 'Edit Medical Visit (予約の編集)' : 'Schedule Medical Visit (新規予約)'}
            </h2>
            <p className="text-xs text-navy-600 mt-0.5">
              Track appointment details, doctor notes, and receive arrival alerts.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-navy-500 hover:text-navy-900 hover:bg-navy-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Visit Type */}
          <div>
            <label className="block font-bold text-navy-900 mb-1.5">
              Visit Type (受診目的) <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(VISIT_EVENT_TYPES) as VisitEventType[]).map((typeKey) => {
                const config = VISIT_EVENT_TYPES[typeKey];
                const isSelected = formData.type === typeKey;
                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: typeKey })}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50 text-brand-950 ring-2 ring-brand-500/20'
                        : 'border-navy-200 bg-white hover:bg-navy-50 text-navy-800'
                    }`}
                  >
                    <span className="font-bold text-xs">{config.labelEn}</span>
                    <span className="text-[10px] text-navy-500 font-jp mt-0.5">{config.labelJa}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-navy-900 mb-1">
              Visit Title / Description <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Annual Health Check, Cold & Cough Consultation"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-navy-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 ${
                errors.title ? 'border-red-500 bg-red-50/30' : 'border-navy-200 bg-white'
              }`}
            />
            {errors.title && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Clinic & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-navy-900 mb-1">
                Clinic / Hospital Name <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-navy-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={formData.clinic}
                  onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                  placeholder="e.g. Roppongi Hills Clinic"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs text-navy-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 ${
                    errors.clinic ? 'border-red-500 bg-red-50/30' : 'border-navy-200 bg-white'
                  }`}
                />
              </div>
              {errors.clinic && (
                <p className="text-[11px] text-red-600 mt-1">{errors.clinic}</p>
              )}
            </div>

            <div>
              <label className="block font-bold text-navy-900 mb-1">
                Department (診療科) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 text-navy-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Internal Medicine (内科)"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs text-navy-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 ${
                    errors.department ? 'border-red-500 bg-red-50/30' : 'border-navy-200 bg-white'
                  }`}
                />
              </div>
              {errors.department && (
                <p className="text-[11px] text-red-600 mt-1">{errors.department}</p>
              )}
            </div>
          </div>

          {/* Doctor Name */}
          <div>
            <label className="block font-bold text-navy-900 mb-1">
              Doctor Name (医師名 - optional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-navy-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                placeholder="e.g. Dr. Tanaka (田中医師)"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-navy-900 mb-1">
                Date (受診日) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-navy-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="date"
                  value={formData.date}
                  min={initialEvent ? undefined : getTodayTokyo()}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs text-navy-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 ${
                    errors.date ? 'border-red-500 bg-red-50/30' : 'border-navy-200 bg-white'
                  }`}
                />
              </div>
              {errors.date && (
                <p className="text-[11px] text-red-600 mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block font-bold text-navy-900 mb-1">
                Time (予約時間) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-navy-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs text-navy-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 ${
                    errors.time ? 'border-red-500 bg-red-50/30' : 'border-navy-200 bg-white'
                  }`}
                />
              </div>
              {errors.time && (
                <p className="text-[11px] text-red-600 mt-1">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Reminder Selection */}
          <div>
            <label className="block font-bold text-navy-900 mb-1">
              Reminder Alarm (リマインダー通知)
            </label>
            <div className="relative">
              <Bell className="w-4 h-4 text-navy-400 absolute left-3 top-2.5 pointer-events-none" />
              <select
                value={formData.reminder}
                onChange={(e) => setFormData({ ...formData, reminder: e.target.value as ReminderOption })}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                {(Object.keys(REMINDER_OPTIONS) as ReminderOption[]).map((rKey) => (
                  <option key={rKey} value={rKey}>
                    {REMINDER_OPTIONS[rKey].labelEn} ({REMINDER_OPTIONS[rKey].labelJa})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-navy-900 mb-1">
              Notes & Questions for Doctor (持参物・問診メモ)
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Bring previous blood test results from September, ask about medication side effects..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-navy-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-navy-200 hover:bg-navy-50 text-navy-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-md flex items-center space-x-1.5"
            >
              <span>{initialEvent ? 'Save Changes' : 'Add to Calendar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
