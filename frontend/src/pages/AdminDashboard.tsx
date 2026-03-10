import { useState, useEffect, useCallback } from 'react';
import api, { adminApi, roomsApi } from '../lib/api';
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
  Send,
  Save,
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
                if (item.path) navigate(item.path);
                else setActiveTab(item.key);
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
      <main className="flex-1 p-8 overflow-auto">
        {activeTab === 'dashboard' && <DashboardTab data={data} />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'rooms' && <RoomsTab rooms={data?.rooms} onRefresh={loadData} />}
        {activeTab === 'attendants' && <AttendantsTab />}
        {activeTab === 'schedule' && <ScheduleTab />}
        {activeTab === 'pricing' && <PricingTab />}
        {activeTab === 'sms' && <SmsTab />}
        {activeTab === 'features' && <FeaturesTab />}
        {activeTab === 'audit' && <AuditTab />}
      </main>
    </div>
  );
}

// ======= DASHBOARD TAB =======
function DashboardTab({ data }: { data: any }) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">דשבורד ניהולי</h2>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString('he-IL')}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'הזמנות היום', value: data.stats.totalBookings },
          { label: 'הגיעו', value: data.stats.arrived },
          { label: 'הושלמו', value: data.stats.completed },
          { label: 'ממתינות', value: data.stats.waiting },
          { label: 'בחדרים', value: data.stats.inRooms },
          { label: 'ביטולים', value: data.stats.cancelled },
          { label: 'No-Show', value: data.stats.noShow },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className="text-3xl font-bold mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

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
                Date.now() - new Date(r.statusChangedAt).getTime() > 20 * 60000,
            )
            .map((r: any) => (
              <div key={r.id} className="text-sm text-amber-700">
                חדר {r.roomNumber} – הכנה מעל 20 דקות
              </div>
            ))}
        </div>
      )}
    </>
  );
}

// ======= SETTINGS TAB =======
function SettingsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    adminApi.settings(LOCATION_ID).then((res) => {
      const s = res.data;
      setName(s.name || '');
      setAddress(s.address || '');
      setPhone(s.phone || '');
      setTimezone(s.timezone || 'Asia/Jerusalem');
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await adminApi.updateSettings(LOCATION_ID, { name, address, phone, timezone });
    setSaving(false);
  };

  if (loading) return <div className="text-gray-400">טוען...</div>;

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">הגדרות מקווה</h2>
      <div className="bg-white rounded-xl shadow-sm border p-6 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם המקווה</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-4 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">כתובת</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border rounded-lg px-4 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg px-4 py-2" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">אזור זמן</label>
          <input value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full border rounded-lg px-4 py-2" dir="ltr" />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
        >
          <Save size={16} />
          {saving ? 'שומר...' : 'שמור'}
        </button>
      </div>
    </>
  );
}

