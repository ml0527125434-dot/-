import { useState, useEffect, useCallback, useRef } from 'react';
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
  mockBookings,
  getAvailableSlots,
  notifyChange,
  mockUsers,
  getMusicTracks,
  getRoomMusicState,
  changeRoomMusic,
  changeRoomVolume,
  exitRoom,
  addManualQueueEntry,
  getDefaultMusicTrack,
} from '../lib/mockData';
import type { Room, Booking, QueueEntry, MusicTrack } from '../types';
import {
  Eye,
  UserCheck,
  Droplets,
  Tablet,
  Sparkles,
  CheckCircle,
  Clock,
  Package,
  CalendarDays,
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  LogOut,
  UserPlus,
} from 'lucide-react';
import HebrewCalendar from '../components/HebrewCalendar';

export default function DemoPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [attData, setAttData] = useState<any>(null);
  const [selectedTabletRoom, setSelectedTabletRoom] = useState('r2');
  const [tabletChecklist, setTabletChecklist] = useState<Record<string, boolean>>({
    nail_polish: false, shampoo: false, comb: false, final_check: false,
  });
  const [tabletReady, setTabletReady] = useState(false);
  const [notification, setNotification] = useState('');

  // Music state
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showMusic, setShowMusic] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [exitCode, setExitCode] = useState('');
  const [sessionEnded, setSessionEnded] = useState(false);

  // Manual queue state
  const [showManualQueue, setShowManualQueue] = useState(false);
  const [manualForm, setManualForm] = useState({ phone: '', firstName: '', lastName: '', notes: '' });
  const [manualAdding, setManualAdding] = useState(false);

  // Booking state
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [bookingSlot, setBookingSlot] = useState('');
  const [bookingStep, setBookingStep] = useState<'calendar' | 'slots' | 'done'>('calendar');

  const containerRef = useRef<HTMLDivElement>(null);

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

  // Load music tracks
  useEffect(() => {
    const tracks = getMusicTracks();
    setMusicTracks(tracks);
    const state = getRoomMusicState(selectedTabletRoom);
    setCurrentTrackId(state.trackId);
    setVolume(state.volume);
  }, [selectedTabletRoom]);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2500);
  };

  // Prevent scroll on actions
  const action = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };

  const handleArrived = (bookingId: string) => { arriveBooking(bookingId); notify('הגעה נרשמה - נכנסה לתור'); };
  const handleAssign = (bookingId: string, roomId: string) => { assignBooking(bookingId, roomId); const r = mockRooms.find(x => x.id === roomId); notify(`שובצה לחדר ${r?.roomNumber}`); };
  const handleAttendantArrive = (roomId: string) => { attendantArrive(roomId); notify('בלנית הגיעה - טבילה החלה'); };
  const handleComplete = (roomId: string) => { completeImmersion(roomId); notify('טבילה הושלמה'); };
  const handleClean = (roomId: string) => { cleanRoom(roomId); notify('חדר נוקה - פנוי'); };
  const handleTabletReady = () => { markReady(selectedTabletRoom); setTabletReady(true); notify('מוכנה לטבילה!'); };

  const handleMusicChange = (trackId: string) => {
    changeRoomMusic(selectedTabletRoom, trackId, volume);
    setCurrentTrackId(trackId);
    notify('שיר שונה');
  };
  const handleVolumeChange = (v: number) => {
    changeRoomVolume(selectedTabletRoom, v);
    setVolume(v);
  };
  const currentTrack = musicTracks.find(t => t.id === currentTrackId) || getDefaultMusicTrack();
  const handleNextTrack = () => {
    const idx = musicTracks.findIndex(t => t.id === currentTrackId);
    const next = musicTracks[(idx + 1) % musicTracks.length];
    if (next) handleMusicChange(next.id);
  };
  const handlePrevTrack = () => {
    const idx = musicTracks.findIndex(t => t.id === currentTrackId);
    const prev = musicTracks[(idx - 1 + musicTracks.length) % musicTracks.length];
    if (prev) handleMusicChange(prev.id);
  };
  const handleExitCode = () => {
    if (exitCode === '1234') {
      exitRoom(selectedTabletRoom, 'room_code');
      setSessionEnded(true);
      notify('יציאה אושרה - חדר מתאפס');
      setTimeout(() => { setSessionEnded(false); setShowExit(false); setExitCode(''); }, 3000);
    } else {
      notify('קוד שגוי');
    }
  };
  const handleExitMainDoor = () => {
    exitRoom(selectedTabletRoom, 'main_door');
    setSessionEnded(true);
    notify('יציאה דרך דלת ראשית - חדר מתאפס');
    setTimeout(() => { setSessionEnded(false); setShowExit(false); }, 3000);
  };
  const handleManualAdd = () => {
    if (!manualForm.phone) return;
    setManualAdding(true);
    addManualQueueEntry(manualForm);
    setManualForm({ phone: '', firstName: '', lastName: '', notes: '' });
    notify('לקוחה נוספה לתור');
    setManualAdding(false);
    setShowManualQueue(false);
    notifyChange();
  };

  const handleBookSlot = (slot: string) => {
    setBookingSlot(slot);
    // Create a new booking and add to the system
    const newId = `b-${Date.now()}`;
    const user = { ...mockUsers[6], firstName: 'נעמי', lastName: 'דוד' };
    mockBookings.push({
      id: newId, locationId: 'loc-demo', userId: user.id,
      bookingDate: bookingDate!.toISOString().split('T')[0],
      timeSlotStart: slot, timeSlotEnd: '', status: 'confirmed',
      paymentStatus: 'paid', user,
    });
    notifyChange();
    setBookingStep('done');
    notify('הזמנה נוצרה בהצלחה!');
    setTimeout(() => { setBookingStep('calendar'); setBookingDate(null); setBookingSlot(''); }, 3000);
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      available: 'פנוי', occupied: 'תפוס', preparation: 'הכנה',
      waiting_for_attendant: 'ממתינה', immersion: 'טבילה',
      cleaning_required: 'ניקיון', cleaning_in_progress: 'בניקיון',
      out_of_service: 'מושבת',
    };
    return map[status] || status;
  };

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      available: 'bg-green-400', occupied: 'bg-yellow-400', preparation: 'bg-yellow-400',
      waiting_for_attendant: 'bg-red-400 animate-pulse', immersion: 'bg-blue-400',
      cleaning_required: 'bg-gray-400', cleaning_in_progress: 'bg-gray-400', out_of_service: 'bg-gray-600',
    };
    return map[status] || 'bg-gray-300';
  };

  const timeSince = (d?: string) => { if (!d) return ''; return `${Math.floor((Date.now() - new Date(d).getTime()) / 60000)} דק`; };
  const availableRooms = rooms.filter(r => r.status === 'available');

  const DEFAULT_CHECKLIST: Record<string, string> = { nail_polish: 'הסרת לק', shampoo: 'חפיפה', comb: 'סריקה', final_check: 'בדיקה אחרונה' };
  const slots = getAvailableSlots();

  return (
    <div ref={containerRef} className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Notification */}
      {notification && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-1.5 rounded-full shadow-xl text-xs font-medium">
          {notification}
        </div>
      )}

      {/* Compact Header */}
      <header className="bg-white border-b px-4 py-1.5 flex items-center justify-between shrink-0">
        <h1 className="text-sm font-bold text-blue-900">ZENTRO Demo</h1>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <Sparkles size={10} className="text-yellow-500" />
          <span>מצב דמו - כל המסכים בו זמנית</span>
        </div>
      </header>

      {/* Main grid - all panels visible */}
      <div className="flex-1 grid grid-cols-12 gap-2 p-2 overflow-hidden">

        {/* Column 1: Booking + Hallway */}
        <div className="col-span-3 flex flex-col gap-2 overflow-y-auto">
          {/* CLIENT BOOKING */}
          <div className="bg-white rounded-xl shadow border border-orange-200 overflow-hidden">
            <div className="bg-orange-500 text-white px-3 py-1.5 flex items-center gap-1.5">
              <CalendarDays size={14} />
              <span className="font-bold text-xs">הזמנה - צד לקוחה</span>
            </div>
            <div className="p-2">
              {bookingStep === 'calendar' && (
                <div>
                  <HebrewCalendar
                    selectedDate={bookingDate}
                    onSelectDate={(d) => { setBookingDate(d); setBookingStep('slots'); }}
                  />
                </div>
              )}
              {bookingStep === 'slots' && (
                <div>
                  <div className="text-xs text-gray-500 mb-2 text-center">
                    {bookingDate?.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {slots.filter(s => s.available).map(s => (
                      <button key={s.start} onClick={action(() => handleBookSlot(s.start))}
                        className="bg-blue-50 border border-blue-200 rounded-lg py-2 text-sm font-medium hover:bg-blue-100 transition">
                        {s.start}
                      </button>
                    ))}
                  </div>
                  <button onClick={action(() => setBookingStep('calendar'))}
                    className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600">חזרה ללוח</button>
                </div>
              )}
              {bookingStep === 'done' && (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">✓</div>
                  <div className="text-sm font-bold text-green-600">ההזמנה אושרה!</div>
                  <div className="text-xs text-gray-500">{bookingSlot} - נעמי דוד</div>
                </div>
              )}
            </div>
          </div>

          {/* HALLWAY DISPLAY */}
          <div className="bg-gray-900 rounded-xl shadow overflow-hidden flex-1 min-h-0">
            <div className="bg-gray-800 text-white px-3 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5"><Eye size={14} /><span className="font-bold text-xs">מסדרון</span></div>
              <span className="text-[10px] font-mono">{new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="p-2">
              <div className="grid grid-cols-4 gap-1">
                {rooms.map(room => (
                  <div key={room.id} className={`rounded p-1.5 text-[10px] border ${
                    room.status === 'available' ? 'bg-green-900/40 border-green-700 text-green-200' :
                    room.status === 'waiting_for_attendant' ? 'bg-red-900/40 border-red-700 text-red-200 animate-pulse' :
                    room.status === 'immersion' ? 'bg-blue-900/40 border-blue-700 text-blue-200' :
                    room.status === 'out_of_service' ? 'bg-gray-800 border-gray-600 text-gray-500' :
                    room.status === 'cleaning_required' ? 'bg-gray-800 border-gray-600 text-gray-400' :
                    'bg-yellow-900/40 border-yellow-700 text-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{room.roomNumber}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusColor(room.status)}`} />
                    </div>
                    <div className="text-[9px]">{statusLabel(room.status)}</div>
                  </div>
                ))}
              </div>
              {queue.length > 0 && (
                <div className="mt-2 text-[10px] text-gray-400">
                  תור: {queue.map((e, i) => `${i+1}. ${e.booking.user?.firstName}`).join(' | ')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Reception */}
        <div className="col-span-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow border border-blue-200 overflow-hidden h-full flex flex-col">
            <div className="bg-blue-600 text-white px-3 py-1.5 flex items-center gap-1.5 shrink-0">
              <UserCheck size={14} />
              <span className="font-bold text-xs">קבלה</span>
              <span className="mr-auto text-[10px] opacity-80">תור: {queue.length} | בחדרים: {rooms.filter(r => !['available','out_of_service'].includes(r.status)).length}</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Room grid */}
              <div className="p-2 border-b">
                <div className="text-[10px] font-bold text-gray-400 mb-1">חדרים</div>
                <div className="grid grid-cols-4 gap-1">
                  {rooms.map(room => (
                    <div key={room.id} className={`rounded-lg p-1.5 text-center text-[10px] ${
                      room.status === 'available' ? 'bg-green-100 border border-green-300' :
                      room.status === 'out_of_service' ? 'bg-gray-200' :
                      room.status === 'waiting_for_attendant' ? 'bg-red-100 border border-red-300 animate-pulse' :
                      room.status === 'immersion' ? 'bg-blue-100 border border-blue-300' :
                      'bg-yellow-100 border border-yellow-300'
                    }`}>
                      <div className="font-bold text-xs">{room.roomNumber}</div>
                      <div>{statusLabel(room.status)}</div>
                      {room.currentBooking?.user?.firstName && <div className="text-gray-500 truncate">{room.currentBooking.user.firstName}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Queue */}
              {queue.length > 0 && (
                <div className="p-2 border-b">
                  <div className="text-[10px] font-bold text-gray-400 mb-1">תור ({queue.length})</div>
                  {queue.map((entry, i) => (
                    <div key={entry.id} className="bg-blue-50 rounded-lg p-1.5 mb-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="bg-blue-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">{i+1}</span>
                        <span className="text-xs font-medium">{entry.booking.user?.firstName} {entry.booking.user?.lastName?.[0]}.</span>
                        <span className="text-[10px] text-gray-500">{entry.booking.timeSlotStart}</span>
                      </div>
                      {availableRooms.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {availableRooms.map(room => (
                            <button key={room.id} onClick={action(() => handleAssign(entry.booking.id, room.id))}
                              className="bg-green-500 text-white px-2 py-0.5 rounded text-[10px] hover:bg-green-600 transition">
                              חדר {room.roomNumber}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Bookings to arrive */}
              <div className="p-2">
                <div className="text-[10px] font-bold text-gray-400 mb-1">הזמנות להגעה</div>
                {bookings.filter(b => ['confirmed', 'pending_payment'].includes(b.status)).map(b => (
                  <div key={b.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-1.5 mb-1">
                    <div className="text-xs">
                      <span className="font-medium">{b.user?.firstName} {b.user?.lastName?.[0]}.</span>
                      <span className="text-[10px] text-gray-500 mr-1">{b.timeSlotStart}</span>
                      {b.paymentStatus !== 'paid' && <span className="text-[10px] text-red-500 mr-1">לא שולם</span>}
                    </div>
                    <button onClick={action(() => handleArrived(b.id))}
                      className="bg-blue-500 text-white px-2 py-0.5 rounded text-[10px] hover:bg-blue-600 transition">הגיעה</button>
                  </div>
                ))}
                {bookings.filter(b => ['confirmed', 'pending_payment'].includes(b.status)).length === 0 && (
                  <div className="text-center text-[10px] text-gray-300 py-2">כל ההזמנות הגיעו</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Attendant */}
        <div className="col-span-2 overflow-y-auto">
          <div className="bg-white rounded-xl shadow border border-purple-200 overflow-hidden h-full flex flex-col">
            <div className="bg-purple-600 text-white px-3 py-1.5 flex items-center gap-1.5 shrink-0">
              <Droplets size={14} />
              <span className="font-bold text-xs">בלנית</span>
              <button onClick={() => setShowManualQueue(!showManualQueue)}
                className="mr-auto bg-purple-500 hover:bg-purple-400 text-white px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5 transition">
                <UserPlus size={9} />הוספה לתור
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {/* Manual queue add */}
              {showManualQueue && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 space-y-1">
                  <input value={manualForm.phone} onChange={e => setManualForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="טלפון *" className="w-full border rounded px-2 py-1 text-[10px]" dir="ltr" />
                  <div className="grid grid-cols-2 gap-1">
                    <input value={manualForm.firstName} onChange={e => setManualForm(f => ({ ...f, firstName: e.target.value }))}
                      placeholder="שם פרטי" className="border rounded px-2 py-1 text-[10px]" />
                    <input value={manualForm.lastName} onChange={e => setManualForm(f => ({ ...f, lastName: e.target.value }))}
                      placeholder="משפחה" className="border rounded px-2 py-1 text-[10px]" />
                  </div>
                  <button onClick={action(handleManualAdd)} disabled={!manualForm.phone || manualAdding}
                    className="w-full bg-blue-500 text-white py-1 rounded text-[10px] font-medium hover:bg-blue-600 disabled:opacity-50 transition">
                    {manualAdding ? 'מוסיף...' : 'הוסף לתור'}
                  </button>
                </div>
              )}
              {attData?.readyForImmersion?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-red-600 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />ממתינות
                  </div>
                  {attData.readyForImmersion.map((room: Room) => (
                    <div key={room.id} className="bg-red-50 border border-red-200 rounded-lg p-1.5 mb-1">
                      <div className="flex items-center justify-between">
                        <div className="text-xs">
                          <span className="font-bold">חדר {room.roomNumber}</span>
                          <span className="text-gray-500 mr-1">{room.currentBooking?.user?.firstName}</span>
                          {room.statusChangedAt && <div className="text-[10px] text-red-500">{timeSince(room.statusChangedAt)}</div>}
                        </div>
                        <button onClick={action(() => handleAttendantArrive(room.id))}
                          className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-red-600">ניגשת</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {attData?.inPreparation?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-yellow-600 mb-1">בהכנה</div>
                  {attData.inPreparation.map((room: Room) => (
                    <div key={room.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-1.5 mb-1 text-xs">
                      <span className="font-bold">חדר {room.roomNumber}</span> {room.currentBooking?.user?.firstName}
                      {room.statusChangedAt && <span className="text-[10px] text-yellow-600 mr-1">{timeSince(room.statusChangedAt)}</span>}
                    </div>
                  ))}
                </div>
              )}
              {attData?.inImmersion?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-green-600 mb-1">בטבילה</div>
                  {attData.inImmersion.map((room: Room) => (
                    <div key={room.id} className="bg-green-50 border border-green-200 rounded-lg p-1.5 mb-1 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="font-bold">חדר {room.roomNumber}</span> {room.currentBooking?.user?.firstName}
                      </div>
                      <button onClick={action(() => handleComplete(room.id))}
                        className="bg-green-500 text-white px-2 py-0.5 rounded text-[10px] hover:bg-green-600">סיום</button>
                    </div>
                  ))}
                </div>
              )}
              {attData?.needsCleaning?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-gray-500 mb-1">ניקיון</div>
                  <div className="flex gap-1 flex-wrap">
                    {attData.needsCleaning.map((room: Room) => (
                      <button key={room.id} onClick={action(() => handleClean(room.id))}
                        className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-[10px] hover:bg-gray-200">
                        {room.roomNumber} ✓
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 4: Tablet */}
        <div className="col-span-3 overflow-y-auto">
          <div className="bg-white rounded-xl shadow border border-teal-200 overflow-hidden h-full flex flex-col">
            <div className="bg-teal-600 text-white px-3 py-1.5 flex items-center gap-1.5 shrink-0">
              <Tablet size={14} />
              <span className="font-bold text-xs">טאבלט חדר</span>
              <select value={selectedTabletRoom}
                onChange={e => { setSelectedTabletRoom(e.target.value); setTabletReady(false); setSessionEnded(false); setShowMusic(false); setShowExit(false); setTabletChecklist({ nail_polish: false, shampoo: false, comb: false, final_check: false }); }}
                className="mr-auto text-[10px] bg-teal-700 text-white rounded px-1 py-0.5 border-0">
                {rooms.filter(r => r.currentBooking).map(r => (
                  <option key={r.id} value={r.id}>חדר {r.roomNumber} - {r.currentBooking?.user?.firstName}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {(() => {
                const room = rooms.find(r => r.id === selectedTabletRoom);
                const isWaiting = room?.status === 'waiting_for_attendant' || tabletReady;

                if (sessionEnded) {
                  return (
                    <div className="text-center py-8 bg-green-50 rounded-xl">
                      <div className="text-3xl mb-2">✓</div>
                      <div className="text-lg font-bold text-green-800">תודה על ביקורך!</div>
                      <div className="text-sm text-green-600">המוזיקה והחדר מתאפסים...</div>
                    </div>
                  );
                }

                if (isWaiting) {
                  return (
                    <div className="text-center py-8 bg-blue-50 rounded-xl">
                      <div className="text-4xl mb-3">🕊</div>
                      <div className="text-lg font-bold text-blue-900">הבלנית בדרך אלייך</div>
                      <div className="text-sm text-blue-600">אנא המתיני...</div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    <div className="text-center text-sm text-teal-600">ברוכה הבאה, {room?.currentBooking?.user?.firstName || 'אורחת'}!</div>

                    {/* Clock */}
                    <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-around">
                      <div className="text-center">
                        <Clock className="mx-auto text-blue-500" size={14} />
                        <div className="text-sm font-mono font-bold">{new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-gray-400">זמן בחדר</div>
                        <div className="text-sm font-mono font-bold">{timeSince(room?.statusChangedAt)}</div>
                      </div>
                    </div>

                    {/* Now Playing mini bar */}
                    {currentTrack && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-1.5 flex items-center gap-2">
                        <Music size={12} className="text-purple-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-medium truncate">{currentTrack.title}</div>
                          <div className="text-[9px] text-gray-400 truncate">{currentTrack.artist}</div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <button onClick={action(handlePrevTrack)} className="p-0.5 hover:bg-purple-100 rounded"><SkipForward size={10} className="text-purple-500" /></button>
                          <button onClick={action(() => setIsPlaying(!isPlaying))} className="p-0.5 hover:bg-purple-100 rounded">
                            {isPlaying ? <Pause size={12} className="text-purple-500" /> : <Play size={12} className="text-purple-500" />}
                          </button>
                          <button onClick={action(handleNextTrack)} className="p-0.5 hover:bg-purple-100 rounded"><SkipBack size={10} className="text-purple-500" /></button>
                          <button onClick={action(() => handleVolumeChange(volume > 0 ? 0 : 50))} className="p-0.5 hover:bg-purple-100 rounded">
                            {volume > 0 ? <Volume2 size={10} className="text-purple-500" /> : <VolumeX size={10} className="text-red-400" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Checklist */}
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 mb-1">רשימת הכנה</div>
                      {Object.entries(DEFAULT_CHECKLIST).map(([key, label]) => (
                        <button key={key}
                          onClick={action(() => setTabletChecklist(prev => ({ ...prev, [key]: !prev[key] })))}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-lg mb-1 text-xs transition ${
                            tabletChecklist[key] ? 'bg-green-50 border border-green-300' : 'bg-gray-50 border border-gray-200'
                          }`}>
                          <CheckCircle className={tabletChecklist[key] ? 'text-green-500' : 'text-gray-300'} size={16} />
                          <span className={tabletChecklist[key] ? 'line-through text-gray-400' : ''}>{label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Quick actions row */}
                    <div className="flex gap-1">
                      {['מגבת', 'סבון', 'מסרק'].map(item => (
                        <button key={item} onClick={action(() => notify(`${item} - בקשה נשלחה`))}
                          className="bg-orange-50 border border-orange-200 rounded px-2 py-1 text-[10px] hover:bg-orange-100 flex items-center gap-1 transition flex-1">
                          <Package size={10} className="text-orange-500" />{item}
                        </button>
                      ))}
                      <button onClick={action(() => { setShowMusic(!showMusic); setShowExit(false); })}
                        className={`border rounded px-2 py-1 text-[10px] flex items-center gap-1 transition flex-1 ${showMusic ? 'bg-purple-100 border-purple-300' : 'bg-purple-50 border-purple-200 hover:bg-purple-100'}`}>
                        <Music size={10} className="text-purple-500" />מוזיקה
                      </button>
                      <button onClick={action(() => { setShowExit(!showExit); setShowMusic(false); })}
                        className={`border rounded px-2 py-1 text-[10px] flex items-center gap-1 transition flex-1 ${showExit ? 'bg-red-100 border-red-300' : 'bg-red-50 border-red-200 hover:bg-red-100'}`}>
                        <LogOut size={10} className="text-red-500" />יציאה
                      </button>
                    </div>

                    {/* Music panel */}
                    {showMusic && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 space-y-2">
                        <div className="text-[10px] font-bold text-purple-700">בחירת מוזיקה</div>
                        {/* Volume slider */}
                        <div className="flex items-center gap-2">
                          <VolumeX size={10} className="text-gray-400" />
                          <input type="range" min={0} max={100} value={volume}
                            onChange={e => handleVolumeChange(Number(e.target.value))}
                            className="flex-1 h-1 accent-purple-500" />
                          <Volume2 size={10} className="text-gray-400" />
                          <span className="text-[9px] text-gray-500 w-6 text-center">{volume}</span>
                        </div>
                        {/* Track list */}
                        <div className="max-h-28 overflow-y-auto space-y-1">
                          {musicTracks.map(track => (
                            <button key={track.id} onClick={action(() => handleMusicChange(track.id))}
                              className={`w-full text-right p-1.5 rounded text-[10px] transition ${
                                currentTrackId === track.id ? 'bg-purple-200 border border-purple-400' : 'bg-white hover:bg-purple-100 border border-transparent'
                              }`}>
                              <div className="font-medium">{track.title}</div>
                              <div className="text-[9px] text-gray-400">{track.artist}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exit panel */}
                    {showExit && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2 space-y-2">
                        <div className="text-[10px] font-bold text-red-700">יציאה מהחדר</div>
                        <div className="flex gap-1">
                          <input value={exitCode} onChange={e => setExitCode(e.target.value)}
                            placeholder="קוד יציאה (1234)" maxLength={4} dir="ltr"
                            className="flex-1 border rounded px-2 py-1 text-xs text-center" />
                          <button onClick={action(handleExitCode)}
                            disabled={exitCode.length < 4}
                            className="bg-red-500 text-white px-3 py-1 rounded text-[10px] hover:bg-red-600 disabled:opacity-50 transition">
                            אישור
                          </button>
                        </div>
                        <button onClick={action(handleExitMainDoor)}
                          className="w-full bg-gray-500 text-white py-1.5 rounded text-[10px] hover:bg-gray-600 transition flex items-center justify-center gap-1">
                          <LogOut size={10} />יציאה דרך דלת ראשית
                        </button>
                      </div>
                    )}

                    {/* Ready button */}
                    <button onClick={action(handleTabletReady)}
                      className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-teal-700 transition">
                      מוכנה לטבילה
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
