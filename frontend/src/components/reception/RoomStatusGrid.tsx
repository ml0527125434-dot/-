import type { Room } from '../../types';

const STATUS_CONFIG: Record<
  string,
  { bg: string; label: string; dot: string }
> = {
  available: { bg: 'bg-green-50 border-green-300', label: 'פנוי', dot: 'bg-green-500' },
  occupied: { bg: 'bg-yellow-50 border-yellow-300', label: 'תפוס (הכנה)', dot: 'bg-yellow-500' },
  preparation: { bg: 'bg-yellow-50 border-yellow-300', label: 'הכנה', dot: 'bg-yellow-500' },
  waiting_for_attendant: { bg: 'bg-red-50 border-red-300', label: 'מוכנה לטבילה', dot: 'bg-red-500' },
  immersion: { bg: 'bg-blue-50 border-blue-300', label: 'טבילה', dot: 'bg-blue-500' },
  cleaning_required: { bg: 'bg-gray-50 border-gray-300', label: 'ניקיון', dot: 'bg-gray-400' },
  cleaning_in_progress: { bg: 'bg-gray-50 border-gray-300', label: 'בניקיון', dot: 'bg-gray-400' },
  out_of_service: { bg: 'bg-gray-100 border-gray-400', label: 'לא פעיל', dot: 'bg-gray-600' },
};

interface Props {
  rooms: Room[];
}

export default function RoomStatusGrid({ rooms }: Props) {
  const timeSince = (dateStr?: string) => {
    if (!dateStr) return '';
    const diff = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 60000,
    );
    return `${diff} דק`;
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-3">סטטוס חדרים</h2>
      <div className="grid grid-cols-2 gap-3">
        {rooms.map((room) => {
          const config =
            STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
          return (
            <div
              key={room.id}
              className={`${config.bg} border rounded-xl p-4 transition hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-lg">
                  חדר {room.roomNumber}
                </span>
                <span className={`w-3 h-3 rounded-full ${config.dot}`} />
              </div>
              <div className="text-sm font-medium">{config.label}</div>
              {room.statusChangedAt && room.status !== 'available' && (
                <div className="text-xs text-gray-500 mt-1">
                  {timeSince(room.statusChangedAt)}
                </div>
              )}
              {room.currentBooking?.user?.firstName && (
                <div className="text-sm mt-1 text-gray-700">
                  {room.currentBooking.user.firstName}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
