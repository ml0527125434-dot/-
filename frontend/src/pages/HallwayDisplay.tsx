import { useState, useEffect, useCallback } from 'react';
import { roomsApi, queueApi } from '../lib/api';
import { useLocationSocket } from '../hooks/useSocket';
import type { Room, QueueEntry } from '../types';

const LOCATION_ID = localStorage.getItem('zentro_location') || '';

const STATUS_CONFIG: Record<string, { bg: string; label: string; dot: string }> = {
  available: { bg: 'bg-green-100 border-green-400', label: 'פנוי', dot: 'bg-green-500' },
  occupied: { bg: 'bg-yellow-100 border-yellow-400', label: 'הכנה', dot: 'bg-yellow-500' },
  preparation: { bg: 'bg-yellow-100 border-yellow-400', label: 'הכנה', dot: 'bg-yellow-500' },
  waiting_for_attendant: { bg: 'bg-red-100 border-red-400', label: 'מוכנה', dot: 'bg-red-500' },
  immersion: { bg: 'bg-blue-100 border-blue-400', label: 'טבילה', dot: 'bg-blue-500' },
  cleaning_required: { bg: 'bg-gray-100 border-gray-400', label: 'ניקיון', dot: 'bg-gray-400' },
  cleaning_in_progress: { bg: 'bg-gray-100 border-gray-400', label: 'בניקיון', dot: 'bg-gray-400' },
  out_of_service: { bg: 'bg-gray-200 border-gray-500', label: 'מושבת', dot: 'bg-gray-600' },
};

export default function HallwayDisplay() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [time, setTime] = useState(new Date());

  const loadData = useCallback(async () => {
    if (!LOCATION_ID) return;
    const [roomsRes, queueRes] = await Promise.all([
      roomsApi.list(LOCATION_ID),
      queueApi.get(LOCATION_ID),
    ]);
    setRooms(roomsRes.data);
    setQueue(queueRes.data);
  }, []);

  useEffect(() => {
    loadData();
    const dataInterval = setInterval(loadData, 15000);
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(clockInterval);
    };
  }, [loadData]);

  useLocationSocket(LOCATION_ID, 'hallway', {
    'room:status_changed': () => loadData(),
    'queue:updated': () => loadData(),
  });

  const timeSince = (dateStr?: string) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return `${diff} דק`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">סטטוס חדרים</h1>
        <div className="text-3xl font-mono">
          {time.toLocaleTimeString('he-IL', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </header>

      {/* Room grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {rooms.map((room) => {
          const config = STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
          return (
            <div
              key={room.id}
              className={`${config.bg} border-2 rounded-2xl p-5 text-gray-900`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold">חדר {room.roomNumber}</span>
                <span className={`w-3 h-3 rounded-full ${config.dot}`} />
              </div>
              <div className="text-sm font-medium mb-1">{config.label}</div>
              {room.statusChangedAt && room.status !== 'available' && (
                <div className="text-xs opacity-70">
                  {timeSince(room.statusChangedAt)}
                </div>
              )}
              {room.currentBooking?.user?.firstName && (
                <div className="text-sm mt-1">
                  {room.currentBooking.user.firstName}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">
            ממתינות בתור: {queue.length}
          </h2>
          <div className="space-y-2">
            {queue.map((entry, i) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 text-sm"
              >
                <span className="text-gray-400">{i + 1}.</span>
                <span>
                  {entry.booking.user?.firstName || ''}{' '}
                  {entry.booking.user?.lastName?.[0] || ''}.
                </span>
                <span className="text-gray-500">
                  ({entry.booking.timeSlotStart})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
