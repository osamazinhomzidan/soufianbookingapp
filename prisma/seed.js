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
  const hotels = [];
  
  const hotelData = [
    {
      name: 'Grand Palace Hotel',
      code: 'GPH001',
      altName: 'فندق القصر الكبير',
      description: 'Luxury hotel in the heart of the city',
      altDescription: 'فندق فاخر في قلب المدينة مع خدمات متميزة ووسائل راحة حديثة',
      address: '123 Main Street, Downtown',
      location: 'Downtown Business District'
    },
    {
      name: 'Ocean View Resort',
      code: 'OVR002',
      altName: 'منتجع إطلالة المحيط',
      description: 'Beautiful resort with stunning ocean views',
      altDescription: 'منتجع جميل مع إطلالات خلابة على المحيط وشاطئ خاص',
      address: '456 Ocean Drive, Beachfront',
      location: 'Beachfront Resort Area'
    },
    {
      name: 'Mountain Lodge',
      code: 'ML003',
      altName: 'نزل الجبل',
      description: 'Cozy lodge with mountain scenery',
      altDescription: 'نزل مريح مع مناظر جبلية خلابة وأجواء هادئة',
      address: '789 Mountain Road, Mountain View',
      location: 'Mountain View Resort'
    },
    {
      name: 'City Center Hotel',
      code: 'CCH004',
      altName: 'فندق وسط المدينة',
      description: 'Modern hotel perfect for business travelers',
      altDescription: 'فندق حديث مثالي لرجال الأعمال مع مرافق متطورة',
      address: '321 Business District, City Center',
      location: 'City Center Business Hub'
    },
    {
      name: 'Royal Gardens Hotel',
      code: 'RGH005',
      altName: 'فندق الحدائق الملكية',
      description: 'Elegant hotel surrounded by beautiful gardens',
      altDescription: 'فندق أنيق محاط بحدائق جميلة ومناظر طبيعية خلابة',
      address: '555 Garden Avenue, Green District',
      location: 'Garden District'
    },
    {
      name: 'Desert Oasis Resort',
      code: 'DOR006',
      altName: 'منتجع واحة الصحراء',
      description: 'Unique desert experience with luxury amenities',
      altDescription: 'تجربة صحراوية فريدة مع وسائل راحة فاخرة ومغامرات مثيرة',
      address: '777 Desert Highway, Oasis Valley',
      location: 'Desert Oasis'
    },
    {
      name: 'Skyline Tower Hotel',
      code: 'STH007',
      altName: 'فندق برج الأفق',
      description: 'High-rise hotel with panoramic city views',
      altDescription: 'فندق شاهق الارتفاع مع إطلالات بانورامية على المدينة',
      address: '888 Skyline Boulevard, Financial District',
      location: 'Financial District'
    },
    {
      name: 'Seaside Paradise Resort',
      code: 'SPR008',
      altName: 'منتجع جنة البحر',
      description: 'Tropical paradise with pristine beaches',
      altDescription: 'جنة استوائية مع شواطئ نقية ومياه صافية',
      address: '999 Paradise Beach, Coastal Area',
      location: 'Paradise Beach'
    },
    {
      name: 'Heritage Boutique Hotel',
      code: 'HBH009',
      altName: 'فندق التراث البوتيكي',
      description: 'Charming boutique hotel with historical character',
      altDescription: 'فندق بوتيكي ساحر بطابع تاريخي وتصميم أصيل',
      address: '111 Heritage Street, Old Town',
      location: 'Historic Old Town'
    },
    {
      name: 'Alpine Retreat Lodge',
      code: 'ARL010',
      altName: 'نزل الملاذ الجبلي',
      description: 'Peaceful mountain retreat with spa facilities',
      altDescription: 'ملاذ جبلي هادئ مع مرافق سبا ومناظر طبيعية',
      address: '222 Alpine Road, Mountain Peak',
      location: 'Alpine Mountains'
    },
    {
      name: 'Metropolitan Suites',
      code: 'MS011',
      altName: 'أجنحة المتروبوليتان',
      description: 'Sophisticated suites in the metropolitan area',
      altDescription: 'أجنحة راقية في المنطقة الحضرية مع خدمات متميزة',
      address: '333 Metro Plaza, Central District',
      location: 'Metropolitan Center'
    },
    {
      name: 'Riverside Inn',
      code: 'RI012',
      altName: 'نزل ضفاف النهر',
      description: 'Charming inn by the riverside with scenic views',
      altDescription: 'نزل ساحر على ضفاف النهر مع مناظر خلابة',
      address: '444 River Road, Riverside',
      location: 'Riverside District'
    },
    {
      name: 'Golden Sands Resort',
      code: 'GSR013',
      altName: 'منتجع الرمال الذهبية',
      description: 'Luxury beachfront resort with golden sand beaches',
      altDescription: 'منتجع فاخر على الشاطئ مع رمال ذهبية ومياه فيروزية',
      address: '555 Golden Beach, Coastal Highway',
      location: 'Golden Beach'
    },
    {
      name: 'Urban Loft Hotel',
      code: 'ULH014',
      altName: 'فندق اللوفت الحضري',
      description: 'Modern loft-style hotel in trendy urban area',
      altDescription: 'فندق حديث بطراز اللوفت في منطقة حضرية عصرية',
      address: '666 Loft Street, Trendy Quarter',
      location: 'Urban Trendy Quarter'
    },
    {
      name: 'Wellness Spa Resort',
      code: 'WSR015',
      altName: 'منتجع السبا والعافية',
      description: 'Health and wellness focused resort with spa treatments',
      altDescription: 'منتجع مخصص للصحة والعافية مع علاجات سبا متنوعة',
      address: '777 Wellness Way, Spa Valley',
      location: 'Wellness Valley'
    },
    {
      name: 'Castle View Manor',
      code: 'CVM016',
      altName: 'قصر إطلالة القلعة',
      description: 'Historic manor with castle views and royal ambiance',
      altDescription: 'قصر تاريخي مع إطلالة على القلعة وأجواء ملكية',
      address: '888 Castle Hill, Royal District',
      location: 'Royal Castle District'
    },
    {
      name: 'Eco Forest Lodge',
      code: 'EFL017',
      altName: 'نزل الغابة البيئي',
      description: 'Eco-friendly lodge in pristine forest setting',
      altDescription: 'نزل صديق للبيئة في بيئة غابات نقية ومحمية',
      address: '999 Forest Trail, Green Valley',
      location: 'Eco Forest Reserve'
    },
    {
      name: 'Marina Bay Hotel',
      code: 'MBH018',
      altName: 'فندق خليج المارينا',
      description: 'Waterfront hotel with marina and yacht facilities',
      altDescription: 'فندق على الواجهة المائية مع مرافق مارينا ويخوت',
      address: '101 Marina Boulevard, Harbor District',
      location: 'Marina Harbor'
    },
    {
      name: 'Sunset Valley Resort',
      code: 'SVR019',
      altName: 'منتجع وادي الغروب',
      description: 'Romantic resort known for spectacular sunsets',
      altDescription: 'منتجع رومانسي مشهور بمناظر الغروب الخلابة',
      address: '202 Sunset Drive, Valley View',
      location: 'Sunset Valley'
    },
    {
      name: 'Business Executive Hotel',
      code: 'BEH020',
      altName: 'فندق رجال الأعمال التنفيذي',
      description: 'Premium business hotel with executive facilities',
      altDescription: 'فندق أعمال متميز مع مرافق تنفيذية ومؤتمرات',
      address: '303 Executive Plaza, Business Park',
      location: 'Executive Business Park'
    }
  ];

  for (const hotelInfo of hotelData) {
    const hotel = await prisma.hotel.create({
      data: {
        ...hotelInfo,
        createdById: owner.id,
      },
    });
    hotels.push(hotel);
  }

  // For backward compatibility, assign the first 4 hotels to original variables
  const grandPalace = hotels[0];
  const oceanView = hotels[1];
  const mountainLodge = hotels[2];
  const cityCenter = hotels[3];

  console.log('🏨 Created hotels');

  // Create Hotel Amenities
  const amenityTypes = [
    { name: 'WiFi', icon: '📶' },
    { name: 'Pool', icon: '🏊' },
    { name: 'Spa', icon: '💆' },
    { name: 'Restaurant', icon: '🍽️' },
    { name: 'Gym', icon: '💪' },
    { name: 'Beach Access', icon: '🏖️' },
    { name: 'Water Sports', icon: '🏄' },
    { name: 'Fireplace', icon: '🔥' },
    { name: 'Hiking Trails', icon: '🥾' },
    { name: 'Business Center', icon: '💼' },
    { name: 'Conference Rooms', icon: '🏢' },
    { name: 'Parking', icon: '🚗' },
    { name: 'Room Service', icon: '🛎️' },
    { name: 'Laundry', icon: '👕' },
    { name: 'Airport Shuttle', icon: '✈️' },
    { name: 'Pet Friendly', icon: '🐕' },
    { name: 'Bar', icon: '🍸' },
    { name: 'Concierge', icon: '🎩' },
    { name: 'Balcony', icon: '🏞️' },
    { name: 'Garden', icon: '🌺' }
  ];

  const hotelAmenities = [];
  hotels.forEach((hotel, index) => {
    // Each hotel gets 4-6 random amenities
    const numAmenities = 4 + Math.floor(Math.random() * 3);
    const shuffledAmenities = [...amenityTypes].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numAmenities; i++) {
      hotelAmenities.push({
        hotelId: hotel.id,
        name: shuffledAmenities[i].name,
        icon: shuffledAmenities[i].icon
      });
    }
  });

  await prisma.hotelAmenity.createMany({ data: hotelAmenities });
  console.log('🏨 Created hotel amenities');

  // Create Sample Agreement Files
  const agreementTypes = [
    { fileName: 'partnership_agreement.pdf', mimeType: 'application/pdf', sizeRange: [1024000, 3145728] },
    { fileName: 'service_contract.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', sizeRange: [512000, 2048576] },
    { fileName: 'management_agreement.pdf', mimeType: 'application/pdf', sizeRange: [1572864, 4194304] },
    { fileName: 'operations_contract.pdf', mimeType: 'application/pdf', sizeRange: [1048576, 2621440] },
    { fileName: 'corporate_rates_agreement.txt', mimeType: 'text/plain', sizeRange: [25600, 102400] }
  ];

  const agreements = [];
  hotels.forEach((hotel, index) => {
    // Each hotel gets 1-3 random agreement files
    const numAgreements = 1 + Math.floor(Math.random() * 3);
    const shuffledAgreements = [...agreementTypes].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numAgreements; i++) {
      const agreement = shuffledAgreements[i];
      const fileSize = agreement.sizeRange[0] + Math.floor(Math.random() * (agreement.sizeRange[1] - agreement.sizeRange[0]));
      const hotelCode = hotel.code.toLowerCase().replace(/\s+/g, '_');
      
      agreements.push({
        hotelId: hotel.id,
        fileName: agreement.fileName,
        filePath: `/uploads/agreements/${hotelCode}_${agreement.fileName}`,
        fileSize: fileSize,
        mimeType: agreement.mimeType,
        uploadedAt: new Date(),
      });
    }
  });

  await prisma.hotelAgreement.createMany({ data: agreements });
  console.log('📄 Created sample agreement files');

  // Create Rooms
  const roomTypes = [
    {
      roomType: 'Standard Room',
      roomTypeDescription: 'Comfortable room with modern amenities and city view',
      altDescription: 'غرفة مريحة مع وسائل راحة حديثة وإطلالة على المدينة',
      purchasePrice: [80, 120],
      basePrice: [100, 150],
      alternativePrice: [120, 180],
      quantity: [8, 15],
      boardType: 'BED_BREAKFAST',
      size: ['25 sqm', '30 sqm'],
      capacity: 2,
      floor: [1, 3]
    },
    {
      roomType: 'Deluxe Room',
      roomTypeDescription: 'Spacious room with premium amenities and beautiful views',
      altDescription: 'غرفة واسعة مع وسائل راحة متميزة وإطلالات جميلة',
      purchasePrice: [150, 200],
      basePrice: [180, 250],
      alternativePrice: [220, 300],
      quantity: [5, 10],
      boardType: 'HALF_BOARD',
      size: ['35 sqm', '45 sqm'],
      capacity: 2,
      floor: [2, 4]
    },
    {
      roomType: 'Family Suite',
      roomTypeDescription: 'Large suite perfect for families with separate living area',
      altDescription: 'جناح كبير مثالي للعائلات مع منطقة معيشة منفصلة',
      purchasePrice: [200, 280],
      basePrice: [250, 350],
      alternativePrice: [300, 420],
      quantity: [3, 8],
      boardType: 'FULL_BOARD',
      size: ['50 sqm', '65 sqm'],
      capacity: 4,
      floor: [2, 5]
    },
    {
      roomType: 'Executive Suite',
      roomTypeDescription: 'Luxury suite with premium amenities and exclusive services',
      altDescription: 'جناح فاخر مع وسائل راحة متميزة وخدمات حصرية',
      purchasePrice: [300, 400],
      basePrice: [380, 500],
      alternativePrice: [450, 600],
      quantity: [1, 3],
      boardType: 'FULL_BOARD',
      size: ['70 sqm', '90 sqm'],
      capacity: 3,
      floor: [3, 6]
    }
  ];

  const createdRooms = [];
  for (const hotel of hotels) {
    // Each hotel gets 2-4 different room types
    const numRoomTypes = 2 + Math.floor(Math.random() * 3);
    const shuffledRoomTypes = [...roomTypes].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numRoomTypes; i++) {
      const roomType = shuffledRoomTypes[i];
      const purchasePrice = roomType.purchasePrice[0] + Math.random() * (roomType.purchasePrice[1] - roomType.purchasePrice[0]);
      const basePrice = roomType.basePrice[0] + Math.random() * (roomType.basePrice[1] - roomType.basePrice[0]);
      const alternativePrice = roomType.alternativePrice[0] + Math.random() * (roomType.alternativePrice[1] - roomType.alternativePrice[0]);
      const quantity = roomType.quantity[0] + Math.floor(Math.random() * (roomType.quantity[1] - roomType.quantity[0] + 1));
      const floor = roomType.floor[0] + Math.floor(Math.random() * (roomType.floor[1] - roomType.floor[0] + 1));
      const size = Array.isArray(roomType.size) ? roomType.size[Math.floor(Math.random() * roomType.size.length)] : roomType.size;
      
      const room = await prisma.room.create({
        data: {
          hotelId: hotel.id,
          roomType: roomType.roomType,
          roomTypeDescription: roomType.roomTypeDescription,
          altDescription: roomType.altDescription,
          purchasePrice: Math.round(purchasePrice * 100) / 100,
          basePrice: Math.round(basePrice * 100) / 100,
          alternativePrice: Math.round(alternativePrice * 100) / 100,
          availableFrom: new Date('2025-09-15'),
          availableTo: new Date('2025-09-27'),
          quantity: quantity,
          boardType: roomType.boardType,
          size: size,
          capacity: roomType.capacity,
          floor: floor,
          createdById: owner.id,
        },
      });
      
      createdRooms.push(room);
    }
  }
  
  // Maintain backward compatibility
  const deluxeSuite = createdRooms[0];
  const familyRoom = createdRooms[1];
  const presidentialSuite = createdRooms[2];
  const oceanViewRoom = createdRooms[3];
  const mountainView = createdRooms[4];
  const businessRoom = createdRooms[5];

  console.log('🏠 Created rooms');

  // Create Room Amenities
  const roomAmenityTypes = {
    'Standard Room': [
      { name: 'Queen Bed', icon: '🛏️' },
      { name: 'Air Conditioning', icon: '❄️' },
      { name: 'WiFi', icon: '📶' },
      { name: 'Private Bathroom', icon: '🚿' },
      { name: 'City View', icon: '🏙️' },
      { name: 'Safe', icon: '🔒' },
      { name: 'Mini Fridge', icon: '🧊' }
    ],
    'Deluxe Room': [
      { name: 'King Bed', icon: '🛏️' },
      { name: 'Balcony', icon: '🏡' },
      { name: 'Marble Bathroom', icon: '🛁' },
      { name: 'Mini Bar', icon: '🍷' },
      { name: 'Safe', icon: '🔒' },
      { name: 'Air Conditioning', icon: '❄️' },
      { name: 'Premium WiFi', icon: '📶' },
      { name: 'Room Service', icon: '🛎️' }
    ],
    'Family Suite': [
      { name: 'Two Double Beds', icon: '🛏️' },
      { name: 'Living Area', icon: '🛋️' },
      { name: 'Refrigerator', icon: '❄️' },
      { name: 'Safe', icon: '🔒' },
      { name: 'WiFi', icon: '📶' },
      { name: 'Baby Crib Available', icon: '👶' },
      { name: 'Play Area', icon: '🎮' },
      { name: 'Kitchenette', icon: '🍳' }
    ],
    'Executive Suite': [
      { name: 'King Bed', icon: '🛏️' },
      { name: 'Living Room', icon: '🛋️' },
      { name: 'Dining Area', icon: '🍽️' },
      { name: 'Panoramic View', icon: '🌆' },
      { name: 'Jacuzzi', icon: '🛁' },
      { name: 'Butler Service', icon: '🤵' },
      { name: 'Private Terrace', icon: '🌿' },
      { name: 'Premium WiFi', icon: '📶' },
      { name: 'Concierge Service', icon: '🎩' }
    ]
  };

  const roomAmenities = [];
  createdRooms.forEach(room => {
    const amenitiesForType = roomAmenityTypes[room.roomType] || roomAmenityTypes['Standard Room'];
    // Each room gets 4-7 amenities from its type
    const numAmenities = 4 + Math.floor(Math.random() * 4);
    const shuffledAmenities = [...amenitiesForType].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < Math.min(numAmenities, shuffledAmenities.length); i++) {
      roomAmenities.push({
        roomId: room.id,
        name: shuffledAmenities[i].name,
        icon: shuffledAmenities[i].icon
      });
    }
  });

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
      telephone: '+971-50-123-4568',
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
      vip: true,
      notes: 'Prefers high floor rooms',
      totalStays: 5,
      totalSpent: 2500.00,
      lastStayDate: new Date('2024-01-10'),
      lastStay: '2024-01-10',
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
      telephone: '+1-555-987-6544',
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
      vip: false,
      notes: 'Vegetarian meals preferred',
      totalStays: 2,
      totalSpent: 800.00,
      lastStayDate: new Date('2023-12-15'),
      lastStay: '2023-12-15',
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
      telephone: '+966-50-111-2223',
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
      vip: true,
      notes: 'Family with 2 children',
      totalStays: 8,
      totalSpent: 4200.00,
      lastStayDate: new Date('2024-01-20'),
      lastStay: '2024-01-20',
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