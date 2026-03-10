import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsApi } from '../lib/api';
import type { Booking } from '../types';
import { Calendar, Clock, Plus, ChevronLeft } from 'lucide-react';

const LOCATION_ID = localStorage.getItem('zentro_location') || '';

export default function HomePage() {
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await bookingsApi.list({
          locationId: LOCATION_ID,
          dateFrom: today,
          status: 'confirmed',
        });
        setUpcomingBookings(
          res.data
            .filter((b: Booking) => !['completed', 'cancelled', 'no_show'].includes(b.status))
            .slice(0, 3),
        );
      } catch {
        // ignore
      }
      setLoading(false);
    };
    load();
  }, []);

  const user = JSON.parse(localStorage.getItem('zentro_user') || '{}');

  const statusLabel: Record<string, string> = {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-900">ZENTRO Mikveh</h1>
            <p className="text-sm text-gray-500">
              שלום, {user.firstName || 'אורחת'}
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('zentro_token');
              localStorage.removeItem('zentro_user');
              navigate('/login');
            }}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            יציאה
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-8 space-y-6">
        {/* Quick book button */}
        <button
          onClick={() => navigate('/book')}
          className="w-full bg-blue-600 text-white rounded-2xl p-6 flex items-center justify-between shadow-lg hover:bg-blue-700 transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 rounded-xl p-3">
              <Plus size={28} />
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">הזמנה חדשה</div>
              <div className="text-blue-200 text-sm">בחרי תאריך ושעה</div>
            </div>
          </div>
          <ChevronLeft size={24} className="text-blue-300" />
        </button>

        {/* My bookings */}
        <button
          onClick={() => navigate('/my-bookings')}
          className="w-full bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm border hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 rounded-xl p-3">
              <Calendar size={24} className="text-purple-600" />
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">ההזמנות שלי</div>
              <div className="text-gray-500 text-sm">צפיה ועדכון הזמנות</div>
            </div>
          </div>
          <ChevronLeft size={20} className="text-gray-400" />
        </button>

        {/* Upcoming bookings */}
        {!loading && upcomingBookings.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">הזמנות קרובות</h2>
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <button
                  key={booking.id}
                  onClick={() => navigate(`/my-bookings/${booking.id}`)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm border text-right hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {new Date(booking.bookingDate).toLocaleDateString('he-IL')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Clock size={14} />
                        <span>{booking.timeSlotStart}</span>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {statusLabel[booking.status] || booking.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
