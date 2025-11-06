'use client';

import { useState, useEffect } from 'react';
import { TimeSlot } from '@/types';

interface SchedulingWidgetProps {
  emergencyLevel: number;
  onSchedule: (date: string, time: string) => void;
}

export default function SchedulingWidget({ emergencyLevel, onSchedule }: SchedulingWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    generateTimeSlots();
  }, []);

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dates = emergencyLevel >= 4 ? [today] : [today, tomorrow];

    dates.forEach((date) => {
      const dateStr = date.toISOString().split('T')[0];
      const hours = emergencyLevel >= 4 ? [9, 11, 13, 15] : [9, 11, 13, 15, 17];

      hours.forEach((hour) => {
        slots.push({
          date: dateStr,
          time: `${hour}:00`,
          available: true,
        });
      });
    });

    setTimeSlots(slots);
    if (slots.length > 0) {
      setSelectedDate(slots[0].date);
    }
  };

  const availableTimes = timeSlots
    .filter((slot) => slot.date === selectedDate && slot.available)
    .map((slot) => slot.time);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onSchedule(selectedDate, selectedTime);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Schedule Your Appointment
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Array.from(new Set(timeSlots.map((s) => s.date))).map((date) => (
              <button
                key={date}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedTime('');
                }}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  selectedDate === date
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-300 hover:border-primary/50'
                }`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Time
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    selectedTime === time
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-300 hover:border-primary/50'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDate && selectedTime && (
          <button
            onClick={handleConfirm}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Confirm Appointment
          </button>
        )}
      </div>
    </div>
  );
}

