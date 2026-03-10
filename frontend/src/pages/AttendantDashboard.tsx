import { useState, useEffect, useCallback } from 'react';
import { attendantApi } from '../lib/api';
import { useLocationSocket } from '../hooks/useSocket';
import type { Room } from '../types';

const LOCATION_ID = localStorage.getItem('zentro_location') || '';

export default function AttendantDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        <div className="text-lg font-mono">
          {new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>

      <div className="p-6 space-y-6">
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
