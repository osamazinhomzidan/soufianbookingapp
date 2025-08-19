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
  payment: Payment;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  createdAt: string;
}

export default function Reservations() {
  const [language, setLanguage] = useState('en');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [hotelFilter, setHotelFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  
  // View options
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'checked-in': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'checked-out': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Filter and sort bookings
  const filteredAndSortedBookings = bookings
    .filter(booking => {
      const statusMatch = !statusFilter || booking.status === statusFilter;
      const hotelMatch = !hotelFilter || booking.room.hotelId === hotelFilter;
      const dateMatch = (!dateRangeFilter.start || booking.guest.arrival >= dateRangeFilter.start) &&
                       (!dateRangeFilter.end || booking.guest.departure <= dateRangeFilter.end);
      const searchMatch = !searchQuery || 
        booking.guest.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.resId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.guest.telephone.includes(searchQuery);
      return statusMatch && hotelMatch && dateMatch && searchMatch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.guest.fullName;
          bValue = b.guest.fullName;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'amount':
          aValue = a.payment.amount;
          bValue = b.payment.amount;
          break;
        default:
          aValue = a.guest.arrival;
          bValue = b.guest.arrival;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  
  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);
  const paginatedBookings = filteredAndSortedBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Statistics
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    checkedIn: bookings.filter(b => b.status === 'checked-in').length,
    checkedOut: bookings.filter(b => b.status === 'checked-out').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.payment.amount, 0),
    pendingPayments: bookings.reduce((sum, b) => sum + (b.payment.remainingBalance || 0), 0)
  };
  
  // Handle bulk operations
  const handleBulkStatusChange = (newStatus: string) => {
    setBookings(bookings.map(booking => 
      selectedBookings.includes(booking.id) 
        ? { ...booking, status: newStatus as any }
        : booking
    ));
    setSelectedBookings([]);
  };
  
  // Export functionality
  const exportToCSV = () => {
    const headers = ['Reservation ID', 'Guest Name', 'Hotel', 'Room', 'Check-in', 'Check-out', 'Status', 'Amount', 'Balance'];
    const csvData = filteredAndSortedBookings.map(booking => [
      booking.resId,
      booking.guest.fullName,
      hotels.find(h => h.id === booking.room.hotelId)?.name || '',
      booking.room.type,
      booking.guest.arrival,
      booking.guest.departure,
      booking.status,
      booking.payment.amount,
      booking.payment.remainingBalance || 0
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reservations.csv';
    a.click();
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-gray-700">
              {language === 'ar' ? 'جاري تحميل الحجوزات...' : 'Loading reservations...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              <h1 className="text-3xl font-bold text-gray-800">
                {language === 'ar' ? 'إدارة الحجوزات' : 'Reservations Management'}
              </h1>
            </div>
            
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
          
          {/* Statistics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-700">{language === 'ar' ? 'إجمالي الحجوزات' : 'Total'}</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-yellow-700">{language === 'ar' ? 'في الانتظار' : 'Pending'}</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <div className="text-sm text-green-700">{language === 'ar' ? 'مؤكد' : 'Confirmed'}</div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.checkedIn}</div>
              <div className="text-sm text-blue-700">{language === 'ar' ? 'داخل الفندق' : 'Checked-in'}</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{stats.checkedOut}</div>
              <div className="text-sm text-purple-700">{language === 'ar' ? 'خرج من الفندق' : 'Checked-out'}</div>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-red-700">{language === 'ar' ? 'ملغي' : 'Cancelled'}</div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-600">{stats.totalRevenue} SAR</div>
              <div className="text-sm text-emerald-700">{language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{stats.pendingPayments} SAR</div>
              <div className="text-sm text-orange-700">{language === 'ar' ? 'مدفوعات معلقة' : 'Pending Payments'}</div>
            </div>
          </div>
        </div>
        
        {/* Filters and Controls */}
        <div className="backdrop-blur-sm bg-white/50 border border-white/30 rounded-2xl p-6 shadow-lg mb-8">
          {/* Search and View Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث بالاسم، رقم الحجز، أو الهاتف...' : 'Search by name, reservation ID, or phone...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl hover:bg-white/70 transition-all duration-200"
              >
                {viewMode === 'table' ? '📋' : '📊'}
              </button>
              
              <button
                onClick={exportToCSV}
                className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200"
              >
                {language === 'ar' ? 'تصدير' : 'Export'}
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
                <option value="checked-out">{language === 'ar' ? 'تم تسجيل الخروج' : 'Checked-out'}</option>
                <option value="cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {language === 'ar' ? 'تصفية حسب الفندق' : 'Filter by Hotel'}
              </label>
              <select
                value={hotelFilter}
                onChange={(e) => setHotelFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              >
                <option value="">{language === 'ar' ? 'جميع الفنادق' : 'All Hotels'}</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
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
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {language === 'ar' ? 'ترتيب حسب' : 'Sort by'}
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              >
                <option value="date-desc">{language === 'ar' ? 'التاريخ (الأحدث)' : 'Date (Newest)'}</option>
                <option value="date-asc">{language === 'ar' ? 'التاريخ (الأقدم)' : 'Date (Oldest)'}</option>
                <option value="name-asc">{language === 'ar' ? 'الاسم (أ-ي)' : 'Name (A-Z)'}</option>
                <option value="name-desc">{language === 'ar' ? 'الاسم (ي-أ)' : 'Name (Z-A)'}</option>
                <option value="amount-desc">{language === 'ar' ? 'المبلغ (الأعلى)' : 'Amount (Highest)'}</option>
                <option value="amount-asc">{language === 'ar' ? 'المبلغ (الأقل)' : 'Amount (Lowest)'}</option>
              </select>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectedBookings.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-200/50">
              <span className="text-sm font-medium text-blue-700">
                {selectedBookings.length} {language === 'ar' ? 'حجز محدد' : 'selected'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkStatusChange('confirmed')}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                >
                  {language === 'ar' ? 'تأكيد' : 'Confirm'}
                </button>
                <button
                  onClick={() => handleBulkStatusChange('cancelled')}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={() => setSelectedBookings([])}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {language === 'ar' ? 'إلغاء التحديد' : 'Clear'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Reservations Table/Cards */}
        <div className="backdrop-blur-sm bg-white/50 border border-white/30 rounded-2xl p-6 shadow-lg">
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedBookings.length === paginatedBookings.length && paginatedBookings.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBookings(paginatedBookings.map(b => b.id));
                          } else {
                            setSelectedBookings([]);
                          }
                        }}
                        className="rounded"
                      />
                    </th>
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
                      {language === 'ar' ? 'الفندق' : 'Hotel'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'الغرفة' : 'Room'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'التواريخ' : 'Dates'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'المبلغ' : 'Amount'}
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
                  {paginatedBookings.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                        {language === 'ar' ? 'لا توجد حجوزات' : 'No reservations found'}
                      </td>
                    </tr>
                  ) : (
                    paginatedBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-white/30 transition-all duration-200">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedBookings.includes(booking.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBookings([...selectedBookings, booking.id]);
                              } else {
                                setSelectedBookings(selectedBookings.filter(id => id !== booking.id));
                              }
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {booking.resId}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="flex items-center">
                            {booking.guest.fullName}
                            {booking.guest.vip && (
                              <span className="ml-2 inline-block w-2 h-2 bg-yellow-400 rounded-full" title="VIP"></span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{booking.guest.telephone}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {booking.guest.guestClassification}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {hotels.find(h => h.id === booking.room.hotelId)?.name || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div>{booking.room.type}</div>
                          <div className="text-xs text-gray-500">{booking.room.boardType}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div>{booking.guest.arrival}</div>
                          <div className="text-xs text-gray-500">to {booking.guest.departure}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {booking.payment.amount} SAR
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {booking.payment.remainingBalance || 0} SAR
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
                                // Add view functionality here
                                console.log('View booking:', booking.id);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              {language === 'ar' ? 'عرض' : 'View'}
                            </button>
                            <button 
                              onClick={() => {
                                // Edit reservation
                                console.log('Edit reservation:', booking.id);
                                alert(`Editing reservation ${booking.resId}`);
                              }}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              {language === 'ar' ? 'تعديل' : 'Edit'}
                            </button>
                            <button 
                              onClick={() => {
                                // Cancel reservation
                                if (confirm(`Are you sure you want to cancel reservation ${booking.resId}?`)) {
                                  console.log('Cancel reservation:', booking.id);
                                  alert(`Reservation ${booking.resId} has been cancelled`);
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button 
                              onClick={() => {
                                // Print reservation
                                console.log('Print reservation:', booking.id);
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedBookings.map((booking) => (
                <div key={booking.id} className="bg-white/70 border border-white/30 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">{booking.guest.fullName}</h3>
                      <p className="text-sm text-gray-600">{booking.resId}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {booking.guest.vip && (
                        <span className="w-2 h-2 bg-yellow-400 rounded-full" title="VIP"></span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div><strong>Hotel:</strong> {hotels.find(h => h.id === booking.room.hotelId)?.name}</div>
                    <div><strong>Room:</strong> {booking.room.type}</div>
                    <div><strong>Dates:</strong> {booking.guest.arrival} - {booking.guest.departure}</div>
                    <div><strong>Amount:</strong> {booking.payment.amount} SAR</div>
                    <div><strong>Balance:</strong> {booking.payment.remainingBalance || 0} SAR</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        // Add view functionality here
                        console.log('View booking:', booking.id);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      {language === 'ar' ? 'عرض' : 'View'}
                    </button>
                    <button 
                      onClick={() => {
                        // Edit reservation
                        console.log('Edit reservation:', booking.id);
                        alert(`Editing reservation ${booking.resId}`);
                      }}
                      className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                    >
                      {language === 'ar' ? 'تعديل' : 'Edit'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                {language === 'ar' 
                  ? `عرض ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredAndSortedBookings.length)} من ${filteredAndSortedBookings.length}`
                  : `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredAndSortedBookings.length)} of ${filteredAndSortedBookings.length}`
                }
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white/50 border border-gray-200/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/70 transition-colors"
                >
                  {language === 'ar' ? 'السابق' : 'Previous'}
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + Math.max(1, currentPage - 2);
                  if (page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/50 border border-gray-200/50 hover:bg-white/70'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-white/50 border border-gray-200/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/70 transition-colors"
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
