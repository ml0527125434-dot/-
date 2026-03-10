import { useState } from 'react';
import { adminApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Download } from 'lucide-react';

const LOCATION_ID = localStorage.getItem('zentro_location') || '';

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadReport = async () => {
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    const res = await adminApi.reports(LOCATION_ID, dateFrom, dateTo);
    setReport(res.data);
    setLoading(false);
  };

  const exportReport = async () => {
    const res = await adminApi.exportReport(LOCATION_ID, dateFrom, dateTo);
    const data = res.data;

    // Convert to CSV
    if (data.rows?.length > 0) {
      const headers = Object.keys(data.rows[0]);
      const csvContent = [
        headers.join(','),
        ...data.rows.map((row: any) =>
          headers.map((h) => `"${row[h] ?? ''}"`).join(','),
        ),
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zentro-report-${dateFrom}-${dateTo}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const statusLabel: Record<string, string> = {
    completed: 'הושלם',
    cancelled: 'בוטל',
    no_show: 'לא הגיעה',
    confirmed: 'מאושר',
    arrived: 'הגיעה',
    assigned: 'בחדר',
    in_progress: 'בטבילה',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowRight size={20} />
          </button>
          <h1 className="text-2xl font-bold">דוחות</h1>
        </div>

        {/* Date range */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              מתאריך
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              עד תאריך
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          <button
            onClick={loadReport}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? '...' : 'הצג'}
          </button>
          {report && (
            <button
              onClick={exportReport}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
            >
              <Download size={16} />
              ייצוא CSV
            </button>
          )}
        </div>

        {/* Summary */}
        {report && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'סה"כ הזמנות', value: report.summary.totalBookings },
                { label: 'הושלמו', value: report.summary.completed },
                { label: 'ביטולים', value: report.summary.cancelled },
                { label: 'No-Show', value: report.summary.noShow },
                {
                  label: 'הכנסות',
                  value: `₪${report.summary.totalRevenue.toLocaleString()}`,
                },
                {
                  label: 'ממוצע',
                  value: `₪${Math.round(report.summary.averagePrice)}`,
                },
                { label: 'מקלחות', value: report.summary.showerCount },
                { label: 'אמבטיות', value: report.summary.bathtubCount },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl shadow-sm border p-4"
                >
                  <div className="text-sm text-gray-500">{stat.label}</div>
                  <div className="text-2xl font-bold mt-1">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Bookings table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-right p-3">תאריך</th>
                    <th className="text-right p-3">שעה</th>
                    <th className="text-right p-3">שם</th>
                    <th className="text-right p-3">חדר</th>
                    <th className="text-right p-3">סטטוס</th>
                    <th className="text-right p-3">תשלום</th>
                  </tr>
                </thead>
                <tbody>
                  {report.bookings.map((b: any) => (
                    <tr key={b.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        {new Date(b.bookingDate).toLocaleDateString('he-IL')}
                      </td>
                      <td className="p-3">{b.timeSlotStart}</td>
                      <td className="p-3">
                        {b.user?.firstName || ''} {b.user?.lastName || ''}
                      </td>
                      <td className="p-3">{b.room?.roomNumber || '-'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            b.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : b.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {statusLabel[b.status] || b.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {b.paymentStatus === 'paid' ? '✓' : '✗'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
