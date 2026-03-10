import { useState, useEffect, useCallback } from 'react';
import { bookingsApi, roomsApi, queueApi, attendantApi } from '../lib/api';
import {
  onDataChange,
  arriveBooking,
  assignBooking,
  attendantArrive,
  completeImmersion,
  cleanRoom,
  markReady,
  mockRooms,
  mockQueue,
} from '../lib/mockData';
import type { Room, Booking, QueueEntry } from '../types';
import {
  Eye,
  UserCheck,
  Droplets,
  Tablet,
  Monitor,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle,
  Clock,
  Package,
  Timer,
} from 'lucide-react';

type ActiveView = 'all' | 'reception' | 'attendant' | 'tablet' | 'hallway';

export default function DemoPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [attData, setAttData] = useState<any>(null);
  const [activeView, setActiveView] = useState<ActiveView>('all');
  const [selectedTabletRoom, setSelectedTabletRoom] = useState('r2');
  const [tabletChecklist, setTabletChecklist] = useState<Record<string, boolean>>({
    nail_polish: false, shampoo: false, comb: false, final_check: false,
  });
  const [tabletReady, setTabletReady] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [notification, setNotification] = useState('');

  const loadAll = useCallback(async () => {
    try {
      const [roomsRes, bookingsRes, queueRes, attRes] = await Promise.all([
        roomsApi.list('loc-demo'),
        bookingsApi.list({ locationId: 'loc-demo' }),
        queueApi.get('loc-demo'),
        attendantApi.dashboard('loc-demo'),
      ]);
      setRooms(roomsRes.data);
      setBookings(bookingsRes.data);
      setQueue(queueRes.data);
      setAttData(attRes.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const unsub = onDataChange(() => loadAll());
    return unsub;
  }, [loadAll]);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2500);
  };

  const handleArrived = (bookingId: string) => {
    arriveBooking(bookingId);
    notify('הגעה נרשמה - נכנסה לתור');
  };

  const handleAssign = (bookingId: string, roomId: string) => {
    assignBooking(bookingId, roomId);
    const room = mockRooms.find(r => r.id === roomId);
    notify(`שובצה לחדר ${room?.roomNumber}`);
  };

  const handleAttendantArrive = (roomId: string) => {
    attendantArrive(roomId);
    notify('בלנית הגיעה - טבילה החלה');
  };

  const handleComplete = (roomId: string) => {
    completeImmersion(roomId);
    notify('טבילה הושלמה');
  };

  const handleClean = (roomId: string) => {
    cleanRoom(roomId);
    notify('חדר נוקה - פנוי');
  };

  const handleTabletReady = () => {
    markReady(selectedTabletRoom);
    setTabletReady(true);
    notify('מוכנה לטבילה! הבלנית קיבלה התראה');
  };

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      available: 'bg-green-400',
      occupied: 'bg-yellow-400',
      preparation: 'bg-yellow-400',
      waiting_for_attendant: 'bg-red-400 animate-pulse',
      immersion: 'bg-blue-400',
      cleaning_required: 'bg-gray-400',
      cleaning_in_progress: 'bg-gray-400',
      out_of_service: 'bg-gray-600',
    };
    return map[status] || 'bg-gray-300';
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      available: 'פנוי', occupied: 'תפוס', preparation: 'הכנה',
      waiting_for_attendant: 'ממתינה לבלנית', immersion: 'טבילה',
      cleaning_required: 'ניקיון', cleaning_in_progress: 'בניקיון',
      out_of_service: 'מושבת', reserved: 'שמור',
    };
    return map[status] || status;
  };

  const timeSince = (d?: string) => {
    if (!d) return '';
    const min = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    return `${min} דק`;
  };

  const availableRooms = rooms.filter(r => r.status === 'available');

  const views = [
    { key: 'all' as const, label: 'הכל', icon: Monitor },
    { key: 'reception' as const, label: 'קבלה', icon: UserCheck },
    { key: 'attendant' as const, label: 'בלנית', icon: Droplets },
    { key: 'tablet' as const, label: 'טאבלט', icon: Tablet },
    { key: 'hallway' as const, label: 'מסדרון', icon: Eye },
  ];

  const DEFAULT_CHECKLIST: Record<string, string> = {
    nail_polish: 'הסרת לק',
    shampoo: 'חפיפה',
    comb: 'סריקה',
    final_check: 'בדיקה אחרונה',
  };

  const EQUIPMENT_ITEMS = ['מגבת גדולה', 'מגבת קטנה', 'סבון', 'שמפו', 'מסרק'];

  const show = (v: ActiveView) => activeView === 'all' || activeView === v;

  // ========== RECEPTION PANEL ==========
  const ReceptionPanel = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-200">
      <div className="bg-blue-600 text-white px-4 py-2 flex items-center gap-2">
        <UserCheck size={16} />
        <span className="font-bold text-sm">קבלה</span>
        <span className="mr-auto text-xs opacity-80">
          תור: {queue.length} | בחדרים: {rooms.filter(r => !['available','out_of_service'].includes(r.status)).length}
        </span>
      </div>

      {/* Room mini grid */}
      <div className="p-3 border-b">
        <div className="text-xs font-bold text-gray-500 mb-2">חדרים</div>
        <div className="grid grid-cols-4 gap-1.5">
          {rooms.map(room => (
            <div key={room.id} className="text-center">
              <div className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center text-xs ${
                room.status === 'available' ? 'bg-green-100 border border-green-300' :
                room.status === 'out_of_service' ? 'bg-gray-200' :
                room.status === 'waiting_for_attendant' ? 'bg-red-100 border border-red-300 animate-pulse' :
                room.status === 'immersion' ? 'bg-blue-100 border border-blue-300' :
                'bg-yellow-100 border border-yellow-300'
              }`}>
                <span className="font-bold">{room.roomNumber}</span>
                <span className="text-[10px] leading-tight">{statusLabel(room.status)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="p-3 border-b">
          <div className="text-xs font-bold text-gray-500 mb-2">תור ({queue.length})</div>
          <div className="space-y-2">
            {queue.map((entry, i) => (
              <div key={entry.id} className="bg-blue-50 rounded-lg p-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>
                  <span className="text-sm font-medium">{entry.booking.user?.firstName} {entry.booking.user?.lastName?.[0]}.</span>
                  <span className="text-xs text-gray-500">{entry.booking.timeSlotStart}</span>
                </div>
                {availableRooms.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {availableRooms.map(room => (
                      <button key={room.id} onClick={() => handleAssign(entry.booking.id, room.id)}
                        className="bg-green-500 text-white px-2 py-0.5 rounded text-xs hover:bg-green-600 transition">
                        חדר {room.roomNumber}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming bookings */}
      <div className="p-3">
        <div className="text-xs font-bold text-gray-500 mb-2">הזמנות להגעה</div>
        <div className="space-y-1.5">
          {bookings.filter(b => ['confirmed', 'pending_payment'].includes(b.status)).map(b => (
            <div key={b.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
              <div>
                <span className="text-sm font-medium">{b.user?.firstName} {b.user?.lastName?.[0]}.</span>
                <span className="text-xs text-gray-500 mr-2">{b.timeSlotStart}</span>
                {b.paymentStatus !== 'paid' && <span className="text-xs text-red-500 mr-1">לא שולם</span>}
              </div>
              <button onClick={() => handleArrived(b.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition">
                הגיעה
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ========== ATTENDANT PANEL ==========
  const AttendantPanel = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-200">
      <div className="bg-purple-600 text-white px-4 py-2 flex items-center gap-2">
        <Droplets size={16} />
        <span className="font-bold text-sm">בלנית</span>
      </div>
      <div className="p-3 space-y-3">
        {/* Ready for immersion */}
        {attData?.readyForImmersion?.length > 0 && (
          <div>
            <div className="text-xs font-bold text-red-600 mb-1.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              ממתינות לבלנית
            </div>
            {attData.readyForImmersion.map((room: Room) => (
              <div key={room.id} className="bg-red-50 border border-red-200 rounded-lg p-2 mb-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm">חדר {room.roomNumber}</span>
                    <span className="text-xs text-gray-600 mr-1">{room.currentBooking?.user?.firstName}</span>
                    {room.statusChangedAt && <div className="text-xs text-red-500">ממתינה {timeSince(room.statusChangedAt)}</div>}
                    {room.currentBooking?.notesForAttendant && (
                      <div className="text-xs text-gray-500 mt-0.5">{room.currentBooking.notesForAttendant}</div>
                    )}
                  </div>
                  <button onClick={() => handleAttendantArrive(room.id)}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition">
                    ניגשת
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* In preparation */}
        {attData?.inPreparation?.length > 0 && (
          <div>
            <div className="text-xs font-bold text-yellow-600 mb-1.5">בהכנה</div>
            <div className="grid grid-cols-2 gap-1.5">
              {attData.inPreparation.map((room: Room) => (
                <div key={room.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-sm">
                  <span className="font-bold">חדר {room.roomNumber}</span>
                  <span className="text-xs text-gray-500 mr-1">{room.currentBooking?.user?.firstName}</span>
                  {room.statusChangedAt && <div className="text-xs text-yellow-600">{timeSince(room.statusChangedAt)}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In immersion */}
        {attData?.inImmersion?.length > 0 && (
          <div>
            <div className="text-xs font-bold text-green-600 mb-1.5">בטבילה</div>
            {attData.inImmersion.map((room: Room) => (
              <div key={room.id} className="bg-green-50 border border-green-200 rounded-lg p-2 mb-1.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm">חדר {room.roomNumber}</span>
                  <span className="text-xs text-gray-600 mr-1">{room.currentBooking?.user?.firstName}</span>
                  {room.statusChangedAt && <div className="text-xs text-green-600">{timeSince(room.statusChangedAt)}</div>}
                </div>
                <button onClick={() => handleComplete(room.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition">
                  סיום
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Needs cleaning */}
        {attData?.needsCleaning?.length > 0 && (
          <div>
            <div className="text-xs font-bold text-gray-500 mb-1.5">ניקיון</div>
            <div className="flex gap-1.5 flex-wrap">
              {attData.needsCleaning.map((room: Room) => (
                <button key={room.id} onClick={() => handleClean(room.id)}
                  className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1.5 text-xs hover:bg-gray-200 transition">
                  חדר {room.roomNumber} - נקי
                </button>
              ))}
            </div>
          </div>
        )}

        {(!attData?.readyForImmersion?.length && !attData?.inPreparation?.length && !attData?.inImmersion?.length && !attData?.needsCleaning?.length) && (
          <div className="text-center text-gray-400 py-6 text-sm">אין פעילות כרגע</div>
        )}
      </div>
    </div>
  );

  // ========== TABLET PANEL ==========
  const TabletPanel = () => {
    const room = rooms.find(r => r.id === selectedTabletRoom);
    const isWaiting = room?.status === 'waiting_for_attendant' || tabletReady;

    if (isWaiting) {
      return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-teal-200">
          <div className="bg-teal-600 text-white px-4 py-2 flex items-center gap-2">
            <Tablet size={16} />
            <span className="font-bold text-sm">טאבלט חדר {room?.roomNumber}</span>
          </div>
          <div className="p-8 text-center bg-blue-50">
            <div className="text-5xl mb-4">🕊</div>
            <h2 className="text-xl font-bold text-blue-900 mb-2">הבלנית בדרך אלייך</h2>
            <p className="text-blue-600">אנא המתיני...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-teal-200">
        <div className="bg-teal-600 text-white px-4 py-2 flex items-center gap-2">
          <Tablet size={16} />
          <span className="font-bold text-sm">טאבלט חדר {room?.roomNumber}</span>
          {/* Room selector */}
          <select value={selectedTabletRoom} onChange={e => { setSelectedTabletRoom(e.target.value); setTabletReady(false); setTabletChecklist({ nail_polish: false, shampoo: false, comb: false, final_check: false }); }}
            className="mr-auto text-xs bg-teal-700 text-white rounded px-1 py-0.5 border-0">
            {rooms.filter(r => r.currentBooking).map(r => (
              <option key={r.id} value={r.id}>חדר {r.roomNumber}</option>
            ))}
          </select>
        </div>

        <div className="p-3">
          {/* Guest greeting */}
          <div className="text-center mb-3">
            <p className="text-sm text-teal-600">ברוכה הבאה, {room?.currentBooking?.user?.firstName || 'אורחת'}!</p>
          </div>

          {/* Clock */}
          <div className="bg-gray-50 rounded-xl p-3 mb-3 flex items-center justify-around">
            <div className="text-center">
              <Clock className="mx-auto text-blue-500" size={18} />
              <div className="text-lg font-mono font-bold">{new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div className="text-center">
              <Timer className="mx-auto text-purple-500" size={18} />
              <div className="text-lg font-mono font-bold">{timeSince(room?.statusChangedAt)}</div>
            </div>
          </div>

          {/* Checklist */}
          <div className="mb-3">
            <div className="text-xs font-bold text-gray-500 mb-2">רשימת הכנה</div>
            <div className="space-y-1.5">
              {Object.entries(DEFAULT_CHECKLIST).map(([key, label]) => (
                <button key={key}
                  onClick={() => setTabletChecklist(prev => ({ ...prev, [key]: !prev[key] }))}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg transition text-sm ${
                    tabletChecklist[key] ? 'bg-green-50 border border-green-300' : 'bg-gray-50 border border-gray-200'
                  }`}>
                  <CheckCircle className={tabletChecklist[key] ? 'text-green-500' : 'text-gray-300'} size={18} />
                  <span className={tabletChecklist[key] ? 'line-through text-gray-400' : ''}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <button onClick={() => setShowEquipment(!showEquipment)}
            className="w-full bg-gray-50 rounded-lg p-2 mb-3 flex items-center justify-between text-sm hover:bg-gray-100 transition">
            <span className="flex items-center gap-2"><Package size={16} className="text-orange-500" /> בקשת ציוד</span>
            {showEquipment ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showEquipment && (
            <div className="bg-orange-50 rounded-lg p-2 mb-3 space-y-1">
              {EQUIPMENT_ITEMS.map(item => (
                <div key={item} className="flex items-center justify-between text-xs">
                  <span>{item}</span>
                  <button className="bg-orange-200 px-2 py-0.5 rounded hover:bg-orange-300 transition" onClick={() => notify(`${item} נשלחה בקשה`)}>בקשי</button>
                </div>
              ))}
            </div>
          )}

          {/* Ready button */}
          <button onClick={handleTabletReady}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition text-sm">
            מוכנה לטבילה
          </button>
        </div>
      </div>
    );
  };

  // ========== HALLWAY PANEL ==========
  const HallwayPanel = () => (
    <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-700">
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye size={16} />
          <span className="font-bold text-sm">תצוגת מסדרון</span>
        </div>
        <span className="text-xs font-mono">
          {new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-4 gap-1.5">
          {rooms.map(room => (
            <div key={room.id} className={`rounded-lg p-2 text-xs border ${
              room.status === 'available' ? 'bg-green-900/40 border-green-700 text-green-200' :
              room.status === 'waiting_for_attendant' ? 'bg-red-900/40 border-red-700 text-red-200 animate-pulse' :
              room.status === 'immersion' ? 'bg-blue-900/40 border-blue-700 text-blue-200' :
              room.status === 'out_of_service' ? 'bg-gray-800 border-gray-600 text-gray-500' :
              room.status === 'cleaning_required' || room.status === 'cleaning_in_progress' ? 'bg-gray-800 border-gray-600 text-gray-400' :
              'bg-yellow-900/40 border-yellow-700 text-yellow-200'
            }`}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold">{room.roomNumber}</span>
                <span className={`w-2 h-2 rounded-full ${statusColor(room.status)}`} />
              </div>
              <div className="text-[10px]">{statusLabel(room.status)}</div>
              {room.currentBooking?.user?.firstName && (
                <div className="text-[10px] opacity-70 mt-0.5">{room.currentBooking.user.firstName}</div>
              )}
            </div>
          ))}
        </div>
        {queue.length > 0 && (
          <div className="mt-3 bg-gray-800 rounded-lg p-2">
            <div className="text-xs text-gray-400 mb-1">תור: {queue.length}</div>
            {queue.map((e, i) => (
              <div key={e.id} className="text-xs text-gray-300">
                {i+1}. {e.booking.user?.firstName} {e.booking.user?.lastName?.[0]}. ({e.booking.timeSlotStart})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-2 rounded-full shadow-xl text-sm font-medium animate-bounce">
          {notification}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold text-blue-900">ZENTRO Demo</h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Sparkles size={14} className="text-yellow-500" />
              <span>מצב דמו</span>
            </div>
          </div>
          {/* View tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {views.map(v => (
              <button key={v.key} onClick={() => setActiveView(v.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  activeView === v.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                <v.icon size={12} />
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {show('reception') && <ReceptionPanel />}
        {show('attendant') && <AttendantPanel />}
        {show('tablet') && <TabletPanel />}
        {show('hallway') && <HallwayPanel />}
      </div>

      {/* Instructions */}
      <div className="p-4 max-w-lg mx-auto">
        <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-800 leading-relaxed">
          <strong>איך לנסות:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>בקבלה - לחצי "הגיעה" על הזמנה ותראי אותה נכנסת לתור</li>
            <li>בקבלה - שבצי ממתינה לחדר פנוי</li>
            <li>בטאבלט - סמני את רשימת ההכנה ולחצי "מוכנה לטבילה"</li>
            <li>בבלנית - לחצי "ניגשת" כשיש ממתינה, ואז "סיום" אחרי טבילה</li>
            <li>כל הפאנלים מתעדכנים בו-זמנית!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
