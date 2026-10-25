import { VisitEvent } from './types';

const STORAGE_KEY = 'mednavi_visit_calendar_events_v1';

export function loadEventsFromStorage(): VisitEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => {
        const dateA = `${a.date}T${a.time || '00:00'}`;
        const dateB = `${b.date}T${b.time || '00:00'}`;
        return dateA.localeCompare(dateB);
      });
    }
    return [];
  } catch (err) {
    console.error('Failed to load visit events from localStorage:', err);
    return [];
  }
}

export function saveEventsToStorage(events: VisitEvent[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    return true;
  } catch (err) {
    console.error('Failed to save visit events to localStorage:', err);
    return false;
  }
}

export function addEventToStorage(event: VisitEvent): VisitEvent[] {
  const current = loadEventsFromStorage();
  const updated = [...current, event];
  saveEventsToStorage(updated);
  return updated.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
}

export function updateEventInStorage(updatedEvent: VisitEvent): VisitEvent[] {
  const current = loadEventsFromStorage();
  const updated = current.map((e) => (e.id === updatedEvent.id ? updatedEvent : e));
  saveEventsToStorage(updated);
  return updated.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
}

export function deleteEventFromStorage(eventId: string): VisitEvent[] {
  const current = loadEventsFromStorage();
  const updated = current.filter((e) => e.id !== eventId);
  saveEventsToStorage(updated);
  return updated;
}

export function toggleEventDoneInStorage(eventId: string): VisitEvent[] {
  const current = loadEventsFromStorage();
  const updated = current.map((e) =>
    e.id === eventId
      ? { ...e, isDone: !e.isDone, updatedAt: new Date().toISOString() }
      : e
  );
  saveEventsToStorage(updated);
  return updated;
}

export function clearAllEventsFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('Failed to clear visit events from localStorage:', err);
    return false;
  }
}
