import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const sendCode = async () => {
    setLoading(true);
    setError('');
    try {
      await authApi.sendCode(phone);
      setCodeSent(true);
    } catch {
      setError('שגיאה בשליחת קוד');
    }
    setLoading(false);
  };

  const verify = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.verify(phone, code);
      localStorage.setItem('zentro_token', data.accessToken);
      localStorage.setItem('zentro_user', JSON.stringify(data.user));
      navigate(data.user.isAdmin ? '/admin' : '/reception');
    } catch {
      setError('קוד שגוי');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-2">
          ZENTRO Mikveh
        </h1>
        <p className="text-center text-gray-500 mb-8">ברוכה הבאה</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              מספר טלפון
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="050-1234567"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              dir="ltr"
            />
          </div>

          {!codeSent ? (
            <button
              onClick={sendCode}
              disabled={loading || !phone}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? '...' : 'שלחי קוד אימות'}
            </button>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  קוד אימות (SMS)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="1234"
                  maxLength={4}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-center tracking-widest"
                  dir="ltr"
                />
              </div>
              <button
                onClick={verify}
                disabled={loading || code.length !== 4}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? '...' : 'כניסה'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