// ======= ROOMS TAB =======
function RoomsTab({ rooms, onRefresh }: { rooms: any[]; onRefresh: () => void }) {
  const handleStatusChange = async (roomId: string, status: string) => {
    await roomsApi.updateStatus(roomId, status);
    onRefresh();
  };

  const handleClean = async (roomId: string) => {
    await roomsApi.clean(roomId);
    onRefresh();
  };

  const statusOptions = ['available', 'out_of_service', 'cleaning_required', 'cleaning_in_progress'];
  const statusLabels: Record<string, string> = {
    available: 'פנוי',
    reserved: 'שמור',
    occupied: 'תפוס',
    preparation: 'הכנה',
    waiting_for_attendant: 'מוכנה לטבילה',
    immersion: 'טבילה',
    cleaning_required: 'ניקיון נדרש',
    cleaning_in_progress: 'בניקיון',
    out_of_service: 'לא פעיל',
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">ניהול חדרים</h2>
      <div className="grid grid-cols-3 gap-4">
        {rooms?.map((room: any) => (
          <div key={room.id} className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">חדר {room.roomNumber}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100">{room.roomType}</span>
            </div>
            <div className="text-sm text-gray-600 mb-3">
              סטטוס: <strong>{statusLabels[room.status] || room.status}</strong>
            </div>
            <div className="text-xs text-gray-400 mb-3">{room.hasBathtub ? 'אמבטיה' : 'מקלחת'}</div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(room.id, st)}
                  disabled={room.status === st}
                  className={`text-xs px-2 py-1 rounded border transition ${
                    room.status === st ? 'bg-blue-100 border-blue-300 text-blue-700' : 'hover:bg-gray-50'
                  }`}
                >
                  {statusLabels[st]}
                </button>
              ))}
              {room.status === 'cleaning_required' && (
                <button
                  onClick={() => handleClean(room.id)}
                  className="text-xs px-2 py-1 rounded border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition"
                >
                  סיום ניקיון
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ======= ATTENDANTS TAB =======
function AttendantsTab() {
  const [attendants, setAttendants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.dashboard(LOCATION_ID).then((res) => {
      setAttendants(res.data.attendants || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-gray-400">טוען...</div>;

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">ניהול בלניות</h2>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-right p-3">שם</th>
              <th className="text-right p-3">טלפון</th>
              <th className="text-right p-3">סטטוס</th>
              <th className="text-right p-3">במשמרת</th>
            </tr>
          </thead>
          <tbody>
            {attendants.map((att: any) => (
              <tr key={att.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{att.displayName}</td>
                <td className="p-3 font-mono text-xs" dir="ltr">{att.user?.phone || '-'}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${att.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {att.isActive ? 'פעילה' : 'לא פעילה'}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${att.isOnDuty ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {att.isOnDuty ? 'כן' : 'לא'}
                  </span>
                </td>
              </tr>
            ))}
            {attendants.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-gray-400">אין בלניות רשומות</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ======= SCHEDULE TAB =======
function ScheduleTab() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  useEffect(() => {
    api.get('/schedules', { params: { locationId: LOCATION_ID } }).then((res) => {
      setSchedules(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400">טוען...</div>;

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">לוח זמנים</h2>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-right p-3">יום</th>
              <th className="text-right p-3">פתיחה</th>
              <th className="text-right p-3">סגירה</th>
              <th className="text-right p-3">מקס הזמנות</th>
              <th className="text-right p-3">משך slot</th>
              <th className="text-right p-3">פעיל</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((sch: any) => (
              <tr key={sch.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{days[sch.dayOfWeek]}</td>
                <td className="p-3 font-mono" dir="ltr">{sch.openTime}</td>
                <td className="p-3 font-mono" dir="ltr">{sch.closeTime}</td>
                <td className="p-3">{sch.maxConcurrentBookings}</td>
                <td className="p-3">{sch.slotDurationMinutes} דק</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${sch.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {sch.isActive ? 'כן' : 'לא'}
                  </span>
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">לא הוגדר לוח זמנים</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ======= PRICING TAB =======
function PricingTab() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const roomTypeLabels: Record<string, string> = { standard: 'רגיל', premium: 'פרמיום', accessible: 'נגיש' };

  useEffect(() => {
    api.get('/pricing', { params: { locationId: LOCATION_ID } }).then((res) => {
      setRules(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400">טוען...</div>;

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">ניהול מחירים</h2>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-right p-3">שם תעריף</th>
              <th className="text-right p-3">סוג חדר</th>
              <th className="text-right p-3">מחיר</th>
              <th className="text-right p-3">מ-תאריך</th>
              <th className="text-right p-3">עד-תאריך</th>
              <th className="text-right p-3">פעיל</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule: any) => (
              <tr key={rule.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{rule.name}</td>
                <td className="p-3">{roomTypeLabels[rule.roomType] || rule.roomType}</td>
                <td className="p-3 font-bold">&#8362;{rule.price}</td>
                <td className="p-3 text-xs">{rule.validFrom ? new Date(rule.validFrom).toLocaleDateString('he-IL') : '-'}</td>
                <td className="p-3 text-xs">{rule.validUntil ? new Date(rule.validUntil).toLocaleDateString('he-IL') : '-'}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {rule.isActive ? 'כן' : 'לא'}
                  </span>
                </td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">לא הוגדרו תעריפים</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ======= SMS TAB =======
function SmsTab() {
  const [recipientPhone, setRecipientPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!recipientPhone || !message) return;
    setSending(true);
    try {
      await adminApi.sendSms(LOCATION_ID, recipientPhone, message);
      setSent(true);
      setRecipientPhone('');
      setMessage('');
      setTimeout(() => setSent(false), 3000);
    } catch {
      alert('שגיאה בשליחת SMS');
    }
    setSending(false);
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">שליחת SMS</h2>
      <div className="bg-white rounded-xl shadow-sm border p-6 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">מספר טלפון נמען</label>
          <input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="050-1234567" className="w-full border rounded-lg px-4 py-2" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תוכן ההודעה</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="הקלידי את ההודעה..." className="w-full border rounded-lg px-4 py-3 resize-none h-32" />
        </div>
        {sent && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">ההודעה נשלחה בהצלחה!</div>}
        <button
          onClick={handleSend}
          disabled={sending || !recipientPhone || !message}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
        >
          <Send size={16} />
          {sending ? 'שולח...' : 'שלח SMS'}
        </button>
      </div>
    </>
  );
}

// ======= FEATURES TAB =======
function FeaturesTab() {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.dashboard(LOCATION_ID).then((res) => {
      setFeatures(res.data.features || []);
      setLoading(false);
    });
  }, []);

  const toggleFeature = async (key: string, currentState: boolean) => {
    await adminApi.toggleFeature(LOCATION_ID, key, !currentState);
    setFeatures((prev) => prev.map((f) => (f.featureKey === key ? { ...f, isEnabled: !currentState } : f)));
  };

  const featureLabels: Record<string, string> = {
    room_tablet: 'טאבלט חדר',
    music_control: 'בקרת מוזיקה',
    access_control: 'בקרת כניסה (AKUVOX)',
    hallway_display: 'מסך מסדרון',
    saved_cards: 'כרטיסים שמורים',
    sms_blast: 'SMS תפוצה',
    advanced_reports: 'דוחות מתקדמים',
    auto_overtime_alert: 'התראת overtime אוטומטית',
  };

  if (loading) return <div className="text-gray-400">טוען...</div>;

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">ניהול פיצ׳רים</h2>
      <div className="bg-white rounded-xl shadow-sm border divide-y max-w-2xl">
        {features.map((f: any) => (
          <div key={f.featureKey} className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">{featureLabels[f.featureKey] || f.featureKey}</div>
              <div className="text-xs text-gray-400 font-mono">{f.featureKey}</div>
            </div>
            <button
              onClick={() => toggleFeature(f.featureKey, f.isEnabled)}
              className={`relative w-12 h-6 rounded-full transition ${f.isEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${f.isEnabled ? 'left-0.5' : 'right-0.5'}`} />
            </button>
          </div>
        ))}
        {features.length === 0 && <div className="p-6 text-center text-gray-400">אין פיצ׳רים מוגדרים</div>}
      </div>
    </>
  );
}

// ======= AUDIT TAB =======
function AuditTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.auditLog(LOCATION_ID).then((res) => {
      setLogs(res.data);
      setLoading(false);
    });
  }, []);

  const actionLabels: Record<string, string> = {
    manual_assign: 'שיבוץ ידני',
    override_queue: 'עקיפת תור',
    change_status: 'שינוי סטטוס',
    change_price: 'שינוי מחיר',
    change_schedule: 'שינוי לו"ז',
    send_sms: 'שליחת SMS',
    toggle_feature: 'שינוי פיצ׳ר',
  };

  if (loading) return <div className="text-gray-400">טוען...</div>;

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">לוג פעולות מנהל</h2>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-right p-3">תאריך</th>
              <th className="text-right p-3">פעולה</th>
              <th className="text-right p-3">ישות</th>
              <th className="text-right p-3">פרטים</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString('he-IL')}</td>
                <td className="p-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    {actionLabels[log.actionType] || log.actionType}
                  </span>
                </td>
                <td className="p-3 text-xs">{log.entityType} #{log.entityId?.slice(0, 8)}</td>
                <td className="p-3 text-xs text-gray-500 max-w-xs truncate">{log.details ? JSON.stringify(log.details) : '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-gray-400">אין פעולות בלוג</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
