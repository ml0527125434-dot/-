import { useState, useEffect, useCallback } from 'react';
import { bookingsApi, roomsApi, queueApi } from '../lib/api';
import { useLocationSocket } from '../hooks/useSocket';
import RoomStatusGrid from '../components/reception/RoomStatusGrid';
import BookingsList from '../components/reception/BookingsList';
import QueuePanel from '../components/reception/QueuePanel';
import type { Room, Booking, QueueEntry } from '../types';

const LOCATION_ID = localStorage.getItem('zentro_location') || '';

export default function ReceptionDashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!LOCATION_ID) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const [roomsRes, bookingsRes, queueRes] = await Promise.all([
        roomsApi.list(LOCATION_ID),
        bookingsApi.list({ locationId: LOCATION_ID, dateFrom: today, dateTo: today }),
        queueApi.get(LOCATION_ID),
      ]);
      setRooms(roomsRes.data);
      setBookings(bookingsRes.data);
      setQueue(queueRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useLocationSocket(LOCATION_ID, 'reception', {
    'room:status_changed': () => loadData(),
    'queue:updated': () => loadData(),
    'booking:updated': () => loadData(),
  });

  const handleArrived = async (bookingId: string) => {
    await bookingsApi.arrive(bookingId);
    loadData();
  };

  const handleAssign = async (bookingId: string, roomId: string) => {
    await bookingsApi.assign(bookingId, roomId);
    loadData();
  };

  const arrivedCount = bookings.filter((b) => b.arrivedAt).length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const inRoomsCount = rooms.filter(
    (r) => !['available', 'out_of_service'].includes(r.status),
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-900">ZENTRO - קבלה</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('he-IL')} &middot;{' '}
          {new Date().toLocaleTimeString('he-IL', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-white border-b px-6 py-3 flex gap-8 text-sm">
        <span>
          הזמנות היום: <strong>{bookings.length}</strong>
        </span>
        <span>
          הגיעו: <strong>{arrivedCount}</strong>
        </span>
        <span>
          ממתינות: <strong>{queue.length}</strong>
        </span>
        <span>
          בחדרים: <strong>{inRoomsCount}</strong>
        </span>
        <span>
          הושלמו: <strong>{completedCount}</strong>
        </span>
      </div>

      {/* Main content */}
      <div className="p-6 grid grid-cols-12 gap-6">
        {/* Queue */}
        <div className="col-span-3">
          <QueuePanel
            queue={queue}
            rooms={rooms.filter((r) => r.status === 'available')}
            onAssign={handleAssign}
            onRefresh={loadData}
          />
        </div>

        {/* Room grid */}
        <div className="col-span-5">
          <RoomStatusGrid rooms={rooms} />
        </div>

        {/* Bookings list */}
        <div className="col-span-4">
          <BookingsList
            bookings={bookings.filter(
              (b) => !['completed', 'cancelled', 'no_show'].includes(b.status),
            )}
            onArrived={handleArrived}
          />
        </div>
      </div>
    </div>
  );
}
