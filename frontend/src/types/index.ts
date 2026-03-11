export type RoomStatus =
  | 'available'
  | 'reserved'
  | 'occupied'
  | 'preparation'
  | 'waiting_for_attendant'
  | 'immersion'
  | 'cleaning_required'
  | 'cleaning_in_progress'
  | 'out_of_service';

export type BookingStatus =
  | 'draft'
  | 'pending_payment'
  | 'confirmed'
  | 'arrived'
  | 'assigned'
  | 'ready_for_immersion'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'partial';

export interface User {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isAdmin: boolean;
}

export interface Room {
  id: string;
  roomNumber: number;
  roomType: 'standard' | 'premium' | 'accessible';
  hasBathtub: boolean;
  hasShower: boolean;
  status: RoomStatus;
  statusChangedAt?: string;
  currentBooking?: Booking;
}

export interface Booking {
  id: string;
  locationId: string;
  userId: string;
  roomId?: string;
  bookingDate: string;
  timeSlotStart: string;
  timeSlotEnd: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notesForAttendant?: string;
  arrivedAt?: string;
  completedAt?: string;
  user?: User;
  room?: Room;
}

export interface QueueEntry {
  id: string;
  position: number;
  booking: Booking;
  enteredAt: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist?: string;
  url: string;
  duration?: number;
  category: string;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface RoomSession {
  id: string;
  roomId: string;
  bookingId: string;
  startedAt: string;
  readyForImmersionAt?: string;
  preparationChecklist?: Record<string, boolean>;
  musicPreference?: string;
  musicTrackId?: string;
  musicTrack?: MusicTrack;
  musicVolume: number;
  equipmentReqs: EquipmentRequest[];
}

export interface EquipmentRequest {
  id: string;
  itemType: string;
  quantity: number;
  status: 'requested' | 'acknowledged' | 'delivered';
  requestedAt: string;
}

export interface TimeSlot {
  start: string;
  available: boolean;
  currentBookings: number;
  maxBookings: number;
}
