const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data in correct order (respecting foreign key constraints)
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.seasonalPrice.deleteMany();
  await prisma.roomAmenity.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotelAmenity.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.loyaltyProgram.deleteMany();
  await prisma.guestPreference.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create Users (Owner and Staff)
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const owner = await prisma.user.create({
    data: {
      username: 'owner',
      email: 'owner@hotel.com',
      password: hashedPassword,
      role: 'OWNER',
      firstName: 'Hotel',
      lastName: 'Owner',
      phone: '+1-555-0001',
      isActive: true,
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      username: 'staff1',
      email: 'staff1@hotel.com',
      password: hashedPassword,
      role: 'STAFF',
      firstName: 'John',
      lastName: 'Staff',
      phone: '+1-555-0002',
      isActive: true,
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      username: 'staff2',
      email: 'staff2@hotel.com',
      password: hashedPassword,
      role: 'STAFF',
      firstName: 'Sarah',
      lastName: 'Manager',
      phone: '+1-555-0003',
      isActive: true,
    },
  });

  console.log('👥 Created users');

  // Create Hotels
  const grandPalace = await prisma.hotel.create({
    data: {
      name: 'Grand Palace Hotel',
      code: 'GPH001',
      altName: 'فندق القصر الكبير',
      description: 'Luxury hotel in the heart of the city',
      altDescription: 'فندق فاخر في قلب المدينة مع خدمات متميزة ووسائل راحة حديثة',
      address: '123 Main Street, Downtown',
      createdById: owner.id,
    },
  });

  const oceanView = await prisma.hotel.create({
    data: {
      name: 'Ocean View Resort',
      code: 'OVR002',
      altName: 'منتجع إطلالة المحيط',
      description: 'Beautiful resort with stunning ocean views',
      altDescription: 'منتجع جميل مع إطلالات خلابة على المحيط وشاطئ خاص',
      address: '456 Ocean Drive, Beachfront',
      createdById: owner.id,
    },
  });

  const mountainLodge = await prisma.hotel.create({
    data: {
      name: 'Mountain Lodge',
      code: 'ML003',
      altName: 'نزل الجبل',
      description: 'Cozy lodge with mountain scenery',
      altDescription: 'نزل مريح مع مناظر جبلية خلابة وأجواء هادئة',
      address: '789 Mountain Road, Mountain View',
      createdById: owner.id,
    },
  });

  const cityCenter = await prisma.hotel.create({
    data: {
      name: 'City Center Hotel',
      code: 'CCH004',
      altName: 'فندق وسط المدينة',
      description: 'Modern hotel perfect for business travelers',
      altDescription: 'فندق حديث مثالي لرجال الأعمال مع مرافق متطورة',
      address: '321 Business District, City Center',
      createdById: owner.id,
    },
  });

  console.log('🏨 Created hotels');

  // Create Hotel Amenities
  const hotelAmenities = [
    { hotelId: grandPalace.id, name: 'WiFi', icon: '📶' },
    { hotelId: grandPalace.id, name: 'Pool', icon: '🏊' },
    { hotelId: grandPalace.id, name: 'Spa', icon: '💆' },
    { hotelId: grandPalace.id, name: 'Restaurant', icon: '🍽️' },
    { hotelId: grandPalace.id, name: 'Gym', icon: '💪' },
    { hotelId: oceanView.id, name: 'WiFi', icon: '📶' },
    { hotelId: oceanView.id, name: 'Beach Access', icon: '🏖️' },
    { hotelId: oceanView.id, name: 'Pool', icon: '🏊' },
    { hotelId: oceanView.id, name: 'Restaurant', icon: '🍽️' },
    { hotelId: oceanView.id, name: 'Water Sports', icon: '🏄' },
    { hotelId: mountainLodge.id, name: 'WiFi', icon: '📶' },
    { hotelId: mountainLodge.id, name: 'Fireplace', icon: '🔥' },
    { hotelId: mountainLodge.id, name: 'Hiking Trails', icon: '🥾' },
    { hotelId: mountainLodge.id, name: 'Restaurant', icon: '🍽️' },
    { hotelId: mountainLodge.id, name: 'Spa', icon: '💆' },
    { hotelId: cityCenter.id, name: 'WiFi', icon: '📶' },
    { hotelId: cityCenter.id, name: 'Business Center', icon: '💼' },
    { hotelId: cityCenter.id, name: 'Conference Rooms', icon: '🏢' },
    { hotelId: cityCenter.id, name: 'Restaurant', icon: '🍽️' },
  ];

  await prisma.hotelAmenity.createMany({ data: hotelAmenities });
  console.log('🏨 Created hotel amenities');

  // Create Rooms
  const deluxeSuite = await prisma.room.create({
    data: {
      hotelId: grandPalace.id,
      roomType: 'Deluxe Suite',
      roomTypeDescription: 'Luxury suite with ocean view and premium amenities including king bed, marble bathroom, and private balcony',
      altDescription: 'جناح فاخر مع إطلالة على المحيط ووسائل راحة متميزة',
      basePrice: 250.00,
      alternativePrice: 300.00,
      quantity: 5,
      boardType: 'BED_BREAKFAST',
      size: '45 sqm',
      capacity: 2,
      floor: 1,
      createdById: owner.id,
    },
  });

  const familyRoom = await prisma.room.create({
    data: {
      hotelId: grandPalace.id,
      roomType: 'Family Room',
      roomTypeDescription: 'Spacious room perfect for families with children, featuring two double beds and play area',
      altDescription: 'غرفة واسعة مثالية للعائلات مع الأطفال',
      basePrice: 180.00,
      alternativePrice: 220.00,
      quantity: 8,
      boardType: 'HALF_BOARD',
      size: '35 sqm',
      capacity: 4,
      floor: 2,
      createdById: owner.id,
    },
  });

  const presidentialSuite = await prisma.room.create({
    data: {
      hotelId: grandPalace.id,
      roomType: 'Presidential Suite',
      roomTypeDescription: 'Ultimate luxury suite with separate living room, dining area, and panoramic city views',
      altDescription: 'جناح رئاسي فاخر مع غرفة معيشة منفصلة ومنطقة طعام',
      basePrice: 450.00,
      alternativePrice: 550.00,
      quantity: 1,
      boardType: 'FULL_BOARD',
      size: '80 sqm',
      capacity: 3,
      floor: 3,
      createdById: owner.id,
    },
  });

  const oceanViewRoom = await prisma.room.create({
    data: {
      hotelId: oceanView.id,
      roomType: 'Ocean View Room',
      roomTypeDescription: 'Beautiful room with direct ocean views and modern amenities',
      altDescription: 'غرفة جميلة مع إطلالة مباشرة على المحيط',
      basePrice: 200.00,
      alternativePrice: 240.00,
      quantity: 10,
      boardType: 'BED_BREAKFAST',
      size: '30 sqm',
      capacity: 2,
      floor: 2,
      createdById: owner.id,
    },
  });

  const mountainView = await prisma.room.create({
    data: {
      hotelId: mountainLodge.id,
      roomType: 'Mountain View Cabin',
      roomTypeDescription: 'Cozy cabin with stunning mountain views and rustic charm',
      altDescription: 'كابينة مريحة مع إطلالات جبلية خلابة',
      basePrice: 120.00,
      alternativePrice: 150.00,
      quantity: 6,
      boardType: 'ROOM_ONLY',
      size: '25 sqm',
      capacity: 2,
      floor: 1,
      createdById: owner.id,
    },
  });

  const businessRoom = await prisma.room.create({
    data: {
      hotelId: cityCenter.id,
      roomType: 'Business Room',
      roomTypeDescription: 'Modern room designed for business travelers with work desk and high-speed internet',
      altDescription: 'غرفة حديثة مصممة لرجال الأعمال',
      basePrice: 150.00,
      alternativePrice: 180.00,
      quantity: 15,
      boardType: 'BED_BREAKFAST',
      size: '28 sqm',
      capacity: 2,
      floor: 4,
      createdById: owner.id,
    },
  });

  console.log('🏠 Created rooms');

  // Create Room Amenities
  const roomAmenities = [
    { roomId: deluxeSuite.id, name: 'King Bed', icon: '🛏️' },
    { roomId: deluxeSuite.id, name: 'Ocean View', icon: '🌊' },
    { roomId: deluxeSuite.id, name: 'Balcony', icon: '🏡' },
    { roomId: deluxeSuite.id, name: 'Marble Bathroom', icon: '🛁' },
    { roomId: deluxeSuite.id, name: 'Mini Bar', icon: '🍷' },
    { roomId: deluxeSuite.id, name: 'Safe', icon: '🔒' },
    { roomId: familyRoom.id, name: 'Two Double Beds', icon: '🛏️' },
    { roomId: familyRoom.id, name: 'Play Area', icon: '🎮' },
    { roomId: familyRoom.id, name: 'Refrigerator', icon: '❄️' },
    { roomId: familyRoom.id, name: 'Safe', icon: '🔒' },
    { roomId: familyRoom.id, name: 'City View', icon: '🏙️' },
    { roomId: presidentialSuite.id, name: 'King Bed', icon: '🛏️' },
    { roomId: presidentialSuite.id, name: 'Living Room', icon: '🛋️' },
    { roomId: presidentialSuite.id, name: 'Dining Area', icon: '🍽️' },
    { roomId: presidentialSuite.id, name: 'Panoramic View', icon: '🌆' },
    { roomId: presidentialSuite.id, name: 'Jacuzzi', icon: '🛁' },
    { roomId: presidentialSuite.id, name: 'Butler Service', icon: '🤵' },
  ];

  await prisma.roomAmenity.createMany({ data: roomAmenities });
  console.log('🛏️ Created room amenities');

  // Create Seasonal Prices
  const seasonalPrices = [
    {
      roomId: deluxeSuite.id,
      startDate: new Date('2024-12-20'),
      endDate: new Date('2025-01-05'),
      price: 350.00, // Holiday season premium
    },
    {
      roomId: oceanViewRoom.id,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      price: 280.00, // Summer season premium
    },
    {
      roomId: mountainView.id,
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-03-31'),
      price: 150.00, // Winter season premium
    },
  ];

  await prisma.seasonalPrice.createMany({ data: seasonalPrices });
  console.log('💰 Created seasonal prices');

  // Create Availability Slots (next 30 days)
  const availabilitySlots = [];
  const rooms = [deluxeSuite, familyRoom, presidentialSuite, oceanViewRoom, mountainView, businessRoom];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    for (const room of rooms) {
      availabilitySlots.push({
        roomId: room.id,
        date: date,
        availableCount: Math.max(0, room.quantity - Math.floor(Math.random() * 3)), // Random availability
        blockedCount: Math.floor(Math.random() * 2), // Random blocked rooms
      });
    }
  }

  await prisma.availabilitySlot.createMany({ data: availabilitySlots });
  console.log('📅 Created availability slots');

  // Create Guests
  const guest1 = await prisma.guest.create({
    data: {
      profileId: 'PROF-12345',
      firstName: 'Ahmed',
      lastName: 'Al-Rashid',
      fullName: 'Ahmed Mohammed Al-Rashid',
      email: 'ahmed.alrashid@email.com',
      phone: '+971-50-123-4567',
      nationality: 'UAE',
      passportNumber: 'A12345678',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'MALE',
      address: '123 Business Bay, Dubai',
      city: 'Dubai',
      country: 'UAE',
      company: 'Al-Rashid Trading Co.',
      guestClassification: 'UAE Citizen',
      travelAgent: 'Emirates Travel Agency',
      source: 'Online Booking',
      group: 'Business Group',
      isVip: true,
      notes: 'Prefers high floor rooms',
      totalStays: 5,
      totalSpent: 2500.00,
      lastStayDate: new Date('2024-01-10'),
    },
  });

  const guest2 = await prisma.guest.create({
    data: {
      profileId: 'PROF-67890',
      firstName: 'Sarah',
      lastName: 'Johnson',
      fullName: 'Sarah Elizabeth Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-987-6543',
      nationality: 'American',
      passportNumber: 'US987654321',
      dateOfBirth: new Date('1990-07-22'),
      gender: 'FEMALE',
      address: '456 Manhattan Ave, New York',
      city: 'New York',
      country: 'USA',
      company: 'Tech Solutions Inc.',
      guestClassification: 'International Visitor',
      travelAgent: 'Global Travel Co.',
      source: 'Travel Agent',
      group: 'Corporate',
      isVip: false,
      notes: 'Vegetarian meals preferred',
      totalStays: 2,
      totalSpent: 800.00,
      lastStayDate: new Date('2023-12-15'),
    },
  });

  const guest3 = await prisma.guest.create({
    data: {
      profileId: 'PROF-11111',
      firstName: 'Mohammed',
      lastName: 'Hassan',
      fullName: 'Mohammed Ali Hassan',
      email: 'mohammed.hassan@email.com',
      phone: '+966-50-111-2222',
      nationality: 'Saudi Arabian',
      passportNumber: 'SA111222333',
      dateOfBirth: new Date('1978-11-08'),
      gender: 'MALE',
      address: '789 King Fahd Road, Riyadh',
      city: 'Riyadh',
      country: 'Saudi Arabia',
      company: 'Hassan Industries',
      guestClassification: 'Saudi Citizen',
      travelAgent: 'Saudi Travel Services',
      source: 'Direct Booking',
      group: 'Family',
      isVip: true,
      notes: 'Family with 2 children',
      totalStays: 8,
      totalSpent: 4200.00,
      lastStayDate: new Date('2024-01-20'),
    },
  });

  console.log('👥 Created guests');

  // Create Guest Preferences
  await prisma.guestPreference.create({
    data: {
      guestId: guest1.id,
      roomType: 'Deluxe Suite',
      bedType: 'King Bed',
      smokingPreference: 'NON_SMOKING',
      floorPreference: 'High Floor',
      specialRequests: ['Late checkout', 'Extra pillows', 'City view'],
    },
  });

  await prisma.guestPreference.create({
    data: {
      guestId: guest2.id,
      roomType: 'Business Room',
      bedType: 'Queen Bed',
      smokingPreference: 'NON_SMOKING',
      floorPreference: 'Mid Floor',
      specialRequests: ['Vegetarian meals', 'Quiet room', 'Work desk'],
    },
  });

  await prisma.guestPreference.create({
    data: {
      guestId: guest3.id,
      roomType: 'Family Room',
      bedType: 'Two Double Beds',
      smokingPreference: 'NON_SMOKING',
      floorPreference: 'Low Floor',
      specialRequests: ['Connecting rooms', 'Baby crib', 'Extra towels'],
    },
  });

  console.log('⚙️ Created guest preferences');

  // Create Loyalty Programs
  await prisma.loyaltyProgram.create({
    data: {
      guestId: guest1.id,
      isMember: true,
      level: 'GOLD',
      points: 2500,
      joinDate: new Date('2023-01-15'),
    },
  });

  await prisma.loyaltyProgram.create({
    data: {
      guestId: guest2.id,
      isMember: true,
      level: 'BRONZE',
      points: 800,
      joinDate: new Date('2023-11-20'),
    },
  });

  await prisma.loyaltyProgram.create({
    data: {
      guestId: guest3.id,
      isMember: true,
      level: 'PLATINUM',
      points: 4200,
      joinDate: new Date('2022-06-10'),
    },
  });

  console.log('🏆 Created loyalty programs');

  // Create Emergency Contacts
  await prisma.emergencyContact.create({
    data: {
      guestId: guest1.id,
      name: 'Fatima Al-Rashid',
      relationship: 'Wife',
      phone: '+971-50-123-4568',
      email: 'fatima.alrashid@email.com',
    },
  });

  await prisma.emergencyContact.create({
    data: {
      guestId: guest2.id,
      name: 'Michael Johnson',
      relationship: 'Husband',
      phone: '+1-555-987-6544',
      email: 'michael.johnson@email.com',
    },
  });

  await prisma.emergencyContact.create({
    data: {
      guestId: guest3.id,
      name: 'Aisha Hassan',
      relationship: 'Wife',
      phone: '+966-50-111-2223',
      email: 'aisha.hassan@email.com',
    },
  });

  console.log('🚨 Created emergency contacts');

  // Create Bookings
  const booking1 = await prisma.booking.create({
    data: {
      resId: 'RES-2024-001',
      hotelId: grandPalace.id,
      roomId: deluxeSuite.id,
      guestId: guest1.id,
      numberOfRooms: 1,
      checkInDate: new Date('2024-01-15'),
      checkOutDate: new Date('2024-01-18'),
      numberOfNights: 3,
      roomRate: 250.00,
      totalAmount: 750.00,
      rateCode: 'CORP',
      status: 'CHECKED_IN',
      checkInTime: new Date('2024-01-15T15:00:00Z'),
      assignedRoomNo: '101',
      specialRequests: ['Late checkout', 'Extra pillows'],
      notes: 'VIP guest - provide welcome amenities',
      createdById: staff1.id,
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      resId: 'RES-2024-002',
      hotelId: oceanView.id,
      roomId: oceanViewRoom.id,
      guestId: guest2.id,
      numberOfRooms: 1,
      checkInDate: new Date('2024-01-20'),
      checkOutDate: new Date('2024-01-23'),
      numberOfNights: 3,
      roomRate: 200.00,
      totalAmount: 600.00,
      rateCode: 'RACK',
      status: 'CONFIRMED',
      assignedRoomNo: '205',
      specialRequests: ['Vegetarian meals', 'Quiet room'],
      notes: 'Business traveler',
      createdById: staff2.id,
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      resId: 'RES-2024-003',
      hotelId: grandPalace.id,
      roomId: familyRoom.id,
      guestId: guest3.id,
      numberOfRooms: 2,
      checkInDate: new Date('2024-01-25'),
      checkOutDate: new Date('2024-01-30'),
      numberOfNights: 5,
      roomRate: 180.00,
      totalAmount: 1800.00, // 2 rooms * 5 nights * 180
      rateCode: 'FAM',
      status: 'PENDING',
      specialRequests: ['Connecting rooms', 'Baby crib'],
      notes: 'Family with 2 children - ages 5 and 8',
      createdById: staff1.id,
    },
  });

  console.log('📝 Created bookings');

  // Create Payments
  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      method: 'CREDIT_CARD',
      amount: 750.00,
      paymentDate: new Date('2024-01-15'),
      startDate: new Date('2024-01-15'),
      completionDate: new Date('2024-01-18'),
      amountPaidToday: 750.00,
      remainingBalance: 0.00,
      status: 'COMPLETED',
      transactionId: 'TXN-001-2024',
      notes: 'Full payment at check-in',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking2.id,
      method: 'VISA',
      amount: 300.00,
      paymentDate: new Date('2024-01-18'),
      startDate: new Date('2024-01-20'),
      completionDate: new Date('2024-01-23'),
      amountPaidToday: 300.00,
      remainingBalance: 300.00,
      status: 'PARTIALLY_PAID',
      transactionId: 'TXN-002-2024',
      notes: '50% deposit paid',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking3.id,
      method: 'BANK_TRANSFER',
      amount: 900.00,
      paymentDate: new Date('2024-01-22'),
      startDate: new Date('2024-01-25'),
      completionDate: new Date('2024-01-30'),
      amountPaidToday: 900.00,
      remainingBalance: 900.00,
      status: 'PARTIALLY_PAID',
      transactionId: 'TXN-003-2024',
      notes: '50% deposit paid via bank transfer',
    },
  });

  console.log('💳 Created payments');

  // Create System Settings
  const systemSettings = [
    { key: 'default_currency', value: 'AED', category: 'system' },
    { key: 'tax_rate', value: '5.0', category: 'payment' },
    { key: 'cancellation_policy', value: '24 hours before check-in', category: 'booking' },
    { key: 'check_in_time', value: '15:00', category: 'booking' },
    { key: 'check_out_time', value: '12:00', category: 'booking' },
    { key: 'loyalty_points_rate', value: '1', category: 'loyalty' }, // 1 point per AED spent
    { key: 'vip_discount_rate', value: '10.0', category: 'pricing' }, // 10% discount for VIP
    { key: 'seasonal_markup', value: '40.0', category: 'pricing' }, // 40% markup for peak season
  ];

  await prisma.systemSetting.createMany({ data: systemSettings });
  console.log('⚙️ Created system settings');

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   👥 Users: ${await prisma.user.count()}`);
  console.log(`   🏨 Hotels: ${await prisma.hotel.count()}`);
  console.log(`   🏠 Rooms: ${await prisma.room.count()}`);
  console.log(`   👤 Guests: ${await prisma.guest.count()}`);
  console.log(`   📝 Bookings: ${await prisma.booking.count()}`);
  console.log(`   💳 Payments: ${await prisma.payment.count()}`);
  console.log(`   📅 Availability Slots: ${await prisma.availabilitySlot.count()}`);
  console.log(`   ⚙️ System Settings: ${await prisma.systemSetting.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });