import { useState, useEffect, useCallback } from 'react';
import { attendantApi, queueApi } from '../lib/api';
import { useLocationSocket } from '../hooks/useSocket';
import { UserPlus } from 'lucide-react';
import type { Room } from '../types';

const LOCATION_ID = localStorage.getItem('zentro_location') || '';

export default function AttendantDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddToQueue, setShowAddToQueue] = useState(false);
  const [queueForm, setQueueForm] = useState({ phone: '', firstName: '', lastName: '', notes: '' });
  const [addingToQueue, setAddingToQueue] = useState(false);
  const [queueSuccess, setQueueSuccess] = useState(false);

  const loadData = useCallback(async () => {
    if (!LOCATION_ID) return;
    const res = await attendantApi.dashboard(LOCATION_ID);
    setData(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  useLocationSocket(LOCATION_ID, 'attendant', {
    'room:ready_for_immersion': () => loadData(),
    'room:status_changed': () => loadData(),
  });

  const handleArrive = async (roomId: string) => {
    await attendantApi.arriveAtRoom(roomId);
    loadData();
  };

  const handleComplete = async (roomId: string) => {
    await attendantApi.complete(roomId);
    loadData();
  };

  const handleAddToQueue = async () => {
    if (!queueForm.phone) return;
    setAddingToQueue(true);
    try {
      await queueApi.manualAdd(LOCATION_ID, queueForm);
      setQueueForm({ phone: '', firstName: '', lastName: '', notes: '' });
      setQueueSuccess(true);
      setTimeout(() => { setQueueSuccess(false); setShowAddToQueue(false); }, 2000);
      loadData();
    } catch {
      // handle error
    }
    setAddingToQueue(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">טוען...</div>
      </div>
    );
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'waiting_for_attendant': return 'bg-red-100 border-red-400 text-red-800';
      case 'occupied':
      case 'preparation': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'immersion': return 'bg-green-100 border-green-400 text-green-800';
      case 'cleaning_required':
      case 'cleaning_in_progress': return 'bg-gray-100 border-gray-400 text-gray-600';
      default: return 'bg-white';
    }
  };

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
      waiting_for_attendant: 'מוכנה לטבילה',
      occupied: 'בהכנה',
      preparation: 'בהכנה',
      immersion: 'בטבילה',
      cleaning_required: 'ניקיון נדרש',
      cleaning_in_progress: 'בניקיון',
      available: 'פנוי',
    };
    return labels[status] || status;
  };

  const timeSince = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return `${diff} דק`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-900">מסך בלנית</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddToQueue(!showAddToQueue)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <UserPlus size={16} />
            הוספה ידנית לתור
          </button>
          <div className="text-lg font-mono">
            {new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Manual queue add form */}
        {showAddToQueue && (
          <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">הוספת לקוחה לתור באופן ידני</h2>
            {queueSuccess ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center font-medium">
                הלקוחה נוספה לתור בהצלחה!
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">טלפון *</label>
                    <input
                      value={queueForm.phone}
                      onChange={e => setQueueForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="050-1234567"
                      className="w-full border rounded-lg px-4 py-2"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">שם פרטי</label>
                    <input
                      value={queueForm.firstName}
                      onChange={e => setQueueForm(f => ({ ...f, firstName: e.target.value }))}
                      placeholder="שם"
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">שם משפחה</label>
                    <input
                      value={queueForm.lastName}
                      onChange={e => setQueueForm(f => ({ ...f, lastName: e.target.value }))}
                      placeholder="משפחה"
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
                    <input
                      value={queueForm.notes}
                      onChange={e => setQueueForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="הערות לבלנית"
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToQueue}
                    disabled={!queueForm.phone || addingToQueue}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {addingToQueue ? 'מוסיף...' : 'הוסף לתור'}
                  </button>
                  <button onClick={() => setShowAddToQueue(false)} className="text-gray-500 px-4 py-2">
                    ביטול
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {/* Ready for immersion - priority */}
        {data.readyForImmersion?.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-red-700 mb-3">
              מוכנות לטבילה
            </h2>
            <div className="space-y-3">
              {data.readyForImmersion.map((room: Room) => (
                <div
                  key={room.id}
                  className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-lg">
                      חדר {room.roomNumber} -{' '}
                      {room.currentBooking?.user?.firstName || ''}
                    </div>
                    {room.statusChangedAt && (
                      <div className="text-sm text-red-600">
                        מוכנה {timeSince(room.statusChangedAt)}
                      </div>
                    )}
                    {room.currentBooking?.notesForAttendant && (
                      <div className="text-sm text-gray-600 mt-1">
                        הערות: {room.currentBooking.notesForAttendant}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleArrive(room.id)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition"
                  >
                    ניגשת
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* In preparation */}
        {data.inPreparation?.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-yellow-700 mb-3">בהכנה</h2>
            <div className="grid grid-cols-2 gap-3">
              {data.inPreparation.map((room: Room) => (
                <div
                  key={room.id}
                  className="bg-yellow-50 border border-yellow-300 rounded-xl p-4"
                >
                  <div className="font-bold">
                    חדר {room.roomNumber} -{' '}
                    {room.currentBooking?.user?.firstName || ''}
                  </div>
                  {room.statusChangedAt && (
                    <div className="text-sm text-yellow-600">
                      {timeSince(room.statusChangedAt)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* In immersion */}
        {data.inImmersion?.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-green-700 mb-3">
              בטבילה כעת
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {data.inImmersion.map((room: Room) => (
                <div
                  key={room.id}
                  className="bg-green-50 border border-green-300 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold">
                      חדר {room.roomNumber} -{' '}
                      {room.currentBooking?.user?.firstName || ''}
                    </div>
                    {room.statusChangedAt && (
                      <div className="text-sm text-green-600">
                        {timeSince(room.statusChangedAt)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleComplete(room.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                  >
                    סיום
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Needs cleaning */}
        {data.needsCleaning?.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-600 mb-3">
              ניקיון נדרש
            </h2>
            <div className="flex gap-3">
              {data.needsCleaning.map((room: Room) => (
                <div
                  key={room.id}
                  className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-2"
                >
                  חדר {room.roomNumber}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
