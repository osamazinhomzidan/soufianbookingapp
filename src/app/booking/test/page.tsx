'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

interface Hotel {
  id: string;
  name: string;
  code: string;
  altName?: string;
  address?: string;
  location?: string;
  description?: string;
  altDescription?: string;
  roomCount?: number;
  agreementCount?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface Room {
  id: string;
  hotelId: string;
  roomType: string;
  roomTypeDescription: string;
  altDescription?: string;
  basePrice: number;
  alternativePrice?: number;
  availableFrom?: string;
  availableTo?: string;
  quantity: number;
  capacity: number;
  boardType: string;
  roomAmenities?: Array<{
    id: string;
    name: string;
    icon?: string;
  }>;
}

interface AvailabilityResult {
  room: Room & {
    hotel: {
      id: string;
      name: string;
      altName?: string;
    };
  };
  availability: {
    isAvailable: boolean;
    totalAvailable: number;
    requestedRooms: number;
    bookedRooms: number;
    isWithinAvailabilityPeriod: boolean;
  };
}

interface Guest {
  id?: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  telephone: string;
  nationality: string;
  passportNumber: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  address: string;
  city: string;
  country: string;
  guestClassification: string;
  travelAgent: string;
  company: string;
  source: string;
  group: string;
  isVip: boolean;
  vip: boolean;
  profileId: string;
  notes: string;
}

interface Payment {
  method: 'CASH' | 'CREDIT';
  date: string;
  paidAmount?: number;
  remainingDueDate?: string;
}

export default function Booking() {
  const { language } = useLanguage();
  const { t, isRTL, textAlignClass } = useTranslation();
  
  // Room Selection State
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [useAlternativeRate, setUseAlternativeRate] = useState(false);
  
  // Guest Data State
  const [guestData, setGuestData] = useState<Guest>({
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    telephone: '',
    nationality: '',
    passportNumber: '',
    dateOfBirth: '',
    gender: 'MALE',
    address: '',
    city: '',
    country: '',
    guestClassification: '',
    travelAgent: '',
    company: '',
    source: '',
    group: '',
    isVip: false,
    vip: false,
    profileId: '',
    notes: ''
  });
  
  // Payment State
  const [paymentData, setPaymentData] = useState<Payment>({
    method: 'CASH',
    date: new Date().toISOString().split('T')[0],
    paidAmount: 0,
    remainingDueDate: ''
  });
  
  // Data states
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [availableRooms, setAvailableRooms] = useState<AvailabilityResult[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  // Calculated values
  const [numberOfNights, setNumberOfNights] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Fetch hotels on component mount
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/hotels');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setHotels(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotels();
  }, []);
  
  // Calculate number of nights when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setNumberOfNights(nights > 0 ? nights : 0);
      
