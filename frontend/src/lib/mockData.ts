// Centralized mock data store with realistic Hebrew data
// All screens share this state so changes propagate across views

import type { Room, Booking, QueueEntry, MusicTrack } from '../types';

const now = new Date();
const today = now.toISOString().split('T')[0];

function minutesAgo(min: number) {
  return new Date(Date.now() - min * 60000).toISOString();
}

export const LOCATION_ID = 'loc-demo';

export const mockUsers = [
  { id: 'u1', phone: '050-1234567', firstName: 'שרה', lastName: 'כהן', email: 'sarah@example.com', isAdmin: false },
  { id: 'u2', phone: '052-9876543', firstName: 'מיכל', lastName: 'לוי', email: 'michal@example.com', isAdmin: false },
  { id: 'u3', phone: '054-5551234', firstName: 'רחל', lastName: 'גורן', email: 'rachel@example.com', isAdmin: false },
  { id: 'u4', phone: '050-7773333', firstName: 'דינה', lastName: 'אברהם', email: 'dina@example.com', isAdmin: false },
  { id: 'u5', phone: '053-8884444', firstName: 'חנה', lastName: 'פרידמן', email: 'hana@example.com', isAdmin: false },
  { id: 'u6', phone: '058-2226666', firstName: 'אסתר', lastName: 'מזרחי', email: 'ester@example.com', isAdmin: false },
  { id: 'u7', phone: '050-1119999', firstName: 'יעל', lastName: 'שפירא', email: 'yael@example.com', isAdmin: false },
  { id: 'admin1', phone: '050-0000000', firstName: 'מנהלת', lastName: 'ראשית', email: 'admin@zentro.com', isAdmin: true },
];

export let mockRooms: Room[] = [
  { id: 'r1', roomNumber: 1, roomType: 'standard', hasBathtub: false, hasShower: true, status: 'available', statusChangedAt: minutesAgo(30) },
  { id: 'r2', roomNumber: 2, roomType: 'premium', hasBathtub: true, hasShower: true, status: 'preparation', statusChangedAt: minutesAgo(12), currentBooking: undefined },
  { id: 'r3', roomNumber: 3, roomType: 'premium', hasBathtub: true, hasShower: true, status: 'waiting_for_attendant', statusChangedAt: minutesAgo(3), currentBooking: undefined },
  { id: 'r4', roomNumber: 4, roomType: 'accessible', hasBathtub: true, hasShower: true, status: 'immersion', statusChangedAt: minutesAgo(5), currentBooking: undefined },
  { id: 'r5', roomNumber: 5, roomType: 'standard', hasBathtub: false, hasShower: true, status: 'cleaning_required', statusChangedAt: minutesAgo(2) },
  { id: 'r6', roomNumber: 6, roomType: 'standard', hasBathtub: false, hasShower: true, status: 'available', statusChangedAt: minutesAgo(45) },
  { id: 'r7', roomNumber: 7, roomType: 'premium', hasBathtub: true, hasShower: true, status: 'occupied', statusChangedAt: minutesAgo(8), currentBooking: undefined },
  { id: 'r8', roomNumber: 8, roomType: 'standard', hasBathtub: false, hasShower: true, status: 'out_of_service', statusChangedAt: minutesAgo(120) },
];

