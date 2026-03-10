import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsApi } from '../lib/api';
import type { TimeSlot } from '../types';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

const LOCATION_ID = localStorage.getItem('zentro_location') || '';

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [roomPreference, setRoomPreference] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!selectedDate) return;
    const loadSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot('');
      try {
        const res = await bookingsApi.getSlots(LOCATION_ID, selectedDate);
        setSlots(res.data);
      } catch {
        setSlots([]);
      }
      setLoadingSlots(false);
    };
    loadSlots();
  }, [selectedDate]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) return;
    setSubmitting(true);
    try {
      const res = await bookingsApi.create({
        locationId: LOCATION_ID,
        bookingDate: selectedDate,
        timeSlotStart: selectedSlot,
        notesForAttendant: notes || undefined,
        roomTypePreference: roomPreference || undefined,
      });
      navigate(`/payment/${res.data.id}`);
    } catch {
      alert('שגיאה ביצירת ההזמנה');
    }
    setSubmitting(false);
  };

  const formatDateHe = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/home')} className="p-1">
          <ArrowRight size={22} className="text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-blue-900">הזמנה חדשה</h1>
      </header>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
        {/* Date picker */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={20} className="text-blue-600" />
            <h2 className="font-bold text-gray-900">בחרי תאריך</h2>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={today}
            className="w-full border rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dir="ltr"
          />
          {selectedDate && (
            <p className="mt-2 text-sm text-gray-500">{formatDateHe(selectedDate)}</p>
          )}
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={20} className="text-blue-600" />
              <h2 className="font-bold text-gray-900">שעות פנויות</h2>
            </div>
            {loadingSlots ? (
              <div className="text-center text-gray-400 py-4">טוען שעות...</div>
            ) : slots.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                אין שעות פנויות בתאריך זה
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot.start}
                    onClick={() => slot.available && setSelectedSlot(slot.start)}
                    disabled={!slot.available}
                    className={`py-3 rounded-xl text-center font-medium transition ${
                      selectedSlot === slot.start
                        ? 'bg-blue-600 text-white shadow-md'
                        : slot.available
                          ? 'bg-gray-100 text-gray-900 hover:bg-blue-50'
                          : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {slot.start}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Room preference */}
        {selectedSlot && (
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h2 className="font-bold text-gray-900 mb-3">העדפת חדר</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '', label: 'ללא העדפה' },
                { value: 'standard', label: 'רגיל' },
                { value: 'premium', label: 'פרמיום' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRoomPreference(opt.value)}
                  className={`py-2 rounded-xl text-sm font-medium transition ${
                    roomPreference === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {selectedSlot && (
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h2 className="font-bold text-gray-900 mb-3">הערות לבלנית</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות אופציונליות..."
              className="w-full border rounded-xl px-4 py-3 resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Submit */}
        {selectedSlot && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-lg"
          >
            {submitting ? '...' : 'המשך לתשלום'}
          </button>
        )}
      </div>
    </div>
  );
}
