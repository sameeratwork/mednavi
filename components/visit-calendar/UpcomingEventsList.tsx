'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  Building2, 
  Stethoscope, 
  User, 
  Bell, 
  ShieldCheck, 
  Plus,
  FileText
} from 'lucide-react';
import { VisitEvent, VISIT_EVENT_TYPES, REMINDER_OPTIONS } from '@/lib/calendar/types';

interface UpcomingEventsListProps {
  events: VisitEvent[];
  selectedDateFilter: string | null;
  onClearDateFilter: () => void;
  onEditEvent: (event: VisitEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onToggleDone: (eventId: string) => void;
  onClearAll: () => void;
  onAddNewEvent: () => void;
}

export default function UpcomingEventsList({
  events,
  selectedDateFilter,
  onClearDateFilter,
  onEditEvent,
  onDeleteEvent,
  onToggleDone,
  onClearAll,
  onAddNewEvent,
}: UpcomingEventsListProps) {
  const [filterTab, setFilterTab] = useState<'upcoming' | 'all' | 'done'>('upcoming');

  const getTodayTokyo = () => {
    try {
      return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' });
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const todayStr = getTodayTokyo();

  // Filter events based on tab and selected date
  const filteredEvents = events.filter((evt) => {
    if (selectedDateFilter && evt.date !== selectedDateFilter) return false;
    if (filterTab === 'upcoming') return !evt.isDone && evt.date >= todayStr;
    if (filterTab === 'done') return evt.isDone;
    return true; // 'all'
  });

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-navy-200 shadow-card space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-navy-100">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-heading font-black text-lg text-navy-950">
              Scheduled Visits (予約一覧)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-700 font-bold text-xs">
              {events.length}
            </span>
          </div>
          <p className="text-xs text-navy-500 mt-0.5">
            Manage your consultations, follow-ups, and test results.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {events.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="px-2.5 py-1.5 rounded-xl text-navy-500 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
              title="Clear all visits from this browser"
            >
              Clear All
            </button>
          )}

          <button
            type="button"
            onClick={onAddNewEvent}
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Visit</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div className="inline-flex rounded-xl bg-navy-100/70 p-1 space-x-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              filterTab === 'upcoming'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            Upcoming ({events.filter((e) => !e.isDone && e.date >= todayStr).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              filterTab === 'all'
                ? 'bg-white text-navy-950 shadow-sm'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            All ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('done')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              filterTab === 'done'
                ? 'bg-white text-navy-950 shadow-sm'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            Done ({events.filter((e) => e.isDone).length})
          </button>
        </div>

        {selectedDateFilter && (
          <div className="inline-flex items-center space-x-2 text-xs bg-brand-50 text-brand-800 border border-brand-200 px-3 py-1.5 rounded-xl font-medium">
            <span>Filtered by: {selectedDateFilter}</span>
            <button
              type="button"
              onClick={onClearDateFilter}
              className="text-brand-900 font-bold hover:underline"
            >
              &times; Clear filter
            </button>
          </div>
        )}
      </div>

      {/* Visits List */}
      <div className="space-y-3 pt-2">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-navy-50/60 border border-dashed border-navy-200 space-y-2">
            <Calendar className="w-8 h-8 text-navy-300 mx-auto" />
            <h4 className="font-heading font-bold text-sm text-navy-900">
              No visits found
            </h4>
            <p className="text-xs text-navy-500 max-w-sm mx-auto">
              {selectedDateFilter
                ? `No visits scheduled for ${selectedDateFilter}. Click "Add Visit" to schedule one on this day.`
                : 'You have no visits scheduled. Click "Add Visit" to log your doctor appointments.'}
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const typeConfig = VISIT_EVENT_TYPES[event.type] || VISIT_EVENT_TYPES.other;
            const reminderConfig = REMINDER_OPTIONS[event.reminder] || REMINDER_OPTIONS.none;

            return (
              <div
                key={event.id}
                className={`p-4 rounded-2xl border transition-all ${
                  event.isDone
                    ? 'bg-navy-50/40 border-navy-200 opacity-70'
                    : 'bg-white hover:border-brand-300 border-navy-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkmark & Main Details */}
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleDone(event.id)}
                      className="mt-0.5 text-brand-600 hover:text-brand-700 shrink-0"
                      title={event.isDone ? 'Mark as active' : 'Mark as completed'}
                    >
                      {event.isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-navy-300 hover:text-brand-500" />
                      )}
                    </button>

                    <div className="space-y-1.5 min-w-0 flex-1 text-xs">
                      {/* Badge & Title */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeConfig.badgeBg} ${typeConfig.badgeText}`}
                        >
                          {typeConfig.labelEn}
                        </span>
                        <h4
                          className={`font-heading font-bold text-sm truncate ${
                            event.isDone ? 'line-through text-navy-400' : 'text-navy-950'
                          }`}
                        >
                          {event.title}
                        </h4>
                      </div>

                      {/* Clinic & Department */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-navy-600">
                        <div className="flex items-center space-x-1">
                          <Building2 className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                          <span className="font-semibold text-navy-800 truncate">{event.clinic}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Stethoscope className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                          <span>{event.department}</span>
                        </div>
                        {event.doctorName && (
                          <div className="flex items-center space-x-1">
                            <User className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                            <span>{event.doctorName}</span>
                          </div>
                        )}
                      </div>

                      {/* Date, Time & Reminder */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-navy-700 pt-0.5">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          <span className="font-bold text-navy-900">{event.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          <span className="font-bold text-navy-900">{event.time}</span>
                        </div>
                        {event.reminder !== 'none' && (
                          <div className="flex items-center space-x-1 text-navy-500">
                            <Bell className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{reminderConfig.labelEn}</span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {event.notes && (
                        <p className="text-[11px] text-navy-600 bg-navy-50/70 p-2 rounded-xl mt-1 leading-relaxed border border-navy-100">
                          {event.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Edit & Delete */}
                  <div className="flex items-center space-x-1 shrink-0 pt-0.5">
                    <button
                      type="button"
                      onClick={() => onEditEvent(event)}
                      className="p-1.5 rounded-lg text-navy-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="Edit visit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEvent(event.id)}
                      className="p-1.5 rounded-lg text-navy-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete visit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Storage & Privacy Note */}
      <div className="pt-3 border-t border-navy-100 flex items-center justify-between text-xs text-navy-500">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Saved on this device only (この端末にのみ保存されます).</span>
        </div>
      </div>
    </div>
  );
}
