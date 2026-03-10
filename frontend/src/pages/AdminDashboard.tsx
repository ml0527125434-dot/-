import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  BarChart3,
  MessageSquare,
  DoorOpen,
  Users,
  Calendar,
  CreditCard,
  ToggleLeft,
  ClipboardList,
} from 'lucide-react';

const LOCATION_ID = localStorage.getItem('zentro_location') || '';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    if (!LOCATION_ID) return;
    const res = await adminApi.dashboard(LOCATION_ID);
    setData(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const menuItems = [
    { key: 'dashboard', label: 'דשבורד', icon: LayoutDashboard },
    { key: 'settings', label: 'הגדרות', icon: Settings },
    { key: 'rooms', label: 'חדרים', icon: DoorOpen },
    { key: 'attendants', label: 'בלניות', icon: Users },
    { key: 'schedule', label: 'לוח זמנים', icon: Calendar },
    { key: 'pricing', label: 'מחירים', icon: CreditCard },
    { key: 'sms', label: 'SMS', icon: MessageSquare },
    { key: 'features', label: 'פיצ׳רים', icon: ToggleLeft },
    { key: 'reports', label: 'דוחות', icon: BarChart3, path: '/admin/reports' },
    { key: 'audit', label: 'לוג', icon: ClipboardList },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-l shadow-sm">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-blue-900">ZENTRO Admin</h1>
        </div>
        <nav className="p-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                } else {
                  setActiveTab(item.key);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right mb-1 transition ${
                activeTab === item.key
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">דשבורד ניהולי</h2>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('he-IL')}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'הזמנות היום', value: data.stats.totalBookings, color: 'blue' },
            { label: 'הגיעו', value: data.stats.arrived, color: 'green' },
            { label: 'הושלמו', value: data.stats.completed, color: 'emerald' },
            { label: 'ממתינות', value: data.stats.waiting, color: 'yellow' },
            { label: 'בחדרים', value: data.stats.inRooms, color: 'purple' },
            { label: 'ביטולים', value: data.stats.cancelled, color: 'red' },
            { label: 'No-Show', value: data.stats.noShow, color: 'gray' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border p-4"
            >
              <div className="text-sm text-gray-500">{stat.label}</div>
              <div className="text-3xl font-bold mt-1">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Room status overview */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">סטטוס חדרים</h3>
          <div className="grid grid-cols-4 gap-3">
            {data.rooms?.map((room: any) => (
              <div
                key={room.id}
                className={`rounded-lg p-3 border text-sm ${
                  room.status === 'available'
                    ? 'bg-green-50 border-green-300'
                    : room.status === 'out_of_service'
                      ? 'bg-gray-100 border-gray-400'
                      : 'bg-blue-50 border-blue-300'
                }`}
              >
                <div className="font-bold">חדר {room.roomNumber}</div>
                <div className="text-xs mt-1">{room.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {data.rooms?.some(
          (r: any) =>
            ['occupied', 'preparation'].includes(r.status) &&
            r.statusChangedAt &&
            Date.now() - new Date(r.statusChangedAt).getTime() > 20 * 60000,
        ) && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
            <h3 className="font-bold text-amber-800 mb-2">התראות</h3>
            {data.rooms
              .filter(
                (r: any) =>
                  ['occupied', 'preparation'].includes(r.status) &&
                  r.statusChangedAt &&
                  Date.now() - new Date(r.statusChangedAt).getTime() >
                    20 * 60000,
              )
              .map((r: any) => (
                <div key={r.id} className="text-sm text-amber-700">
                  חדר {r.roomNumber} – הכנה מעל 20 דקות
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
