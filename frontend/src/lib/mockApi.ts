// Mock API interceptor - intercepts all axios calls and returns mock data
import type { AxiosInstance } from 'axios';
import * as mock from './mockData';

export function installMockApi(api: AxiosInstance) {
  api.interceptors.request.use((config) => {
    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();
    const data = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};

    let responseData: any = null;

    // AUTH
    if (url === '/auth/send-code' && method === 'post') {
      responseData = { success: true };
    }
    if (url === '/auth/verify' && method === 'post') {
      responseData = {
        accessToken: 'mock-token-demo',
        user: mock.mockUsers[7], // admin user
      };
    }

    // BOOKINGS
    if (url === '/bookings' && method === 'get') {
      responseData = mock.mockBookings;
    }
    if (url.match(/^\/bookings\/[^/]+$/) && method === 'get') {
      const id = url.split('/')[2];
      responseData = mock.mockBookings.find((b) => b.id === id) || mock.mockBookings[0];
    }
    if (url === '/bookings/available-slots' && method === 'get') {
      responseData = mock.getAvailableSlots();
    }
    if (url.match(/\/bookings\/[^/]+\/arrive/) && method === 'post') {
      const id = url.split('/')[2];
      mock.arriveBooking(id);
      responseData = { success: true };
    }
    if (url.match(/\/bookings\/[^/]+\/assign/) && method === 'post') {
      const id = url.split('/')[2];
      mock.assignBooking(id, data.roomId);
      responseData = { success: true };
    }
    if (url.match(/\/bookings\/[^/]+\/ready/) && method === 'post') {
      responseData = { success: true };
    }
    if (url.match(/\/bookings\/[^/]+\/complete/) && method === 'post') {
      responseData = { success: true };
    }

    // ROOMS
    if (url === '/rooms' && method === 'get') {
      responseData = mock.mockRooms;
    }
    if (url.match(/^\/rooms\/[^/]+$/) && method === 'get') {
      const id = url.split('/')[2];
      responseData = mock.mockRooms.find((r) => r.id === id);
    }
    if (url === '/rooms/stats' && method === 'get') {
      responseData = {
        totalRooms: mock.mockRooms.length,
        availableRooms: mock.mockRooms.filter((r) => r.status === 'available').length,
        occupiedRooms: mock.mockRooms.filter((r) => !['available', 'out_of_service'].includes(r.status)).length,
      };
    }
    if (url.match(/\/rooms\/[^/]+\/clean/) && method === 'post') {
      const id = url.split('/')[2];
      mock.cleanRoom(id);
      responseData = { success: true };
    }

    // TABLET
    if (url.match(/\/tablet\/room\/[^/]+$/) && method === 'get') {
      const roomId = url.split('/')[3];
      const room = mock.mockRooms.find((r) => r.id === roomId) || mock.mockRooms[1];
      responseData = {
        room,
        guestName: room.currentBooking?.user?.firstName || 'אורחת',
        session: {
          id: 'session-1',
          roomId: room.id,
          preparationChecklist: { nail_polish: false, shampoo: false, comb: false, final_check: false },
          equipmentReqs: [],
        },
      };
    }
    if (url.match(/\/tablet\/room\/[^/]+\/ready/) && method === 'post') {
      const roomId = url.split('/')[3];
      mock.markReady(roomId);
      responseData = { success: true };
    }
    if (url.match(/\/tablet\/room\/[^/]+\/equipment/) && method === 'post') {
      responseData = { success: true };
    }
    if (url.match(/\/tablet\/room\/[^/]+\/checklist/) && method === 'patch') {
      responseData = { success: true };
    }
    if (url.match(/\/tablet\/room\/[^/]+\/music/) && method === 'post') {
      responseData = { success: true };
    }

    // ATTENDANT
    if (url === '/attendant/dashboard' && method === 'get') {
      responseData = mock.getAttendantDashboard();
    }
    if (url.match(/\/attendant\/room\/[^/]+\/arrive/) && method === 'post') {
      const roomId = url.split('/')[3];
      mock.attendantArrive(roomId);
      responseData = { success: true };
    }
    if (url.match(/\/attendant\/room\/[^/]+\/done/) && method === 'post') {
      const roomId = url.split('/')[3];
      mock.completeImmersion(roomId);
      responseData = { success: true };
    }

    // QUEUE
    if (url === '/queue' && method === 'get') {
      responseData = mock.mockQueue;
    }

    // ADMIN
    if (url === '/admin/dashboard' && method === 'get') {
      responseData = mock.getAdminDashboard();
    }
    if (url === '/admin/reports' && method === 'get') {
      responseData = mock.getReports();
    }
    if (url === '/admin/reports/export' && method === 'get') {
      responseData = {
        rows: mock.mockBookings.map((b) => ({
          bookingId: b.id,
          date: b.bookingDate,
          time: b.timeSlotStart,
          guestName: `${b.user?.firstName || ''} ${b.user?.lastName || ''}`,
          roomNumber: b.room?.roomNumber || '-',
          status: b.status,
          paymentStatus: b.paymentStatus,
          price: 50,
        })),
      };
    }
    if (url === '/admin/audit-log' && method === 'get') {
      responseData = [
        { id: 'log-1', createdAt: mock.mockBookings[0].arrivedAt, actionType: 'arrive', entityType: 'booking', entityId: 'b1', details: {} },
        { id: 'log-2', createdAt: mock.mockBookings[1].arrivedAt, actionType: 'assign_room', entityType: 'booking', entityId: 'b2', details: { roomId: 'r3' } },
      ];
    }
    if (url === '/admin/settings' && method === 'get') {
      responseData = { id: 's1', locationId: mock.LOCATION_ID, name: 'מקווה מרכזית ירושלים', address: 'רחוב הרצל 123, ירושלים', phone: '02-5551234' };
    }

    // PAYMENTS
    if (url === '/payments' && method === 'post') {
      responseData = { id: 'pay-1', status: 'completed', transactionId: 'txn-123' };
    }

    if (responseData !== null) {
      // Cancel the real request and return mock data
      return Promise.reject({
        __MOCK__: true,
        data: responseData,
      });
    }

    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.__MOCK__) {
        return Promise.resolve({ data: error.data, status: 200, statusText: 'OK', headers: {}, config: {} });
      }
      return Promise.reject(error);
    },
  );
}