export let mockBookings: Booking[] = [
  {
    id: 'b1', locationId: LOCATION_ID, userId: 'u1', roomId: 'r2',
    bookingDate: today, timeSlotStart: '18:00', timeSlotEnd: '19:00',
    status: 'assigned', paymentStatus: 'paid',
    notesForAttendant: 'אלרגיה לסבון רגיל',
    arrivedAt: minutesAgo(15),
    user: mockUsers[0], room: mockRooms[1],
  },
  {
    id: 'b2', locationId: LOCATION_ID, userId: 'u2', roomId: 'r3',
    bookingDate: today, timeSlotStart: '18:00', timeSlotEnd: '19:00',
    status: 'ready_for_immersion', paymentStatus: 'paid',
    arrivedAt: minutesAgo(25),
    user: mockUsers[1], room: mockRooms[2],
  },
  {
    id: 'b3', locationId: LOCATION_ID, userId: 'u3', roomId: 'r4',
    bookingDate: today, timeSlotStart: '18:30', timeSlotEnd: '19:30',
    status: 'in_progress', paymentStatus: 'paid',
    arrivedAt: minutesAgo(20),
    user: mockUsers[2], room: mockRooms[3],
  },
  {
    id: 'b4', locationId: LOCATION_ID, userId: 'u4', roomId: 'r7',
    bookingDate: today, timeSlotStart: '18:30', timeSlotEnd: '19:30',
    status: 'assigned', paymentStatus: 'paid',
    arrivedAt: minutesAgo(10),
    user: mockUsers[3], room: mockRooms[6],
  },
  {
    id: 'b5', locationId: LOCATION_ID, userId: 'u5',
    bookingDate: today, timeSlotStart: '19:00', timeSlotEnd: '20:00',
    status: 'arrived', paymentStatus: 'paid',
    arrivedAt: minutesAgo(5),
    user: mockUsers[4],
  },
  {
    id: 'b6', locationId: LOCATION_ID, userId: 'u6',
    bookingDate: today, timeSlotStart: '19:00', timeSlotEnd: '20:00',
    status: 'arrived', paymentStatus: 'unpaid',
    arrivedAt: minutesAgo(3),
    user: mockUsers[5],
  },
  {
    id: 'b7', locationId: LOCATION_ID, userId: 'u7',
    bookingDate: today, timeSlotStart: '19:30', timeSlotEnd: '20:30',
    status: 'confirmed', paymentStatus: 'paid',
    user: mockUsers[6],
  },
  {
    id: 'b8', locationId: LOCATION_ID, userId: 'u1',
    bookingDate: today, timeSlotStart: '17:00', timeSlotEnd: '18:00',
    status: 'completed', paymentStatus: 'paid',
    arrivedAt: minutesAgo(90), completedAt: minutesAgo(50),
    user: mockUsers[0],
  },
];

// Link bookings to rooms
mockRooms[1].currentBooking = mockBookings[0];
mockRooms[2].currentBooking = mockBookings[1];
mockRooms[3].currentBooking = mockBookings[2];
mockRooms[6].currentBooking = mockBookings[3];

export let mockQueue: QueueEntry[] = [
  { id: 'q1', position: 1, booking: mockBookings[4], enteredAt: minutesAgo(5) },
  { id: 'q2', position: 2, booking: mockBookings[5], enteredAt: minutesAgo(3) },
];

// Equipment requests per room
const equipmentRequests: Record<string, Array<{ id: string; itemType: string; quantity: number; status: string; requestedAt: string }>> = {};

// Settings
let mockSettings = {
  id: 's1', locationId: LOCATION_ID,
  name: 'מקווה מרכזי ירושלים', address: 'רחוב הרצל 123, ירושלים',
  phone: '02-5551234', timezone: 'Asia/Jerusalem',
  openingHours: '17:00', closingHours: '22:00',
};

// Features
let mockFeatures = [
  { featureKey: 'room_tablet', label: 'טאבלט בחדר', isEnabled: true },
  { featureKey: 'music_control', label: 'בקרת מוזיקה', isEnabled: true },
  { featureKey: 'access_control', label: 'בקרת כניסה (AKUVOX)', isEnabled: false },
  { featureKey: 'hallway_display', label: 'מסך מסדרון', isEnabled: true },
  { featureKey: 'saved_cards', label: 'שמירת כרטיס', isEnabled: true },
  { featureKey: 'sms_blast', label: 'SMS המוני', isEnabled: false },
  { featureKey: 'advanced_reports', label: 'דוחות מתקדמים', isEnabled: true },
  { featureKey: 'auto_overtime_alert', label: 'התראת חריגה', isEnabled: true },
];

// Audit log
const auditLog = [
  { id: 'log-1', createdAt: minutesAgo(15), actionType: 'booking_arrived', entityType: 'booking', entityId: 'b1', performedBy: 'admin1', details: { guestName: 'שרה כהן' } },
  { id: 'log-2', createdAt: minutesAgo(14), actionType: 'room_assigned', entityType: 'room', entityId: 'r2', performedBy: 'admin1', details: { guestName: 'שרה כהן', roomNumber: 2 } },
  { id: 'log-3', createdAt: minutesAgo(25), actionType: 'booking_arrived', entityType: 'booking', entityId: 'b2', performedBy: 'admin1', details: { guestName: 'מיכל לוי' } },
  { id: 'log-4', createdAt: minutesAgo(24), actionType: 'room_assigned', entityType: 'room', entityId: 'r3', performedBy: 'admin1', details: { guestName: 'מיכל לוי', roomNumber: 3 } },
  { id: 'log-5', createdAt: minutesAgo(3), actionType: 'ready_for_immersion', entityType: 'room', entityId: 'r3', performedBy: 'system', details: { guestName: 'מיכל לוי', roomNumber: 3 } },
  { id: 'log-6', createdAt: minutesAgo(50), actionType: 'immersion_completed', entityType: 'room', entityId: 'r1', performedBy: 'att1', details: { guestName: 'שרה כהן' } },
  { id: 'log-7', createdAt: minutesAgo(60), actionType: 'feature_toggled', entityType: 'feature', entityId: 'music_control', performedBy: 'admin1', details: { isEnabled: true } },
  { id: 'log-8', createdAt: minutesAgo(120), actionType: 'room_out_of_service', entityType: 'room', entityId: 'r8', performedBy: 'admin1', details: { reason: 'תיקון' } },
];

