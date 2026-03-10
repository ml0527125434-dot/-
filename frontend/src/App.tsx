import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import BookingConfirmedPage from './pages/BookingConfirmedPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import ReceptionDashboard from './pages/ReceptionDashboard';
import AttendantDashboard from './pages/AttendantDashboard';
import RoomTablet from './pages/RoomTablet';
import HallwayDisplay from './pages/HallwayDisplay';
import AdminDashboard from './pages/AdminDashboard';
import ReportsPage from './pages/ReportsPage';
import DemoPage from './pages/DemoPage';

function App() {
  return (
    <Routes>
      {/* Demo - split screen */}
      <Route path="/demo" element={<DemoPage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Client (mobile) */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/book" element={<BookingPage />} />
      <Route path="/payment/:bookingId" element={<PaymentPage />} />
      <Route path="/booking-confirmed/:bookingId" element={<BookingConfirmedPage />} />
      <Route path="/my-bookings" element={<MyBookingsPage />} />
      <Route path="/my-bookings/:bookingId" element={<BookingDetailPage />} />

      {/* Reception */}
      <Route path="/reception" element={<ReceptionDashboard />} />

      {/* Attendant */}
      <Route path="/attendant" element={<AttendantDashboard />} />

      {/* Room Tablet */}
      <Route path="/tablet/:roomId" element={<RoomTablet />} />

      {/* Hallway Display */}
      <Route path="/hallway" element={<HallwayDisplay />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/reports" element={<ReportsPage />} />

      {/* Default redirect to demo */}
      <Route path="*" element={<Navigate to="/demo" replace />} />
    </Routes>
  );
}

export default App;
