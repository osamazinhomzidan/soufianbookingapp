'use client';

import { useState, useEffect } from 'react';

interface Hotel {
  id: string;
  name: string;
  code: string;
}

interface Room {
  id: string;
  hotelId: string;
  type: string;
  boardType: 'Room only' | 'Bed & breakfast' | 'Half board' | 'Full board';
  description: string;
  rate: number;
  available: boolean;
  status: 'available' | 'occupied' | 'maintenance';
  availableCount?: number;
}

interface Guest {
  fullName: string;
  email: string;
  guestClassification: string;
  travelAgent: string;
  company: string;
  source: string;
  group: string;
  arrival: string;
  departure: string;
  vip: boolean;
  nationality: string;
  telephone: string;
  roomNo: string;
  rateCode: string;
  roomRate: number;
  payment: string;
  resId: string;
  profileId: string;
}

interface Payment {
  method: 'cash' | 'credit' | 'visa';
  amount: number;
  date: string;
  startDate?: string;
  completionDate?: string;
  amountPaidToday?: number;
  remainingBalance?: number;
}

interface Booking {
  id: string;
  resId: string;
  guest: Guest;
  room: Room;
  numberOfRooms: number;
  payment: Payment;
  status: 'pending' | 'confirmed' | 'checked-in' | 'cancelled';
  createdAt: string;
}

