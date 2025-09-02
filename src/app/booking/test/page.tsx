'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

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
  alternativePrice?: number;
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
  method: 'CASH' | 'CREDIT';
  amount?: number; // For cash payments
  paidAmount?: number; // For credit payments
  date: string;
  remainingDueDate?: string; // For credit payments
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
  const { language } = useLanguage();
  const { t, isRTL, textAlignClass } = useTranslation();
  
  // Step 1: Room Selection
  const [selectedHotelId, setSelectedHotelId] = useState('hotel-1');
  const [selectedRoomId, setSelectedRoomId] = useState('room-1');
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [arrivalDate, setArrivalDate] = useState('2025-09-05');
  const [departureDate, setDepartureDate] = useState('2025-09-05');
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
    arrival: '2025-09-02',
    departure: '2025-09-05',
    vip: true,
    nationality: 'UAE',
    telephone: '+971-50-123-4567',
    roomNo: '205',
    rateCode: 'CORP',
    roomRate: 250,
    payment: 'CREDIT',
    resId: 'RES-2024-001',
    profileId: ''
  });
  
  // Step 3: Payment
  const [paymentData, setPaymentData] = useState<Payment>({
    method: 'CASH',
    amount: 1250,
    paidAmount: 0,
    date: new Date().toISOString().split('T')[0],
    remainingDueDate: ''
  });
  
  // Alternative pricing
  const [useAlternativeRate, setUseAlternativeRate] = useState(false);
  const [alternativeRate, setAlternativeRate] = useState<number>(0);
  
  // Operations Management
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });
  
  // Data states
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch hotels from API
        const hotelsResponse = await fetch('/api/hotels');
        if (hotelsResponse.ok) {
          const hotelsResult = await hotelsResponse.json();
          if (hotelsResult.success && hotelsResult.data) {
            setHotels(hotelsResult.data);
          }
        } else {
          console.error('Failed to fetch hotels:', hotelsResponse.statusText);
        }
        
        // Fetch rooms from API
        const roomsResponse = await fetch('/api/rooms');
        if (roomsResponse.ok) {
          const roomsResult = await roomsResponse.json();
          if (roomsResult.success && roomsResult.data) {
            // Transform room data to match expected interface
            const transformedRooms = roomsResult.data.map((room: any) => ({
              id: room.id,
              hotelId: room.hotelId,
              type: room.roomType,
              boardType: room.boardType,
              description: room.roomTypeDescription || room.altDescription || '',
              rate: room.basePrice || room.alternativePrice || 0,
              available: room.isActive,
              status: room.isActive ? 'available' : 'maintenance',
              availableCount: room.quantity || 0
            }));
            setRooms(transformedRooms);
          }
        } else {
          console.error('Failed to fetch rooms:', roomsResponse.statusText);
        }
        
        // Fetch bookings from API
        const bookingsResponse = await fetch('/api/bookings');
        if (bookingsResponse.ok) {
          const bookingsResult = await bookingsResponse.json();
          if (bookingsResult.success && bookingsResult.data) {
            // Ensure data is an array
            const bookingsData = Array.isArray(bookingsResult.data) ? bookingsResult.data : [];
            setBookings(bookingsData);
          }
        } else {
          console.error('Failed to fetch bookings:', bookingsResponse.statusText);
        }
        
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
      
      // Check availability when dates change
      if (nights > 0) {
        checkRoomAvailability(arrival, departure);
      }
    } else {
      setNumberOfNights(0);
    }
  };
  
  // Check room availability for selected dates
  const checkRoomAvailability = async (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut || !selectedHotelId) return;
    
    try {
      setCheckingAvailability(true);
      const params = new URLSearchParams({
        checkInDate: checkIn,
        checkOutDate: checkOut,
        hotelId: selectedHotelId,
        numberOfRooms: numberOfRooms.toString(),
        availableOnly: 'false'
      });
      
      const response = await fetch(`/api/bookings/availability?${params}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.results) {
          // Update rooms with real-time availability
          const updatedRooms = rooms.map(room => {
            const availabilityInfo = result.data.results.find((r: any) => r.room.id === room.id);
            if (availabilityInfo) {
              return {
                ...room,
                available: availabilityInfo.availability.isAvailable,
                availableCount: availabilityInfo.availability.availableCount,
                status: availabilityInfo.availability.isAvailable ? 'available' : 'occupied'
              };
            }
            return room;
          });
          setRooms(updatedRooms);
        }
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setCheckingAvailability(false);
    }
  };
  
  // Handle hotel selection change
  const handleHotelChange = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    setSelectedRoomId(''); // Reset room selection
    
    // Filter rooms for selected hotel
    const hotelRooms = rooms.filter(room => room.hotelId === hotelId);
    
    // Check availability if dates are selected
    if (arrivalDate && departureDate && numberOfNights > 0) {
      checkRoomAvailability(arrivalDate, departureDate);
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
  // Guest data validation function
  const validateGuestData = () => {
    const errors: {[key: string]: string} = {};
    const errorMessages = [];
    
    // Required fields validation
    if (!guestData.fullName.trim()) {
      errors.fullName = t('booking.validation.nameRequired');
      errorMessages.push(errors.fullName);
    }
    
    if (!guestData.email.trim()) {
      errors.email = t('booking.validation.emailRequired');
      errorMessages.push(errors.email);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestData.email)) {
      errors.email = t('booking.validation.emailInvalid');
      errorMessages.push(errors.email);
    }
    
    if (!guestData.guestClassification) {
      errors.guestClassification = t('booking.validation.classificationRequired');
      errorMessages.push(errors.guestClassification);
    }
    
    if (!guestData.nationality.trim()) {
      errors.nationality = t('booking.validation.nationalityRequired');
      errorMessages.push(errors.nationality);
    }
    
    if (!guestData.telephone.trim()) {
      errors.telephone = t('booking.validation.phoneRequired');
      errorMessages.push(errors.telephone);
    } else if (!/^[+]?[0-9\s-()]{8,}$/.test(guestData.telephone)) {
      errors.telephone = t('booking.validation.phoneInvalid');
      errorMessages.push(errors.telephone);
    }
    
    // Date validation
    if (!arrivalDate) {
      errors.arrivalDate = t('booking.validation.arrivalDateRequired');
      errorMessages.push(errors.arrivalDate);
    }
    
    if (!departureDate) {
      errors.departureDate = t('booking.validation.departureDateRequired');
      errorMessages.push(errors.departureDate);
    }
    
    if (arrivalDate && departureDate && new Date(arrivalDate) >= new Date(departureDate)) {
      errors.dateRange = t('booking.validation.invalidDateRange');
      errorMessages.push(errors.dateRange);
    }
    
    // Payment validation
    const validPaymentMethods = ['CASH', 'CREDIT'];
    
    if (!paymentData.method) {
      errors.paymentMethod = t('booking.validation.paymentMethodRequired');
      errorMessages.push(errors.paymentMethod);
    } else if (!validPaymentMethods.includes(paymentData.method)) {
      errors.paymentMethod = `Invalid payment method: ${paymentData.method}. Valid methods are: ${validPaymentMethods.join(', ')}`;
      errorMessages.push(errors.paymentMethod);
    }
    
    if (!paymentData.date) {
      errors.paymentDate = t('booking.validation.paymentDateRequired');
      errorMessages.push(errors.paymentDate);
    }
    
    if (paymentData.amount <= 0) {
      errors.paymentAmount = t('booking.validation.paymentAmountRequired');
      errorMessages.push(errors.paymentAmount);
    }
    
    // Set validation errors for UI feedback
    setValidationErrors(errors);
    
    return errorMessages;
  };
  
  // Sanitize guest data
  const sanitizeGuestData = () => {
    return {
      ...guestData,
      fullName: guestData.fullName.trim(),
      email: guestData.email.trim().toLowerCase(),
      telephone: guestData.telephone.trim(),
      nationality: guestData.nationality.trim(),
      travelAgent: guestData.travelAgent.trim(),
      company: guestData.company.trim(),
      source: guestData.source.trim(),
      group: guestData.group.trim(),
      roomNo: guestData.roomNo.trim(),
      rateCode: guestData.rateCode.trim(),
      resId: guestData.resId.trim(),
      profileId: guestData.profileId.trim()
    };
  };
  
  // Reset booking form
  const resetBookingForm = () => {
    // Reset guest data
    setGuestData({
      fullName: '',
      email: '',
      guestClassification: '',
      travelAgent: '',
      company: '',
      source: '',
      group: '',
      arrival: '',
      departure: '',
      vip: false,
      nationality: '',
      telephone: '',
      roomNo: '',
      rateCode: '',
      roomRate: 0,
      payment: '',
      resId: '',
      profileId: ''
    });
    
    // Reset payment data
    setPaymentData({
      method: 'CASH',
      amount: 0,
      paidAmount: 0,
      date: new Date().toISOString().split('T')[0],
      remainingDueDate: ''
    });
    
    // Reset alternative pricing
    setUseAlternativeRate(false);
    setAlternativeRate(0);
    
    // Reset booking details
    setSelectedHotelId('hotel-1');
    setSelectedRoomId('');
    setNumberOfRooms(1);
    setArrivalDate('');
    setDepartureDate('');
    setNumberOfNights(0);
    
    // Clear validation errors
    setValidationErrors({});
  };

  const handleConfirmBooking = async () => {
    const selectedRoom = getSelectedRoom();
    const selectedHotel = getSelectedHotel();
    
    // Validate guest data before proceeding
    const validationErrors = validateGuestData();
    if (validationErrors.length > 0) {
      alert(t('booking.validation.errors') + '\n' + validationErrors.join('\n'));
      return;
    }
    
    if (selectedRoom && selectedHotel) {
      try {
        setLoading(true);
        
        // Sanitize guest data
        const sanitizedGuestData = sanitizeGuestData();
        
        // Calculate rate to use
        const rateToUse = useAlternativeRate ? alternativeRate : selectedRoom.rate;
        const totalAmount = (rateToUse || 0) * numberOfNights * numberOfRooms;
        
        const bookingData = {
          hotelId: selectedHotel.id,
          roomId: selectedRoom.id,
          guestData: {
            fullName: sanitizedGuestData.fullName,
            email: sanitizedGuestData.email,
            telephone: sanitizedGuestData.telephone,
            nationality: sanitizedGuestData.nationality,
            guestClassification: sanitizedGuestData.guestClassification,
            travelAgent: sanitizedGuestData.travelAgent,
            company: sanitizedGuestData.company,
            source: sanitizedGuestData.source,
            group: sanitizedGuestData.group,
            vip: sanitizedGuestData.vip,
            roomNo: sanitizedGuestData.roomNo,
            rateCode: sanitizedGuestData.rateCode,
            resId: sanitizedGuestData.resId,
            profileId: sanitizedGuestData.profileId
          },
          checkInDate: arrivalDate,
          checkOutDate: departureDate,
          numberOfRooms: numberOfRooms,
          useAlternativeRate: useAlternativeRate,
          alternativeRate: useAlternativeRate ? alternativeRate : undefined,
          paymentData: {
            method: paymentData.method,
            ...(paymentData.method === 'CASH' ? {
              amount: totalAmount,
              paymentDate: paymentData.date
            } : {
              paidAmount: paymentData.paidAmount || 0,
              paymentDate: paymentData.date,
              remainingDueDate: paymentData.remainingDueDate
            })
          }
        };
        
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        });
        
        if (response.ok) {
          const newBooking = await response.json();
          
          // Refresh bookings list
          const bookingsResponse = await fetch('/api/bookings');
          if (bookingsResponse.ok) {
            const updatedBookingsResult = await bookingsResponse.json();
            if (updatedBookingsResult.success && updatedBookingsResult.data) {
              const bookingsData = Array.isArray(updatedBookingsResult.data) ? updatedBookingsResult.data : [];
              setBookings(bookingsData);
            }
          }
          
          // Show success message
          alert(`${t('booking.success.confirmed')} ${newBooking.id}`);
          
          // Reset form after successful booking
          resetBookingForm();
          
        } else {
          const errorData = await response.json();
          console.error('Booking creation failed:', errorData);
          alert(`Failed to create booking: ${errorData.error || 'Unknown error'}`);
        }
        
      } catch (error) {
        console.error('Error creating booking:', error);
        alert('Failed to create booking. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please select a hotel and room before confirming the booking.');
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
  const filteredBookings = (Array.isArray(bookings) ? bookings : []).filter(booking => {
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
              {t('booking.loadingData')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
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
                <h2 className={`text-xl font-semibold text-gray-800 ${textAlignClass}`}>
                  {t('booking.roomSelection')}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Hotel Selection */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium text-gray-700 ${textAlignClass}`}>
                    {t('booking.hotel')}
                  </label>
                  <select
                    value={selectedHotelId}
                    onChange={(e) => handleHotelChange(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    disabled={checkingAvailability}
                  >
                    <option value="">{t('booking.selectHotel')}</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name} ({hotel.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Room Type Selection with Availability Colors */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className={`block text-sm font-medium text-gray-700 ${textAlignClass}`}>
                      {t('booking.roomType')}
                    </label>
                    {checkingAvailability && (
                      <div className="flex items-center space-x-2 text-sm text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                        <span>{t('booking.checkingAvailability')}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {!selectedHotelId ? (
                      <div className={`w-full px-4 py-3 bg-gray-100/50 border border-gray-200/50 rounded-xl text-gray-500 ${textAlignClass}`}>
                        {t('booking.selectHotelFirst')}
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
                                        {t('booking.roomsAvailable', { count: room.availableCount || 0 })}
                                      </span>
                                    ) : (
                                      <span className="text-red-600 font-medium">
                                        {t('booking.notAvailable')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">{room.rate} {t('common.currency')}/{t('booking.night')}</div>
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
                  <label className={`block text-sm font-medium text-gray-700 ${textAlignClass}`}>
                    {t('booking.numberOfRooms')}
                  </label>
                  <select
                    value={numberOfRooms}
                    onChange={(e) => setNumberOfRooms(parseInt(e.target.value))}
                    disabled={!selectedRoomId}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!selectedRoomId ? (
                      <option value={1}>{t('booking.selectRoomTypeFirst')}</option>
                    ) : (
                      Array.from({ length: Math.min(10, (getSelectedRoom()?.availableCount || 0)) }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                          {num} {t(num === 1 ? 'booking.room' : 'booking.rooms')}
                        </option>
                      ))
                    )}
                  </select>
                  {selectedRoomId && (
                    <div className="text-xs text-gray-600 mt-1">
                      {t('booking.maximumRooms', { count: getSelectedRoom()?.availableCount || 0 })}
                    </div>
                  )}
                </div>
                
                {/* Arrival Date */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium text-gray-700 ${textAlignClass}`}>
                    {t('booking.arrivalDate')}
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
                  <label className={`block text-sm font-medium text-gray-700 ${textAlignClass}`}>
                    {t('booking.departureDate')}
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
                  <label className={`block text-sm font-medium text-gray-700 ${textAlignClass}`}>
                    {t('booking.numberOfNights')}
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl backdrop-blur-sm text-gray-700">
                    {numberOfNights} {t(numberOfNights === 1 ? 'booking.night' : 'booking.nights')}
                  </div>
                </div>
                
                {/* Alternative Price Toggle and Input */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="useAlternativeRate"
                      checked={useAlternativeRate}
                      onChange={(e) => setUseAlternativeRate(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="useAlternativeRate" className={`text-sm font-medium text-gray-700 ${textAlignClass}`}>
                      {language === 'ar' ? 'استخدام سعر بديل' : 'Use Alternative Price'}
                    </label>
                  </div>
                  
                  {useAlternativeRate && (
                    <div className="relative">
                      <input
                        type="number"
                        value={alternativeRate}
                        onChange={(e) => setAlternativeRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                        placeholder={language === 'ar' ? 'أدخل السعر البديل' : 'Enter alternative price'}
                        min="0"
                        step="0.01"
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-medium text-sm">
                          SAR
                        </span>
                      </div>
                    </div>
                  )}
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
                              <h4 className={`text-sm font-medium text-gray-700 mb-1 ${textAlignClass}`}>
                                {t('booking.descriptionAmenities')}
                              </h4>
                              <p className="text-sm text-gray-600">{room?.description}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(room?.status || '')}`}>
                                  {room?.status ? room.status.charAt(0).toUpperCase() + room.status.slice(1) : ''}
                                </span>
                                <span className="text-sm font-medium text-gray-700">
                                  {t('booking.roomRate')}: {room?.rate} {t('common.currency')}/{t('booking.night')}
                                </span>
                              </div>
                              <div className="text-lg font-bold text-blue-600">
                                {t('booking.total')}: {(room?.rate || 0) * numberOfNights * numberOfRooms} {t('common.currency')}
                                {numberOfRooms > 1 && (
                                  <div className="text-sm text-gray-600 font-normal">
                                    ({numberOfRooms} {t('booking.rooms')} × {numberOfNights} {t('booking.nights')} × {room?.rate || 0} {t('common.currency')})
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
                <h2 className={`text-xl font-semibold text-gray-800 ${textAlignClass}`}>
                  {t('booking.guestDataEntry')}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium text-gray-700 ${textAlignClass}`}>
                    {t('booking.fullName')} *
                  </label>
                  <input
                    type="text"
                    value={guestData.fullName}
                    onChange={(e) => setGuestData({...guestData, fullName: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder={t('booking.enterFullName')}
                  />
                </div>
                
                {/* Email */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium text-gray-700 ${textAlignClass}`}>
                    {t('booking.email')} *
                  </label>
                  <input
                    type="email"
                    value={guestData.email}
                    onChange={(e) => setGuestData({...guestData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder={t('booking.enterEmail')}
                  />
                </div>
                
                {/* Guest Classification */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium text-gray-700 ${textAlignClass}`}>
                    {t('booking.guestClassification')} *
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
                    <option value="CASH">{language === 'ar' ? 'نقدي' : 'Cash'}</option>
                        <option value="CREDIT">{language === 'ar' ? 'آجل' : 'Credit'}</option>
                        <option value="CREDIT_CARD">{language === 'ar' ? 'بطاقة ائتمان' : 'Credit Card'}</option>
                        <option value="DEBIT_CARD">{language === 'ar' ? 'بطاقة خصم' : 'Debit Card'}</option>
                        <option value="BANK_TRANSFER">{language === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                        <option value="VISA">{language === 'ar' ? 'فيزا' : 'Visa'}</option>
                        <option value="MASTERCARD">{language === 'ar' ? 'ماستركارد' : 'Mastercard'}</option>
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
                      onClick={() => setPaymentData({...paymentData, method: 'CASH'})}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        paymentData.method === 'CASH'
                          ? 'border-green-500 bg-green-50/80 shadow-lg'
                          : 'border-gray-200 bg-white/50 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          paymentData.method === 'CASH' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                        }`}></div>
                        <span className="font-medium text-gray-800">
                          {language === 'ar' ? 'نقدي' : 'Cash'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Credit */}
                    <div
                      onClick={() => setPaymentData({...paymentData, method: 'CREDIT'})}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        paymentData.method === 'CREDIT'
                          ? 'border-orange-500 bg-orange-50/80 shadow-lg'
                          : 'border-gray-200 bg-white/50 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          paymentData.method === 'CREDIT' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                        }`}></div>
                        <span className="font-medium text-gray-800">
                          {language === 'ar' ? 'آجل' : 'Credit'}
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
                  
                  {/* Amount for Cash or Paid Amount for Credit */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {paymentData.method === 'CASH' 
                        ? (language === 'ar' ? 'المبلغ الكامل' : 'Full Amount')
                        : (language === 'ar' ? 'المبلغ المدفوع' : 'Amount Paid Today')
                      }
                    </label>
                    <input
                      type="number"
                      value={paymentData.method === 'CASH' ? (paymentData.amount || 0) : (paymentData.paidAmount || 0)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        if (paymentData.method === 'CASH') {
                          setPaymentData({...paymentData, amount: value});
                        } else {
                          setPaymentData({...paymentData, paidAmount: value});
                        }
                      }}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      placeholder={paymentData.method === 'CASH' 
                        ? (language === 'ar' ? 'أدخل المبلغ الكامل' : 'Enter full amount')
                        : (language === 'ar' ? 'أدخل المبلغ المدفوع اليوم' : 'Enter amount paid today')
                      }
                    />
                  </div>
                  
                  {/* Credit Payment Due Date */}
                  {paymentData.method === 'CREDIT' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {language === 'ar' ? 'تاريخ استحقاق الباقي' : 'Remaining Due Date'}
                      </label>
                      <input
                        type="date"
                        value={paymentData.remainingDueDate || ''}
                        onChange={(e) => setPaymentData({...paymentData, remainingDueDate: e.target.value})}
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Step 4: Review & Confirmation */}
            <div className="backdrop-blur-sm bg-white/50 border border-white/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {t('common.reviewAndConfirm')}
                </h2>
              </div>
              
              <div className="space-y-6 text-black">
                {/* Room Summary */}
                <div className="p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-xl border border-blue-200/50">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {t('booking.roomDetails')}
                  </h3>
                  {(() => {
                    const hotel = getSelectedHotel();
                    const room = getSelectedRoom();
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">{t('booking.hotelLabel')}</span> {hotel?.name} ({hotel?.code})</div>
                        <div><span className="font-medium">{t('booking.roomTypeLabel')}</span> {room?.type}</div>
                        <div><span className="font-medium">{t('booking.boardTypeLabel')}</span> {room?.boardType}</div>
                        <div><span className="font-medium">{t('booking.rateLabel')}</span> {room?.rate} {t('common.currency')}{t('booking.perNight')}</div>
                        <div><span className="font-medium">{t('booking.arrivalLabel')}</span> {arrivalDate}</div>
                        <div><span className="font-medium">{t('booking.departureLabel')}</span> {departureDate}</div>
                        <div><span className="font-medium">{t('booking.nightsLabel')}</span> {numberOfNights}</div>
                        <div><span className="font-medium">{t('booking.numberOfRoomsLabel')}</span> {numberOfRooms}</div>
                        <div><span className="font-medium">{t('booking.totalLabel')}</span> {(room?.rate || 0) * numberOfNights * numberOfRooms} {t('common.currency')}</div>
                      </div>
                    );
                  })()} 
                </div>
                
                {/* Guest Summary */}
                <div className="p-4 bg-gradient-to-r from-green-50/80 to-blue-50/80 rounded-xl border border-green-200/50">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {t('booking.guestDetails')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">{t('booking.nameLabel')}</span> {guestData.fullName}</div>
                    <div><span className="font-medium">{t('booking.emailLabel')}</span> {guestData.email}</div>
                    <div><span className="font-medium">{t('booking.classificationLabel')}</span> {guestData.guestClassification}</div>
                    <div><span className="font-medium">{t('booking.nationalityLabel')}</span> {guestData.nationality}</div>
                    <div><span className="font-medium">{t('booking.telephoneLabel')}</span> {guestData.telephone}</div>
                    <div><span className="font-medium">{t('booking.companyLabel')}</span> {guestData.company}</div>
                    <div><span className="font-medium">{t('booking.travelAgentLabel')}</span> {guestData.travelAgent}</div>
                    <div><span className="font-medium">{t('booking.vipLabel')}</span> {guestData.vip ? 'Yes' : 'No'}</div>
                    <div><span className="font-medium">{t('booking.roomNoLabel')}</span> {guestData.roomNo}</div>
                  </div>
                </div>
                
                {/* Payment Summary */}
                <div className="p-4 bg-gradient-to-r from-yellow-50/80 to-orange-50/80 rounded-xl border border-yellow-200/50">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {t('booking.paymentBreakdown')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">{t('booking.methodLabel')}</span> {paymentData.method ? paymentData.method.charAt(0).toUpperCase() + paymentData.method.slice(1) : 'N/A'}</div>
                    <div><span className="font-medium">{t('booking.amountPaidLabel')}</span> {paymentData.amount} {t('common.currency')}</div>
                    <div><span className="font-medium">{t('booking.paymentDateLabel')}</span> {paymentData.date}</div>
                    {paymentData.method === 'CREDIT' && (
                      <>
                        <div><span className="font-medium">{t('booking.paidTodayLabel')}</span> {paymentData.amountPaidToday || 0} {t('common.currency')}</div>
                        <div><span className="font-medium">{t('booking.remainingLabel')}</span> {paymentData.remainingBalance || 0} {t('common.currency')}</div>
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
                            {booking.guest?.fullName || 'N/A'}
                            {booking.guest?.vip && (
                              <span className="ml-2 inline-block w-2 h-2 bg-yellow-400 rounded-full" title="VIP"></span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {booking.guest?.guestClassification || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {booking.room?.type || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {booking.guest?.arrival && booking.guest?.departure ? `${booking.guest.arrival} - ${booking.guest.departure}` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {booking.payment?.method ? t(`booking.${booking.payment.method}` as any) || booking.payment.method.charAt(0).toUpperCase() + booking.payment.method.slice(1) : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            ${booking.payment?.remainingBalance || 0}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status || 'pending')}`}>
                              {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Pending'}
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
    </ProtectedRoute>
  );
}
