import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { tabletApi } from '../lib/api';
import { useRoomSocket } from '../hooks/useSocket';
import {
  Clock, Music, Package, CheckCircle, Timer,
  Volume2, VolumeX, SkipForward, SkipBack, Play, Pause,
  LogOut, KeyRound, Star,
} from 'lucide-react';
import type { MusicTrack } from '../types';

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

const CATEGORY_LABELS: Record<string, string> = {
  relaxing: 'מרגיעה',
  nature: 'צלילי טבע',
  classical: 'קלאסית',
  spiritual: 'רוחנית',
  general: 'כללי',
};

export default function RoomTablet() {
  const { roomId } = useParams<{ roomId: string }>();
  const [data, setData] = useState<any>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [showEquipment, setShowEquipment] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [isReady, setIsReady] = useState(false);
  const [waitingForAttendant, setWaitingForAttendant] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [time, setTime] = useState(new Date());
  const [timerStart, setTimerStart] = useState<Date | null>(null);

  // Music state
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(true);
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Exit state
  const [exitCode, setExitCode] = useState('');
  const [exitError, setExitError] = useState('');

  const loadData = useCallback(async () => {
    if (!roomId) return;
    const res = await tabletApi.getRoomInfo(roomId);
    setData(res.data);
    if (res.data.session?.preparationChecklist) {
      setChecklist(res.data.session.preparationChecklist);
    }
    if (res.data.musicTracks) {
      setMusicTracks(res.data.musicTracks);
    }
    if (res.data.currentTrack) {
      setCurrentTrackId(res.data.currentTrack.id);
    }
    if (res.data.musicVolume !== undefined) {
      setVolume(res.data.musicVolume);
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

  // Music handlers
  const handleChangeTrack = async (trackId: string) => {
    if (!roomId) return;
    setCurrentTrackId(trackId);
    setIsPlaying(true);
    await tabletApi.changeMusic(roomId, trackId, volume);
  };

  const handleVolumeChange = async (newVolume: number) => {
    if (!roomId) return;
    const v = Math.min(100, Math.max(0, newVolume));
    setVolume(v);
    await tabletApi.changeVolume(roomId, v);
  };

  const handleNextTrack = () => {
    const idx = musicTracks.findIndex(t => t.id === currentTrackId);
    const next = musicTracks[(idx + 1) % musicTracks.length];
    if (next) handleChangeTrack(next.id);
  };

  const handlePrevTrack = () => {
    const idx = musicTracks.findIndex(t => t.id === currentTrackId);
    const prev = musicTracks[(idx - 1 + musicTracks.length) % musicTracks.length];
    if (prev) handleChangeTrack(prev.id);
  };

  // Exit handlers
  const handleExitWithCode = async () => {
    if (!roomId || exitCode.length < 4) {
      setExitError('נא להזין קוד בן 4 ספרות');
      return;
    }
    try {
      await tabletApi.verifyExitCode(roomId, exitCode);
      setSessionEnded(true);
    } catch {
      setExitError('קוד שגוי, נסי שוב');
    }
  };

  const handleExitMainDoor = async () => {
    if (!roomId) return;
    await tabletApi.exitRoom(roomId, 'main_door');
    setSessionEnded(true);
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

  const currentTrack = musicTracks.find(t => t.id === currentTrackId);
  const filteredTracks = selectedCategory
    ? musicTracks.filter(t => t.category === selectedCategory)
    : musicTracks;
  const categories = [...new Set(musicTracks.map(t => t.category))];

  // Session ended screen
  if (sessionEnded) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">&#10004;&#65039;</div>
          <h1 className="text-3xl font-bold text-green-900 mb-4">
            תודה שביקרת!
          </h1>
          <p className="text-xl text-green-600">המוזיקה אופסה לברירת מחדל</p>
          <p className="text-lg text-green-500 mt-2">החדר מוכן לאורחת הבאה</p>
        </div>
      </div>
    );
  }

  if (waitingForAttendant) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">&#128330;</div>
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
            onClick={() => setTimerStart(timerStart ? null : new Date())}
            className="text-sm text-purple-600 hover:underline mt-1"
          >
            {timerStart ? 'איפוס' : 'התחלה'}
          </button>
        </div>
      </div>

      {/* Now Playing mini bar */}
      {currentTrack && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music className="text-purple-500" size={20} />
            <div>
              <div className="font-medium text-purple-900 text-sm">{currentTrack.title}</div>
              {currentTrack.artist && <div className="text-xs text-purple-500">{currentTrack.artist}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrevTrack} className="p-1 hover:bg-purple-100 rounded-full">
              <SkipBack size={16} className="text-purple-600" />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-1 hover:bg-purple-100 rounded-full">
              {isPlaying ? <Pause size={16} className="text-purple-600" /> : <Play size={16} className="text-purple-600" />}
            </button>
            <button onClick={handleNextTrack} className="p-1 hover:bg-purple-100 rounded-full">
              <SkipForward size={16} className="text-purple-600" />
            </button>
            <button onClick={() => handleVolumeChange(volume === 0 ? 50 : 0)} className="p-1 hover:bg-purple-100 rounded-full mr-1">
              {volume === 0 ? <VolumeX size={16} className="text-purple-600" /> : <Volume2 size={16} className="text-purple-600" />}
            </button>
          </div>
        </div>
      )}

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
                className={checklist[key] ? 'text-green-500' : 'text-gray-300'}
                size={24}
              />
              <span className={`text-lg ${checklist[key] ? 'line-through text-gray-400' : ''}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => { setShowEquipment(!showEquipment); setShowMusic(false); setShowExit(false); }}
          className={`bg-white rounded-2xl shadow p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition ${showEquipment ? 'ring-2 ring-orange-400' : ''}`}
        >
          <Package className="text-orange-500" size={32} />
          <span className="font-medium text-sm">בקשת ציוד</span>
        </button>
        <button
          onClick={() => { setShowMusic(!showMusic); setShowEquipment(false); setShowExit(false); }}
          className={`bg-white rounded-2xl shadow p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition ${showMusic ? 'ring-2 ring-purple-400' : ''}`}
        >
          <Music className="text-purple-500" size={32} />
          <span className="font-medium text-sm">מוזיקה</span>
        </button>
        <button
          onClick={() => { setShowExit(!showExit); setShowEquipment(false); setShowMusic(false); }}
          className={`bg-white rounded-2xl shadow p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition ${showExit ? 'ring-2 ring-red-400' : ''}`}
        >
          <LogOut className="text-red-500" size={32} />
          <span className="font-medium text-sm">יציאה</span>
        </button>
      </div>

      {/* Music panel */}
      {showMusic && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Music size={20} className="text-purple-500" />
            בחירת מוזיקה
          </h2>

          {/* Volume control */}
          <div className="flex items-center gap-4 mb-5 bg-purple-50 rounded-xl p-4">
            <VolumeX size={18} className="text-purple-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
              className="flex-1 accent-purple-600 h-2"
            />
            <Volume2 size={18} className="text-purple-400" />
            <span className="text-sm font-mono text-purple-700 w-10 text-center">{volume}%</span>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`text-xs px-3 py-1 rounded-full transition ${!selectedCategory ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              הכל
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full transition ${selectedCategory === cat ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          {/* Track list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredTracks.map(track => (
              <button
                key={track.id}
                onClick={() => handleChangeTrack(track.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-right ${
                  currentTrackId === track.id
                    ? 'bg-purple-100 border-2 border-purple-400'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentTrackId === track.id ? 'bg-purple-500' : 'bg-gray-300'
                }`}>
                  {currentTrackId === track.id && isPlaying ? (
                    <Pause size={14} className="text-white" />
                  ) : (
                    <Play size={14} className="text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    {track.title}
                    {track.isDefault && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
                  </div>
                  {track.artist && <div className="text-xs text-gray-400">{track.artist}</div>}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {CATEGORY_LABELS[track.category] || track.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

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

      {/* Exit panel */}
      {showExit && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <LogOut size={20} className="text-red-500" />
            יציאה מהחדר
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            ביציאה, המוזיקה תתאפס לברירת המחדל והחדר יסומן לניקיון.
          </p>

          {/* Exit by code */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound size={16} className="text-gray-500" />
              <span className="font-medium text-sm">יציאה עם קוד</span>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                maxLength={4}
                value={exitCode}
                onChange={(e) => { setExitCode(e.target.value.replace(/\D/g, '')); setExitError(''); }}
                placeholder="הזיני קוד 4 ספרות"
                className="flex-1 border rounded-lg px-4 py-2 text-center text-2xl font-mono tracking-widest"
                dir="ltr"
              />
              <button
                onClick={handleExitWithCode}
                disabled={exitCode.length < 4}
                className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 transition"
              >
                אישור
              </button>
            </div>
            {exitError && <p className="text-red-500 text-sm mt-2">{exitError}</p>}
          </div>

          {/* Exit via main door */}
          <button
            onClick={handleExitMainDoor}
            className="w-full bg-gray-600 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            יציאה דרך הדלת הראשית
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
