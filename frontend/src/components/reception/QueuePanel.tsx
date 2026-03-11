import { useState } from 'react';
import { queueApi } from '../../lib/api';
import { UserPlus } from 'lucide-react';
import type { QueueEntry, Room } from '../../types';

const LOCATION_ID = localStorage.getItem('zentro_location') || '';

interface Props {
  queue: QueueEntry[];
  rooms: Room[];
  onAssign: (bookingId: string, roomId: string) => void;
  onRefresh?: () => void;
}

export default function QueuePanel({ queue, rooms, onAssign, onRefresh }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ phone: '', firstName: '', lastName: '', notes: '' });
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAdd = async () => {
    if (!form.phone) return;
    setAdding(true);
    try {
      await queueApi.manualAdd(LOCATION_ID, form);
      setForm({ phone: '', firstName: '', lastName: '', notes: '' });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setShowAdd(false); }, 2000);
      onRefresh?.();
    } catch { /* ignore */ }
    setAdding(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">תור ממתינות</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
        >
          <UserPlus size={12} />
          הוספה ידנית
        </button>
      </div>

      {/* Manual add form */}
      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
          {success ? (
            <div className="text-green-700 text-sm font-medium text-center">נוספה בהצלחה!</div>
          ) : (
            <div className="space-y-2">
              <input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="טלפון *"
                className="w-full border rounded-lg px-3 py-1.5 text-sm"
                dir="ltr"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  placeholder="שם פרטי"
                  className="border rounded-lg px-3 py-1.5 text-sm"
                />
                <input
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  placeholder="משפחה"
                  className="border rounded-lg px-3 py-1.5 text-sm"
                />
              </div>
              <input
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="הערות"
                className="w-full border rounded-lg px-3 py-1.5 text-sm"
              />
              <button
                onClick={handleAdd}
                disabled={!form.phone || adding}
                className="w-full bg-blue-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {adding ? 'מוסיף...' : 'הוסף לתור'}
              </button>
            </div>
          )}
        </div>
      )}

      {queue.length === 0 ? (
        <div className="bg-white rounded-xl border p-6 text-center text-gray-400">
          אין ממתינות בתור
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((entry, i) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl border p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <span className="font-medium">
                  {entry.booking.user?.firstName || ''}{' '}
                  {entry.booking.user?.lastName?.[0] || ''}.
                </span>
                <span className="text-sm text-gray-500">
                  ({entry.booking.timeSlotStart})
                </span>
              </div>

              {rooms.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => onAssign(entry.booking.id, room.id)}
                      className="bg-green-50 text-green-700 border border-green-300 px-3 py-1 rounded-lg text-xs hover:bg-green-100 transition"
                    >
                      חדר {room.roomNumber} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
