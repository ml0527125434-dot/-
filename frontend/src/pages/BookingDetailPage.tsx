import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingsApi } from '../lib/api';
import type { Booking } from '../types';
import { ArrowRight, Calendar, Clock, MapPin, AlertTriangle } from 'lucide-react';

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

export default function BookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!bookingId) return;
    bookingsApi
      .get(bookingId)
      .then((res) => setBooking(res.data))
      .catch(() => navigate('/my-bookings'))
      .finally(() => setLoading(false));
  }, [bookingId, navigate]);

  const handleCancel = async () => {
    if (!bookingId) return;
    setCancelling(true);
    try {
      await bookingsApi.cancel(bookingId, cancelReason);
      navigate('/my-bookings');
    } catch {
      alert('שגיאה בביטול ההזמנה');
    }
    setCancelling(false);
  };

  if (loading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">טוען...</div>
      </div>
    );
  }

  const canCancel = ['draft', 'pending_payment', 'confirmed'].includes(booking.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/my-bookings')} className="p-1">
          <ArrowRight size={22} className="text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-blue-900">פרטי הזמנה</h1>
      </header>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
        {/* Status banner */}
        <div
          className={`rounded-2xl p-5 text-center ${
            booking.status === 'confirmed'
              ? 'bg-blue-100 text-blue-800'
              : booking.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : booking.status === 'cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-700'
          }`}
        >
          <div className="text-lg font-bold">
            {STATUS_LABELS[booking.status] || booking.status}
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-4">
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
          {booking.room && (
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-blue-500" />
              <span className="text-gray-700">חדר {booking.room.roomNumber}</span>
            </div>
          )}
        </div>

        {/* Payment info */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">תשלום</span>
            <span
              className={`font-medium ${
                booking.paymentStatus === 'paid'
                  ? 'text-green-600'
                  : 'text-orange-600'
              }`}
            >
              {booking.paymentStatus === 'paid' ? 'שולם' : 'לא שולם'}
            </span>
          </div>
        </div>

        {/* Notes */}
        {booking.notesForAttendant && (
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <div className="text-sm text-gray-500 mb-1">הערות לבלנית</div>
            <div className="text-gray-700">{booking.notesForAttendant}</div>
          </div>
        )}

        {/* Cancel */}
        {canCancel && !showCancelConfirm && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="w-full border-2 border-red-300 text-red-600 py-3 rounded-xl font-medium hover:bg-red-50 transition"
          >
            ביטול הזמנה
          </button>
        )}

        {showCancelConfirm && (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-5 space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle size={20} />
              <span className="font-bold">ביטול הזמנה</span>
            </div>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="סיבת ביטול (אופציונלי)"
              className="w-full border rounded-xl px-4 py-3 resize-none h-20"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition"
              >
                {cancelling ? '...' : 'אישור ביטול'}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 border text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                חזרה
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
