'use client';

import { useState, useEffect } from 'react';

interface Hotel {
  id: string;
  name: string;
  code: string;
}

interface Guest {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  guestClassification: string;
  telephone: string;
  nationality: string;
  passportNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  address: string;
  city: string;
  country: string;
  company: string;
  travelAgent: string;
  source: string;
  group: string;
  vip: boolean;
  profileId: string;
  preferences: {
    roomType: string;
    bedType: string;
    smokingPreference: 'smoking' | 'non-smoking';
    floorPreference: string;
    specialRequests: string[];
  };
  loyaltyProgram: {
    member: boolean;
    level: 'bronze' | 'silver' | 'gold' | 'platinum';
    points: number;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: string;
  lastStay: string;
  totalStays: number;
  totalSpent: number;
  notes: string;
}

interface Booking {
  id: string;
  resId: string;
  guestId: string;
  hotelId: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  totalAmount: number;
}

export default function Guests() {
  const [language, setLanguage] = useState('en');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('');
  const [vipFilter, setVipFilter] = useState('');
  const [loyaltyFilter, setLoyaltyFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  
  // View options
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'lastStay' | 'totalStays' | 'totalSpent'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  // Modal states
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch hotels
        const hotelsResponse = await fetch('/hotels.json');
        const hotelsData = await hotelsResponse.json();
        setHotels(hotelsData);
        
        // Fetch bookings
        const bookingsResponse = await fetch('/bookings.json');
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
        
        // Generate sample guests data
        const sampleGuests: Guest[] = [
          {
            id: '1',
            fullName: 'Ahmed Al-Rashid',
            firstName: 'Ahmed',
            lastName: 'Al-Rashid',
            email: 'ahmed.rashid@email.com',
            guestClassification: 'Saudi Citizen',
            telephone: '+966501234567',
            nationality: 'Saudi Arabia',
            passportNumber: 'SA123456789',
            dateOfBirth: '1985-03-15',
            gender: 'male',
            address: 'King Fahd Road, Riyadh',
            city: 'Riyadh',
            country: 'Saudi Arabia',
            company: 'Saudi Aramco',
            travelAgent: 'Elite Travel',
            source: 'Corporate',
            group: 'Business',
            vip: true,
            profileId: 'VIP001',
            preferences: {
              roomType: 'Suite',
              bedType: 'King',
              smokingPreference: 'non-smoking',
              floorPreference: 'High floor',
              specialRequests: ['Late checkout', 'Airport transfer']
            },
            loyaltyProgram: {
              member: true,
              level: 'gold',
              points: 15000
            },
            emergencyContact: {
              name: 'Fatima Al-Rashid',
              relationship: 'Spouse',
              phone: '+966501234568'
            },
            createdAt: '2023-01-15',
            lastStay: '2024-01-15',
            totalStays: 12,
            totalSpent: 45000,
            notes: 'Prefers room with city view. Regular business traveler.'
          },
          {
            id: '2',
            fullName: 'Sarah Johnson',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@email.com',
            guestClassification: 'Visitor',
            telephone: '+1234567890',
            nationality: 'United States',
            passportNumber: 'US987654321',
            dateOfBirth: '1990-07-22',
            gender: 'female',
            address: '123 Main Street, New York',
            city: 'New York',
            country: 'United States',
            company: 'Tech Corp',
            travelAgent: 'Global Tours',
            source: 'Online',
            group: 'Leisure',
            vip: false,
            profileId: 'REG002',
            preferences: {
              roomType: 'Deluxe',
              bedType: 'Queen',
              smokingPreference: 'non-smoking',
              floorPreference: 'Mid floor',
              specialRequests: ['Extra pillows', 'Room service']
            },
            loyaltyProgram: {
              member: true,
              level: 'silver',
              points: 8500
            },
            emergencyContact: {
              name: 'Michael Johnson',
              relationship: 'Brother',
              phone: '+1234567891'
            },
            createdAt: '2023-05-10',
            lastStay: '2024-02-10',
            totalStays: 6,
            totalSpent: 18000,
            notes: 'Frequent leisure traveler. Enjoys spa services.'
          },
          {
            id: '3',
            fullName: 'Mohammed Hassan',
            firstName: 'Mohammed',
            lastName: 'Hassan',
            email: 'mohammed.hassan@email.com',
            guestClassification: 'Resident',
            telephone: '+971501234567',
            nationality: 'United Arab Emirates',
            passportNumber: 'AE456789123',
            dateOfBirth: '1978-11-08',
            gender: 'male',
            address: 'Sheikh Zayed Road, Dubai',
            city: 'Dubai',
            country: 'United Arab Emirates',
            company: 'Emirates Group',
            travelAgent: 'Premium Travel',
            source: 'Referral',
            group: 'Business',
            vip: true,
            profileId: 'VIP003',
            preferences: {
              roomType: 'Presidential Suite',
              bedType: 'King',
              smokingPreference: 'non-smoking',
              floorPreference: 'Top floor',
              specialRequests: ['Butler service', 'Private dining']
            },
            loyaltyProgram: {
              member: true,
              level: 'platinum',
              points: 25000
            },
            emergencyContact: {
              name: 'Aisha Hassan',
              relationship: 'Wife',
              phone: '+971501234568'
            },
            createdAt: '2022-08-20',
            lastStay: '2024-01-28',
            totalStays: 18,
            totalSpent: 75000,
            notes: 'VIP guest. Requires special attention and personalized service.'
          }
        ];
        
        setGuests(sampleGuests);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Get loyalty level color
  const getLoyaltyColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Filter and sort guests
  const filteredAndSortedGuests = guests
    .filter(guest => {
      const searchMatch = !searchQuery || 
        guest.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.telephone.includes(searchQuery) ||
        guest.profileId.toLowerCase().includes(searchQuery.toLowerCase());
      const nationalityMatch = !nationalityFilter || guest.nationality === nationalityFilter;
      const vipMatch = !vipFilter || (vipFilter === 'vip' ? guest.vip : !guest.vip);
      const loyaltyMatch = !loyaltyFilter || guest.loyaltyProgram.level === loyaltyFilter;
      const genderMatch = !genderFilter || guest.gender === genderFilter;
      return searchMatch && nationalityMatch && vipMatch && loyaltyMatch && genderMatch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'lastStay':
          aValue = new Date(a.lastStay).getTime();
          bValue = new Date(b.lastStay).getTime();
          break;
        case 'totalStays':
          aValue = a.totalStays;
          bValue = b.totalStays;
          break;
        case 'totalSpent':
          aValue = a.totalSpent;
          bValue = b.totalSpent;
          break;
        default:
          aValue = a.fullName;
          bValue = b.fullName;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  
  // Pagination
  const totalPages = Math.ceil(filteredAndSortedGuests.length / itemsPerPage);
  const paginatedGuests = filteredAndSortedGuests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Statistics
  const stats = {
    total: guests.length,
    vip: guests.filter(g => g.vip).length,
    loyaltyMembers: guests.filter(g => g.loyaltyProgram.member).length,
    totalSpent: guests.reduce((sum, g) => sum + g.totalSpent, 0),
    averageStays: guests.length > 0 ? Math.round(guests.reduce((sum, g) => sum + g.totalStays, 0) / guests.length) : 0,
    nationalities: Array.from(new Set(guests.map(g => g.nationality))).length
  };
  
  // Export functionality
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Nationality', 'VIP', 'Loyalty Level', 'Total Stays', 'Total Spent', 'Last Stay'];
    const csvData = filteredAndSortedGuests.map(guest => [
      guest.fullName,
      guest.email,
      guest.telephone,
      guest.nationality,
      guest.vip ? 'Yes' : 'No',
      guest.loyaltyProgram.level,
      guest.totalStays,
      guest.totalSpent,
      guest.lastStay
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guests.csv';
    a.click();
  };
  
  // Get guest bookings
  const getGuestBookings = (guestId: string) => {
    return bookings.filter(booking => booking.guestId === guestId);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-gray-700">
              {language === 'ar' ? 'جاري تحميل بيانات النزلاء...' : 'Loading guests data...'}
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
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-full animate-pulse"></div>
              <h1 className="text-3xl font-bold text-gray-800">
                {language === 'ar' ? 'إدارة النزلاء' : 'Guest Management'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Add New Guest Button */}
              <button
                onClick={() => {
                  setSelectedGuest(null);
                  setIsEditing(false);
                  setShowGuestModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                {language === 'ar' ? 'إضافة نزيل جديد' : 'Add New Guest'}
              </button>
              
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                {language === 'ar' ? 'English' : 'العربية'}
              </button>
            </div>
          </div>
          
          {/* Statistics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-700">{language === 'ar' ? 'إجمالي النزلاء' : 'Total Guests'}</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{stats.vip}</div>
              <div className="text-sm text-yellow-700">{language === 'ar' ? 'نزلاء VIP' : 'VIP Guests'}</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{stats.loyaltyMembers}</div>
              <div className="text-sm text-purple-700">{language === 'ar' ? 'أعضاء الولاء' : 'Loyalty Members'}</div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-600">{stats.totalSpent.toLocaleString()} SAR</div>
              <div className="text-sm text-emerald-700">{language === 'ar' ? 'إجمالي الإنفاق' : 'Total Spent'}</div>
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
              <div className="text-2xl font-bold text-indigo-600">{stats.averageStays}</div>
              <div className="text-sm text-indigo-700">{language === 'ar' ? 'متوسط الإقامات' : 'Avg Stays'}</div>
            </div>
            <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-xl border border-pink-200">
              <div className="text-2xl font-bold text-pink-600">{stats.nationalities}</div>
              <div className="text-sm text-pink-700">{language === 'ar' ? 'الجنسيات' : 'Nationalities'}</div>
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
                placeholder={language === 'ar' ? 'البحث بالاسم، البريد الإلكتروني، الهاتف، أو رقم الملف...' : 'Search by name, email, phone, or profile ID...'}
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
                {viewMode === 'table' ? '👥' : '📋'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {language === 'ar' ? 'تصفية حسب الجنسية' : 'Filter by Nationality'}
              </label>
              <select
                value={nationalityFilter}
                onChange={(e) => setNationalityFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              >
                <option value="">{language === 'ar' ? 'جميع الجنسيات' : 'All Nationalities'}</option>
                {Array.from(new Set(guests.map(g => g.nationality))).map((nationality) => (
                  <option key={nationality} value={nationality}>
                    {nationality}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {language === 'ar' ? 'تصفية VIP' : 'VIP Filter'}
              </label>
              <select
                value={vipFilter}
                onChange={(e) => setVipFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              >
                <option value="">{language === 'ar' ? 'جميع النزلاء' : 'All Guests'}</option>
                <option value="vip">{language === 'ar' ? 'VIP فقط' : 'VIP Only'}</option>
                <option value="regular">{language === 'ar' ? 'عادي فقط' : 'Regular Only'}</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {language === 'ar' ? 'مستوى الولاء' : 'Loyalty Level'}
              </label>
              <select
                value={loyaltyFilter}
                onChange={(e) => setLoyaltyFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              >
                <option value="">{language === 'ar' ? 'جميع المستويات' : 'All Levels'}</option>
                <option value="bronze">{language === 'ar' ? 'برونزي' : 'Bronze'}</option>
                <option value="silver">{language === 'ar' ? 'فضي' : 'Silver'}</option>
                <option value="gold">{language === 'ar' ? 'ذهبي' : 'Gold'}</option>
                <option value="platinum">{language === 'ar' ? 'بلاتيني' : 'Platinum'}</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {language === 'ar' ? 'الجنس' : 'Gender'}
              </label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              >
                <option value="">{language === 'ar' ? 'جميع الأجناس' : 'All Genders'}</option>
                <option value="male">{language === 'ar' ? 'ذكر' : 'Male'}</option>
                <option value="female">{language === 'ar' ? 'أنثى' : 'Female'}</option>
              </select>
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
                <option value="name-asc">{language === 'ar' ? 'الاسم (أ-ي)' : 'Name (A-Z)'}</option>
                <option value="name-desc">{language === 'ar' ? 'الاسم (ي-أ)' : 'Name (Z-A)'}</option>
                <option value="lastStay-desc">{language === 'ar' ? 'آخر إقامة (الأحدث)' : 'Last Stay (Newest)'}</option>
                <option value="lastStay-asc">{language === 'ar' ? 'آخر إقامة (الأقدم)' : 'Last Stay (Oldest)'}</option>
                <option value="totalStays-desc">{language === 'ar' ? 'عدد الإقامات (الأكثر)' : 'Total Stays (Most)'}</option>
                <option value="totalSpent-desc">{language === 'ar' ? 'إجمالي الإنفاق (الأعلى)' : 'Total Spent (Highest)'}</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Guests Table/Cards */}
        <div className="backdrop-blur-sm bg-white/50 border border-white/30 rounded-2xl p-6 shadow-lg">
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'معلومات الاتصال' : 'Contact Info'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'الجنسية' : 'Nationality'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'التصنيف' : 'Classification'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'برنامج الولاء' : 'Loyalty Program'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'الإحصائيات' : 'Statistics'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'آخر إقامة' : 'Last Stay'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {language === 'ar' ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {paginatedGuests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        {language === 'ar' ? 'لا توجد نزلاء' : 'No guests found'}
                      </td>
                    </tr>
                  ) : (
                    paginatedGuests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-white/30 transition-all duration-200">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {guest.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{guest.fullName}</span>
                                {guest.vip && (
                                  <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full" title="VIP"></span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">{guest.profileId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div>{guest.email}</div>
                          <div className="text-xs text-gray-500">{guest.telephone}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div>{guest.nationality}</div>
                          <div className="text-xs text-gray-500">{guest.gender === 'male' ? (language === 'ar' ? 'ذكر' : 'Male') : (language === 'ar' ? 'أنثى' : 'Female')}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div>{guest.guestClassification}</div>
                        </td>
                        <td className="px-4 py-3">
                          {guest.loyaltyProgram.member ? (
                            <div>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getLoyaltyColor(guest.loyaltyProgram.level)}`}>
                                {guest.loyaltyProgram.level.charAt(0).toUpperCase() + guest.loyaltyProgram.level.slice(1)}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">{guest.loyaltyProgram.points} pts</div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">{language === 'ar' ? 'غير عضو' : 'Not a member'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div>{guest.totalStays} {language === 'ar' ? 'إقامة' : 'stays'}</div>
                          <div className="text-xs text-gray-500">{guest.totalSpent.toLocaleString()} SAR</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {guest.lastStay}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedGuest(guest);
                                setIsEditing(false);
                                setShowGuestModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              {language === 'ar' ? 'عرض' : 'View'}
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedGuest(guest);
                                setIsEditing(true);
                                setShowGuestModal(true);
                              }}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              {language === 'ar' ? 'تعديل' : 'Edit'}
                            </button>
                            <button 
                              onClick={() => {
                                // View guest bookings
                                console.log('View bookings for guest:', guest.id);
                                alert(`Viewing bookings for ${guest.fullName}`);
                              }}
                              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                            >
                              {language === 'ar' ? 'الحجوزات' : 'Bookings'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedGuests.map((guest) => (
                <div key={guest.id} className="bg-white/70 border border-white/30 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {guest.fullName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-800">{guest.fullName}</h3>
                        {guest.vip && (
                          <span className="w-2 h-2 bg-yellow-400 rounded-full" title="VIP"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{guest.profileId}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div><strong>Email:</strong> {guest.email}</div>
                    <div><strong>Phone:</strong> {guest.telephone}</div>
                    <div><strong>Nationality:</strong> {guest.nationality}</div>
                    <div className="flex items-center space-x-2">
                      <strong>Loyalty:</strong>
                      {guest.loyaltyProgram.member ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLoyaltyColor(guest.loyaltyProgram.level)}`}>
                          {guest.loyaltyProgram.level}
                        </span>
                      ) : (
                        <span className="text-gray-500">Not a member</span>
                      )}
                    </div>
                    <div><strong>Stays:</strong> {guest.totalStays}</div>
                    <div><strong>Spent:</strong> {guest.totalSpent.toLocaleString()} SAR</div>
                    <div><strong>Last Stay:</strong> {guest.lastStay}</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedGuest(guest);
                        setIsEditing(false);
                        setShowGuestModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      {language === 'ar' ? 'عرض' : 'View'}
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedGuest(guest);
                        setIsEditing(true);
                        setShowGuestModal(true);
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
                  ? `عرض ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredAndSortedGuests.length)} من ${filteredAndSortedGuests.length}`
                  : `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredAndSortedGuests.length)} of ${filteredAndSortedGuests.length}`
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
      
      {/* Guest Details Modal */}
      {showGuestModal && selectedGuest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-black">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {isEditing ? (language === 'ar' ? 'تعديل النزيل' : 'Edit Guest') : (language === 'ar' ? 'تفاصيل النزيل' : 'Guest Details')}
                </h2>
                <button
                  onClick={() => setShowGuestModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    {language === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
                  </h3>
                  <div><strong>Name:</strong> {selectedGuest.fullName}</div>
                  <div><strong>Email:</strong> {selectedGuest.email}</div>
                  <div><strong>Classification:</strong> {selectedGuest.guestClassification}</div>
                  <div><strong>Phone:</strong> {selectedGuest.telephone}</div>
                  <div><strong>Nationality:</strong> {selectedGuest.nationality}</div>
                  <div><strong>Gender:</strong> {selectedGuest.gender}</div>
                  <div><strong>Date of Birth:</strong> {selectedGuest.dateOfBirth}</div>
                  <div><strong>Passport:</strong> {selectedGuest.passportNumber}</div>
                </div>
                
                {/* Address & Company */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    {language === 'ar' ? 'العنوان والشركة' : 'Address & Company'}
                  </h3>
                  <div><strong>Address:</strong> {selectedGuest.address}</div>
                  <div><strong>City:</strong> {selectedGuest.city}</div>
                  <div><strong>Country:</strong> {selectedGuest.country}</div>
                  <div><strong>Company:</strong> {selectedGuest.company}</div>
                  <div><strong>Travel Agent:</strong> {selectedGuest.travelAgent}</div>
                </div>
                
                {/* Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    {language === 'ar' ? 'التفضيلات' : 'Preferences'}
                  </h3>
                  <div><strong>Room Type:</strong> {selectedGuest.preferences.roomType}</div>
                  <div><strong>Bed Type:</strong> {selectedGuest.preferences.bedType}</div>
                  <div><strong>Smoking:</strong> {selectedGuest.preferences.smokingPreference}</div>
                  <div><strong>Floor:</strong> {selectedGuest.preferences.floorPreference}</div>
                  <div><strong>Special Requests:</strong> {selectedGuest.preferences.specialRequests.join(', ')}</div>
                </div>
                
                {/* Statistics & Loyalty */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    {language === 'ar' ? 'الإحصائيات والولاء' : 'Statistics & Loyalty'}
                  </h3>
                  <div><strong>VIP Status:</strong> {selectedGuest.vip ? 'Yes' : 'No'}</div>
                  <div><strong>Total Stays:</strong> {selectedGuest.totalStays}</div>
                  <div><strong>Total Spent:</strong> {selectedGuest.totalSpent.toLocaleString()} SAR</div>
                  <div><strong>Last Stay:</strong> {selectedGuest.lastStay}</div>
                  <div><strong>Loyalty Level:</strong> {selectedGuest.loyaltyProgram.level}</div>
                  <div><strong>Loyalty Points:</strong> {selectedGuest.loyaltyProgram.points}</div>
                </div>
              </div>
              
              {/* Emergency Contact */}
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  {language === 'ar' ? 'جهة الاتصال في حالات الطوارئ' : 'Emergency Contact'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><strong>Name:</strong> {selectedGuest.emergencyContact.name}</div>
                  <div><strong>Relationship:</strong> {selectedGuest.emergencyContact.relationship}</div>
                  <div><strong>Phone:</strong> {selectedGuest.emergencyContact.phone}</div>
                </div>
              </div>
              
              {/* Notes */}
              {selectedGuest.notes && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    {language === 'ar' ? 'ملاحظات' : 'Notes'}
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">{selectedGuest.notes}</div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => setShowGuestModal(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    {language === 'ar' ? 'تعديل' : 'Edit'}
                  </button>
                )}
                {isEditing && (
                  <button
                    onClick={() => {
                      // Save logic would go here
                      setIsEditing(false);
                    }}
                    className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                  >
                    {language === 'ar' ? 'حفظ' : 'Save'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
