'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';

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
  const { theme, isDark } = useTheme();
  
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
  const [nationalities, setNationalities] = useState<{code: string, name: string, nameAr: string}[]>([]);
  const [countries, setCountries] = useState<{code: string, name: string, nameAr: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [message, setMessage] = useState<{type: 'success' | 'error' | null, text: string}>({type: null, text: ''});
  
  // Calculated values
  const [numberOfNights, setNumberOfNights] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Fetch hotels and nationalities on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch hotels
        const hotelsResponse = await fetch('/api/hotels');
        if (hotelsResponse.ok) {
          const hotelsResult = await hotelsResponse.json();
          if (hotelsResult.success && hotelsResult.data) {
            setHotels(hotelsResult.data);
          }
        }
        
        // Fetch nationalities
        const nationalitiesResponse = await fetch('/api/bookings/nationalities');
        if (nationalitiesResponse.ok) {
          const nationalitiesResult = await nationalitiesResponse.json();
          if (nationalitiesResult.success && nationalitiesResult.data) {
            setNationalities(nationalitiesResult.data);
            setCountries(nationalitiesResult.data); // Use same data for countries dropdown
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
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
  
  // Clear selected room if it becomes unavailable when number of rooms changes
  useEffect(() => {
    if (selectedRoomId && availableRooms.length > 0) {
      const selectedRoomResult = availableRooms.find(r => r.room.id === selectedRoomId);
      if (selectedRoomResult) {
        const availability = selectedRoomResult.availability;
        if (!availability.isAvailable || availability.totalAvailable < numberOfRooms) {
          setSelectedRoomId('');
          setSelectedRoom(null);
        }
      }
    }
  }, [numberOfRooms, availableRooms, selectedRoomId]);
  
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
    
    // Room availability validation
    if (selectedRoomId) {
      const selectedRoomResult = availableRooms.find(r => r.room.id === selectedRoomId);
      if (selectedRoomResult) {
        const availability = selectedRoomResult.availability;
        if (!availability.isAvailable) {
          errors.room = 'Selected room is not available for the chosen dates';
        } else if (availability.totalAvailable < numberOfRooms) {
          errors.room = `Only ${availability.totalAvailable} rooms available, but ${numberOfRooms} requested`;
        }
      }
    }
    
    // Guest Data validation
    if (!guestData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!guestData.email.trim()) errors.email = 'Email is required';
    if (!guestData.phone.trim()) errors.phone = 'Phone is required';
    if (!guestData.nationality.trim()) errors.nationality = 'Nationality is required';
    if (!guestData.guestClassification.trim()) errors.guestClassification = 'Guest classification is required';
    
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
    
    // Clear any existing messages
    setMessage({type: null, text: ''});
    
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
        setMessage({
          type: 'success', 
          text: `🎉 Booking created successfully! Reservation ID: ${result.data?.resId || 'N/A'}. You can create another booking or close this form.`
        });
        // Scroll to top to show the success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Reset form data for next booking
        setSelectedHotelId('');
        setSelectedRoomId('');
        setSelectedRoom(null);
        setAvailableRooms([]);
        setCheckInDate('');
        setCheckOutDate('');
        setNumberOfRooms(1);
        setGuestData({
          fullName: '', firstName: '', lastName: '', email: '', phone: '', telephone: '',
          nationality: '', passportNumber: '', dateOfBirth: '', gender: 'MALE',
          address: '', city: '', country: '', guestClassification: '', travelAgent: '',
          company: '', source: '', group: '', isVip: false, vip: false, profileId: '', notes: ''
        });
        setPaymentData({
          method: 'CASH',
          date: new Date().toISOString().split('T')[0],
          paidAmount: 0,
          remainingDueDate: ''
        });
      } else {
        setMessage({type: 'error', text: `Error: ${result.message}`});
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setMessage({type: 'error', text: 'An error occurred while creating the booking'});
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <div className={`min-h-full relative overflow-hidden transition-colors duration-300 p-8 lg:p-16 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      } ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* Header */}
            <div className="mb-8 lg:mb-16">
              <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-12 mb-8 lg:mb-16">
                <div className={`w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-xl ${
                  isDark ? 'shadow-slate-900/50' : 'shadow-slate-300/50'
                }`}>
                  <svg className="w-12 h-12 lg:w-16 lg:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h1 className={`text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-4 lg:mb-6 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {t('booking.title', 'Create New Booking')}
                  </h1>
                  <p className={`text-lg lg:text-xl font-bold mt-4 lg:mt-6 leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Complete the booking process with our enhanced reservation system
                  </p>
                </div>
              </div>
            </div>
            
              {/* Message Display */}
              {message.type && (
                <div className={`backdrop-blur-xl rounded-3xl shadow-2xl p-6 lg:p-8 mb-8 lg:mb-12 ${
                  message.type === 'success' 
                    ? isDark 
                      ? 'bg-green-900/70 border-2 border-green-700/50 text-green-200'
                      : 'bg-green-50/70 border-2 border-green-200/50 text-green-800'
                    : isDark 
                      ? 'bg-red-900/70 border-2 border-red-700/50 text-red-200'
                      : 'bg-red-50/70 border-2 border-red-200/50 text-red-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
                      message.type === 'success' 
                        ? isDark ? 'bg-green-800/50' : 'bg-green-100'
                        : isDark ? 'bg-red-800/50' : 'bg-red-100'
                    }`}>
                        {message.type === 'success' ? (
                          <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-7 h-7 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-bold leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setMessage({type: null, text: ''})}
                      className={`ml-6 p-2 rounded-xl transition-colors ${
                        message.type === 'success' 
                          ? isDark 
                            ? 'text-green-300 hover:text-green-100 hover:bg-green-800/30'
                            : 'text-green-400 hover:text-green-600 hover:bg-green-100'
                          : isDark 
                            ? 'text-red-300 hover:text-red-100 hover:bg-red-800/30'
                            : 'text-red-400 hover:text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              {/* All Steps in One View - Vertical Layout */}
              <div className="space-y-8 lg:space-y-16">
                
                {/* Step 1: Room Selection */}
                <div className="w-full">
                  <div className={`backdrop-blur-sm border-2 rounded-3xl shadow-xl p-6 lg:p-12 ${
                    isDark 
                      ? 'bg-slate-800/70 border-slate-700/50' 
                      : 'bg-blue-50/70 border-blue-200/50'
                  }`}>
                    <div className="flex items-center space-x-4 lg:space-x-6 mb-6 lg:mb-8">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h2 className={`text-2xl lg:text-3xl font-black tracking-tight ${
                        isDark ? 'text-blue-300' : 'text-blue-800'
                      }`}>
                        1. Room Selection
                      </h2>
                    </div>
                    
                    {/* Hotel Selection */}
                    <div className="mb-6 lg:mb-8">
                      <label className={`block text-lg lg:text-xl font-black tracking-wide mb-3 lg:mb-4 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        Hotel *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 lg:pl-5 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
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
                          className={`w-full pl-12 lg:pl-14 pr-4 lg:pr-6 py-4 lg:py-5 border-2 rounded-2xl focus:outline-none focus:border-blue-600 focus:shadow-lg transition-all duration-300 font-semibold text-base lg:text-lg shadow-sm hover:shadow-md ${
                            isDark 
                              ? 'bg-slate-700/70 border-slate-600 text-white hover:border-slate-500 focus:bg-slate-700'
                              : 'bg-slate-50/70 border-slate-300 text-slate-800 hover:border-slate-400'
                          }`}
                        >
                          <option value="">Select a hotel</option>
                          {hotels.map((hotel) => (
                            <option key={hotel.id} value={hotel.id}>
                              {hotel.name} ({hotel.code})
                            </option>
                          ))}
                        </select>
                      </div>
                      {validationErrors.hotel && (
                        <p className="mt-3 text-base text-red-600 font-medium">{validationErrors.hotel}</p>
                      )}
                    </div>
                    
                    {/* Hotel Information & Booking Dates Container */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
                      {/* Selected Hotel Details */}
                      {selectedHotel && (
                        <div className={`backdrop-blur-sm ${isDark ? 'bg-slate-800/70 border-slate-600/50' : 'bg-slate-50/70 border-slate-200/50'} border-2 p-5 lg:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300`}>
                          <div className="flex items-center space-x-3 mb-4 lg:mb-5">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-2a1 1 0 011-1h4a1 1 0 011 1v2" />
                              </svg>
                            </div>
                            <h3 className={`text-xl lg:text-2xl xl:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                              Hotel Information
                            </h3>
                          </div>
                          <div className="space-y-3 lg:space-y-4 text-base lg:text-lg">
                            <div className="flex items-center space-x-3">
                              <span className={`font-black ${isDark ? 'text-slate-300' : 'text-slate-700'} min-w-[100px] text-sm lg:text-base`}>Name:</span>
                              <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold text-base lg:text-lg`}>{selectedHotel.name}</span>
                              {selectedHotel.altName && (
                                <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} font-semibold text-sm lg:text-base`}>({selectedHotel.altName})</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`font-black ${isDark ? 'text-slate-300' : 'text-slate-700'} min-w-[100px] text-sm lg:text-base`}>Code:</span>
                              <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold text-base lg:text-lg`}>{selectedHotel.code}</span>
                            </div>
                            {selectedHotel.location && (
                              <div className="flex items-center space-x-3">
                                <span className={`font-black min-w-[100px] text-sm lg:text-base ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>Location:</span>
                                <span className={`font-bold text-base lg:text-lg ${
                                  isDark ? 'text-white' : 'text-slate-900'
                                }`}>{selectedHotel.location}</span>
                              </div>
                            )}
                            {selectedHotel.address && (
                              <div className="flex items-center space-x-3">
                                <span className={`font-black min-w-[100px] text-sm lg:text-base ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>Address:</span>
                                <span className={`font-bold text-base lg:text-lg ${
                                  isDark ? 'text-white' : 'text-slate-900'
                                }`}>{selectedHotel.address}</span>
                              </div>
                            )}
                            {selectedHotel.description && (
                              <div className="flex items-start space-x-3">
                                <span className={`font-black min-w-[100px] mt-1 text-sm lg:text-base ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>Description:</span>
                                <span className={`font-bold leading-relaxed text-base lg:text-lg ${
                                  isDark ? 'text-white' : 'text-slate-900'
                                }`}>{selectedHotel.description}</span>
                              </div>
                            )}
                            {selectedHotel.altDescription && (
                              <div className="flex items-start space-x-3">
                                <span className={`font-black min-w-[100px] mt-1 text-sm lg:text-base ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>Alt Description:</span>
                                <span className={`font-bold leading-relaxed text-base lg:text-lg ${
                                  isDark ? 'text-white' : 'text-slate-900'
                                }`}>{selectedHotel.altDescription}</span>
                              </div>
                            )}
                            {selectedHotel.roomCount !== undefined && (
                              <div className="flex items-center space-x-3">
                                <span className={`font-black min-w-[100px] text-sm lg:text-base ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>Total Rooms:</span>
                                <span className={`font-bold text-base lg:text-lg ${
                                  isDark ? 'text-white' : 'text-slate-900'
                                }`}>{selectedHotel.roomCount}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Date Selection */}
                      <div className={`backdrop-blur-sm border-2 p-5 lg:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 ${
                        isDark 
                          ? 'bg-slate-700/70 border-slate-600/50' 
                          : 'bg-slate-50/70 border-slate-200/50'
                      }`}>
                      <div className="flex items-center space-x-3 mb-4 lg:mb-5">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className={`text-xl lg:text-2xl xl:text-3xl font-black tracking-tight ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>Booking Dates</h3>
                          <p className={`font-bold text-sm lg:text-base ${
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          }`}>Select your check-in and check-out dates</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7 mb-6">
                        <div>
                          <label className={`block text-base lg:text-lg xl:text-xl font-black mb-3 lg:mb-4 ${
                            isDark ? 'text-white' : 'text-slate-700'
                          }`}>
                            Check-in Date *
                          </label>
                          <input
                            type="date"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full px-4 lg:px-5 py-3 lg:py-4 border-2 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm font-bold text-base lg:text-lg transition-all duration-200 ${
                              isDark 
                                ? 'bg-slate-700/80 border-slate-600 text-white focus:bg-slate-700'
                                : 'bg-white/80 border-slate-200 text-slate-900'
                            }`}
                          />
                          {validationErrors.checkIn && (
                            <p className={`mt-3 lg:mt-4 text-base lg:text-lg font-bold ${
                              isDark ? 'text-red-400' : 'text-red-600'
                            }`}>{validationErrors.checkIn}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className={`block text-base lg:text-lg xl:text-xl font-black mb-3 lg:mb-4 ${
                            isDark ? 'text-white' : 'text-slate-700'
                          }`}>
                            Check-out Date *
                          </label>
                          <input
                            type="date"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            min={checkInDate || new Date().toISOString().split('T')[0]}
                            className={`w-full px-4 lg:px-5 py-3 lg:py-4 border-2 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm font-bold text-base lg:text-lg transition-all duration-200 ${
                              isDark 
                                ? 'bg-slate-700/80 border-slate-600 text-white focus:bg-slate-700'
                                : 'bg-white/80 border-slate-200 text-slate-900'
                            }`}
                          />
                          {validationErrors.checkOut && (
                            <p className={`mt-3 lg:mt-4 text-base lg:text-lg font-bold ${
                              isDark ? 'text-red-400' : 'text-red-600'
                            }`}>{validationErrors.checkOut}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className={`block text-base lg:text-lg xl:text-xl font-black mb-3 lg:mb-4 ${
                            isDark ? 'text-white' : 'text-slate-700'
                          }`}>
                            Number of Rooms *
                          </label>
                          <input
                            type="number"
                            value={numberOfRooms}
                            onChange={(e) => setNumberOfRooms(parseInt(e.target.value) || 1)}
                            min="1"
                            className={`w-full px-4 lg:px-5 py-3 lg:py-4 border-2 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm font-bold text-base lg:text-lg transition-all duration-200 ${
                              isDark 
                                ? 'bg-slate-700/80 border-slate-600 text-white focus:bg-slate-700'
                                : 'bg-white/80 border-slate-200 text-slate-900'
                            }`}
                          />
                          {validationErrors.numberOfRooms && (
                            <p className={`mt-3 lg:mt-4 text-base lg:text-lg font-bold ${
                              isDark ? 'text-red-400' : 'text-red-600'
                            }`}>{validationErrors.numberOfRooms}</p>
                          )}
                        </div>
                      </div>

                      {numberOfNights > 0 && (
                        <div className={`border-2 p-5 lg:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                          isDark 
                            ? 'bg-slate-700/70 border-slate-600/50' 
                            : 'bg-blue-50/70 border-blue-200/50'
                        }`}>
                          <div className="flex items-center justify-center space-x-3">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h2 className={`text-xl lg:text-2xl xl:text-3xl font-black tracking-tight ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              <span className="font-black">Duration:</span> {numberOfNights} night{numberOfNights !== 1 ? 's' : ''}
                            </h2>
                          </div>
                        </div>
                      )}
                      
                    </div>

                    
                        
                      </div>
                    </div>
                    
                    
                    
                    {/* Room Selection */}
                    {checkingAvailability && (
                      <div className={`backdrop-blur-sm ${isDark ? 'bg-slate-800/70 border-slate-600/50' : 'bg-slate-50/70 border-slate-200/50'} border-2 p-8 lg:p-12 rounded-3xl mb-6 lg:mb-8 shadow-lg text-center`}>
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-4 border-blue-600"></div>
                        <p className={`mt-4 text-base lg:text-lg ${isDark ? 'text-slate-200' : 'text-slate-700'} font-semibold`}>Checking availability...</p>
                      </div>
                    )}
                    
                    {availableRooms.length > 0 && (
                      <div className={`backdrop-blur-sm ${isDark ? 'bg-slate-800/70 border-slate-600/50' : 'bg-slate-50/70 border-slate-200/50'} border-2 p-6 lg:p-8 rounded-3xl mb-6 lg:mb-8 shadow-lg`}>
                        <div className="flex items-center space-x-4 mb-4 lg:mb-6">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-2a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                          </div>
                          <div>
                            <h3 className={`text-xl lg:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>Available Rooms</h3>
                            <p className={`text-sm lg:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'} font-medium`}>Select your preferred room type</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                          {availableRooms.map((roomResult) => {
                            const room = roomResult.room;
                            const availability = roomResult.availability;
                            
                            return (
                              <div
                                key={room.id}
                                className={`border-2 rounded-3xl p-5 lg:p-6 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-[1.02] backdrop-blur-md ${
                                  !availability.isAvailable
                                    ? isDark 
                                      ? 'border-red-500/60 bg-gradient-to-br from-red-900/40 to-red-800/20 cursor-not-allowed opacity-50'
                                      : 'border-red-400/70 bg-gradient-to-br from-red-50/90 to-red-100/60 cursor-not-allowed opacity-50'
                                    : availability.totalAvailable < numberOfRooms
                                    ? isDark
                                      ? 'border-amber-500/60 bg-gradient-to-br from-amber-900/40 to-amber-800/20 cursor-not-allowed opacity-50'
                                      : 'border-amber-400/70 bg-gradient-to-br from-amber-50/90 to-amber-100/60 cursor-not-allowed opacity-50'
                                    : selectedRoomId === room.id
                                    ? isDark
                                      ? 'border-blue-400/80 bg-gradient-to-br from-blue-900/50 to-blue-800/30 cursor-pointer ring-4 ring-blue-400/30 shadow-blue-500/20'
                                      : 'border-blue-500/80 bg-gradient-to-br from-blue-50/95 to-blue-100/70 cursor-pointer ring-4 ring-blue-300/40 shadow-blue-500/20'
                                    : isDark
                                      ? 'border-slate-600/60 bg-gradient-to-br from-slate-800/70 to-slate-900/40 hover:border-slate-500/80 cursor-pointer hover:from-slate-700/80 hover:to-slate-800/50'
                                      : 'border-slate-300/70 bg-gradient-to-br from-white/95 to-slate-50/80 hover:border-slate-400/80 cursor-pointer hover:from-white hover:to-slate-100/90'
                                }`}
                                onClick={() => {
                                  if (availability.isAvailable && availability.totalAvailable >= numberOfRooms) {
                                    handleRoomSelection(room.id);
                                  }
                                }}
                              >
                                <div className="space-y-5">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h3 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'} text-lg lg:text-xl tracking-tight leading-tight`}>
                                        {room.roomType}
                                      </h3>
                                      <p className={`text-sm lg:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'} font-semibold mt-2 leading-relaxed line-clamp-2`}>
                                        {room.roomTypeDescription}
                                      </p>
                                    </div>
                                    <div className="ml-4 text-right">
                                      <div className={`${isDark ? 'bg-gradient-to-br from-blue-600 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-purple-600'} text-white rounded-2xl p-3 lg:p-4 shadow-xl`}>
                                        <div className="text-lg lg:text-xl font-black">
                                          {formatCurrency(room.basePrice)}
                                        </div>
                                        <div className="text-sm font-bold opacity-90">
                                          per night
                                        </div>
                                        {room.alternativePrice && (
                                          <div className={`text-sm font-bold mt-2 ${isDark ? 'bg-slate-600/40' : 'bg-white/25'} rounded-lg px-2 py-1`}>
                                            Alt: {formatCurrency(room.alternativePrice)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className={`text-sm lg:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'} grid grid-cols-2 gap-4`}>
                                    <div className="text-center">
                                      <span className="font-black text-base lg:text-lg block">{room.boardType}</span>
                                      <span className="text-sm font-bold opacity-75">Board Type</span>
                                    </div>
                                    
                                    <div className="text-center">
                                      <span className="font-black text-base lg:text-lg block">{room.quantity}</span>
                                      <span className="text-sm font-bold opacity-75">Total Rooms</span>
                                    </div>
                                  </div>
                                    
                                  {/* Availability Status */}
                                  <div className="text-sm">
                                    {!availability.isAvailable ? (
                                      <div className={`${isDark ? 'bg-red-900/60 border-red-600/60 text-red-200' : 'bg-red-50 border-red-400 text-red-800'} border-2 rounded-xl p-3`}>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-lg">❌</span>
                                          <span className="font-black text-sm lg:text-base">Not Available</span>
                                        </div>
                                        {!availability.isWithinAvailabilityPeriod && (
                                          <p className="mt-2 text-sm font-semibold opacity-80">Outside availability period</p>
                                        )}
                                      </div>
                                    ) : availability.totalAvailable < numberOfRooms ? (
                                      <div className={`${isDark ? 'bg-amber-900/60 border-amber-600/60 text-amber-200' : 'bg-amber-50 border-amber-400 text-amber-800'} border-2 rounded-xl p-3`}>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-lg">⚠️</span>
                                          <span className="font-black text-sm lg:text-base">Insufficient Rooms</span>
                                        </div>
                                        <p className="mt-2 text-sm font-semibold opacity-80">Available: {availability.totalAvailable}, Need: {numberOfRooms}</p>
                                      </div>
                                    ) : (
                                      <div className={`${isDark ? 'bg-emerald-900/60 border-emerald-600/60 text-emerald-200' : 'bg-emerald-50 border-emerald-400 text-emerald-800'} border-2 rounded-xl p-3`}>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-lg">✅</span>
                                          <span className="font-black text-sm lg:text-base">Available</span>
                                        </div>
                                        <p className="mt-2 text-sm font-semibold opacity-80">
                                          {availability.totalAvailable} rooms available
                                          {availability.bookedRooms > 0 && (
                                            <span className="ml-1">({availability.bookedRooms} booked)</span>
                                          )}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Additional Info - Enhanced */}
                                  {(room.altDescription || (room.availableFrom || room.availableTo) || (room.roomAmenities && room.roomAmenities.length > 0)) && (
                                    <div className="space-y-3">
                                      {room.altDescription && (
                                        <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'} p-3 ${isDark ? 'bg-slate-700/40' : 'bg-slate-100/80'} rounded-xl border ${isDark ? 'border-slate-600/30' : 'border-slate-200/60'}`}>
                                          <span className="font-black">Note:</span> <span className="font-semibold">{room.altDescription}</span>
                                        </div>
                                      )}
                                      
                                      {(room.availableFrom || room.availableTo) && (
                                        <div className={`text-sm ${isDark ? 'bg-blue-900/40 border-blue-600/60 text-blue-200' : 'bg-blue-50/90 border-blue-300/70 text-blue-800'} border-2 rounded-xl p-3`}>
                                          <span className="font-black">Period:</span>
                                          <span className="font-semibold">
                                            {room.availableFrom && ` From ${formatDate(room.availableFrom)}`}
                                            {room.availableTo && ` To ${formatDate(room.availableTo)}`}
                                          </span>
                                        </div>
                                      )}
                                      
                                      {room.roomAmenities && room.roomAmenities.length > 0 && (
                                        <div className={`text-sm ${isDark ? 'bg-emerald-900/40 border-emerald-600/60 text-emerald-200' : 'bg-emerald-50/90 border-emerald-300/70 text-emerald-800'} border-2 rounded-xl p-3`}>
                                          <span className="font-black">Amenities:</span> <span className="font-semibold">{room.roomAmenities.map(amenity => amenity.name).join(', ')}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {validationErrors.room && (
                          <p className="mt-6 text-base text-red-600 font-medium bg-red-50 border border-red-200 rounded-xl p-3">{validationErrors.room}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Alternative Pricing Option */}
                    {selectedRoom && selectedRoom.alternativePrice && (
                      <div className={`backdrop-blur-sm ${isDark ? 'bg-yellow-900/30 border-yellow-700/50' : 'bg-yellow-50/70 border-yellow-200/50'} border-2 p-4 lg:p-6 rounded-2xl mt-6 lg:mt-8 shadow-lg`}>
                        <label className="flex items-center space-x-3 lg:space-x-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useAlternativeRate}
                            onChange={(e) => setUseAlternativeRate(e.target.checked)}
                            className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 focus:ring-blue-500 border-2 border-slate-300 rounded-lg transition-all duration-200"
                          />
                          <div>
                            <span className={`text-base lg:text-lg font-bold ${isDark ? 'text-yellow-200' : 'text-slate-900'}`}>
                              Use alternative pricing
                            </span>
                            <p className={`text-sm lg:text-base ${isDark ? 'text-yellow-300' : 'text-slate-600'} font-medium`}>
                              {formatCurrency(selectedRoom.alternativePrice)} per night
                            </p>
                          </div>
                        </label>
                      </div>
                    )}
                    
                    {/* Total Calculation */}
                    {totalAmount > 0 && (
                      <div className={`backdrop-blur-sm ${isDark ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-slate-600/50' : 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-200/50'} border-2 p-4 lg:p-6 rounded-2xl mt-6 lg:mt-8 shadow-xl`}>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <h3 className={`text-xl lg:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Total Amount</h3>
                        </div>
                        <div className={`text-2xl lg:text-3xl font-black ${isDark ? 'text-green-400' : 'text-green-700'} mb-2`}>
                          {formatCurrency(totalAmount)}
                        </div>
                        <div className={`text-sm lg:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'} font-medium`}>
                          {formatCurrency(useAlternativeRate && selectedRoom?.alternativePrice ? selectedRoom.alternativePrice : selectedRoom?.basePrice || 0)} × {numberOfNights} nights × {numberOfRooms} rooms
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Step 2: Guest Information */}
                <div className="w-full">
                  <div className={`backdrop-blur-sm ${isDark ? 'bg-slate-800/70 border-slate-600/50' : 'bg-white/70 border-slate-200/50'} border-2 p-6 lg:p-8 rounded-2xl shadow-xl mb-6 lg:mb-8`}>
                    <div className="flex items-center space-x-3 lg:space-x-4 mb-6 lg:mb-8">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className={`text-xl lg:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          2. Guest Information
                        </h2>
                        <p className={`text-sm lg:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'} font-medium`}>Please provide your contact details</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                      <div>
                        <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={guestData.fullName}
                          onChange={(e) => setGuestData(prev => ({ ...prev, fullName: e.target.value }))}
                          className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                        />
                        {validationErrors.fullName && (
                          <p className={`mt-2 text-sm lg:text-base text-red-600 font-medium ${isDark ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200'} border rounded-xl p-2 lg:p-3`}>{validationErrors.fullName}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                          Email *
                        </label>
                        <input
                          type="email"
                          value={guestData.email}
                          onChange={(e) => setGuestData(prev => ({ ...prev, email: e.target.value }))}
                          className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                        />
                        {validationErrors.email && (
                          <p className={`mt-2 text-sm lg:text-base text-red-600 font-medium ${isDark ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200'} border rounded-xl p-2 lg:p-3`}>{validationErrors.email}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={guestData.phone}
                          onChange={(e) => setGuestData(prev => ({ ...prev, phone: e.target.value }))}
                          className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                        />
                        {validationErrors.phone && (
                          <p className={`mt-2 text-sm lg:text-base text-red-600 font-medium ${isDark ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200'} border rounded-xl p-2 lg:p-3`}>{validationErrors.phone}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                          Nationality *
                        </label>
                        <select
                          value={guestData.nationality}
                          onChange={(e) => setGuestData(prev => ({ ...prev, nationality: e.target.value }))}
                          className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                        >
                          <option value="">Select nationality</option>
                          {nationalities.map((nationality) => (
                            <option key={nationality.code} value={nationality.name}>
                              {nationality.name}
                            </option>
                          ))}
                        </select>
                        {validationErrors.nationality && (
                          <p className={`mt-2 text-sm lg:text-base text-red-600 font-medium ${isDark ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200'} border rounded-xl p-2 lg:p-3`}>{validationErrors.nationality}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                          Guest Classification *
                        </label>
                        <select
                          value={guestData.guestClassification}
                          onChange={(e) => setGuestData(prev => ({ ...prev, guestClassification: e.target.value }))}
                          className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                        >
                          <option value="">Select guest classification</option>
                          <option value="Saudi Citizen">Saudi Citizen</option>
                          <option value="Visitor">Visitor</option>
                          <option value="Resident">Resident (Non‑Saudi)</option>
                        </select>
                        {validationErrors.guestClassification && (
                          <p className={`mt-2 text-sm lg:text-base text-red-600 font-medium ${isDark ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200'} border rounded-xl p-2 lg:p-3`}>{validationErrors.guestClassification}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                          Travel Agent
                        </label>
                        <input
                          type="text"
                          value={guestData.travelAgent}
                          onChange={(e) => setGuestData(prev => ({ ...prev, travelAgent: e.target.value }))}
                          className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                          Company
                        </label>
                        <input
                          type="text"
                          value={guestData.company}
                          onChange={(e) => setGuestData(prev => ({ ...prev, company: e.target.value }))}
                          className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                          Source
                        </label>
                        <input
                          type="text"
                          value={guestData.source}
                          onChange={(e) => setGuestData(prev => ({ ...prev, source: e.target.value }))}
                          placeholder="e.g., Online Booking, Walk-in"
                          className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                          Group
                        </label>
                        <input
                          type="text"
                          value={guestData.group}
                          onChange={(e) => setGuestData(prev => ({ ...prev, group: e.target.value }))}
                          placeholder="e.g., Business Group, Family"
                          className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                        />
                      </div>
                    </div>
                      
                    {/* Additional Guest Information */}
                    <div className="mt-6 lg:mt-8">
                      <h3 className={`text-lg lg:text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-4 lg:mb-6`}>Additional Information</h3>
                      
                      {/* First Row - Personal Details (4 columns) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
                        <div>
                          <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                            First Name
                          </label>
                          <input
                            type="text"
                            value={guestData.firstName}
                            onChange={(e) => setGuestData(prev => ({ ...prev, firstName: e.target.value }))}
                            className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                          />
                        </div>
                        
                        <div>
                          <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={guestData.lastName}
                            onChange={(e) => setGuestData(prev => ({ ...prev, lastName: e.target.value }))}
                            className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                          />
                        </div>
                        
                        <div>
                          <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={guestData.dateOfBirth}
                            onChange={(e) => setGuestData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                            className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                          />
                        </div>
                        
                        <div>
                          <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                            Gender
                          </label>
                          <select
                            value={guestData.gender}
                            onChange={(e) => setGuestData(prev => ({ ...prev, gender: e.target.value as 'MALE' | 'FEMALE' }))}
                            className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Second Row - Contact & ID Details (4 columns) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
                        <div>
                          <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                            Telephone
                          </label>
                          <input
                            type="tel"
                            value={guestData.telephone}
                            onChange={(e) => setGuestData(prev => ({ ...prev, telephone: e.target.value }))}
                            className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                          />
                        </div>
                        
                        <div>
                          <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                            Passport Number
                          </label>
                          <input
                            type="text"
                            value={guestData.passportNumber}
                            onChange={(e) => setGuestData(prev => ({ ...prev, passportNumber: e.target.value }))}
                            className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                          />
                        </div>
                        
                        <div>
                          <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                            City
                          </label>
                          <input
                            type="text"
                            value={guestData.city}
                            onChange={(e) => setGuestData(prev => ({ ...prev, city: e.target.value }))}
                            className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                          />
                        </div>
                        
                        <div>
                          <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                            Country
                          </label>
                          <select
                            value={guestData.country}
                            onChange={(e) => setGuestData(prev => ({ ...prev, country: e.target.value }))}
                            className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                          >
                            <option value="">Select country</option>
                            {countries.map((country) => (
                              <option key={country.code} value={country.name}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {/* Third Row - Address, Notes, and VIP in 4 columns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        <div>
                          <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                            Address
                          </label>
                          <textarea
                            value={guestData.address}
                            onChange={(e) => setGuestData(prev => ({ ...prev, address: e.target.value }))}
                            rows={3}
                            className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base resize-none`}
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                            Notes
                          </label>
                          <textarea
                            value={guestData.notes}
                            onChange={(e) => setGuestData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            placeholder="Additional notes or special requests"
                            className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base resize-none`}
                          />
                        </div>
                        
                        <div className="flex items-end pb-3">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={guestData.isVip}
                              onChange={(e) => setGuestData(prev => ({ ...prev, isVip: e.target.checked }))}
                              className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-2 border-slate-300 rounded-lg transition-all duration-200"
                            />
                            <span className={`text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              VIP Guest
                            </span>
                          </label>
                        </div>
                      </div>
                    </div></div>
                  </div>
                
                
                {/* Step 3: Payment Details */}
                <div className="w-full">
                  <div className={`backdrop-blur-sm ${isDark ? 'bg-slate-800/70 border-slate-600/50' : 'bg-white/80 border-slate-200'} border-2 p-6 lg:p-8 rounded-2xl shadow-lg mb-6 lg:mb-8`}>
                    <div className="flex items-center space-x-3 lg:space-x-4 mb-6 lg:mb-8">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className={`text-xl lg:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          3. Payment Details
                        </h2>
                        <p className={`text-sm lg:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'} font-medium`}>Choose your payment method and complete the booking</p>
                      </div>
                    </div>
                    
                    {/* Booking Summary */}
                    {totalAmount > 0 && (
                      <div className={`backdrop-blur-sm ${isDark ? 'bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500' : 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200'} border-2 p-4 lg:p-6 rounded-xl mb-4 lg:mb-6 shadow-lg`}>
                        <h3 className={`text-base lg:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-3 lg:mb-4`}>Booking Summary</h3>
                        <div className={`space-y-2 lg:space-y-3 text-sm lg:text-base ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                          <p><strong>Hotel:</strong> {hotels.find(h => h.id === selectedHotelId)?.name}</p>
                          <p><strong>Room:</strong> {selectedRoom?.roomType}</p>
                          <p><strong>Dates:</strong> {checkInDate} to {checkOutDate} ({numberOfNights} nights)</p>
                          <p><strong>Rooms:</strong> {numberOfRooms}</p>
                          <p><strong>Rate:</strong> {formatCurrency(useAlternativeRate && selectedRoom?.alternativePrice ? selectedRoom.alternativePrice : selectedRoom?.basePrice || 0)} per night</p>
                          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 lg:p-4 rounded-xl mt-3 lg:mt-4">
                            <p className="text-base lg:text-lg font-bold">
                              Total Amount: {formatCurrency(totalAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Payment Method */}
                    <div className="mb-4 lg:mb-6">
                      <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-3 lg:mb-4`}>
                        Payment Method *
                      </label>
                      <div className="space-y-3 lg:space-y-4">
                        <label className={`flex items-center space-x-3 lg:space-x-4 cursor-pointer p-3 lg:p-4 border-2 ${isDark ? 'border-slate-600 hover:bg-slate-700/50' : 'border-slate-200 hover:bg-slate-50'} rounded-xl transition-all duration-200`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="CASH"
                            checked={paymentData.method === 'CASH'}
                            onChange={() => handlePaymentMethodChange('CASH')}
                            className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-2 border-slate-300 rounded-lg"
                          />
                          <span className={`text-sm lg:text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Cash Payment (Full amount: {formatCurrency(totalAmount)})
                          </span>
                        </label>
                        
                        <label className={`flex items-center space-x-3 lg:space-x-4 cursor-pointer p-3 lg:p-4 border-2 ${isDark ? 'border-slate-600 hover:bg-slate-700/50' : 'border-slate-200 hover:bg-slate-50'} rounded-xl transition-all duration-200`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="CREDIT"
                            checked={paymentData.method === 'CREDIT'}
                            onChange={() => handlePaymentMethodChange('CREDIT')}
                            className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-2 border-slate-300 rounded-lg"
                          />
                          <span className={`text-sm lg:text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Credit Payment (Pay now + Pay later)
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Payment Date */}
                    <div className="mb-4 lg:mb-6">
                      <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
                        Payment Date *
                      </label>
                      <input
                        type="date"
                        value={paymentData.date}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, date: e.target.value }))}
                        className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                      />
                      {validationErrors.paymentDate && (
                        <p className={`mt-2 lg:mt-3 text-sm lg:text-base font-medium ${isDark ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200'} border-2 text-red-600 rounded-xl p-2 lg:p-3`}>{validationErrors.paymentDate}</p>
                      )}
                    </div>
                    
                    {/* Credit Payment Details */}
                    {paymentData.method === 'CREDIT' && (
                      <div className={`backdrop-blur-sm ${isDark ? 'bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500' : 'bg-gradient-to-r from-orange-50/80 to-amber-50/80 border-orange-200'} border-2 p-4 lg:p-6 rounded-xl shadow-lg`}>
                        <h4 className={`text-base lg:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-4 lg:mb-6`}>
                          Credit Payment Details
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
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
                            className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                          />
                          {validationErrors.paidAmount && (
                            <p className={`mt-2 lg:mt-3 text-sm lg:text-base font-medium ${isDark ? 'bg-red-900/50 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'} border-2 rounded-xl p-2 lg:p-3`}>{validationErrors.paidAmount}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className={`block text-sm lg:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-3`}>
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
                            className={`w-full px-3 lg:px-4 py-3 lg:py-4 border-2 ${isDark ? 'border-slate-600 bg-slate-700/70 text-white focus:border-slate-500 focus:bg-slate-700' : 'border-slate-200 bg-white/80 text-slate-900 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm font-medium transition-all duration-200 text-sm lg:text-base`}
                          />
                          {validationErrors.remainingDueDate && (
                            <p className={`mt-2 lg:mt-3 text-sm lg:text-base font-medium ${isDark ? 'bg-red-900/50 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'} border-2 rounded-xl p-2 lg:p-3`}>{validationErrors.remainingDueDate}</p>
                          )}
                        </div>
                        </div>
                        
                        {paymentData.paidAmount && paymentData.paidAmount > 0 && (
                          <div className={`mt-4 lg:mt-6 p-3 lg:p-4 ${isDark ? 'bg-gradient-to-r from-orange-900/50 to-amber-900/50 border-orange-700' : 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-300'} border-2 rounded-xl`}>
                            <div className={`space-y-1 lg:space-y-2 text-sm lg:text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              <p><strong>Pay Now:</strong> {formatCurrency(paymentData.paidAmount)}</p>
                              <p><strong>Pay Later:</strong> {formatCurrency(totalAmount - paymentData.paidAmount)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Cash Payment Info */}
                    {paymentData.method === 'CASH' && (
                      <div className={`backdrop-blur-sm ${isDark ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-700' : 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-200'} border-2 p-4 lg:p-6 rounded-xl shadow-lg`}>
                        <h4 className={`text-base lg:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-3 lg:mb-4`}>
                          Cash Payment
                        </h4>
                        <p className={`text-sm lg:text-base font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                          Full payment of {formatCurrency(totalAmount)} will be collected on {formatDate(paymentData.date)}.
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
              <div className="mt-12 flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !selectedRoom || totalAmount === 0}
                  className="w-full text-center px-12 py-8 bg-gradient-to-r from-blue-600 to-blue-600 text-white text-lg font-bold rounded-2xl hover:from-blue-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transform  transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center space-x-3">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating Booking...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 text-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Create Booking</span>
                    </div>
                  )}
                </button>
              </div>
                  </div>
                </div>
              </div>
              
              
      
    </ProtectedRoute>
  );
}