      // Check availability when dates and hotel are selected
      if (nights > 0 && selectedHotelId) {
        checkRoomAvailability();
      }
    } else {
      setNumberOfNights(0);
    }
  }, [checkInDate, checkOutDate, selectedHotelId, numberOfRooms]);
  
  // Calculate total amount when room or nights change
  useEffect(() => {
    if (selectedRoom && numberOfNights > 0) {
      const rate = useAlternativeRate && selectedRoom.alternativePrice 
        ? selectedRoom.alternativePrice 
        : selectedRoom.basePrice;
      const total = rate * numberOfNights * numberOfRooms;
      setTotalAmount(total);
      
      // Update payment data for cash (always full amount)
      if (paymentData.method === 'CASH') {
        setPaymentData(prev => ({ ...prev, paidAmount: total }));
      }
    }
  }, [selectedRoom, numberOfNights, numberOfRooms, useAlternativeRate, paymentData.method]);
  
  // Fetch detailed hotel information
  const fetchHotelDetails = async (hotelId: string) => {
    try {
      const response = await fetch(`/api/hotels/${hotelId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSelectedHotel(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching hotel details:', error);
    }
  };

  // Check room availability
  const checkRoomAvailability = async () => {
    if (!checkInDate || !checkOutDate || !selectedHotelId) return;
    
    try {
      setCheckingAvailability(true);
      const params = new URLSearchParams({
        checkInDate,
        checkOutDate,
        hotelId: selectedHotelId,
        numberOfRooms: numberOfRooms.toString(),
        availableOnly: 'false'
      });
      
      const response = await fetch(`/api/bookings/availability?${params}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.results) {
          setAvailableRooms(result.data.results);
        } else {
          setAvailableRooms([]);
        }
      } else {
        setAvailableRooms([]);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailableRooms([]);
    } finally {
      setCheckingAvailability(false);
    }
  };
  
  // Handle room selection
  const handleRoomSelection = (roomId: string) => {
    const roomResult = availableRooms.find(r => r.room.id === roomId);
    if (roomResult) {
      setSelectedRoomId(roomId);
      setSelectedRoom(roomResult.room);
    }
  };
  
  // Handle payment method change
  const handlePaymentMethodChange = (method: 'CASH' | 'CREDIT') => {
    setPaymentData(prev => ({
      ...prev,
      method,
      paidAmount: method === 'CASH' ? totalAmount : 0,
      remainingDueDate: method === 'CREDIT' ? prev.remainingDueDate : ''
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Room Selection validation
    if (!selectedHotelId) errors.hotel = 'Please select a hotel';
    if (!selectedRoomId) errors.room = 'Please select a room';
    if (!checkInDate) errors.checkIn = 'Please select check-in date';
    if (!checkOutDate) errors.checkOut = 'Please select check-out date';
    if (numberOfRooms < 1) errors.numberOfRooms = 'Number of rooms must be at least 1';
    
    // Guest Data validation
    if (!guestData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!guestData.email.trim()) errors.email = 'Email is required';
    if (!guestData.phone.trim()) errors.phone = 'Phone is required';
    
    // Payment validation
    if (!paymentData.date) errors.paymentDate = 'Payment date is required';
    if (paymentData.method === 'CREDIT') {
      if (!paymentData.paidAmount || paymentData.paidAmount < 0) {
        errors.paidAmount = 'Paid amount must be greater than 0';
      }
      if (paymentData.paidAmount && paymentData.paidAmount >= totalAmount) {
        errors.paidAmount = 'Paid amount must be less than total amount for credit payment';
      }
      if (!paymentData.remainingDueDate) {
        errors.remainingDueDate = 'Due date is required for credit payment';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Submit booking
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const bookingData = {
        hotelId: selectedHotelId,
        roomId: selectedRoomId,
        guestData,
        numberOfRooms,
        checkInDate,
        checkOutDate,
        roomRate: selectedRoom?.basePrice,
        alternativeRate: selectedRoom?.alternativePrice,
        useAlternativeRate,
        paymentData: {
          method: paymentData.method,
          date: paymentData.date,
          ...(paymentData.method === 'CASH' 
            ? { amount: totalAmount }
            : { 
                paidAmount: paymentData.paidAmount,
                remainingDueDate: paymentData.remainingDueDate 
              }
          )
        }
      };
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Booking created successfully!');
        // Reset form or redirect
        window.location.reload();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('An error occurred while creating the booking');
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 dark:bg-blue-700 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">
                {t('booking.title', 'Create New Booking')}
              </h1>
            </div>
            
            <div className="p-6">
              {/* All Steps in One View */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Step 1: Room Selection */}
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
                      1. Room Selection
                    </h2>
                    
                    {/* Hotel Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hotel *
                      </label>
                      <select
                        value={selectedHotelId}
                        onChange={(e) => {
                          const hotelId = e.target.value;
                          setSelectedHotelId(hotelId);
                          setSelectedRoomId('');
                          setSelectedRoom(null);
                          setAvailableRooms([]);
                          
                          // Ensure dates are set so rooms can be loaded
                          let ci = checkInDate;
                          let co = checkOutDate;
                          if (!ci || !co) {
                            const today = new Date();
                            const tomorrow = new Date();
                            tomorrow.setDate(today.getDate() + 1);
                            ci = today.toISOString().split('T')[0];
                            co = tomorrow.toISOString().split('T')[0];
                            setCheckInDate(ci);
                            setCheckOutDate(co);
                          }
                          
                          if (hotelId) {
                            fetchHotelDetails(hotelId);
                            // Trigger availability check after ensuring dates are present
                            const selectedId = hotelId;
                            setTimeout(() => {
                              if (selectedId && ci && co) {
                                checkRoomAvailability();
                              }
                            }, 0);
                          } else {
                            setSelectedHotel(null);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select a hotel</option>
                        {hotels.map((hotel) => (
                          <option key={hotel.id} value={hotel.id}>
                            {hotel.name} ({hotel.code})
                          </option>
                        ))}
                      </select>
                      {validationErrors.hotel && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.hotel}</p>
                      )}
                    </div>
                    
                    {/* Selected Hotel Details */}
                    {selectedHotel && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Hotel Information
                        </h3>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{selectedHotel.name}</span>
                            {selectedHotel.altName && (
                              <span className="ml-2 text-gray-600 dark:text-gray-400">({selectedHotel.altName})</span>
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Code:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{selectedHotel.code}</span>
                          </div>
                          {selectedHotel.location && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{selectedHotel.location}</span>
                            </div>
                          )}
                          {selectedHotel.address && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Address:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{selectedHotel.address}</span>
                            </div>
                          )}
                          {selectedHotel.description && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Description:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{selectedHotel.description}</span>
                            </div>
                          )}
                          {selectedHotel.altDescription && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Alt Description:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{selectedHotel.altDescription}</span>
                            </div>
                          )}
                          {selectedHotel.roomCount !== undefined && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Total Rooms:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{selectedHotel.roomCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Date Selection */}
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Check-in Date *
                        </label>
                        <input
                          type="date"
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        {validationErrors.checkIn && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.checkIn}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Check-out Date *
                        </label>
                        <input
                          type="date"
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          min={checkInDate || new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        {validationErrors.checkOut && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.checkOut}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Number of Rooms *
                        </label>
                        <input
                          type="number"
                          value={numberOfRooms}
                          onChange={(e) => setNumberOfRooms(parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        {validationErrors.numberOfRooms && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.numberOfRooms}</p>
                        )}
                      </div>
                    </div>
                    
                    {numberOfNights > 0 && (
                      <div className="bg-blue-100 dark:bg-blue-800/30 p-3 rounded-md mb-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Duration:</strong> {numberOfNights} night{numberOfNights !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                    
                    {/* Room Selection */}
                    {checkingAvailability && (
                      <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">Checking availability...</p>
                      </div>
                    )}
                    
                    {availableRooms.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Available Rooms *
                        </label>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {availableRooms.map((roomResult) => {
                            const room = roomResult.room;
                            const availability = roomResult.availability;
                            
                            return (
                              <div
                                key={room.id}
                                className={`border rounded-lg p-3 cursor-pointer transition-colors text-sm ${
                                  selectedRoomId === room.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                }`}
                                onClick={() => handleRoomSelection(room.id)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                      {room.roomType}
                                    </h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                      {room.roomTypeDescription}
                                    </p>
                                    
                                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                      <span><strong>Board:</strong> {room.boardType}</span>
                                      <span className="ml-3"><strong>Capacity:</strong> {room.capacity}</span>
                                      <span className="ml-3"><strong>Available:</strong> {availability.totalAvailable}</span>
                                      <span className="ml-3"><strong>Quantity:</strong> {room.quantity}</span>
                                    </div>
                                    
                                    {room.altDescription && (
                                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                        <strong>Alt Description:</strong> {room.altDescription}
                                      </div>
                                    )}
                                    
                                    {/* Availability Dates Display */}
                                    {(room.availableFrom || room.availableTo) && (
                                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                        <strong>Availability Period:</strong>
                                        {room.availableFrom && ` From ${formatDate(room.availableFrom)}`}
                                        {room.availableTo && ` To ${formatDate(room.availableTo)}`}
                                      </div>
                                    )}
                                    
                                    {/* Room Amenities */}
                                    {room.roomAmenities && room.roomAmenities.length > 0 && (
                                      <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                                        <strong>Amenities:</strong> {room.roomAmenities.map(amenity => amenity.name).join(', ')}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="ml-2 text-right">
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                      {formatCurrency(room.basePrice)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      per night
                                    </div>
                                    {room.alternativePrice && (
                                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        Alt: {formatCurrency(room.alternativePrice)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {validationErrors.room && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.room}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Alternative Pricing Option */}
                    {selectedRoom && selectedRoom.alternativePrice && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md mt-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={useAlternativeRate}
                            onChange={(e) => setUseAlternativeRate(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Use alternative pricing ({formatCurrency(selectedRoom.alternativePrice)} per night)
                          </span>
                        </label>
                      </div>
                    )}
                    
                    {/* Total Calculation */}
                    {totalAmount > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md mt-4">
                        <div className="text-lg font-semibold text-green-800 dark:text-green-200">
                          Total: {formatCurrency(totalAmount)}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {formatCurrency(useAlternativeRate && selectedRoom?.alternativePrice ? selectedRoom.alternativePrice : selectedRoom?.basePrice || 0)} × {numberOfNights} nights × {numberOfRooms} rooms
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Step 2: Guest Information */}
                <div className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4">
                      2. Guest Information
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={guestData.fullName}
                          onChange={(e) => setGuestData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        {validationErrors.fullName && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={guestData.email}
                          onChange={(e) => setGuestData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        {validationErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={guestData.phone}
                          onChange={(e) => setGuestData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        {validationErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nationality
                        </label>
                        <input
                          type="text"
                          value={guestData.nationality}
                          onChange={(e) => setGuestData(prev => ({ ...prev, nationality: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Guest Classification
                        </label>
                        <input
                          type="text"
                          value={guestData.guestClassification}
                          onChange={(e) => setGuestData(prev => ({ ...prev, guestClassification: e.target.value }))}
                          placeholder="e.g., Saudi Citizen, Visitor"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Travel Agent
                        </label>
                        <input
                          type="text"
                          value={guestData.travelAgent}
                          onChange={(e) => setGuestData(prev => ({ ...prev, travelAgent: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          value={guestData.company}
                          onChange={(e) => setGuestData(prev => ({ ...prev, company: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Source
                        </label>
                        <input
                          type="text"
                          value={guestData.source}
                          onChange={(e) => setGuestData(prev => ({ ...prev, source: e.target.value }))}
                          placeholder="e.g., Online Booking, Walk-in"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Group
                        </label>
                        <input
                          type="text"
                          value={guestData.group}
                          onChange={(e) => setGuestData(prev => ({ ...prev, group: e.target.value }))}
                          placeholder="e.g., Business Group, Family"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      {/* Additional Guest Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={guestData.firstName}
                            onChange={(e) => setGuestData(prev => ({ ...prev, firstName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={guestData.lastName}
                            onChange={(e) => setGuestData(prev => ({ ...prev, lastName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Telephone
                        </label>
                        <input
                          type="tel"
                          value={guestData.telephone}
                          onChange={(e) => setGuestData(prev => ({ ...prev, telephone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Passport Number
                          </label>
                          <input
                            type="text"
                            value={guestData.passportNumber}
                            onChange={(e) => setGuestData(prev => ({ ...prev, passportNumber: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={guestData.dateOfBirth}
                            onChange={(e) => setGuestData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Gender
                        </label>
                        <select
                          value={guestData.gender}
                          onChange={(e) => setGuestData(prev => ({ ...prev, gender: e.target.value as 'MALE' | 'FEMALE' }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Address
                        </label>
                        <textarea
                          value={guestData.address}
                          onChange={(e) => setGuestData(prev => ({ ...prev, address: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={guestData.city}
                            onChange={(e) => setGuestData(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            value={guestData.country}
                            onChange={(e) => setGuestData(prev => ({ ...prev, country: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notes
                        </label>
                        <textarea
                          value={guestData.notes}
                          onChange={(e) => setGuestData(prev => ({ ...prev, notes: e.target.value }))}
                          rows={3}
                          placeholder="Additional notes or special requests"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={guestData.isVip}
                            onChange={(e) => setGuestData(prev => ({ ...prev, isVip: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            VIP Guest
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 3: Payment Details */}
                <div className="space-y-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
                      3. Payment Details
                    </h2>
                    
                    {/* Booking Summary */}
                    {totalAmount > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Booking Summary</h3>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          <p><strong>Hotel:</strong> {hotels.find(h => h.id === selectedHotelId)?.name}</p>
                          <p><strong>Room:</strong> {selectedRoom?.roomType}</p>
                          <p><strong>Dates:</strong> {checkInDate} to {checkOutDate} ({numberOfNights} nights)</p>
                          <p><strong>Rooms:</strong> {numberOfRooms}</p>
                          <p><strong>Rate:</strong> {formatCurrency(useAlternativeRate && selectedRoom?.alternativePrice ? selectedRoom.alternativePrice : selectedRoom?.basePrice || 0)} per night</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            <strong>Total Amount: {formatCurrency(totalAmount)}</strong>
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Payment Method */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Method *
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="CASH"
                            checked={paymentData.method === 'CASH'}
                            onChange={() => handlePaymentMethodChange('CASH')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Cash Payment (Full amount: {formatCurrency(totalAmount)})
                          </span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="CREDIT"
                            checked={paymentData.method === 'CREDIT'}
                            onChange={() => handlePaymentMethodChange('CREDIT')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Credit Payment (Pay now + Pay later)
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Payment Date */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Date *
                      </label>
                      <input
                        type="date"
                        value={paymentData.date}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                      {validationErrors.paymentDate && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.paymentDate}</p>
                      )}
                    </div>
                    
                    {/* Credit Payment Details */}
                    {paymentData.method === 'CREDIT' && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-md space-y-3">
                        <h4 className="font-medium text-orange-800 dark:text-orange-200 text-sm">
                          Credit Payment Details
                        </h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pay Now Amount *
                          </label>
                          <input
                            type="number"
                            value={paymentData.paidAmount || ''}
                            onChange={(e) => setPaymentData(prev => ({ 
                              ...prev, 
                              paidAmount: parseFloat(e.target.value) || 0 
                            }))}
                            min="0"
                            max={totalAmount - 1}
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                          {validationErrors.paidAmount && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.paidAmount}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Due Date for Remaining Amount *
                          </label>
                          <input
                            type="date"
                            value={paymentData.remainingDueDate || ''}
                            onChange={(e) => setPaymentData(prev => ({ 
                              ...prev, 
                              remainingDueDate: e.target.value 
                            }))}
                            min={paymentData.date || new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                          {validationErrors.remainingDueDate && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.remainingDueDate}</p>
                          )}
                        </div>
                        
                        {paymentData.paidAmount && paymentData.paidAmount > 0 && (
                          <div className="text-sm text-orange-700 dark:text-orange-300">
                            <p><strong>Pay Now:</strong> {formatCurrency(paymentData.paidAmount)}</p>
                            <p><strong>Pay Later:</strong> {formatCurrency(totalAmount - paymentData.paidAmount)}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Cash Payment Info */}
                    {paymentData.method === 'CASH' && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2 text-sm">
                          Cash Payment
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Full payment of {formatCurrency(totalAmount)} will be collected on {formatDate(paymentData.date)}.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !selectedRoom || totalAmount === 0}
                  className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? 'Creating Booking...' : 'Create Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
