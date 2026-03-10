import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { tabletApi } from '../lib/api';
import { useRoomSocket } from '../hooks/useSocket';
import { Clock, Music, Package, CheckCircle, Timer } from 'lucide-react';

const DEFAULT_CHECKLIST: Record<string, string> = {
  nail_polish: 'הסרת לק',
  shampoo: 'חפיפה',
  comb: 'סריקה',
  final_check: 'בדיקה אחרונה',
};

const EQUIPMENT_ITEMS = [
  'מגבת גדולה',
  'מגבת קטנה',
  'סבון',
  'שמפו',
  'מסרק',
  'מייבש שיער',
  'כפכפים',
];

export default function RoomTablet() {
  const { roomId } = useParams<{ roomId: string }>();
  const [data, setData] = useState<any>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [showEquipment, setShowEquipment] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
    {},
  );
  const [isReady, setIsReady] = useState(false);
  const [waitingForAttendant, setWaitingForAttendant] = useState(false);
  const [time, setTime] = useState(new Date());
  const [timerStart, setTimerStart] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    if (!roomId) return;
    const res = await tabletApi.getRoomInfo(roomId);
    setData(res.data);
    if (res.data.session?.preparationChecklist) {
      setChecklist(res.data.session.preparationChecklist);
    }
  }, [roomId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useRoomSocket(roomId, {
    'equipment:delivered': () => loadData(),
    'attendant:arriving': () => setWaitingForAttendant(true),
  });

  const handleChecklistChange = async (key: string) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    if (roomId) {
      await tabletApi.updateChecklist(roomId, updated);
    }
  };

  const handleRequestEquipment = async () => {
    if (!roomId) return;
    const items = Object.entries(selectedItems)
      .filter(([, qty]) => qty > 0)
      .map(([itemType, quantity]) => ({ itemType, quantity }));

    if (items.length > 0) {
      await tabletApi.requestEquipment(roomId, items);
      setSelectedItems({});
      setShowEquipment(false);
      loadData();
    }
  };

  const handleReady = async () => {
    if (!roomId) return;
    await tabletApi.markReady(roomId);
    setIsReady(true);
    setWaitingForAttendant(true);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

  const timerDisplay = () => {
    if (!timerStart) return '00:00';
    const diff = Math.floor((time.getTime() - timerStart.getTime()) / 1000);
    const min = Math.floor(diff / 60);
    const sec = diff % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  if (waitingForAttendant) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🕊</div>
          <h1 className="text-3xl font-bold text-blue-900 mb-4">
            הבלנית בדרך אלייך
          </h1>
          <p className="text-xl text-blue-600">אנא המתיני...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-blue-900">
          חדר {data?.room?.roomNumber}
        </h1>
        {data?.guestName && (
          <p className="text-lg text-blue-600">ברוכה הבאה, {data.guestName}!</p>
        )}
      </div>

      {/* Clock + Timer */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6 flex items-center justify-around">
        <div className="text-center">
          <Clock className="mx-auto mb-2 text-blue-600" size={24} />
          <div className="text-4xl font-mono font-bold text-blue-900">
            {formatTime(time)}
          </div>
          <div className="text-sm text-gray-500">שעון</div>
        </div>
        <div className="text-center">
          <Timer className="mx-auto mb-2 text-purple-600" size={24} />
          <div className="text-4xl font-mono font-bold text-purple-900">
            {timerDisplay()}
          </div>
          <button
            onClick={() =>
              setTimerStart(timerStart ? null : new Date())
            }
            className="text-sm text-purple-600 hover:underline mt-1"
          >
            {timerStart ? 'איפוס' : 'התחלה'}
          </button>
        </div>
      </div>

      {/* Preparation Checklist */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">רשימת הכנה</h2>
        <div className="space-y-3">
          {Object.entries(DEFAULT_CHECKLIST).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleChecklistChange(key)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                checklist[key]
                  ? 'bg-green-50 border border-green-300'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <CheckCircle
                className={
                  checklist[key] ? 'text-green-500' : 'text-gray-300'
                }
                size={24}
              />
              <span
                className={`text-lg ${checklist[key] ? 'line-through text-gray-400' : ''}`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setShowEquipment(!showEquipment)}
          className="bg-white rounded-2xl shadow p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition"
        >
          <Package className="text-orange-500" size={32} />
          <span className="font-medium">בקשת ציוד</span>
        </button>
        <button className="bg-white rounded-2xl shadow p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition">
          <Music className="text-purple-500" size={32} />
          <span className="font-medium">מוזיקה</span>
        </button>
      </div>

      {/* Equipment request panel */}
      {showEquipment && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">בקשת ציוד</h2>
          <div className="space-y-3">
            {EQUIPMENT_ITEMS.map((item) => (
              <div key={item} className="flex items-center justify-between">
                <span>{item}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setSelectedItems((prev) => ({
                        ...prev,
                        [item]: Math.max(0, (prev[item] || 0) - 1),
                      }))
                    }
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-mono">
                    {selectedItems[item] || 0}
                  </span>
                  <button
                    onClick={() =>
                      setSelectedItems((prev) => ({
                        ...prev,
                        [item]: (prev[item] || 0) + 1,
                      }))
                    }
                    className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleRequestEquipment}
            className="w-full mt-4 bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition"
          >
            שלחי בקשה
          </button>
        </div>
      )}

      {/* Ready button */}
      {!isReady && (
        <button
          onClick={handleReady}
          className="w-full bg-blue-600 text-white py-5 rounded-2xl text-xl font-bold hover:bg-blue-700 transition shadow-lg"
        >
          מוכנה לטבילה
        </button>
      )}
    </div>
  );
}
