import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingsApi } from '../lib/api';
import type { Booking } from '../types';
import { CheckCircle, Calendar, Clock, Home } from 'lucide-react';

export default function BookingConfirmedPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!bookingId) return;
    bookingsApi.get(bookingId).then((res) => setBooking(res.data)).catch(() => {});
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle size={64} className="text-green-600" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">ההזמנה אושרה!</h1>
          <p className="text-gray-500">נשלח אלייך SMS עם פרטי ההזמנה</p>
        </div>

        {booking && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 text-right space-y-3">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-blue-500" />
              <span className="text-gray-700">
                {new Date(booking.bookingDate).toLocaleDateString('he-IL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-blue-500" />
              <span className="text-gray-700">
                {booking.timeSlotStart} - {booking.timeSlotEnd}
              </span>
            </div>
            <div className="border-t pt-3 text-sm text-gray-500">
              {booking.paymentStatus === 'paid' ? (
                <span className="text-green-600 font-medium">שולם</span>
              ) : (
                <span className="text-orange-600 font-medium">תשלום בהגעה</span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/my-bookings')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            ההזמנות שלי
          </button>
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-white border text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <Home size={18} />
            חזרה לדף הבית
          </button>
        </div>
      </div>
    </div>
  );
}