// Event listeners for cross-view updates
type Listener = () => void;
const listeners: Listener[] = [];
export function onDataChange(fn: Listener) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}
export function notifyChange() {
  listeners.forEach((fn) => fn());
}

// ---------- Actions ----------

export function createBooking(data: any): Booking {
  const id = `b-${Date.now()}`;
  const user = mockUsers.find(u => u.id === data.userId) || mockUsers[6];
  const booking: Booking = {
    id, locationId: LOCATION_ID, userId: user.id,
    bookingDate: data.bookingDate, timeSlotStart: data.timeSlotStart,
    timeSlotEnd: data.timeSlotEnd || '', status: 'confirmed',
    paymentStatus: 'unpaid', notesForAttendant: data.notesForAttendant,
    user,
  };
  mockBookings.push(booking);
  notifyChange();
  return booking;
}

export function cancelBooking(bookingId: string) {
  const b = mockBookings.find(x => x.id === bookingId);
  if (!b) return;
  b.status = 'cancelled';
  // Remove from queue if present
  mockQueue = mockQueue.filter(q => q.booking.id !== bookingId);
  mockQueue.forEach((q, i) => (q.position = i + 1));
  // Free room if assigned
  if (b.roomId) {
    const r = mockRooms.find(x => x.id === b.roomId);
    if (r && r.currentBooking?.id === bookingId) {
      r.status = 'available';
      r.currentBooking = undefined;
      r.statusChangedAt = new Date().toISOString();
    }
  }
  notifyChange();
}

export function arriveBooking(bookingId: string) {
  const b = mockBookings.find((x) => x.id === bookingId);
  if (!b) return;
  b.status = 'arrived';
  b.arrivedAt = new Date().toISOString();
  const pos = mockQueue.length + 1;
  mockQueue.push({ id: `q-${Date.now()}`, position: pos, booking: b, enteredAt: new Date().toISOString() });
  notifyChange();
}

export function assignBooking(bookingId: string, roomId: string) {
  const b = mockBookings.find((x) => x.id === bookingId);
  const r = mockRooms.find((x) => x.id === roomId);
  if (!b || !r) return;
  b.status = 'assigned';
  b.roomId = roomId;
  b.room = r;
  r.status = 'occupied';
  r.statusChangedAt = new Date().toISOString();
  r.currentBooking = b;
  mockQueue = mockQueue.filter((q) => q.booking.id !== bookingId);
  mockQueue.forEach((q, i) => (q.position = i + 1));
  notifyChange();
}

export function markReady(roomId: string) {
  const r = mockRooms.find((x) => x.id === roomId);
  if (!r) return;
  r.status = 'waiting_for_attendant';
  r.statusChangedAt = new Date().toISOString();
  if (r.currentBooking) {
    const b = mockBookings.find((x) => x.id === r.currentBooking!.id);
    if (b) b.status = 'ready_for_immersion';
  }
  notifyChange();
}

export function attendantArrive(roomId: string) {
  const r = mockRooms.find((x) => x.id === roomId);
  if (!r) return;
  r.status = 'immersion';
  r.statusChangedAt = new Date().toISOString();
  if (r.currentBooking) {
    const b = mockBookings.find((x) => x.id === r.currentBooking!.id);
    if (b) b.status = 'in_progress';
  }
  notifyChange();
}

export function completeImmersion(roomId: string) {
  const r = mockRooms.find((x) => x.id === roomId);
  if (!r) return;
  if (r.currentBooking) {
    const b = mockBookings.find((x) => x.id === r.currentBooking!.id);
    if (b) { b.status = 'completed'; b.completedAt = new Date().toISOString(); }
  }
  r.status = 'cleaning_required';
  r.statusChangedAt = new Date().toISOString();
  r.currentBooking = undefined;
  notifyChange();
}

export function cleanRoom(roomId: string) {
  const r = mockRooms.find((x) => x.id === roomId);
  if (!r) return;
  r.status = 'available';
  r.statusChangedAt = new Date().toISOString();
  r.currentBooking = undefined;
  notifyChange();
}