export default function Booking() {
  const [language, setLanguage] = useState('en');
  
  // Step 1: Room Selection
  const [selectedHotelId, setSelectedHotelId] = useState('hotel-1');
  const [selectedRoomId, setSelectedRoomId] = useState('room-1');
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [arrivalDate, setArrivalDate] = useState('2024-01-15');
  const [departureDate, setDepartureDate] = useState('2024-01-20');
  const [numberOfNights, setNumberOfNights] = useState(5);
  
  // Step 2: Guest Data
  const [guestData, setGuestData] = useState<Guest>({
    fullName: 'Ahmed Mohammed Al-Rashid',
    email: 'ahmed.alrashid@email.com',
    guestClassification: 'Saudi Citizen',
    travelAgent: 'Emirates Travel Agency',
    company: 'Al-Rashid Trading Co.',
    source: 'Online Booking',
    group: 'Business Group',
    arrival: '2024-01-15',
    departure: '2024-01-20',
    vip: true,
    nationality: 'UAE',
    telephone: '+971-50-123-4567',
    roomNo: '205',
    rateCode: 'CORP',
    roomRate: 250,
    payment: 'credit',
    resId: 'RES-2024-001',
    profileId: 'PROF-12345'
  });
  
  // Step 3: Payment
  const [paymentData, setPaymentData] = useState<Payment>({
    method: 'credit',
    amount: 1250,
    date: '2024-01-15',
    startDate: '2024-01-15',
    completionDate: '2024-01-25',
    amountPaidToday: 500,
    remainingBalance: 750
  });
  
  // Operations Management
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });
  
  // Data states
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch hotels
        const hotelsResponse = await fetch('/hotels.json');
        const hotelsData = await hotelsResponse.json();
        setHotels(hotelsData);
        
        // Fetch rooms
        const roomsResponse = await fetch('/rooms.json');
        const roomsData = await roomsResponse.json();
        setRooms(roomsData);
        
        // Fetch bookings
        const bookingsResponse = await fetch('/bookings.json');
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate number of nights
  const calculateNights = (arrival: string, departure: string) => {
    if (arrival && departure) {
      const arrivalDate = new Date(arrival);
      const departureDate = new Date(departure);
      const timeDiff = departureDate.getTime() - arrivalDate.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setNumberOfNights(nights > 0 ? nights : 0);
    }
  };
  
  // Get available rooms for selected hotel
  const getAvailableRooms = () => {
    return rooms.filter(room => room.hotelId === selectedHotelId);
  };
  
  // Get selected room details
  const getSelectedRoom = () => {
    return rooms.find(room => room.id === selectedRoomId);
  };
  
  // Get selected hotel details
  const getSelectedHotel = () => {
    return hotels.find(hotel => hotel.id === selectedHotelId);
  };
  
  // Handle booking confirmation
  const handleConfirmBooking = () => {
    const selectedRoom = getSelectedRoom();
    if (selectedRoom) {
      const newBooking: Booking = {
        id: Date.now().toString(),
        resId: guestData.resId || `RES${Date.now()}`,
        guest: {
          ...guestData,
          arrival: arrivalDate,
          departure: departureDate,
          roomRate: selectedRoom.rate
        },
        room: selectedRoom,
        numberOfRooms: numberOfRooms,
        payment: paymentData,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };
      
      setBookings([...bookings, newBooking]);
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'checked-in': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied': return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const statusMatch = !statusFilter || booking.status === statusFilter;
    const dateMatch = (!dateRangeFilter.start || booking.guest.arrival >= dateRangeFilter.start) &&
                     (!dateRangeFilter.end || booking.guest.departure <= dateRangeFilter.end);
    return statusMatch && dateMatch;
  });
  
  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-gray-700">
              {language === 'ar' ? 'جاري تحميل البيانات...' : 'Loading data...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-6xl">
        {/* Glassmorphism card */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-8">
          
          
          {/* All Steps Content */}
          <div className="space-y-8">
            {/* Step 1: Room Selection */}
            <div className="backdrop-blur-sm bg-white/50 border border-white/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {language === 'ar' ? 'اختيار الغرفة' : 'Room Selection'}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Hotel Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'الفندق' : 'Hotel'}
                  </label>
                  <select
                    value={selectedHotelId}
                    onChange={(e) => setSelectedHotelId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  >
                    <option value="">{language === 'ar' ? 'اختر الفندق' : 'Select Hotel'}</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name} ({hotel.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Room Type Selection with Availability Colors */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'نوع الغرفة' : 'Room Type'}
                  </label>
                  <div className="space-y-2">
                    {!selectedHotelId ? (
                      <div className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200/50 rounded-xl text-gray-500">
                        {language === 'ar' ? 'اختر الفندق أولاً' : 'Select hotel first'}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getAvailableRooms().map((room) => {
                          const statusColors = {
                            available: 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200',
                            occupied: 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed',
                            maintenance: 'bg-yellow-100 border-yellow-300 text-yellow-800 cursor-not-allowed'
                          };
                          const isSelectable = room.status === 'available' && (room.availableCount || 0) > 0;
                          return (
                            <div
                              key={room.id}
                              onClick={() => isSelectable && setSelectedRoomId(room.id)}
                              className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                selectedRoomId === room.id ? 'ring-2 ring-blue-500' : ''
                              } ${statusColors[room.status]}`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{room.type}</div>
                                  <div className="text-sm opacity-75">{room.boardType}</div>
                                  <div className="text-xs mt-1">
                                    {room.status === 'available' ? (
                                      <span className="text-green-600 font-medium">
                                        {language === 'ar' ? `${room.availableCount || 0} غرفة متاحة` : `${room.availableCount || 0} rooms available`}
                                      </span>
                                    ) : (
                                      <span className="text-red-600 font-medium">
                                        {language === 'ar' ? 'غير متاح' : 'Not available'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">{room.rate} {language === 'ar' ? 'ريال' : 'SAR'}/night</div>
                                  <div className="text-xs capitalize">{room.status}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Number of Rooms */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'عدد الغرف' : 'Number of Rooms'}
                  </label>
                  <select
                    value={numberOfRooms}
                    onChange={(e) => setNumberOfRooms(parseInt(e.target.value))}
                    disabled={!selectedRoomId}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!selectedRoomId ? (
                      <option value={1}>{language === 'ar' ? 'اختر نوع الغرفة أولاً' : 'Select room type first'}</option>
                    ) : (
                      Array.from({ length: Math.min(10, (getSelectedRoom()?.availableCount || 0)) }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                          {num} {language === 'ar' ? (num === 1 ? 'غرفة' : 'غرف') : (num === 1 ? 'room' : 'rooms')}
                        </option>
                      ))
                    )}
                  </select>
                  {selectedRoomId && (
                    <div className="text-xs text-gray-600 mt-1">
                      {language === 'ar' 
                        ? `الحد الأقصى: ${getSelectedRoom()?.availableCount || 0} غرف متاحة`
                        : `Maximum: ${getSelectedRoom()?.availableCount || 0} rooms available`
                      }
                    </div>
                  )}
                </div>
                
                {/* Arrival Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'تاريخ الوصول' : 'Arrival Date'}
                  </label>
                  <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => {
                      setArrivalDate(e.target.value);
                      calculateNights(e.target.value, departureDate);
                    }}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  />
                </div>
                
                {/* Departure Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'تاريخ المغادرة' : 'Departure Date'}
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => {
                      setDepartureDate(e.target.value);
                      calculateNights(arrivalDate, e.target.value);
                    }}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  />
                </div>
                
                {/* Number of Nights */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'عدد الليالي' : 'Number of Nights'}
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl backdrop-blur-sm text-gray-700">
                    {numberOfNights} {language === 'ar' ? 'ليلة' : 'nights'}
                  </div>
                </div>
                
                {/* Alternative Price Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'السعر البديل' : 'Alternative Price'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={guestData.roomRate || 0}
                      onChange={(e) => setGuestData({...guestData, roomRate: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      placeholder={language === 'ar' ? 'أدخل السعر البديل' : 'Enter alternative price'}
                      min="0"
                      step="0.01"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium text-sm">
                        {language === 'ar' ? 'ريال' : 'SAR'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Room Details */}
                {selectedRoomId && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <div className="p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-xl border border-blue-200/50">
                      {(() => {
                        const room = getSelectedRoom();
                        return (
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-2">{room?.type}</h3>
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">
                                {language === 'ar' ? 'الوصف والخدمات:' : 'Description & Amenities:'}
                              </h4>
                              <p className="text-sm text-gray-600">{room?.description}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(room?.status || '')}`}>
                                  {room?.status ? room.status.charAt(0).toUpperCase() + room.status.slice(1) : ''}
                                </span>
                                <span className="text-sm font-medium text-gray-700">
                                  {language === 'ar' ? 'سعر الليلة:' : 'Room Rate:'} {room?.rate} {language === 'ar' ? 'ريال' : 'SAR'}/night
                                </span>
                              </div>
                              <div className="text-lg font-bold text-blue-600">
                                {language === 'ar' ? 'الإجمالي:' : 'Total:'} {(room?.rate || 0) * numberOfNights * numberOfRooms} {language === 'ar' ? 'ريال' : 'SAR'}
                                {numberOfRooms > 1 && (
                                  <div className="text-sm text-gray-600 font-normal">
                                    {language === 'ar' 
                                      ? `(${numberOfRooms} غرف × ${numberOfNights} ليالي × ${room?.rate || 0} ريال)`
                                      : `(${numberOfRooms} rooms × ${numberOfNights} nights × ${room?.rate || 0} SAR)`
                                    }
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()} 
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Step 2: Guest Data Entry */}
            <div className="backdrop-blur-sm bg-white/50 border border-white/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {language === 'ar' ? 'بيانات النزيل' : 'Guest Data Entry'}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    value={guestData.fullName}
                    onChange={(e) => setGuestData({...guestData, fullName: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder={language === 'ar' ? 'أدخل الاسم الكامل' : 'Enter full name'}
                  />
                </div>
                
                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'} *
                  </label>
                  <input
                    type="email"
                    value={guestData.email}
                    onChange={(e) => setGuestData({...guestData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder={language === 'ar' ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
                  />
                </div>
                
                {/* Guest Classification */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'تصنيف النزيل' : 'Guest Classification'} *
                  </label>
                  <select
                    value={guestData.guestClassification}
                    onChange={(e) => setGuestData({...guestData, guestClassification: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  >
                    <option value="">{language === 'ar' ? 'اختر تصنيف النزيل' : 'Select guest classification'}</option>
                    <option value="Saudi Citizen">{language === 'ar' ? 'مواطن سعودي' : 'Saudi Citizen'}</option>
                    <option value="Visitor">{language === 'ar' ? 'زائر' : 'Visitor'}</option>
                    <option value="Resident">{language === 'ar' ? 'مقيم (غير سعودي)' : 'Resident (Non‑Saudi)'}</option>
                  </select>
                </div>
                
                {/* Travel Agent */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'وكيل السفر' : 'Travel Agent'}
                  </label>
                  <input
                    type="text"
                    value={guestData.travelAgent}
                    onChange={(e) => setGuestData({...guestData, travelAgent: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder={language === 'ar' ? 'أدخل وكيل السفر' : 'Enter travel agent'}
                  />
                </div>
                
                {/* Company */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'الشركة' : 'Company'}
                  </label>
                  <input
                    type="text"
                    value={guestData.company}
                    onChange={(e) => setGuestData({...guestData, company: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder={language === 'ar' ? 'أدخل اسم الشركة' : 'Enter company name'}
                  />
                </div>
                
                {/* Source */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'المصدر' : 'Source'}
                  </label>
                  <input
                    type="text"
                    value={guestData.source}
                    onChange={(e) => setGuestData({...guestData, source: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder={language === 'ar' ? 'أدخل المصدر' : 'Enter source'}
                  />
                </div>
                
                {/* Group */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'المجموعة' : 'Group'}
                  </label>
                  <input
                    type="text"
                    value={guestData.group}
                    onChange={(e) => setGuestData({...guestData, group: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder={language === 'ar' ? 'أدخل المجموعة' : 'Enter group'}
                  />
                </div>
                
                {/* VIP Checkbox */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={guestData.vip}
                      onChange={(e) => setGuestData({...guestData, vip: e.target.checked})}
                      className="w-5 h-5 text-blue-600 bg-white/50 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'نزيل مميز (VIP)' : 'VIP Guest'}
                    </span>
                  </label>
                </div>
                
                {/* Nationality */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'الجنسية' : 'Nationality'} *
                  </label>
                  <input
                    type="text"
                    value={guestData.nationality}
                    onChange={(e) => setGuestData({...guestData, nationality: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder={language === 'ar' ? 'أدخل الجنسية' : 'Enter nationality'}
                  />
                </div>
                
                {/* Telephone */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'رقم الهاتف' : 'Telephone'} *
                  </label>
                  <input
                    type="tel"
                    value={guestData.telephone}
                    onChange={(e) => setGuestData({...guestData, telephone: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder={language === 'ar' ? 'أدخل رقم الهاتف' : 'Enter telephone number'}
                  />
                </div>
                
                {/* Room Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'رقم الغرفة' : 'Room Number'}
                  </label>
                  <input
                    type="text"
                    value={guestData.roomNo}
                    onChange={(e) => setGuestData({...guestData, roomNo: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder={language === 'ar' ? 'أدخل رقم الغرفة' : 'Enter room number'}
                  />
                </div>
                
                {/* Rate Code */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'كود التعريفة' : 'Rate Code'}
                  </label>
                  <input
                    type="text"
                    value={guestData.rateCode}
                    onChange={(e) => setGuestData({...guestData, rateCode: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder={language === 'ar' ? 'أدخل كود التعريفة' : 'Enter rate code'}
                  />
                </div>
                
                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                  </label>
                  <select
                    value={guestData.payment}
                    onChange={(e) => setGuestData({...guestData, payment: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  >
                    <option value="">{language === 'ar' ? 'اختر طريقة الدفع' : 'Select payment method'}</option>
                    <option value="cash">{language === 'ar' ? 'نقدي' : 'Cash'}</option>
                    <option value="credit">{language === 'ar' ? 'آجل' : 'Credit'}</option>
                    <option value="visa">{language === 'ar' ? 'فيزا' : 'Visa'}</option>
                  </select>
                </div>
                
                {/* Res ID */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'رقم الحجز' : 'Reservation ID'}
                  </label>
                  <input
                    type="text"
                    value={guestData.resId}
                    onChange={(e) => setGuestData({...guestData, resId: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder={language === 'ar' ? 'أدخل رقم الحجز' : 'Enter reservation ID'}
                  />
                </div>
                
                {/* Profile ID */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'رقم الملف الشخصي' : 'Profile ID'}
                  </label>
                  <input
                    type="text"
                    value={guestData.profileId}
                    onChange={(e) => setGuestData({...guestData, profileId: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder={language === 'ar' ? 'أدخل رقم الملف الشخصي' : 'Enter profile ID'}
                  />
                </div>
                

              </div>
            </div>
            
            {/* Step 3: Payment */}
            <div className="backdrop-blur-sm bg-white/50 border border-white/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {language === 'ar' ? 'الدفع' : 'Payment'}
                </h2>
              </div>
              
              <div className="space-y-6">
                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Cash */}
                    <div
                      onClick={() => setPaymentData({...paymentData, method: 'cash'})}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        paymentData.method === 'cash'
                          ? 'border-green-500 bg-green-50/80 shadow-lg'
                          : 'border-gray-200 bg-white/50 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          paymentData.method === 'cash' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                        }`}></div>
                        <span className="font-medium text-gray-800">
                          {language === 'ar' ? 'نقدي' : 'Cash'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Credit */}
                    <div
                      onClick={() => setPaymentData({...paymentData, method: 'credit'})}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        paymentData.method === 'credit'
                          ? 'border-orange-500 bg-orange-50/80 shadow-lg'
                          : 'border-gray-200 bg-white/50 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          paymentData.method === 'credit' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                        }`}></div>
                        <span className="font-medium text-gray-800">
                          {language === 'ar' ? 'آجل' : 'Credit'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Visa */}
                    <div
                      onClick={() => setPaymentData({...paymentData, method: 'visa'})}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        paymentData.method === 'visa'
                          ? 'border-blue-500 bg-blue-50/80 shadow-lg'
                          : 'border-gray-200 bg-white/50 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          paymentData.method === 'visa' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}></div>
                        <span className="font-medium text-gray-800">
                          {language === 'ar' ? 'فيزا' : 'Visa'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Payment Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'تاريخ الدفع' : 'Payment Date'}
                    </label>
                    <input
                      type="date"
                      value={paymentData.date}
                      onChange={(e) => setPaymentData({...paymentData, date: e.target.value})}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    />
                  </div>
                  
                  {/* Amount Paid */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'المبلغ المدفوع' : 'Amount Paid'}
                    </label>
                    <input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({...paymentData, amount: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      placeholder={language === 'ar' ? 'أدخل المبلغ' : 'Enter amount'}
                    />
                  </div>
                  
                  {/* Credit Payment Details */}
                  {paymentData.method === 'credit' && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {language === 'ar' ? 'تاريخ بداية الدفع' : 'Payment Start Date'}
                        </label>
                        <input
                          type="date"
                          value={paymentData.startDate || ''}
                          onChange={(e) => setPaymentData({...paymentData, startDate: e.target.value})}
                          className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {language === 'ar' ? 'تاريخ إتمام الدفع' : 'Payment Completion Date'}
                        </label>
                        <input
                          type="date"
                          value={paymentData.completionDate || ''}
                          onChange={(e) => setPaymentData({...paymentData, completionDate: e.target.value})}
                          className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {language === 'ar' ? 'المبلغ المدفوع اليوم' : 'Amount Paid Today'}
                        </label>
                        <input
                          type="number"
                          value={paymentData.amountPaidToday || 0}
                          onChange={(e) => {
                            const paidToday = parseFloat(e.target.value) || 0;
                            const remaining = paymentData.amount - paidToday;
                            setPaymentData({
                              ...paymentData,
                              amountPaidToday: paidToday,
                              remainingBalance: remaining > 0 ? remaining : 0
                            });
                          }}
                          className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          placeholder={language === 'ar' ? 'أدخل المبلغ المدفوع اليوم' : 'Enter amount paid today'}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {language === 'ar' ? 'الرصيد المتبقي' : 'Remaining Balance'}
                        </label>
                        <div className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl backdrop-blur-sm text-gray-700">
                          {paymentData.remainingBalance || 0} SAR
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Step 4: Review & Confirmation */}
            <div className="backdrop-blur-sm bg-white/50 border border-white/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {language === 'ar' ? 'مراجعة وتأكيد' : 'Review & Confirmation'}
                </h2>
              </div>
              
              <div className="space-y-6 text-black">
                {/* Room Summary */}
                <div className="p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-xl border border-blue-200/50">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {language === 'ar' ? 'تفاصيل الغرفة' : 'Room Details'}
                  </h3>
                  {(() => {
                    const hotel = getSelectedHotel();
                    const room = getSelectedRoom();
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">Hotel:</span> {hotel?.name} ({hotel?.code})</div>
                        <div><span className="font-medium">Room Type:</span> {room?.type}</div>
                        <div><span className="font-medium">Board Type:</span> {room?.boardType}</div>
                        <div><span className="font-medium">Rate:</span> {room?.rate} SAR/night</div>
                        <div><span className="font-medium">Arrival:</span> {arrivalDate}</div>
                        <div><span className="font-medium">Departure:</span> {departureDate}</div>
                        <div><span className="font-medium">Nights:</span> {numberOfNights}</div>
                        <div><span className="font-medium">Number of Rooms:</span> {numberOfRooms}</div>
                        <div><span className="font-medium">Total:</span> {(room?.rate || 0) * numberOfNights * numberOfRooms} SAR</div>
                      </div>
                    );
                  })()} 
                </div>
                
                {/* Guest Summary */}
                <div className="p-4 bg-gradient-to-r from-green-50/80 to-blue-50/80 rounded-xl border border-green-200/50">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {language === 'ar' ? 'بيانات النزيل' : 'Guest Details'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Name:</span> {guestData.fullName}</div>
                    <div><span className="font-medium">Email:</span> {guestData.email}</div>
                    <div><span className="font-medium">Classification:</span> {guestData.guestClassification}</div>
                    <div><span className="font-medium">Nationality:</span> {guestData.nationality}</div>
                    <div><span className="font-medium">Telephone:</span> {guestData.telephone}</div>
                    <div><span className="font-medium">Company:</span> {guestData.company}</div>
                    <div><span className="font-medium">Travel Agent:</span> {guestData.travelAgent}</div>
                    <div><span className="font-medium">VIP:</span> {guestData.vip ? 'Yes' : 'No'}</div>
                    <div><span className="font-medium">Room No:</span> {guestData.roomNo}</div>
                  </div>
                </div>
                
                {/* Payment Summary */}
                <div className="p-4 bg-gradient-to-r from-yellow-50/80 to-orange-50/80 rounded-xl border border-yellow-200/50">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {language === 'ar' ? 'تفاصيل الدفع' : 'Payment Breakdown'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Method:</span> {paymentData.method.charAt(0).toUpperCase() + paymentData.method.slice(1)}</div>
                    <div><span className="font-medium">Amount Paid:</span> {paymentData.amount} SAR</div>
                    <div><span className="font-medium">Payment Date:</span> {paymentData.date}</div>
                    {paymentData.method === 'credit' && (
                      <>
                        <div><span className="font-medium">Paid Today:</span> {paymentData.amountPaidToday || 0} SAR</div>
                        <div><span className="font-medium">Remaining:</span> {paymentData.remainingBalance || 0} SAR</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Confirm Booking Action */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleConfirmBooking}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                >
                  {language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'}
                </button>
              </div>
            </div>
            
            {/* Step 5: Operations Management */}
            <div className="backdrop-blur-sm bg-white/50 border border-white/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {language === 'ar' ? 'إدارة العمليات' : 'Operations Management'}
                </h2>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'تصفية حسب الحالة' : 'Filter by Status'}
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  >
                    <option value="">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
                    <option value="pending">{language === 'ar' ? 'في الانتظار' : 'Pending'}</option>
                    <option value="confirmed">{language === 'ar' ? 'مؤكد' : 'Confirmed'}</option>
                    <option value="checked-in">{language === 'ar' ? 'تم تسجيل الدخول' : 'Checked-in'}</option>
                    <option value="cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'من تاريخ' : 'From Date'}
                  </label>
                  <input
                    type="date"
                    value={dateRangeFilter.start}
                    onChange={(e) => setDateRangeFilter({...dateRangeFilter, start: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'إلى تاريخ' : 'To Date'}
                  </label>
                  <input
                    type="date"
                    value={dateRangeFilter.end}
                    onChange={(e) => setDateRangeFilter({...dateRangeFilter, end: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  />
                </div>
              </div>
              
              {/* Bookings Table */}
              <div className="overflow-x-auto">
                <table className="w-full bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                  <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {language === 'ar' ? 'رقم الحجز' : 'Res ID'}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {language === 'ar' ? 'اسم النزيل' : 'Guest Name'}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {language === 'ar' ? 'التصنيف' : 'Classification'}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {language === 'ar' ? 'الغرفة' : 'Room'}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {language === 'ar' ? 'التواريخ' : 'Dates'}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {language === 'ar' ? 'حالة الدفع' : 'Payment Status'}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {language === 'ar' ? 'الرصيد' : 'Balance'}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {language === 'ar' ? 'الحالة' : 'Status'}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {language === 'ar' ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                          {language === 'ar' ? 'لا توجد حجوزات' : 'No bookings found'}
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-white/30 transition-all duration-200">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {booking.resId}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {booking.guest.fullName}
                            {booking.guest.vip && (
                              <span className="ml-2 inline-block w-2 h-2 bg-yellow-400 rounded-full" title="VIP"></span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {booking.guest.guestClassification}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {booking.room.type}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {booking.guest.arrival} - {booking.guest.departure}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {booking.payment.method.charAt(0).toUpperCase() + booking.payment.method.slice(1)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            ${booking.payment.remainingBalance || 0}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  // View booking details
                                  console.log('View booking:', booking.id);
                                  alert(`Viewing booking ${booking.resId} for ${booking.guest.fullName}`);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                {language === 'ar' ? 'عرض' : 'View'}
                              </button>
                              <button 
                                onClick={() => {
                                  // Edit booking
                                  console.log('Edit booking:', booking.id);
                                  alert(`Editing booking ${booking.resId}`);
                                }}
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                              >
                                {language === 'ar' ? 'تعديل' : 'Edit'}
                              </button>
                              <button 
                                onClick={() => {
                                  // Cancel booking
                                  if (confirm(`Are you sure you want to cancel booking ${booking.resId}?`)) {
                                    console.log('Cancel booking:', booking.id);
                                    alert(`Booking ${booking.resId} has been cancelled`);
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                {language === 'ar' ? 'إلغاء' : 'Cancel'}
                              </button>
                              <button 
                                onClick={() => {
                                  // Print booking
                                  console.log('Print booking:', booking.id);
                                  window.print();
                                }}
                                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                              >
                                {language === 'ar' ? 'طباعة' : 'Print'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
