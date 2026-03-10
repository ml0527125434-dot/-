import axios from 'axios';
import { installMockApi } from './mockApi';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zentro_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock API must be installed AFTER auth interceptor (axios runs request interceptors LIFO)
installMockApi(api);

// Auth
export const authApi = {
  sendCode: (phone: string) => api.post('/auth/send-code', { phone }),
  verify: (phone: string, code: string) =>
    api.post('/auth/verify', { phone, code }),
};

// Bookings
export const bookingsApi = {
  list: (params?: any) => api.get('/bookings', { params }),
  get: (id: string) => api.get(`/bookings/${id}`),
  create: (data: any) => api.post('/bookings', data),
  getSlots: (locationId: string, date: string) =>
    api.get('/bookings/available-slots', { params: { locationId, date } }),
  arrive: (id: string) => api.post(`/bookings/${id}/arrive`),
  assign: (id: string, roomId: string) =>
    api.post(`/bookings/${id}/assign`, { roomId }),
  ready: (id: string) => api.post(`/bookings/${id}/ready`),
  immersion: (id: string) => api.post(`/bookings/${id}/immersion`),
  complete: (id: string) => api.post(`/bookings/${id}/complete`),
  cancel: (id: string, reason?: string) =>
    api.delete(`/bookings/${id}`, { data: { cancellationReason: reason } }),
};

// Rooms
export const roomsApi = {
  list: (locationId: string) => api.get('/rooms', { params: { locationId } }),
  get: (id: string) => api.get(`/rooms/${id}`),
  stats: (locationId: string) =>
    api.get('/rooms/stats', { params: { locationId } }),
  updateStatus: (id: string, status: string) =>
    api.patch(`/rooms/${id}/status`, { status }),
  clean: (id: string) => api.post(`/rooms/${id}/clean`),
  session: (id: string) => api.get(`/rooms/${id}/session`),
};

// Tablet
export const tabletApi = {
  getRoomInfo: (roomId: string) => api.get(`/tablet/room/${roomId}`),
  requestEquipment: (roomId: string, items: any[]) =>
    api.post(`/tablet/room/${roomId}/equipment`, { items }),
  markReady: (roomId: string) => api.post(`/tablet/room/${roomId}/ready`),
  updateChecklist: (roomId: string, checklist: Record<string, boolean>) =>
    api.patch(`/tablet/room/${roomId}/checklist`, checklist),
  changeMusic: (roomId: string, preference: string) =>
    api.post(`/tablet/room/${roomId}/music`, { preference }),
};

// Attendant
export const attendantApi = {
  dashboard: (locationId: string) =>
    api.get('/attendant/dashboard', { params: { locationId } }),
  arriveAtRoom: (roomId: string) =>
    api.post(`/attendant/room/${roomId}/arrive`),
  complete: (roomId: string) => api.post(`/attendant/room/${roomId}/done`),
};

// Queue
export const queueApi = {
  get: (locationId: string) => api.get('/queue', { params: { locationId } }),
  override: (bookingId: string, newPosition: number) =>
    api.post('/queue/override', { bookingId, newPosition }),
};

// Admin
export const adminApi = {
  dashboard: (locationId: string) =>
    api.get('/admin/dashboard', { params: { locationId } }),
  settings: (locationId: string) =>
    api.get('/admin/settings', { params: { locationId } }),
  updateSettings: (locationId: string, settings: any) =>
    api.patch('/admin/settings', settings, { params: { locationId } }),
  toggleFeature: (locationId: string, key: string, isEnabled: boolean) =>
    api.patch(`/admin/features/${key}`, { isEnabled }, { params: { locationId } }),
  sendSms: (locationId: string, recipientPhone: string, message: string) =>
    api.post('/admin/sms', { recipientPhone, message }, { params: { locationId } }),
  auditLog: (locationId: string) =>
    api.get('/admin/audit-log', { params: { locationId } }),
  reports: (locationId: string, dateFrom: string, dateTo: string) =>
    api.get('/admin/reports', { params: { locationId, dateFrom, dateTo } }),
  exportReport: (locationId: string, dateFrom: string, dateTo: string) =>
    api.get('/admin/reports/export', { params: { locationId, dateFrom, dateTo } }),
};

// Payments
export const paymentsApi = {
  create: (data: any) => api.post('/payments', data),
  get: (id: string) => api.get(`/payments/${id}`),
  refund: (id: string) => api.post(`/payments/${id}/refund`),
};

export default api;
