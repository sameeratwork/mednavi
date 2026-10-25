'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { VisitEvent, VISIT_EVENT_TYPES } from '@/lib/calendar/types';

interface MonthGridProps {
  events: VisitEvent[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onAddEventOnDate: (date: string) => void;
}

const WEEKDAYS = [
  { en: 'Sun', ja: '日', isWeekend: true },
  { en: 'Mon', ja: '月', isWeekend: false },
  { en: 'Tue', ja: '火', isWeekend: false },
  { en: 'Wed', ja: '水', isWeekend: false },
  { en: 'Thu', ja: '木', isWeekend: false },
  { en: 'Fri', ja: '金', isWeekend: false },
  { en: 'Sat', ja: '土', isWeekend: true },
];

export default function MonthGrid({
  events,
  selectedDate,
  onSelectDate,
  onAddEventOnDate,
}: MonthGridProps) {
  const getTodayTokyo = () => {
    try {
      return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' });
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const todayStr = getTodayTokyo();
  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() }; // month is 0-indexed
  });

  const { year, month } = currentYearMonth;

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentYearMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentYearMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYearMonth({ year: now.getFullYear(), month: now.getMonth() });
    onSelectDate(todayStr);
  };

  // Calendar math
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Month title
  const monthNameEn = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(year, month, 1));
  const monthTitleJa = `${year}年 ${month + 1}月`;

  // Map events to date strings
  const eventsByDate = React.useMemo(() => {
    const map: Record<string, VisitEvent[]> = {};
    events.forEach((evt) => {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    });
    return map;
  }, [events]);

  // Build grid days
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevM = month === 0 ? 12 : month;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete full grid weeks
  const remainingCells = 42 - calendarCells.length; // 6 rows of 7
  if (remainingCells > 0 && remainingCells < 7) {
    for (let d = 1; d <= remainingCells; d++) {
      const nextM = month === 11 ? 1 : month + 2;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      calendarCells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
      });
    }
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-navy-200 shadow-card space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-navy-100">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-brand-600" />
          <div>
            <h3 className="font-heading font-black text-lg text-navy-950">
              {monthNameEn} {year} <span className="text-xs font-normal text-navy-500 font-jp">({monthTitleJa})</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-2.5 py-1.5 rounded-xl border border-navy-200 hover:bg-navy-50 text-navy-700 text-xs font-bold transition-colors"
          >
            Today (今日)
          </button>
          <div className="flex items-center space-x-1 bg-navy-100/70 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-navy-700 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-navy-700 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w, idx) => (
          <div
            key={idx}
            className={`py-1.5 text-xs font-bold ${
              w.isWeekend ? 'text-red-600' : 'text-navy-700'
            }`}
          >
            <span>{w.en}</span>
            <span className="text-[10px] text-navy-400 font-jp block">{w.ja}</span>
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {calendarCells.map((cell) => {
          const isToday = cell.dateStr === todayStr;
          const isSelected = cell.dateStr === selectedDate;
          const dayEvents = eventsByDate[cell.dateStr] || [];
          const hasEvents = dayEvents.length > 0;

          return (
            <button
              key={cell.dateStr}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : cell.dateStr)}
              className={`relative h-12 sm:h-14 p-1 rounded-2xl flex flex-col items-center justify-between transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-400'
                  : isToday
                  ? 'bg-brand-50/80 text-brand-950 border border-brand-300 font-black'
                  : cell.isCurrentMonth
                  ? 'hover:bg-navy-50 text-navy-900 border border-transparent'
                  : 'text-navy-300 hover:bg-navy-50/40 opacity-40'
              }`}
            >
              <span className={`text-xs font-bold ${isToday && !isSelected ? 'text-brand-700' : ''}`}>
                {cell.dayNum}
              </span>

              {/* Event Indicator Dots */}
              <div className="flex items-center space-x-0.5 h-2">
                {hasEvents &&
                  dayEvents.slice(0, 3).map((evt, eIdx) => {
                    const dotColor = isSelected ? '#ffffff' : (VISIT_EVENT_TYPES[evt.type]?.dotColor || '#0d9488');
                    return (
                      <span
                        key={eIdx}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: dotColor }}
                        title={`${evt.title} (${evt.time})`}
                      />
                    );
                  })}
                {dayEvents.length > 3 && (
                  <span className="text-[8px] leading-none font-bold">+</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Date Summary & Quick Action */}
      {selectedDate && (
        <div className="mt-4 p-4 rounded-2xl bg-navy-50/80 border border-navy-200 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div>
            <span className="text-[10px] font-bold text-navy-500 uppercase tracking-wider block">
              Selected Day (選択日)
            </span>
            <p className="font-heading font-black text-sm text-navy-950">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-navy-600 mt-0.5">
              {eventsByDate[selectedDate]?.length
                ? `${eventsByDate[selectedDate].length} visit(s) scheduled`
                : 'No visits scheduled on this day'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onSelectDate(null)}
              className="px-3 py-1.5 rounded-xl border border-navy-200 hover:bg-white text-navy-700 text-xs font-bold transition-colors"
            >
              Show All
            </button>
            <button
              type="button"
              onClick={() => onAddEventOnDate(selectedDate)}
              className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Visit Here</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
