import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsApi } from '../lib/api';
import type { Booking } from '../types';
import { ArrowRight, Calendar, Clock, ChevronLeft } from 'lucide-react';

const LOCATION_ID = localStorage.getItem('zentro_location') || '';

const STATUS_LABELS: Record<string, string> = {
  draft: 'טיוטה',
  pending_payment: 'ממתין לתשלום',
  confirmed: 'מאושר',
  arrived: 'הגעת',
  assigned: 'בחדר',
  ready_for_immersion: 'מוכנה לטבילה',
  in_progress: 'בטבילה',
  completed: 'הושלם',
  cancelled: 'בוטל',
  no_show: 'לא הגיעה',
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-gray-100 text-gray-500',
  arrived: 'bg-purple-100 text-purple-700',
  assigned: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await bookingsApi.list({ locationId: LOCATION_ID });
        setBookings(res.data);
      } catch {
        // ignore
      }
      setLoading(false);
    };
    load();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter(
    (b) =>
      b.bookingDate >= today &&
      !['completed', 'cancelled', 'no_show'].includes(b.status),
  );
  const past = bookings.filter(
    (b) =>
      b.bookingDate < today ||
      ['completed', 'cancelled', 'no_show'].includes(b.status),
  );

  const displayBookings = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/home')} className="p-1">
          <ArrowRight size={22} className="text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-blue-900">ההזמנות שלי</h1>
      </header>

      {/* Tabs */}
      <div className="max-w-lg mx-auto px-6 pt-4">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('upcoming')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'upcoming' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500'
            }`}
          >
            קרובות ({upcoming.length})
          </button>
          <button
            onClick={() => setTab('past')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'past' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500'
            }`}
          >
            היסטוריה ({past.length})
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-4 space-y-3">
        {loading ? (
          <div className="text-center text-gray-400 py-8">טוען...</div>
        ) : displayBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">
              {tab === 'upcoming' ? 'אין הזמנות קרובות' : 'אין היסטוריה'}
            </p>
            {tab === 'upcoming' && (
              <button
                onClick={() => navigate('/book')}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition"
              >
                הזמני עכשיו
              </button>
            )}
          </div>
        ) : (
          displayBookings.map((booking) => (
            <button
              key={booking.id}
              onClick={() => navigate(`/my-bookings/${booking.id}`)}
              className="w-full bg-white rounded-xl p-4 shadow-sm border text-right hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">
                    {new Date(booking.bookingDate).toLocaleDateString('he-IL', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>{booking.timeSlotStart}</span>
                  </div>
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded-full ${
                      STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {STATUS_LABELS[booking.status] || booking.status}
                  </span>
                </div>
                <ChevronLeft size={20} className="text-gray-400" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
