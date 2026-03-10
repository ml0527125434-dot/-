import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingsApi, paymentsApi } from '../lib/api';
import type { Booking } from '../types';
import { ArrowRight, CreditCard, Banknote } from 'lucide-react';

export default function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'cash'>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!bookingId) return;
    const load = async () => {
      try {
        const res = await bookingsApi.get(bookingId);
        setBooking(res.data);
      } catch {
        navigate('/home');
      }
      setLoading(false);
    };
    load();
  }, [bookingId, navigate]);

  const handlePayment = async () => {
    if (!bookingId) return;
    setSubmitting(true);
    try {
      if (paymentMethod === 'cash') {
        // Cash payment - just confirm booking
        navigate(`/booking-confirmed/${bookingId}`);
        return;
      }

      await paymentsApi.create({
        bookingId,
        amount: 50,
        paymentMethod: 'credit_card',
        gateway: 'icount',
        saveCard,
      });
      navigate(`/booking-confirmed/${bookingId}`);
    } catch {
      alert('שגיאה בתשלום');
    }
    setSubmitting(false);
  };

  if (loading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">טוען...</div>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem('zentro_user') || '{}');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowRight size={22} className="text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-blue-900">תשלום</h1>
      </header>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
        {/* Booking summary */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="font-bold text-gray-900 mb-4">סיכום הזמנה</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">תאריך</span>
              <span className="font-medium">
                {new Date(booking.bookingDate).toLocaleDateString('he-IL')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">שעה</span>
              <span className="font-medium">{booking.timeSlotStart}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between text-lg">
              <span className="font-bold">מחיר</span>
              <span className="font-bold text-blue-600">&#8362;50</span>
            </div>
          </div>
        </div>

        {/* Payment method selection */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="font-bold text-gray-900 mb-4">אמצעי תשלום</h2>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('credit_card')}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition ${
                paymentMethod === 'credit_card'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard
                size={24}
                className={paymentMethod === 'credit_card' ? 'text-blue-600' : 'text-gray-400'}
              />
              <span className="font-medium">כרטיס אשראי</span>
            </button>

            {user.savedCardLast4 && (
              <button
                onClick={() => setPaymentMethod('credit_card')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition"
              >
                <CreditCard size={24} className="text-gray-400" />
                <span className="font-medium">כרטיס שמור *{user.savedCardLast4}</span>
              </button>
            )}

            <button
              onClick={() => setPaymentMethod('cash')}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition ${
                paymentMethod === 'cash'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Banknote
                size={24}
                className={paymentMethod === 'cash' ? 'text-blue-600' : 'text-gray-400'}
              />
              <span className="font-medium">תשלום בהגעה</span>
            </button>
          </div>
        </div>

        {/* Card details */}
        {paymentMethod === 'credit_card' && (
          <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מספר כרטיס
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                dir="ltr"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תוקף
                </label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="000"
                  maxLength={4}
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  dir="ltr"
                />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">שמרי כרטיס לפעם הבאה</span>
            </label>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handlePayment}
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-lg"
        >
          {submitting
            ? '...'
            : paymentMethod === 'cash'
              ? 'אישור הזמנה (תשלום בהגעה)'
              : 'אישור ותשלום &#8362;50'}
        </button>
      </div>
    </div>
  );
}
