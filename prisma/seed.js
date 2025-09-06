const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data in correct order (respecting foreign key constraints)
  await prisma.auditLog.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.seasonalPrice.deleteMany();
  await prisma.roomAmenity.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotelAgreement.deleteMany();
  await prisma.hotelAmenity.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.loyaltyProgram.deleteMany();
  await prisma.guestPreference.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create Users (Owner and Staff)
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const owner = await prisma.user.create({
    data: {
      username: 'administrator',
      email: 'administrator@hotel.com',
      password: hashedPassword,
      role: 'OWNER',
      firstName: 'Administrator',
      lastName: 'Administrator',
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
      location: 'Downtown Business District',
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
      location: 'Beachfront Resort Area',
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
      location: 'Mountain View Resort',
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
      location: 'City Center Business Hub',
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

  // Create Sample Agreement Files
  const agreements = [
    {
      hotelId: grandPalace.id,
      fileName: 'partnership_agreement.pdf',
      filePath: '/uploads/agreements/grand_palace_partnership.pdf',
      fileSize: 2048576, // 2MB
      mimeType: 'application/pdf',
      uploadedAt: new Date(),
    },
    {
      hotelId: grandPalace.id,
      fileName: 'service_contract.docx',
      filePath: '/uploads/agreements/grand_palace_service.docx',
      fileSize: 1024000, // 1MB
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: new Date(),
    },
    {
      hotelId: oceanView.id,
      fileName: 'resort_management_agreement.pdf',
      filePath: '/uploads/agreements/ocean_view_management.pdf',
      fileSize: 3145728, // 3MB
      mimeType: 'application/pdf',
      uploadedAt: new Date(),
    },
    {
      hotelId: mountainLodge.id,
      fileName: 'lodge_operations_contract.pdf',
      filePath: '/uploads/agreements/mountain_lodge_operations.pdf',
      fileSize: 1572864, // 1.5MB
      mimeType: 'application/pdf',
      uploadedAt: new Date(),
    },
    {
      hotelId: cityCenter.id,
      fileName: 'business_partnership.pdf',
      filePath: '/uploads/agreements/city_center_business.pdf',
      fileSize: 2621440, // 2.5MB
      mimeType: 'application/pdf',
      uploadedAt: new Date(),
    },
    {
      hotelId: cityCenter.id,
      fileName: 'corporate_rates_agreement.txt',
      filePath: '/uploads/agreements/city_center_corporate.txt',
      fileSize: 51200, // 50KB
      mimeType: 'text/plain',
      uploadedAt: new Date(),
    },
  ];

  await prisma.hotelAgreement.createMany({ data: agreements });
  console.log('📄 Created sample agreement files');

  // Create Rooms
  const deluxeSuite = await prisma.room.create({
    data: {
      hotelId: grandPalace.id,
      roomType: 'Deluxe Suite',
      roomTypeDescription: 'Luxury suite with ocean view and premium amenities including king bed, marble bathroom, and private balcony',
      altDescription: 'جناح فاخر مع إطلالة على المحيط ووسائل راحة متميزة',
      purchasePrice: 200.00,
      basePrice: 250.00,
      alternativePrice: 300.00,
      availableFrom: new Date('2024-01-01'),
      availableTo: new Date('2024-12-31'),
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
      purchasePrice: 140.00,
      basePrice: 180.00,
      alternativePrice: 220.00,
      availableFrom: new Date('2024-01-01'),
      availableTo: new Date('2024-12-31'),
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
      purchasePrice: 350.00,
      basePrice: 450.00,
      alternativePrice: 550.00,
      availableFrom: new Date('2024-01-01'),
      availableTo: new Date('2024-12-31'),
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
      purchasePrice: 160.00,
      basePrice: 200.00,
      alternativePrice: 240.00,
      availableFrom: new Date('2024-01-01'),
      availableTo: new Date('2024-12-31'),
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
      purchasePrice: 90.00,
      basePrice: 120.00,
      alternativePrice: 150.00,
      availableFrom: new Date('2024-01-01'),
      availableTo: new Date('2024-12-31'),
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
      purchasePrice: 120.00,
      basePrice: 150.00,
      alternativePrice: 180.00,
      availableFrom: new Date('2024-01-01'),
      availableTo: new Date('2024-12-31'),
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
    // Deluxe Suite amenities
    { roomId: deluxeSuite.id, name: 'King Bed', icon: '🛏️' },
    { roomId: deluxeSuite.id, name: 'Ocean View', icon: '🌊' },
    { roomId: deluxeSuite.id, name: 'Balcony', icon: '🏡' },
    { roomId: deluxeSuite.id, name: 'Marble Bathroom', icon: '🛁' },
    { roomId: deluxeSuite.id, name: 'Mini Bar', icon: '🍷' },
    { roomId: deluxeSuite.id, name: 'Safe', icon: '🔒' },
    { roomId: deluxeSuite.id, name: 'Air Conditioning', icon: '❄️' },
    { roomId: deluxeSuite.id, name: 'WiFi', icon: '📶' },
    
    // Family Room amenities
    { roomId: familyRoom.id, name: 'Two Double Beds', icon: '🛏️' },
    { roomId: familyRoom.id, name: 'Play Area', icon: '🎮' },
    { roomId: familyRoom.id, name: 'Refrigerator', icon: '❄️' },
    { roomId: familyRoom.id, name: 'Safe', icon: '🔒' },
    { roomId: familyRoom.id, name: 'City View', icon: '🏙️' },
    { roomId: familyRoom.id, name: 'WiFi', icon: '📶' },
    { roomId: familyRoom.id, name: 'Baby Crib Available', icon: '👶' },
    
    // Presidential Suite amenities
    { roomId: presidentialSuite.id, name: 'King Bed', icon: '🛏️' },
    { roomId: presidentialSuite.id, name: 'Living Room', icon: '🛋️' },
    { roomId: presidentialSuite.id, name: 'Dining Area', icon: '🍽️' },
    { roomId: presidentialSuite.id, name: 'Panoramic View', icon: '🌆' },
    { roomId: presidentialSuite.id, name: 'Jacuzzi', icon: '🛁' },
    { roomId: presidentialSuite.id, name: 'Butler Service', icon: '🤵' },
    { roomId: presidentialSuite.id, name: 'Private Terrace', icon: '🌿' },
    { roomId: presidentialSuite.id, name: 'Premium WiFi', icon: '📶' },
    
    // Ocean View Room amenities
    { roomId: oceanViewRoom.id, name: 'Queen Bed', icon: '🛏️' },
    { roomId: oceanViewRoom.id, name: 'Ocean View', icon: '🌊' },
    { roomId: oceanViewRoom.id, name: 'Private Bathroom', icon: '🚿' },
    { roomId: oceanViewRoom.id, name: 'Air Conditioning', icon: '❄️' },
    { roomId: oceanViewRoom.id, name: 'WiFi', icon: '📶' },
    { roomId: oceanViewRoom.id, name: 'Mini Fridge', icon: '🧊' },
    
    // Mountain View amenities
    { roomId: mountainView.id, name: 'Double Bed', icon: '🛏️' },
    { roomId: mountainView.id, name: 'Mountain View', icon: '🏔️' },
    { roomId: mountainView.id, name: 'Fireplace', icon: '🔥' },
    { roomId: mountainView.id, name: 'Wooden Furniture', icon: '🪵' },
    { roomId: mountainView.id, name: 'WiFi', icon: '📶' },
    { roomId: mountainView.id, name: 'Hiking Gear Storage', icon: '🎒' },
    
    // Business Room amenities
    { roomId: businessRoom.id, name: 'Queen Bed', icon: '🛏️' },
    { roomId: businessRoom.id, name: 'Work Desk', icon: '💻' },
    { roomId: businessRoom.id, name: 'Ergonomic Chair', icon: '🪑' },
    { roomId: businessRoom.id, name: 'High-Speed WiFi', icon: '📶' },
    { roomId: businessRoom.id, name: 'Business Center Access', icon: '🏢' },
    { roomId: businessRoom.id, name: 'Coffee Machine', icon: '☕' },
    { roomId: businessRoom.id, name: 'City View', icon: '🏙️' },
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
      useAlternativeRate: false,
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
      useAlternativeRate: false,
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
      roomRate: 220.00, // Using alternative rate
      useAlternativeRate: true,
      alternativeRate: 220.00,
      totalAmount: 2200.00, // 2 rooms * 5 nights * 220
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
      method: 'CASH',
      totalAmount: 750.00,
      paidAmount: 750.00,
      remainingAmount: 0.00,
      paymentDate: new Date('2024-01-15'),
      status: 'COMPLETED',
      transactionId: 'TXN-001-2024',
      notes: 'Full cash payment at check-in',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking2.id,
      method: 'CREDIT',
      totalAmount: 600.00,
      paidAmount: 300.00,
      remainingAmount: 300.00,
      paymentDate: new Date('2024-01-18'),
      remainingDueDate: new Date('2024-01-23'),
      status: 'PARTIALLY_PAID',
      transactionId: 'TXN-002-2024',
      notes: '50% deposit paid on credit, remaining due at checkout',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking3.id,
      method: 'CREDIT',
      totalAmount: 2200.00,
      paidAmount: 1100.00,
      remainingAmount: 1100.00,
      paymentDate: new Date('2024-01-22'),
      remainingDueDate: new Date('2024-01-30'),
      status: 'PARTIALLY_PAID',
      transactionId: 'TXN-003-2024',
      notes: '50% deposit paid on credit with alternative rate',
    },
  });

  console.log('💳 Created payments');

  // Create System Settings
  const systemSettings = [
    {
      key: 'default_currency',
      value: 'AED',
      category: 'system',
      isActive: true,
    },
    {
      key: 'tax_rate',
      value: '5.0',
      category: 'payment',
      isActive: true,
    },
    {
      key: 'cancellation_policy',
      value: JSON.stringify({
        freeCancel: 24,
        partialRefund: 48,
        noRefund: 72
      }),
      category: 'booking',
      isActive: true,
    },
    {
      key: 'check_in_time',
      value: '15:00',
      category: 'booking',
      isActive: true,
    },
    {
      key: 'check_out_time',
      value: '12:00',
      category: 'booking',
      isActive: true,
    },
    {
      key: 'loyalty_points_rate',
      value: '1',
      category: 'loyalty',
      isActive: true,
    },
    {
      key: 'vip_discount_rate',
      value: '10.0',
      category: 'pricing',
      isActive: true,
    },
    {
      key: 'seasonal_markup',
      value: '40.0',
      category: 'pricing',
      isActive: true,
    },
    {
      key: 'max_booking_days',
      value: '365',
      category: 'booking',
      isActive: true,
    },
    {
      key: 'system_language',
      value: 'en',
      category: 'system',
      isActive: true,
    },
    {
      key: 'date_format',
      value: 'YYYY-MM-DD',
      category: 'system',
      isActive: true,
    },
    {
      key: 'time_zone',
      value: 'UTC+4',
      category: 'system',
      isActive: true,
    },
    {
      key: 'email_notifications',
      value: JSON.stringify({
        booking_confirmation: true,
        payment_received: true,
        check_in_reminder: true,
        cancellation_notice: true
      }),
      category: 'system',
      isActive: true,
    },
    {
      key: 'backup_frequency',
      value: 'daily',
      category: 'system',
      isActive: true,
    },
    {
      key: 'session_timeout',
      value: '3600',
      category: 'security',
      isActive: true,
    },
  ];

  await prisma.systemSetting.createMany({ data: systemSettings });
  console.log('⚙️ Created system settings');

  // Create Audit Logs for demonstration
  const auditLogs = [
    {
      userId: owner.id,
      action: 'CREATE_HOTEL',
      tableName: 'hotels',
      recordId: grandPalace.id,
      newValues: {
        name: 'Grand Palace Hotel',
        code: 'GPH001',
        action: 'created'
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    {
      userId: staff1.id,
      action: 'CREATE_BOOKING',
      tableName: 'bookings',
      recordId: booking1.id,
      newValues: {
        resId: 'RES-2024-001',
        guestName: 'Ahmed Al-Rashid',
        action: 'created'
      },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    {
      userId: owner.id,
      action: 'CREATE_USER',
      tableName: 'users',
      recordId: staff2.id,
      newValues: {
        username: 'staff2',
        role: 'STAFF',
        action: 'created'
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    {
      userId: staff2.id,
      action: 'CREATE_BOOKING',
      tableName: 'bookings',
      recordId: booking2.id,
      newValues: {
        resId: 'RES-2024-002',
        guestName: 'Sarah Johnson',
        action: 'created'
      },
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
    {
      userId: owner.id,
      action: 'UPDATE_SYSTEM_SETTING',
      tableName: 'systemSettings',
      recordId: 'tax_rate',
      oldValues: {
        value: '0.0'
      },
      newValues: {
        value: '5.0'
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  ];

  await prisma.auditLog.createMany({ data: auditLogs });
  console.log('📋 Created audit logs');

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   👥 Users: ${await prisma.user.count()}`);
  console.log(`   🏨 Hotels: ${await prisma.hotel.count()}`);
  console.log(`   🏠 Rooms: ${await prisma.room.count()}`);
  console.log(`   👤 Guests: ${await prisma.guest.count()}`);
  console.log(`   📝 Bookings: ${await prisma.booking.count()}`);
  console.log(`   💳 Payments: ${await prisma.payment.count()}`);
  console.log(`   📅 Availability Slots: ${await prisma.availabilitySlot.count()}`);
  console.log(`   📄 Agreements: ${await prisma.hotelAgreement.count()}`);
  console.log(`   ⚙️ System Settings: ${await prisma.systemSetting.count()}`);
  console.log(`   📋 Audit Logs: ${await prisma.auditLog.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });