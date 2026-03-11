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
    if (url === '/bookings' && method === 'post') {
      // Create new booking
      const newBooking = mock.createBooking(data);
      responseData = newBooking;
    }
    if (url.match(/^\/bookings\/[^/]+$/) && method === 'get') {
      const id = url.split('/')[2];
      responseData = mock.mockBookings.find((b) => b.id === id) || mock.mockBookings[0];
    }
    if (url.match(/^\/bookings\/[^/]+$/) && method === 'delete') {
      const id = url.split('/')[2];
      mock.cancelBooking(id);
      responseData = { success: true };
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
    if (url.match(/\/bookings\/[^/]+\/immersion/) && method === 'post') {
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
    if (url.match(/^\/rooms\/[^/]+\/status$/) && method === 'patch') {
      const id = url.split('/')[2];
      mock.updateRoomStatus(id, data.status);
      responseData = { success: true };
    }
    if (url.match(/\/rooms\/[^/]+\/clean/) && method === 'post') {
      const id = url.split('/')[2];
      mock.cleanRoom(id);
      responseData = { success: true };
    }
    if (url.match(/\/rooms\/[^/]+\/session/) && method === 'get') {
      const id = url.split('/')[2];
      const room = mock.mockRooms.find((r) => r.id === id);
      responseData = {
        id: `session-${id}`, roomId: id, bookingId: room?.currentBooking?.id,
        startedAt: room?.statusChangedAt, preparationChecklist: {},
        equipmentReqs: mock.getEquipmentRequests(id),
      };
    }

    // TABLET
    if (url.match(/\/tablet\/room\/[^/]+$/) && method === 'get') {
      const roomId = url.split('/')[3];
      const room = mock.mockRooms.find((r) => r.id === roomId) || mock.mockRooms[1];
      const musicState = mock.getRoomMusicState(roomId);
      const currentTrack = mock.mockMusicTracks.find(t => t.id === musicState.trackId) || mock.getDefaultMusicTrack();
      responseData = {
        room,
        guestName: room.currentBooking?.user?.firstName || 'אורחת',
        session: {
          id: `session-${roomId}`,
          roomId: room.id,
          preparationChecklist: { nail_polish: false, shampoo: false, comb: false, final_check: false },
          equipmentReqs: mock.getEquipmentRequests(roomId),
          musicTrackId: musicState.trackId,
          musicVolume: musicState.volume,
          musicTrack: currentTrack,
        },
        musicTracks: mock.getMusicTracks(),
        defaultTrack: mock.getDefaultMusicTrack(),
        currentTrack,
        musicVolume: musicState.volume,
      };
    }
    if (url.match(/\/tablet\/room\/[^/]+\/ready/) && method === 'post') {
      const roomId = url.split('/')[3];
      mock.markReady(roomId);
      responseData = { success: true };
    }
    if (url.match(/\/tablet\/room\/[^/]+\/equipment/) && method === 'post') {
      const roomId = url.split('/')[3];
      mock.addEquipmentRequest(roomId, data.items);
      responseData = { success: true };
    }
    if (url.match(/\/tablet\/room\/[^/]+\/checklist/) && method === 'patch') {
      responseData = { success: true };
    }
    if (url.match(/\/tablet\/room\/[^/]+\/music$/) && method === 'post') {
      const roomId = url.split('/')[3];
      responseData = mock.changeRoomMusic(roomId, data.trackId, data.volume);
    }
    if (url.match(/\/tablet\/room\/[^/]+\/volume/) && method === 'post') {
      const roomId = url.split('/')[3];
      responseData = mock.changeRoomVolume(roomId, data.volume);
    }
    if (url.match(/\/tablet\/room\/[^/]+\/exit\/verify/) && method === 'post') {
      const roomId = url.split('/')[3];
      mock.exitRoom(roomId, 'room_code');
      responseData = { success: true, message: 'Guest exited, room reset to default' };
    }
    if (url.match(/\/tablet\/room\/[^/]+\/exit$/) && method === 'post') {
      const roomId = url.split('/')[3];
      mock.exitRoom(roomId, data.exitMethod);
      responseData = { success: true, message: 'Guest exited, room reset to default' };
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
    if (url === '/queue/override' && method === 'post') {
      mock.overrideQueue(data.bookingId, data.newPosition);
      responseData = { success: true };
    }
    if (url === '/queue/manual' && method === 'post') {
      responseData = mock.addManualQueueEntry(data);
    }

    // ADMIN
    if (url === '/admin/dashboard' && method === 'get') {
      responseData = mock.getAdminDashboard();
    }
    if (url === '/admin/settings' && method === 'get') {
      responseData = mock.getSettings();
    }
    if (url === '/admin/settings' && method === 'patch') {
      mock.updateSettings(data);
      responseData = { success: true };
    }
    if (url.match(/\/admin\/features\//) && method === 'patch') {
      const key = url.split('/').pop()!;
      mock.toggleFeature(key, data.isEnabled);
      responseData = { success: true };
    }
    if (url === '/admin/sms' && method === 'post') {
      responseData = { success: true, messageId: `sms-${Date.now()}` };
    }
    if (url === '/admin/audit-log' && method === 'get') {
      responseData = mock.getAuditLog();
    }
    if (url === '/admin/reports' && method === 'get') {
      responseData = mock.getReports();
    }
    if (url === '/admin/reports/export' && method === 'get') {
      responseData = {
        rows: mock.mockBookings.map((b) => ({
          bookingId: b.id, date: b.bookingDate, time: b.timeSlotStart,
          guestName: `${b.user?.firstName || ''} ${b.user?.lastName || ''}`,
          roomNumber: b.room?.roomNumber || '-', status: b.status,
          paymentStatus: b.paymentStatus, price: 50,
        })),
      };
    }

    // SCHEDULES
    if (url === '/schedules' && method === 'get') {
      responseData = mock.getSchedules();
    }

    // PRICING
    if (url === '/pricing' && method === 'get') {
      responseData = mock.getPricing();
    }

    // ACCESS CONTROL
    if (url === '/api/access-control/session' && method === 'post') {
      responseData = mock.createAccessSession();
    }
    if (url === '/api/access-control/users' && method === 'post') {
      responseData = mock.createAccessUser(data);
    }
    if (url === '/api/access-control/access' && method === 'post') {
      responseData = mock.assignAccess(data);
    }
    if (url === '/api/access-control/doors/open' && method === 'post') {
      responseData = mock.openDoor(data.roomId, data.reason);
    }
    if (url === '/api/access-control/access' && method === 'delete') {
      responseData = mock.revokeAccess(data.userId);
    }
    if (url === '/api/access-control/logs' && method === 'get') {
      responseData = mock.getAccessLogs(config.params);
    }
    if (url.match(/^\/api\/access-control\/doors\/[^/]+\/status$/) && method === 'get') {
      const doorId = url.split('/')[4];
      responseData = mock.getDoorStatus(doorId);
    }

    // MUSIC
    if (url === '/music/tracks' && method === 'get') {
      responseData = mock.getMusicTracks();
    }
    if (url === '/music/tracks/all' && method === 'get') {
      responseData = mock.getAllMusicTracks();
    }
    if (url === '/music/default' && method === 'get') {
      responseData = mock.getDefaultMusicTrack();
    }
    if (url === '/music/tracks' && method === 'post') {
      responseData = mock.addMusicTrack(data);
    }
    if (url.match(/^\/music\/tracks\/[^/]+$/) && method === 'patch') {
      const id = url.split('/')[3];
      responseData = mock.updateMusicTrack(id, data);
    }
    if (url.match(/^\/music\/tracks\/[^/]+$/) && method === 'delete') {
      const id = url.split('/')[3];
      responseData = mock.deleteMusicTrack(id);
    }
    if (url.match(/\/music\/tracks\/[^/]+\/set-default/) && method === 'post') {
      const id = url.split('/')[3];
      responseData = mock.setDefaultMusicTrack(id);
    }

    // PAYMENTS
    if (url === '/payments' && method === 'post') {
      responseData = { id: `pay-${Date.now()}`, status: 'completed', transactionId: `txn-${Date.now()}` };
    }
    if (url.match(/^\/payments\/[^/]+$/) && method === 'get') {
      responseData = { id: url.split('/')[2], status: 'completed', amount: 50, currency: 'ILS' };
    }
    if (url.match(/\/payments\/[^/]+\/refund/) && method === 'post') {
      responseData = { success: true };
    }

    if (responseData !== null) {
      return Promise.reject({ __MOCK__: true, data: responseData });
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
