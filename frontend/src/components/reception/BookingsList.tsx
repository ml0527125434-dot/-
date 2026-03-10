import type { Booking } from '../../types';

interface Props {
  bookings: Booking[];
  onArrived: (id: string) => void;
}

export default function BookingsList({ bookings, onArrived }: Props) {
  const statusLabel: Record<string, string> = {
    confirmed: 'מאושר',
    arrived: 'הגיעה',
    assigned: 'בחדר',
    ready_for_immersion: 'מוכנה',
    in_progress: 'בטבילה',
    pending_payment: 'ממתין לתשלום',
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-3">הזמנות להגעה</h2>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-right p-3">שם</th>
              <th className="text-right p-3">טלפון</th>
              <th className="text-right p-3">שעה</th>
              <th className="text-right p-3">תשלום</th>
              <th className="text-right p-3">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  {booking.user?.firstName || ''}{' '}
                  {booking.user?.lastName?.[0] || ''}.
                </td>
                <td className="p-3 font-mono text-xs" dir="ltr">
                  *{booking.user?.phone?.slice(-4) || ''}
                </td>
                <td className="p-3">{booking.timeSlotStart}</td>
                <td className="p-3">
                  {booking.paymentStatus === 'paid' ? (
                    <span className="text-green-600">✓ שולם</span>
                  ) : (
                    <span className="text-red-600">✗ לא</span>
                  )}
                </td>
                <td className="p-3">
                  {booking.status === 'confirmed' ||
                  booking.status === 'pending_payment' ? (
                    <button
                      onClick={() => onArrived(booking.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700 transition"
                    >
                      הגיעה
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">
                      {statusLabel[booking.status] || booking.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  אין הזמנות ממתינות
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