export function updateRoomStatus(roomId: string, status: string) {
  const r = mockRooms.find((x) => x.id === roomId);
  if (!r) return;
  r.status = status as any;
  r.statusChangedAt = new Date().toISOString();
  notifyChange();
}

export function overrideQueue(bookingId: string, newPosition: number) {
  const idx = mockQueue.findIndex(q => q.booking.id === bookingId);
  if (idx < 0) return;
  const [item] = mockQueue.splice(idx, 1);
  mockQueue.splice(newPosition - 1, 0, item);
  mockQueue.forEach((q, i) => (q.position = i + 1));
  notifyChange();
}

// Equipment
export function addEquipmentRequest(roomId: string, items: Array<{ itemType: string; quantity: number }>) {
  if (!equipmentRequests[roomId]) equipmentRequests[roomId] = [];
  items.forEach(item => {
    equipmentRequests[roomId].push({
      id: `eq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      itemType: item.itemType, quantity: item.quantity,
      status: 'requested', requestedAt: new Date().toISOString(),
    });
  });
  notifyChange();
}

export function getEquipmentRequests(roomId: string) {
  return equipmentRequests[roomId] || [];
}

export function getAllEquipmentRequests() {
  return Object.entries(equipmentRequests).flatMap(([roomId, reqs]) =>
    reqs.filter(r => r.status === 'requested').map(r => ({
      ...r, roomId, roomNumber: mockRooms.find(rm => rm.id === roomId)?.roomNumber,
    }))
  );
}

export function acknowledgeEquipment(requestId: string) {
  for (const reqs of Object.values(equipmentRequests)) {
    const r = reqs.find(x => x.id === requestId);
    if (r) { r.status = 'acknowledged'; notifyChange(); return; }
  }
}

export function deliverEquipment(requestId: string) {
  for (const reqs of Object.values(equipmentRequests)) {
    const r = reqs.find(x => x.id === requestId);
    if (r) { r.status = 'delivered'; notifyChange(); return; }
  }
}

// Settings
export function getSettings() { return { ...mockSettings }; }
export function updateSettings(data: any) {
  mockSettings = { ...mockSettings, ...data };
  notifyChange();
}

// Features
export function getFeatures() { return mockFeatures.map(f => ({ ...f })); }
export function toggleFeature(key: string, isEnabled: boolean) {
  const f = mockFeatures.find(x => x.featureKey === key);
  if (f) f.isEnabled = isEnabled;
  notifyChange();
}

// Admin dashboard (with features + attendants)
export function getAdminDashboard() {
  return {
    stats: {
      totalBookings: mockBookings.length,
      arrived: mockBookings.filter((b) => b.arrivedAt).length,
      completed: mockBookings.filter((b) => b.status === 'completed').length,
      waiting: mockQueue.length,
      inRooms: mockRooms.filter((r) => !['available', 'out_of_service', 'cleaning_required'].includes(r.status)).length,
      cancelled: mockBookings.filter((b) => b.status === 'cancelled').length,
      noShow: mockBookings.filter((b) => b.status === 'no_show').length,
    },
    rooms: mockRooms,
    features: mockFeatures,
    attendants: [
      { id: 'att-1', displayName: 'דבורה כ.', phone: '050-7654321', isActive: true, isOnDuty: true },
      { id: 'att-2', displayName: 'אסתר ר.', phone: '050-1111111', isActive: true, isOnDuty: false },
      { id: 'att-3', displayName: 'שרה מ.', phone: '050-2222222', isActive: true, isOnDuty: true },
    ],
    equipmentRequests: getAllEquipmentRequests(),
  };
}

// Attendant dashboard
export function getAttendantDashboard() {
  return {
    readyForImmersion: mockRooms.filter((r) => r.status === 'waiting_for_attendant'),
    inPreparation: mockRooms.filter((r) => r.status === 'occupied' || r.status === 'preparation'),
    inImmersion: mockRooms.filter((r) => r.status === 'immersion'),
    needsCleaning: mockRooms.filter((r) => r.status === 'cleaning_required' || r.status === 'cleaning_in_progress'),
    equipmentRequests: getAllEquipmentRequests(),
  };
}

// Reports
export function getReports() {
  return {
    summary: {
      totalBookings: 25, completed: 22, cancelled: 2, noShow: 1,
      totalRevenue: 1100, averagePrice: 50, showerCount: 15, bathtubCount: 10,
    },
    bookings: mockBookings.map((b) => ({ ...b, user: b.user || mockUsers[0], room: b.room || mockRooms[0] })),
  };
}

// Audit log
export function getAuditLog() { return auditLog; }

// Schedules
export function getSchedules() {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return days.map((name, i) => ({
    id: `sch-${i}`, dayOfWeek: i, dayName: name,
    openTime: i === 5 ? '08:00' : i === 6 ? '' : '17:00',
    closeTime: i === 5 ? '14:00' : i === 6 ? '' : '22:00',
    maxConcurrentBookings: i === 6 ? 0 : 3,
    slotDurationMinutes: 60,
    isActive: i !== 6,
  }));
}

// Pricing
export function getPricing() {
  return [
    { id: 'p1', name: 'רגיל', roomType: 'standard', price: 50, isActive: true },
    { id: 'p2', name: 'פרמיום', roomType: 'premium', price: 70, isActive: true },
    { id: 'p3', name: 'נגיש', roomType: 'accessible', price: 50, isActive: true },
    { id: 'p4', name: 'ערב שישי', roomType: 'standard', price: 40, isActive: true, notes: 'הנחה לערב שבת' },
  ];
}

// ---------------------------------------------------------------------------
// Access Control mock data
// ---------------------------------------------------------------------------

export interface MockAccessLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  roomId?: string;
  roomNumber?: number;
  userId?: string;
  userName?: string;
  details: string;
  detailsHe: string;
}

export interface MockDoorStatus {
  doorId: string;
  roomId: string;
  roomNumber: number;
  state: 'locked' | 'unlocked' | 'open' | 'forced' | 'error';
  lastEventAt: string;
  isOnline: boolean;
}

let mockAccessControlSession: {
  token: string;
  clientGuid: string;
  hostGuid: string;
  version: string;
  createdAt: string;
  expiresAt: string;
} | null = null;

const mockAccessUsers: Record<string, any> = {};

export let mockAccessLogs: MockAccessLogEntry[] = [
  {
    id: 'acl-1', timestamp: minutesAgo(60), eventType: 'door_opened',
    roomId: 'r1', roomNumber: 1, userId: 'u1', userName: 'שרה כהן',
    details: 'Door opened for guest entry', detailsHe: 'הדלת נפתחה לכניסת אורחת',
  },
  {
    id: 'acl-2', timestamp: minutesAgo(55), eventType: 'access_granted',
    roomId: 'r1', roomNumber: 1, userId: 'u1', userName: 'שרה כהן',
    details: 'Access granted via PIN', detailsHe: 'גישה אושרה באמצעות קוד PIN',
  },
  {
    id: 'acl-3', timestamp: minutesAgo(45), eventType: 'door_locked',
    roomId: 'r1', roomNumber: 1,
    details: 'Door auto-locked after session', detailsHe: 'הדלת ננעלה אוטומטית לאחר סיום',
  },
  {
    id: 'acl-4', timestamp: minutesAgo(30), eventType: 'access_denied',
    roomId: 'r3', roomNumber: 3, userId: 'u6', userName: 'אסתר מזרחי',
    details: 'Access denied – invalid code', detailsHe: 'גישה נדחתה – קוד לא תקין',
  },
  {
    id: 'acl-5', timestamp: minutesAgo(25), eventType: 'door_opened',
    roomId: 'r2', roomNumber: 2, userId: 'u2', userName: 'מיכל לוי',
    details: 'Door opened for guest entry', detailsHe: 'הדלת נפתחה לכניסת אורחת',
  },
  {
    id: 'acl-6', timestamp: minutesAgo(20), eventType: 'access_granted',
    roomId: 'r4', roomNumber: 4, userId: 'u3', userName: 'רחל גורן',
    details: 'Access granted via QR code', detailsHe: 'גישה אושרה באמצעות קוד QR',
  },
  {
    id: 'acl-7', timestamp: minutesAgo(10), eventType: 'door_opened',
    roomId: 'r7', roomNumber: 7, userId: 'u4', userName: 'דינה אברהם',
    details: 'Door opened for guest entry', detailsHe: 'הדלת נפתחה לכניסת אורחת',
  },
  {
    id: 'acl-8', timestamp: minutesAgo(5), eventType: 'door_forced',
    roomId: 'r5', roomNumber: 5,
    details: 'Door forced open – alert triggered', detailsHe: 'דלת נפרצה – התראה הופעלה',
  },
];

export const mockDoorStatuses: Record<string, MockDoorStatus> = {
  r1: { doorId: 'door-r1', roomId: 'r1', roomNumber: 1, state: 'locked', lastEventAt: minutesAgo(45), isOnline: true },
  r2: { doorId: 'door-r2', roomId: 'r2', roomNumber: 2, state: 'locked', lastEventAt: minutesAgo(25), isOnline: true },
  r3: { doorId: 'door-r3', roomId: 'r3', roomNumber: 3, state: 'locked', lastEventAt: minutesAgo(30), isOnline: true },
  r4: { doorId: 'door-r4', roomId: 'r4', roomNumber: 4, state: 'unlocked', lastEventAt: minutesAgo(20), isOnline: true },
  r5: { doorId: 'door-r5', roomId: 'r5', roomNumber: 5, state: 'forced', lastEventAt: minutesAgo(5), isOnline: true },
  r6: { doorId: 'door-r6', roomId: 'r6', roomNumber: 6, state: 'locked', lastEventAt: minutesAgo(60), isOnline: true },
  r7: { doorId: 'door-r7', roomId: 'r7', roomNumber: 7, state: 'unlocked', lastEventAt: minutesAgo(10), isOnline: true },
  r8: { doorId: 'door-r8', roomId: 'r8', roomNumber: 8, state: 'error', lastEventAt: minutesAgo(120), isOnline: false },
};

export function createAccessSession() {
  const now = new Date();
  mockAccessControlSession = {
    token: `gv-token-${Date.now()}`,
    clientGuid: `client-${Math.random().toString(36).slice(2, 10)}`,
    hostGuid: `host-${Math.random().toString(36).slice(2, 10)}`,
    version: '5.3.1',
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 20 * 60 * 1000).toISOString(),
  };
  const logEntry: MockAccessLogEntry = {
    id: `acl-${Date.now()}`, timestamp: now.toISOString(),
    eventType: 'session_created',
    details: 'GeoVision session created', detailsHe: 'חיבור למערכת בקרת גישה בוצע בהצלחה',
  };
  mockAccessLogs.unshift(logEntry);
  notifyChange();
  return mockAccessControlSession;
}

export function createAccessUser(data: { bookingId: string; fullName: string; phone: string; idNumber?: string; type: 'visitor' }) {
  const id = `acu-${Date.now()}`;
  const user = {
    id,
    bookingId: data.bookingId,
    fullName: data.fullName,
    phone: data.phone,
    idNumber: data.idNumber,
    type: data.type,
    createdAt: new Date().toISOString(),
  };
  mockAccessUsers[id] = user;
  const logEntry: MockAccessLogEntry = {
    id: `acl-${Date.now()}`, timestamp: new Date().toISOString(),
    eventType: 'user_created', userId: id, userName: data.fullName,
    details: `User created for booking ${data.bookingId}`,
    detailsHe: `משתמשת נוצרה עבור הזמנה ${data.bookingId}`,
  };
  mockAccessLogs.unshift(logEntry);
  notifyChange();
  return user;
}

export function assignAccess(data: { userId: string; accessType: 'card' | 'pin' | 'qr'; accessCode: string; validFrom: string; validTo: string }) {
  const assignment = {
    id: `aca-${Date.now()}`,
    userId: data.userId,
    accessType: data.accessType,
    accessCode: data.accessCode,
    validFrom: data.validFrom,
    validTo: data.validTo,
    isActive: true,
  };
  const user = mockAccessUsers[data.userId];
  const logEntry: MockAccessLogEntry = {
    id: `acl-${Date.now()}`, timestamp: new Date().toISOString(),
    eventType: 'access_assigned', userId: data.userId, userName: user?.fullName,
    details: `Access ${data.accessType} assigned: ${data.accessCode}`,
    detailsHe: `גישה מסוג ${data.accessType === 'card' ? 'כרטיס' : data.accessType === 'pin' ? 'קוד PIN' : 'QR'} הוקצתה`,
  };
  mockAccessLogs.unshift(logEntry);
  notifyChange();
  return assignment;
}

export function openDoor(roomId: string, reason: string) {
  const door = mockDoorStatuses[roomId];
  if (!door) return null;
  door.state = 'open';
  door.lastEventAt = new Date().toISOString();
  const room = mockRooms.find(r => r.id === roomId);
  const logEntry: MockAccessLogEntry = {
    id: `acl-${Date.now()}`, timestamp: new Date().toISOString(),
    eventType: 'door_opened', roomId, roomNumber: room?.roomNumber,
    details: `Door opened: ${reason}`, detailsHe: `דלת נפתחה: ${reason}`,
  };
  mockAccessLogs.unshift(logEntry);
  // Auto-lock after 5 seconds (simulated – just mark state)
  setTimeout(() => {
    if (door.state === 'open') {
      door.state = 'locked';
      door.lastEventAt = new Date().toISOString();
      notifyChange();
    }
  }, 5000);
  notifyChange();
  return { success: true as const, logEntry };
}

export function revokeAccess(userId: string) {
  const user = mockAccessUsers[userId];
  const logEntry: MockAccessLogEntry = {
    id: `acl-${Date.now()}`, timestamp: new Date().toISOString(),
    eventType: 'access_revoked', userId, userName: user?.fullName,
    details: `All access revoked for user ${userId}`,
    detailsHe: `כל הגישות בוטלו עבור משתמשת ${user?.fullName || userId}`,
  };
  mockAccessLogs.unshift(logEntry);
  notifyChange();
  return { success: true };
}

export function getAccessLogs(params?: { from?: string; to?: string; roomId?: string }) {
  let logs = [...mockAccessLogs];
  if (params?.roomId) {
    logs = logs.filter(l => l.roomId === params.roomId);
  }
  if (params?.from) {
    const fromDate = new Date(params.from);
    logs = logs.filter(l => new Date(l.timestamp) >= fromDate);
  }
  if (params?.to) {
    const toDate = new Date(params.to);
    logs = logs.filter(l => new Date(l.timestamp) <= toDate);
  }
  return logs;
}

export function getDoorStatus(doorIdOrRoomId: string) {
  // Accept either doorId (door-r1) or roomId (r1)
  const roomId = doorIdOrRoomId.startsWith('door-') ? doorIdOrRoomId.replace('door-', '') : doorIdOrRoomId;
  return mockDoorStatuses[roomId] || null;
}

// ---------------------------------------------------------------------------
// Music mock data
// ---------------------------------------------------------------------------

export let mockMusicTracks: MusicTrack[] = [
  { id: 'mt-1', title: 'ניגון שקט', artist: 'נגינה רכה', url: '/audio/gentle-melody.mp3', duration: 240, category: 'relaxing', isDefault: true, sortOrder: 1, isActive: true },
  { id: 'mt-2', title: 'מים זורמים', artist: 'צלילי טבע', url: '/audio/flowing-water.mp3', duration: 300, category: 'nature', isDefault: false, sortOrder: 2, isActive: true },
  { id: 'mt-3', title: 'כינור קלאסי', artist: 'יצחק פרלמן', url: '/audio/classical-violin.mp3', duration: 280, category: 'classical', isDefault: false, sortOrder: 3, isActive: true },
  { id: 'mt-4', title: 'פסנתר מרגיע', artist: 'מוזיקה שקטה', url: '/audio/calm-piano.mp3', duration: 320, category: 'relaxing', isDefault: false, sortOrder: 4, isActive: true },
  { id: 'mt-5', title: 'ציפורים בגן', artist: 'צלילי טבע', url: '/audio/birds-garden.mp3', duration: 260, category: 'nature', isDefault: false, sortOrder: 5, isActive: true },
  { id: 'mt-6', title: 'נעימה חסידית', artist: 'ניגוני הלב', url: '/audio/chassidic-melody.mp3', duration: 200, category: 'spiritual', isDefault: false, sortOrder: 6, isActive: true },
  { id: 'mt-7', title: 'גלי ים', artist: 'צלילי טבע', url: '/audio/ocean-waves.mp3', duration: 360, category: 'nature', isDefault: false, sortOrder: 7, isActive: true },
  { id: 'mt-8', title: 'חליל מרגיע', artist: 'נשימה עמוקה', url: '/audio/relaxing-flute.mp3', duration: 290, category: 'relaxing', isDefault: false, sortOrder: 8, isActive: true },
];

let currentMusicState: Record<string, { trackId: string | null; volume: number }> = {};

export function getMusicTracks() {
  return mockMusicTracks.filter(t => t.isActive);
}

export function getAllMusicTracks() {
  return [...mockMusicTracks];
}

export function getDefaultMusicTrack() {
  return mockMusicTracks.find(t => t.isDefault && t.isActive) || null;
}

export function addMusicTrack(data: { title: string; artist?: string; url: string; duration?: number; category?: string; isDefault?: boolean }) {
  if (data.isDefault) {
    mockMusicTracks.forEach(t => (t.isDefault = false));
  }
  const track: MusicTrack = {
    id: `mt-${Date.now()}`,
    title: data.title,
    artist: data.artist,
    url: data.url,
    duration: data.duration,
    category: data.category || 'general',
    isDefault: data.isDefault || false,
    sortOrder: mockMusicTracks.length + 1,
    isActive: true,
  };
  mockMusicTracks.push(track);
  notifyChange();
  return track;
}

export function updateMusicTrack(trackId: string, data: Partial<MusicTrack>) {
  const track = mockMusicTracks.find(t => t.id === trackId);
  if (!track) return null;
  if (data.isDefault) {
    mockMusicTracks.forEach(t => (t.isDefault = false));
  }
  Object.assign(track, data);
  notifyChange();
  return track;
}

export function deleteMusicTrack(trackId: string) {
  const track = mockMusicTracks.find(t => t.id === trackId);
  if (track) {
    track.isActive = false;
    notifyChange();
  }
  return { success: true };
}

export function setDefaultMusicTrack(trackId: string) {
  mockMusicTracks.forEach(t => (t.isDefault = t.id === trackId));
  notifyChange();
  return mockMusicTracks.find(t => t.id === trackId);
}

export function changeRoomMusic(roomId: string, trackId: string | null, volume?: number) {
  if (!currentMusicState[roomId]) {
    currentMusicState[roomId] = { trackId: getDefaultMusicTrack()?.id || null, volume: 50 };
  }
  if (trackId !== undefined && trackId !== null) currentMusicState[roomId].trackId = trackId;
  if (volume !== undefined) currentMusicState[roomId].volume = Math.min(100, Math.max(0, volume));
  notifyChange();
  const track = mockMusicTracks.find(t => t.id === currentMusicState[roomId].trackId);
  return { ...currentMusicState[roomId], track };
}

export function changeRoomVolume(roomId: string, volume: number) {
  if (!currentMusicState[roomId]) {
    currentMusicState[roomId] = { trackId: getDefaultMusicTrack()?.id || null, volume: 50 };
  }
  currentMusicState[roomId].volume = Math.min(100, Math.max(0, volume));
  return currentMusicState[roomId];
}

export function getRoomMusicState(roomId: string) {
  if (!currentMusicState[roomId]) {
    const defaultTrack = getDefaultMusicTrack();
    currentMusicState[roomId] = { trackId: defaultTrack?.id || null, volume: 50 };
  }
  return currentMusicState[roomId];
}

export function exitRoom(roomId: string, _exitMethod: string) {
  const r = mockRooms.find(x => x.id === roomId);
  if (!r) return;
  if (r.currentBooking) {
    const b = mockBookings.find(x => x.id === r.currentBooking!.id);
    if (b) { b.status = 'completed'; b.completedAt = new Date().toISOString(); }
  }
  r.status = 'cleaning_required';
  r.statusChangedAt = new Date().toISOString();
  r.currentBooking = undefined;
  // Reset music to default
  currentMusicState[roomId] = { trackId: getDefaultMusicTrack()?.id || null, volume: 50 };
  notifyChange();
}

export function addManualQueueEntry(data: { phone: string; firstName?: string; lastName?: string; notes?: string }) {
  const userId = `u-walk-${Date.now()}`;
  const user = { id: userId, phone: data.phone, firstName: data.firstName || 'לקוחה', lastName: data.lastName || '', email: '', isAdmin: false };
  mockUsers.push(user);
  const bookingId = `b-walk-${Date.now()}`;
  const nowTime = new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  const booking: Booking = {
    id: bookingId, locationId: LOCATION_ID, userId,
    bookingDate: today, timeSlotStart: nowTime, timeSlotEnd: nowTime,
    status: 'arrived', paymentStatus: 'unpaid',
    notesForAttendant: data.notes, arrivedAt: new Date().toISOString(), user,
  };
  mockBookings.push(booking);
  const pos = mockQueue.length + 1;
  const entry: QueueEntry = { id: `q-walk-${Date.now()}`, position: pos, booking, enteredAt: new Date().toISOString() };
  mockQueue.push(entry);
  notifyChange();
  return entry;
}

// Available slots
export function getAvailableSlots() {
  return [
    { start: '17:00', available: false, currentBookings: 3, maxBookings: 3 },
    { start: '17:30', available: true, currentBookings: 1, maxBookings: 3 },
    { start: '18:00', available: true, currentBookings: 2, maxBookings: 3 },
    { start: '18:30', available: true, currentBookings: 2, maxBookings: 3 },
    { start: '19:00', available: true, currentBookings: 1, maxBookings: 3 },
    { start: '19:30', available: true, currentBookings: 1, maxBookings: 3 },
    { start: '20:00', available: true, currentBookings: 0, maxBookings: 3 },
    { start: '20:30', available: true, currentBookings: 0, maxBookings: 3 },
    { start: '21:00', available: true, currentBookings: 0, maxBookings: 3 },
  ];
}
