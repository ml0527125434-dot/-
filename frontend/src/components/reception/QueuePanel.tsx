import type { QueueEntry, Room } from '../../types';

interface Props {
  queue: QueueEntry[];
  rooms: Room[];
  onAssign: (bookingId: string, roomId: string) => void;
}

export default function QueuePanel({ queue, rooms, onAssign }: Props) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-3">תור ממתינות</h2>

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
