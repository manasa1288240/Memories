import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CalendarEvent } from "../types";
import { Calendar, Plus, Trash2, Heart, Smile } from "lucide-react";

interface MemoryCalendarProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, "id">) => void;
  onDeleteEvent?: (id: string) => void;
  readOnly?: boolean;
}

const EMOJIS = ["🧁", "☕", "🐈", "🍿", "🎸", "🗺️", "🎁", "🎡", "🚗", "🏖️", "💐", "🎈", "🎂", "💍", "🏡"];

export default function MemoryCalendar({
  events,
  onAddEvent,
  onDeleteEvent,
  readOnly = false,
}: MemoryCalendarProps) {
  // Setup standard dates. Let us display May 2026 since the current local time indicates May 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4); // 0-indexed, so May is 4
  const [selectedDateStr, setSelectedDateStr] = useState("2026-05-18");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🧁");
  const [showEventForm, setShowEventForm] = useState(false);

  // Month attributes
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper arrays for calendar grids
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday ...
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const startOffset = getFirstDayOfMonth(currentYear, currentMonth);

  // Pad arrays
  const daysArray: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  // Formatting helper
  const formatDateString = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  // Check event exists on date
  const getEventsForDate = (dateStr: string) => {
    return events.filter((e) => e.date === dateStr);
  };

  // Paginate months
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleDayClick = (dayNum: number) => {
    const formatted = formatDateString(currentYear, currentMonth, dayNum);
    setSelectedDateStr(formatted);
    if (!readOnly) {
      setShowEventForm(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please enter a memory title and description!");
      return;
    }

    onAddEvent({
      date: selectedDateStr,
      title: title.trim(),
      description: description.trim(),
      emoji: selectedEmoji,
    });

    setTitle("");
    setDescription("");
    setShowEventForm(false);
  };

  const activeDayEvents = getEventsForDate(selectedDateStr);

  return (
    <div id="memory-calendar" className={readOnly ? "flex flex-col gap-5 w-full" : "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"}>
      {/* Interactive Month Grid */}
      <div className={readOnly ? "bg-white p-5 rounded-3xl border border-pink-100 shadow-sm w-full" : "lg:col-span-6 bg-white p-6 rounded-2xl border border-pink-100 shadow-sm"}>
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-5 h-5 text-pink-500" />
            <h3 className="font-serif text-lg font-bold text-pink-900 leading-none">
              {monthNames[currentMonth]} {currentYear}
            </h3>
          </div>
          <div className="flex gap-1.5">
            <button
              id="calendar-prev-month"
              onClick={prevMonth}
              className="p-1 px-2.5 bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-semibold rounded-lg duration-150 cursor-pointer"
            >
              ◀
            </button>
            <button
              id="calendar-next-month"
              onClick={nextMonth}
              className="p-1 px-2.5 bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-semibold rounded-lg duration-150 cursor-pointer"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-pink-400 font-bold uppercase mb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Day Grid cells */}
        <div className="grid grid-cols-7 gap-1">
          {daysArray.map((dayNum, index) => {
            if (dayNum === null) {
              return <div key={`empty-${index}`} className="aspect-square bg-transparent rounded-lg" />;
            }

            const cellDateStr = formatDateString(currentYear, currentMonth, dayNum);
            const dateEvents = getEventsForDate(cellDateStr);
            const isSelected = selectedDateStr === cellDateStr;
            const hasEvents = dateEvents.length > 0;

            return (
              <button
                id={`calendar-day-btn-${cellDateStr}`}
                key={`day-${dayNum}`}
                type="button"
                onClick={() => handleDayClick(dayNum)}
                className={`aspect-square rounded-xl flex flex-col justify-between p-1.5 text-xs font-medium relative transition-all duration-150 cursor-pointer border ${
                  isSelected
                    ? "bg-pink-500 border-pink-600 text-white shadow-md shadow-pink-100 scale-105 z-10"
                    : hasEvents
                      ? "bg-pink-100/70 border-pink-300 text-pink-900"
                      : "bg-pink-50/15 hover:bg-pink-100/50 border-pink-100/10 text-pink-700"
                }`}
              >
                <span>{dayNum}</span>
                {/* Event Markers inside cell */}
                {hasEvents && (
                  <div className="flex gap-0.5 justify-center mt-auto w-full">
                    {dateEvents.slice(0, 2).map((ev) => (
                      <span key={ev.id} className="text-[12px] filter drop-shadow-sm leading-none animate-pulse">
                        {ev.emoji}
                      </span>
                    ))}
                    {dateEvents.length > 2 && <span className="text-[8px] text-pink-500 font-bold leading-none">+</span>}
                  </div>
                )}
                {/* Cute tiny heart dots */}
                {hasEvents && isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Log Memory & Timeline display */}
      <div className={readOnly ? "flex flex-col gap-5 w-full" : "lg:col-span-6 flex flex-col gap-6"}>
        {/* Day highlight / Form */}
        <div className={readOnly ? "bg-pink-50/30 p-5 rounded-2xl border border-pink-100/50 shadow-2xs space-y-3" : "bg-pink-50 p-6 rounded-2xl border border-pink-100 shadow-sm space-y-4"}>
          <div className="flex items-center justify-between pb-3 border-b border-pink-200/50">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-pink-400">Selected Diary Date</p>
              <h4 className="font-serif font-bold text-pink-900 text-sm">{selectedDateStr}</h4>
            </div>

            {!readOnly && (
              <button
                id="calendar-toggle-log-form-btn"
                onClick={() => setShowEventForm((prev) => !prev)}
                className="text-xs bg-pink-600 hover:bg-pink-700 text-white font-medium px-3  py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {showEventForm ? "Close Drawer" : "Log Memory ✍️"}
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {showEventForm ? (
              <motion.form
                id="event-log-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-[10px] font-mono font-bold text-pink-600 uppercase mb-1">
                    Memory Title
                  </label>
                  <input
                    id="input-event-title"
                    type="text"
                    placeholder="E.g., Sunset cafe chat, Our Road Trip..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full text-xs bg-white border border-pink-200 rounded-lg p-2 text-pink-900 outline-none focus:ring-1 focus:ring-pink-300"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-pink-600 uppercase mb-1">
                    Describe the Memory
                  </label>
                  <textarea
                    id="input-event-description"
                    placeholder="What made this moment magical? Write a warm micro-journal entry..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={2}
                    className="w-full text-xs bg-white border border-pink-200 rounded-lg p-2 text-pink-900 outline-none focus:ring-1 focus:ring-pink-300 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-pink-600 uppercase mb-1.5">
                    Select an Emoji Icon
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJIS.map((emo) => (
                      <button
                        id={`calendar-emoji-selector-${emo}`}
                        key={emo}
                        type="button"
                        onClick={() => setSelectedEmoji(emo)}
                        className={`text-lg p-1.5 rounded-lg border transition-all cursor-pointer ${
                          selectedEmoji === emo ? "bg-pink-200 border-pink-400 scale-110" : "bg-white hover:bg-pink-100 border-pink-150"
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1 border-t border-pink-200/50">
                  <button
                    id="calendar-cancel-log"
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="text-[10px] font-medium text-pink-500 hover:text-pink-700 px-3 py-1.5"
                  >
                    Cancel
                  </button>
                  <button
                    id="calendar-submit-log-btn"
                    type="submit"
                    className="px-4 py-1.5 bg-pink-600 hover:bg-pink-800 text-white font-medium text-[11px] rounded-lg shadow-sm cursor-pointer"
                  >
                    Capture Memory ✨
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="details-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {activeDayEvents.length === 0 ? (
                  <div className="text-center py-6">
                    <span className="text-3xl block filter saturate-50 mb-2">🎈</span>
                    <p className="text-xs text-pink-400 italic">No logged experiences for this date yet. Click "Log Memory" to record one!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeDayEvents.map((ev) => (
                      <div
                        id={`calendar-event-display-${ev.id}`}
                        key={ev.id}
                        className="bg-white p-3.5 rounded-xl border border-pink-100/80 shadow-xs flex gap-3.5 items-start justify-between relative overflow-hidden"
                      >
                        <span className="text-2xl pt-1 select-none">{ev.emoji}</span>
                        <div className="flex-grow">
                          <h5 className="font-serif font-bold text-pink-950 text-xs leading-snug">{ev.title}</h5>
                          <p className="text-[11px] text-pink-700/90 leading-relaxed mt-1 font-mono">{ev.description}</p>
                        </div>
                        {!readOnly && onDeleteEvent && (
                          <button
                            id={`delete-calendar-event-${ev.id}`}
                            onClick={() => onDeleteEvent(ev.id)}
                            className="text-pink-300 hover:text-red-500 duration-150 cursor-pointer self-start ml-2"
                            title="Delete memory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Complete Memories Stream Timeline */}
        {events.length > 0 && (
          <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-xs max-h-[200px] overflow-y-auto">
            <h4 className="text-xs font-mono font-bold text-pink-500 uppercase mb-3 pb-2 border-b border-pink-100">
              📌 Diary Events Timeline ({events.length})
            </h4>

            <div className="relative pl-4 border-l-2 border-pink-100/70 space-y-4 py-2">
              {[...events].sort((a, b) => b.date.localeCompare(a.date)).map((ev) => (
                <div key={ev.id} className="relative text-xs">
                  {/* Bullet */}
                  <span className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-pink-400 ring-4 ring-white animate-pulse" />
                  <span className="font-mono text-[9px] text-pink-400/90 font-bold">{ev.date}</span>
                  <div className="bg-pink-50/20 p-2 rounded-lg border border-pink-100/25 mt-0.5 max-w-sm">
                    <span className="font-semibold text-pink-900">{ev.emoji} {ev.title}</span>
                    <p className="text-[10px] text-pink-600 line-clamp-1 mt-0.5">{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
