import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a mikveh location
  const location = await prisma.mikvehLocation.create({
    data: {
      name: 'מקווה מרכזי',
      address: 'רחוב הרצל 15, ירושלים',
      phone: '02-1234567',
      settings: {
        preparationTimeoutMinutes: 20,
        defaultSlotDuration: 60,
        maxQueueSize: 10,
      },
    },
  });

  console.log(`Created location: ${location.name}`);

  // Create rooms
  const roomData = [
    { roomNumber: 1, roomType: 'standard' as const, hasShower: true, hasBathtub: false },
    { roomNumber: 2, roomType: 'standard' as const, hasShower: true, hasBathtub: false },
    { roomNumber: 3, roomType: 'premium' as const, hasShower: true, hasBathtub: true },
    { roomNumber: 4, roomType: 'standard' as const, hasShower: true, hasBathtub: false },
    { roomNumber: 5, roomType: 'premium' as const, hasShower: true, hasBathtub: true },
    { roomNumber: 6, roomType: 'standard' as const, hasShower: true, hasBathtub: false },
    { roomNumber: 7, roomType: 'accessible' as const, hasShower: true, hasBathtub: true },
    { roomNumber: 8, roomType: 'standard' as const, hasShower: true, hasBathtub: false },
  ];

  for (const room of roomData) {
    await prisma.room.create({
      data: { ...room, locationId: location.id },
    });
  }
  console.log(`Created ${roomData.length} rooms`);

  // Create schedules (Sunday-Thursday evenings)
  for (let day = 0; day <= 4; day++) {
    await prisma.schedule.create({
      data: {
        locationId: location.id,
        dayOfWeek: day,
        openTime: '19:00',
        closeTime: '22:30',
        maxConcurrentBookings: 8,
        slotDurationMinutes: 30,
      },
    });
  }
  console.log('Created weekly schedule');

  // Create pricing rules
  await prisma.pricingRule.create({
    data: {
      locationId: location.id,
      name: 'רגיל',
      roomType: 'standard',
      price: 50,
    },
  });
  await prisma.pricingRule.create({
    data: {
      locationId: location.id,
      name: 'פרימיום (אמבטיה)',
      roomType: 'premium',
      price: 80,
    },
  });
  await prisma.pricingRule.create({
    data: {
      locationId: location.id,
      name: 'נגיש',
      roomType: 'accessible',
      price: 50,
    },
  });
  console.log('Created pricing rules');

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      phone: '0501234567',
      firstName: 'מנהלת',
      lastName: 'ראשית',
      isAdmin: true,
    },
  });
  console.log(`Created admin user: ${admin.phone}`);

  // Create attendant user
  const attendantUser = await prisma.user.create({
    data: {
      phone: '0509876543',
      firstName: 'שרה',
      lastName: 'כהן',
    },
  });

  await prisma.attendant.create({
    data: {
      locationId: location.id,
      userId: attendantUser.id,
      displayName: 'שרה כהן',
      isActive: true,
      isOnDuty: true,
    },
  });
  console.log('Created attendant');

  // Create feature flags
  const features = [
    'room_tablet',
    'music_control',
    'equipment_requests',
    'access_control',
    'saved_cards',
    'sms_blast',
    'advanced_reports',
  ];

  for (const feature of features) {
    await prisma.featureFlag.create({
      data: {
        locationId: location.id,
        featureKey: feature,
        isEnabled: false, // Phase 2 features off by default
      },
    });
  }
  console.log('Created feature flags');

  // Create sample test users
  const testUsers = [
    { phone: '0521111111', firstName: 'רחל', lastName: 'לוי' },
    { phone: '0522222222', firstName: 'מרים', lastName: 'אברהם' },
    { phone: '0523333333', firstName: 'דינה', lastName: 'מזרחי' },
  ];

  for (const u of testUsers) {
    await prisma.user.create({ data: u });
  }
  console.log('Created test users');

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
