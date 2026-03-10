// Centralized mock data store with realistic Hebrew data
// All screens share this state so changes propagate across views

import type { Room, Booking, QueueEntry } from '../types';

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

export function arriveBooking(bookingId: string) {
  const b = mockBookings.find((x) => x.id === bookingId);
  if (!b) return;
  b.status = 'arrived';
  b.arrivedAt = new Date().toISOString();
  // Add to queue
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
  // Remove from queue
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
    if (b) {
      b.status = 'completed';
      b.completedAt = new Date().toISOString();
    }
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

// Mock admin dashboard data
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
  };
}

// Mock attendant dashboard data
export function getAttendantDashboard() {
  return {
    readyForImmersion: mockRooms.filter((r) => r.status === 'waiting_for_attendant'),
    inPreparation: mockRooms.filter((r) => r.status === 'occupied' || r.status === 'preparation'),
    inImmersion: mockRooms.filter((r) => r.status === 'immersion'),
    needsCleaning: mockRooms.filter((r) => r.status === 'cleaning_required' || r.status === 'cleaning_in_progress'),
  };
}

// Mock reports
export function getReports() {
  return {
    summary: {
      totalBookings: 25,
      completed: 22,
      cancelled: 2,
      noShow: 1,
      totalRevenue: 1100,
      averagePrice: 50,
      showerCount: 15,
      bathtubCount: 10,
    },
    bookings: mockBookings.map((b) => ({
      ...b,
      user: b.user || mockUsers[0],
      room: b.room || mockRooms[0],
    })),
  };
}

// Mock available slots
export function getAvailableSlots() {
  return [
    { start: '17:00', available: false, currentBookings: 3, maxBookings: 3 },
    { start: '18:00', available: true, currentBookings: 2, maxBookings: 3 },
    { start: '18:30', available: true, currentBookings: 2, maxBookings: 3 },
    { start: '19:00', available: true, currentBookings: 1, maxBookings: 3 },
    { start: '19:30', available: true, currentBookings: 1, maxBookings: 3 },
    { start: '20:00', available: true, currentBookings: 0, maxBookings: 3 },
  ];
}
