'use client';

import React, { useState, useEffect } from 'react';
import { CalendarCheck, Plus, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { VisitEvent, VisitEventFormData } from '@/lib/calendar/types';
import { 
  loadEventsFromStorage, 
  addEventToStorage, 
  updateEventInStorage, 
  deleteEventFromStorage, 
  toggleEventDoneInStorage, 
  clearAllEventsFromStorage 
} from '@/lib/calendar/storage';
import MonthGrid from './MonthGrid';
import UpcomingEventsList from './UpcomingEventsList';
import EventFormModal from './EventFormModal';

interface VisitCalendarSectionProps {
  selectedClinic?: any;
}

export default function VisitCalendarSection({ selectedClinic }: VisitCalendarSectionProps) {
  const [events, setEvents] = useState<VisitEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<VisitEvent | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string>('');

  // Initial load from localStorage
  useEffect(() => {
    const loaded = loadEventsFromStorage();
    setEvents(loaded);
  }, []);

  // Handlers
  const handleOpenAddModal = (date?: string) => {
    setEditingEvent(null);
    setModalDefaultDate(date || selectedDate || '');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: VisitEvent) => {
    setEditingEvent(event);
    setModalDefaultDate(event.date);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setModalDefaultDate('');
  };

  const handleSaveEvent = (formData: VisitEventFormData, eventId?: string) => {
    const nowIso = new Date().toISOString();

    if (eventId && editingEvent) {
      const updated: VisitEvent = {
        ...editingEvent,
        ...formData,
        updatedAt: nowIso,
      };
      const newEvents = updateEventInStorage(updated);
      setEvents(newEvents);
    } else {
      const newEvent: VisitEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...formData,
        isDone: false,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      const newEvents = addEventToStorage(newEvent);
      setEvents(newEvents);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this visit?')) {
      return;
    }
    const updated = deleteEventFromStorage(eventId);
    setEvents(updated);
  };

  const handleToggleDone = (eventId: string) => {
    const updated = toggleEventDoneInStorage(eventId);
    setEvents(updated);
  };

  const handleClearAll = () => {
    if (typeof window !== 'undefined' && !window.confirm('Clear all scheduled visits from this browser? This cannot be undone.')) {
      return;
    }
    clearAllEventsFromStorage();
    setEvents([]);
    setSelectedDate(null);
  };

  // Default clinic info from visit planner selection
  const defaultClinicName = selectedClinic?.name_en || selectedClinic?.name_ja || '';
  const defaultDepartment = Array.isArray(selectedClinic?.departments) && selectedClinic.departments.length > 0
    ? selectedClinic.departments[0]
    : (Array.isArray(selectedClinic?.specialties) && selectedClinic.specialties.length > 0
      ? selectedClinic.specialties[0]
      : 'Internal Medicine (内科)');

  return (
    <div className="pt-6 space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-2">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Care Schedule (受診カレンダー)</span>
          </div>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-navy-950">
            Medical Visit Calendar
          </h2>
          <p className="text-xs sm:text-sm text-navy-600 mt-1">
            Keep track of your appointments, follow-ups, prescriptions, and test results in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAddModal()}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-md flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Visit</span>
        </button>
      </div>

      {/* Main Grid: Month Calendar on Left, Upcoming List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6">
          <MonthGrid
            events={events}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onAddEventOnDate={(date) => handleOpenAddModal(date)}
          />
        </div>

        <div className="lg:col-span-6">
          <UpcomingEventsList
            events={events}
            selectedDateFilter={selectedDate}
            onClearDateFilter={() => setSelectedDate(null)}
            onEditEvent={handleOpenEditModal}
            onDeleteEvent={handleDeleteEvent}
            onToggleDone={handleToggleDone}
            onClearAll={handleClearAll}
            onAddNewEvent={() => handleOpenAddModal()}
          />
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      <EventFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        initialEvent={editingEvent}
        defaultClinicName={defaultClinicName}
        defaultDepartment={defaultDepartment}
        defaultDate={modalDefaultDate}
      />
    </div>
  );
}
