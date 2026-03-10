import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ReceptionDashboard from './pages/ReceptionDashboard';
import AttendantDashboard from './pages/AttendantDashboard';
import RoomTablet from './pages/RoomTablet';
import HallwayDisplay from './pages/HallwayDisplay';
import AdminDashboard from './pages/AdminDashboard';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reception" element={<ReceptionDashboard />} />
      <Route path="/attendant" element={<AttendantDashboard />} />
      <Route path="/tablet/:roomId" element={<RoomTablet />} />
      <Route path="/hallway" element={<HallwayDisplay />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/reports" element={<ReportsPage />} />
      <Route path="*" element={<Navigate to="/reception" replace />} />
    </Routes>
  );
}

export default App;
