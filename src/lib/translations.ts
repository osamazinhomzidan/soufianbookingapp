// Translation interface definition
export interface Translations {
  // Login page translations
  login: {
    title: string;
    username: string;
    password: string;
    language: string;
    loginButton: string;
    exitButton: string;
    loggingIn: string;
    usernamePlaceholder: string;
    passwordPlaceholder: string;
    forgotPassword: string;
    rememberMe: string;
  };
  
  // Sidebar translations
  sidebar: {
    logo: string;
    hotelsManagement: string;
    roomsManagement: string;
    createReservation: string;
    allReservations: string;
    allGuests: string;
    logout: string;
    loggingOut: string;
    languageToggle: string;
    english: string;
    arabic: string;
  };
  
  // Common UI elements
  common: {
    loading: string;
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    add: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    refresh: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    reset: string;
    confirm: string;
    yes: string;
    no: string;
    ok: string;
    close: string;
    view: string;
    details: string;
    actions: string;
    status: string;
    date: string;
    time: string;
    total: string;
    amount: string;
    price: string;
    quantity: string;
    available: string;
    unavailable: string;
    active: string;
    inactive: string;
    currency: string;
    reviewAndConfirm: string;
    optional: string;
    clearFilters: string;
    createdDate: string;
  };
  
  // Booking page translations
  booking: {
    title: string;
    createReservation: string;
    guestInformation: string;
    roomSelection: string;
    paymentDetails: string;
    confirmBooking: string;
    guestName: string;
    email: string;
    phone: string;
    nationality: string;
    checkIn: string;
    checkOut: string;
    nights: string;
    adults: string;
    children: string;
    roomType: string;
    boardType: string;
    specialRequests: string;
    totalAmount: string;
    paymentMethod: string;
    bookingConfirmed: string;
    bookingFailed: string;
    selectHotel: string;
    selectRoom: string;
    guestClassification: string;
    travelAgent: string;
    company: string;
    source: string;
    group: string;
    vip: string;
    rateCode: string;
    roomRate: string;
    resId: string;
    profileId: string;
  };
  
  // Reservations page translations
  reservations: {
    title: string;
    allReservations: string;
    reservationId: string;
    guestName: string;
    hotel: string;
    room: string;
    checkIn: string;
    checkOut: string;
    status: string;
    amount: string;
    actions: string;
    viewDetails: string;
    editReservation: string;
    cancelReservation: string;
    checkInGuest: string;
    checkOutGuest: string;
    pending: string;
    confirmed: string;
    checkedIn: string;
    checkedOut: string;
    cancelled: string;
    noShow: string;
    searchReservations: string;
    filterByStatus: string;
    filterByDate: string;
    exportReservations: string;
  };
  
  // Guests page translations
  guests: {
    title: string;
    allGuests: string;
    guestProfile: string;
    personalInfo: string;
    contactInfo: string;
    preferences: string;
    bookingHistory: string;
    loyaltyProgram: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    nationality: string;
    passportNumber: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    city: string;
    country: string;
    company: string;
    totalStays: string;
    totalSpent: string;
    lastStay: string;
    vipStatus: string;
    notes: string;
    emergencyContact: string;
    addGuest: string;
    editGuest: string;
    deleteGuest: string;
    searchGuests: string;
    male: string;
    female: string;
  };
  
  // Hotels page translations (Owner only)
  hotels: {
    title: string;
    hotelManagement: string;
    addHotel: string;
    editHotel: string;
    deleteHotel: string;
    hotelName: string;
    hotelCode: string;
    description: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    rating: string;
    amenities: string;
    rooms: string;
    bookings: string;
    revenue: string;
    occupancyRate: string;
    averageRate: string;
    addNewHotel: string;
    enterHotelDetails: string;
    altHotelName: string;
    hotelAddress: string;
    enterHotelName: string;
    enterHotelCode: string;
    enterAltName: string;
    enterHotelAddress: string;
    hotelsList: string;
    viewManageHotels: string;
    filterByName: string;
    filterByCode: string;
    searchByName: string;
    searchByCode: string;
    deleteSelected: string;
    printSelected: string;
    deleteAll: string;
    printAll: string;
    noHotelsMatch: string;
    noHotelsAdded: string;
    hotelDetails: string;
    createdDate: string;
    print: string;
    hotelDetails: string;
    hotelStats: string;
    manageRooms: string;
    viewBookings: string;
    hotelDescription: string;
    altHotelDescription: string;
    enterHotelDescription: string;
    enterAltHotelDescription: string;
    updateHotelDetails: string;
    updateHotel: string;
    adding: string;
    updating: string;
    clear: string;
    confirmDeleteHotel: string;
    confirmDeleteSelectedHotels: string;
  };
  
  // Rooms page translations (Owner only)
  rooms: {
    title: string;
    roomManagement: string;
    addRoom: string;
    editRoom: string;
    deleteRoom: string;
    roomType: string;
    description: string;
    basePrice: string;
    quantity: string;
    boardType: string;
    size: string;
    capacity: string;
    floor: string;
    amenities: string;
    availability: string;
    seasonalPricing: string;
    roomStatus: string;
    available: string;
    occupied: string;
    maintenance: string;
    outOfOrder: string;
    roomOnly: string;
    bedBreakfast: string;
    halfBoard: string;
    fullBoard: string;
    maxOccupancy: string;
    roomAmenities: string;
    addAmenity: string;
    removeAmenity: string;
    addNewRoom: string;
    hotel: string;
    selectHotel: string;
    roomDescription: string;
    altDescription: string;
    numberOfRooms: string;
    basePricePerNight: string;
    enableAlternativePrice: string;
    alternativePrice: string;
    alternativePricePerNight: string;
    seasonalPricingNote: string;
    viewAddedRooms: string;
    deleteAll: string;
    printAll: string;
    deleteSelected: string;
    printSelected: string;
    noRoomsAdded: string;
    print: string;
    createdDate: string;
    enterRoomType: string;
    detailedRoomDescription: string;
    descriptionOtherLanguage: string;
    roomQuantity: string;
    enterPriceSAR: string;
    enterAlternativePriceSAR: string;
    roomQuantityPlaceholder: string;
    updateRoom: string;
    fillAllFields: string;
    selectValidHotel: string;
    roomUpdatedSuccessfully: string;
    roomAddedSuccessfully: string;
    errorAddingRoom: string;
    roomLoadedForEdit: string;
    errorFetchingRoom: string;
    roomDeletedSuccessfully: string;
    errorDeletingRoom: string;
    noRoomsSelected: string;
    selectedRoomsDeleted: string;
    partialDeleteSuccess: string;
    errorDeletingSelectedRooms: string;
    printingSelectedRooms: string;
    noRoomsToDelete: string;
    allRoomsDeleted: string;
    errorDeletingAllRooms: string;
    allHotels: string;
    allBoardTypes: string;
    priceRange: string;
    minPrice: string;
    maxPrice: string;
    quantityRange: string;
    minQty: string;
    maxQty: string;
    clearFilters: string;
    createdBy: string;
    filterByHotel: string;
    filterByBoardType: string;
  };
  
  // Layout and navigation
  layout: {
    hotelManagement: string;
    dashboard: string;
    menu: string;
    profile: string;
    settings: string;
    help: string;
    about: string;
    version: string;
    copyright: string;
  };
  
  // Error messages
  errors: {
    networkError: string;
    serverError: string;
    validationError: string;
    authenticationError: string;
    authorizationError: string;
    notFound: string;
    somethingWentWrong: string;
    tryAgain: string;
    contactSupport: string;
    invalidCredentials: string;
    sessionExpired: string;
    accessDenied: string;
    requiredField: string;
    invalidEmail: string;
    invalidPhone: string;
    invalidDate: string;
    minLength: string;
    maxLength: string;
  };
  
  // Success messages
  success: {
    loginSuccess: string;
    logoutSuccess: string;
    saveSuccess: string;
    deleteSuccess: string;
    updateSuccess: string;
    createSuccess: string;
    bookingCreated: string;
    bookingUpdated: string;
    bookingCancelled: string;
    guestCheckedIn: string;
    guestCheckedOut: string;
    emailSent: string;
    passwordReset: string;
    profileUpdated: string;
  };
}

// English translations
const en: Translations = {
  login: {
    title: 'Login',
    username: 'Username',
    password: 'Password',
    language: 'Language',
    loginButton: 'Login',
    exitButton: 'Exit',
    loggingIn: 'Logging in...',
    usernamePlaceholder: 'Enter your username',
    passwordPlaceholder: 'Enter your password',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember Me',
  },
  
  sidebar: {
    logo: 'Hotel Management',
    hotelsManagement: 'Hotels Management',
    roomsManagement: 'Rooms Management',
    createReservation: 'Create a Reservation',
    allReservations: 'All Reservations',
    allGuests: 'All Guests',
    logout: 'Logout',
    loggingOut: 'Logging out...',
    languageToggle: 'Switch Language',
    english: 'English',
    arabic: 'العربية',
  },
  
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    reset: 'Reset',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    close: 'Close',
    view: 'View',
    details: 'Details',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    total: 'Total',
    amount: 'Amount',
    price: 'Price',
    quantity: 'Quantity',
    available: 'Available',
    unavailable: 'Unavailable',
    active: 'Active',
    inactive: 'Inactive',
    currency: 'SAR',
    reviewAndConfirm: 'Review and Confirm',
    optional: 'Optional',
    clearFilters: 'Clear Filters',
    createdDate: 'Created Date',
  },
  
  booking: {
    title: 'Create Reservation',
    createReservation: 'Create New Reservation',
    guestInformation: 'Guest Information',
    roomSelection: 'Room Selection',
    paymentDetails: 'Payment Details',
    confirmBooking: 'Confirm Booking',
    guestName: 'Guest Name',
    email: 'Email',
    phone: 'Phone',
    nationality: 'Nationality',
    checkIn: 'Check In',
    checkOut: 'Check Out',
    nights: 'Nights',
    adults: 'Adults',
    children: 'Children',
    roomType: 'Room Type',
    boardType: 'Board Type',
    specialRequests: 'Special Requests',
    totalAmount: 'Total Amount',
    paymentMethod: 'Payment Method',
    bookingConfirmed: 'Booking Confirmed',
    bookingFailed: 'Booking Failed',
    selectHotel: 'Select Hotel',
    selectRoom: 'Select Room',
    guestClassification: 'Guest Classification',
    travelAgent: 'Travel Agent',
    company: 'Company',
    source: 'Source',
    group: 'Group',
    vip: 'VIP',
    rateCode: 'Rate Code',
    roomRate: 'Room Rate',
    resId: 'Reservation ID',
    profileId: 'Profile ID',
    hotel: 'Hotel',
    guestDataEntry: 'Guest Data Entry',
    fullName: 'Full Name',
    enterFullName: 'Enter full name',
    email: 'Email',
    enterEmail: 'Enter email address',
    selectHotelFirst: 'Select hotel first',
    roomsAvailable: 'rooms available',
    notAvailable: 'Not available',
    numberOfRooms: 'Number of Rooms',
    selectRoomTypeFirst: 'Select room type first',
    room: 'room',
    rooms: 'rooms',
    maximumRooms: 'Maximum: {{count}} rooms available',
    arrivalDate: 'Arrival Date',
    departureDate: 'Departure Date',
    numberOfNights: 'Number of Nights',
    night: 'night',
    nights: 'nights',
    alternativePrice: 'Alternative Price',
    enterAlternativePrice: 'Enter alternative price',
    descriptionAmenities: 'Description & Amenities:',
    total: 'Total',
    roomDetails: 'Room Details',
    guestDetails: 'Guest Details',
    paymentBreakdown: 'Payment Breakdown',
    hotelLabel: 'Hotel:',
    roomTypeLabel: 'Room Type:',
    boardTypeLabel: 'Board Type:',
    rateLabel: 'Rate:',
    arrivalLabel: 'Arrival:',
    departureLabel: 'Departure:',
    nightsLabel: 'Nights:',
    numberOfRoomsLabel: 'Number of Rooms:',
    totalLabel: 'Total:',
    nameLabel: 'Name:',
    emailLabel: 'Email:',
    classificationLabel: 'Classification:',
    nationalityLabel: 'Nationality:',
    telephoneLabel: 'Telephone:',
    companyLabel: 'Company:',
    travelAgentLabel: 'Travel Agent:',
    vipLabel: 'VIP:',
    roomNoLabel: 'Room No:',
    methodLabel: 'Method:',
    amountPaidLabel: 'Amount Paid:',
    paymentDateLabel: 'Payment Date:',
    paidTodayLabel: 'Paid Today:',
    remainingLabel: 'Remaining:',
    perNight: '/night',
  },
  
  reservations: {
    title: 'Reservations',
    allReservations: 'All Reservations',
    reservationId: 'Reservation ID',
    guestName: 'Guest Name',
    hotel: 'Hotel',
    room: 'Room',
    checkIn: 'Check In',
    checkOut: 'Check Out',
    status: 'Status',
    amount: 'Amount',
    actions: 'Actions',
    viewDetails: 'View Details',
    editReservation: 'Edit Reservation',
    cancelReservation: 'Cancel Reservation',
    checkInGuest: 'Check In Guest',
    checkOutGuest: 'Check Out Guest',
    pending: 'Pending',
    confirmed: 'Confirmed',
    checkedIn: 'Checked In',
    checkedOut: 'Checked Out',
    cancelled: 'Cancelled',
    noShow: 'No Show',
    searchReservations: 'Search Reservations',
    filterByStatus: 'Filter by Status',
    filterByDate: 'Filter by Date',
    exportReservations: 'Export Reservations',
  },
  
  guests: {
    title: 'Guests',
    allGuests: 'All Guests',
    guestProfile: 'Guest Profile',
    personalInfo: 'Personal Information',
    contactInfo: 'Contact Information',
    preferences: 'Preferences',
    bookingHistory: 'Booking History',
    loyaltyProgram: 'Loyalty Program',
    firstName: 'First Name',
    lastName: 'Last Name',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    nationality: 'Nationality',
    passportNumber: 'Passport Number',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    address: 'Address',
    city: 'City',
    country: 'Country',
    company: 'Company',
    totalStays: 'Total Stays',
    totalSpent: 'Total Spent',
    lastStay: 'Last Stay',
    vipStatus: 'VIP Status',
    notes: 'Notes',
    emergencyContact: 'Emergency Contact',
    addGuest: 'Add Guest',
    editGuest: 'Edit Guest',
    deleteGuest: 'Delete Guest',
    searchGuests: 'Search Guests',
    male: 'Male',
    female: 'Female',
  },
  
  hotels: {
    title: 'Hotels',
    hotelManagement: 'Hotel Management',
    addHotel: 'Add Hotel',
    editHotel: 'Edit Hotel',
    deleteHotel: 'Delete Hotel',
    hotelName: 'Hotel Name',
    hotelCode: 'Hotel Code',
    description: 'Description',
    address: 'Address',
    city: 'City',
    country: 'Country',
    phone: 'Phone',
    email: 'Email',
    rating: 'Rating',
    amenities: 'Amenities',
    rooms: 'Rooms',
    bookings: 'Bookings',
    revenue: 'Revenue',
    occupancyRate: 'Occupancy Rate',
    averageRate: 'Average Rate',
    addNewHotel: 'Add New Hotel',
    enterHotelDetails: 'Enter the details of the new hotel',
    altHotelName: 'Alt Hotel Name',
    hotelAddress: 'Hotel Address',
    enterHotelName: 'Enter hotel name',
    enterHotelCode: 'Enter hotel code',
    enterAltName: 'Enter alternative name',
    enterHotelAddress: 'Enter hotel address',
    hotelsList: 'Hotels List',
    viewManageHotels: 'View and manage added hotels',
    filterByName: 'Filter by Name',
    filterByCode: 'Filter by Code',
    searchByName: 'Search by name...',
    searchByCode: 'Search by code...',
    deleteSelected: 'Delete Selected',
    printSelected: 'Print Selected',
    deleteAll: 'Delete All',
    printAll: 'Print All',
    noHotelsMatch: 'No hotels match your search',
    noHotelsAdded: 'No hotels added yet',
    hotelDetails: 'Hotel Details',
    createdDate: 'Created Date',
    print: 'Print',
    hotelStats: 'Hotel Statistics',
    manageRooms: 'Manage Rooms',
    viewBookings: 'View Bookings',
    hotelDescription: 'Hotel Description',
    altHotelDescription: 'Alt Hotel Description',
    enterHotelDescription: 'Enter hotel description',
    enterAltHotelDescription: 'Enter alternative hotel description',
    updateHotelDetails: 'Update hotel details',
    updateHotel: 'Update Hotel',
    adding: 'Adding...',
    updating: 'Updating...',
    clear: 'Clear',
    confirmDeleteHotel: 'Are you sure you want to delete this hotel?',
    confirmDeleteSelectedHotels: 'Are you sure you want to delete {{count}} selected hotel(s)?',
  },
  
  rooms: {
    title: 'Rooms',
    roomManagement: 'Room Management',
    addRoom: 'Add Room',
    editRoom: 'Edit Room',
    deleteRoom: 'Delete Room',
    roomType: 'Room Type',
    description: 'Description',
    basePrice: 'Base Price',
    quantity: 'Quantity',
    boardType: 'Board Type',
    size: 'Size',
    capacity: 'Capacity',
    floor: 'Floor',
    amenities: 'Amenities',
    availability: 'Availability',
    seasonalPricing: 'Seasonal Pricing',
    roomStatus: 'Room Status',
    available: 'Available',
    occupied: 'Occupied',
    maintenance: 'Maintenance',
    outOfOrder: 'Out of Order',
    roomOnly: 'Room Only',
    bedBreakfast: 'Bed & Breakfast',
    halfBoard: 'Half Board',
    fullBoard: 'Full Board',
    maxOccupancy: 'Max Occupancy',
    roomAmenities: 'Room Amenities',
    addAmenity: 'Add Amenity',
    removeAmenity: 'Remove Amenity',
    addNewRoom: 'Add New Room',
    hotel: 'Hotel',
    selectHotel: 'Select Hotel',
    roomDescription: 'Room Description',
    altDescription: 'Alt Description',
    numberOfRooms: 'Number of Rooms',
    basePricePerNight: 'Base Price',
    enableAlternativePrice: 'Enable Alternative Price',
    alternativePrice: 'Alternative Price',
    alternativePricePerNight: 'Alternative Price',
    seasonalPricingNote: 'Seasonal pricing can be configured later',
    viewAddedRooms: 'View Added Rooms',
    deleteAll: 'Delete All',
    printAll: 'Print All',
    deleteSelected: 'Delete Selected',
    printSelected: 'Print Selected',
    noRoomsAdded: 'No rooms added yet',
    print: 'Print',
    createdDate: 'Created Date',
    enterRoomType: 'Enter room type',
    detailedRoomDescription: 'Detailed room description',
    descriptionOtherLanguage: 'Description in other language',
    roomQuantity: 'Room quantity',
    enterPriceSAR: 'Enter price in SAR',
    enterAlternativePriceSAR: 'Enter alternative price in SAR',
    roomQuantityPlaceholder: 'Enter number of rooms',
    updateRoom: 'Update Room',
    fillAllFields: 'Please fill all required fields',
    selectValidHotel: 'Please select a valid hotel',
    roomUpdatedSuccessfully: 'Room updated successfully',
    roomAddedSuccessfully: 'Room added successfully',
    errorAddingRoom: 'Error adding room',
    roomLoadedForEdit: 'Room loaded for editing',
    errorFetchingRoom: 'Error fetching room data',
    roomDeletedSuccessfully: 'Room deleted successfully',
    errorDeletingRoom: 'Error deleting room',
    noRoomsSelected: 'No rooms selected',
    selectedRoomsDeleted: '{{count}} selected rooms deleted successfully',
    partialDeleteSuccess: '{{success}} rooms deleted, {{failed}} failed to delete',
    errorDeletingSelectedRooms: 'Error deleting selected rooms',
    printingSelectedRooms: 'Printing {{count}} selected rooms',
    noRoomsToDelete: 'No rooms to delete',
    allRoomsDeleted: 'All rooms ({{count}}) deleted successfully',
    errorDeletingAllRooms: 'Error deleting all rooms',
    allHotels: 'All Hotels',
    allBoardTypes: 'All Board Types',
    priceRange: 'Price Range',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    quantityRange: 'Quantity Range',
    minQty: 'Min Qty',
    maxQty: 'Max Qty',
    createdBy: 'Created By',
     filterByHotel: 'Filter by Hotel',
     filterByBoardType: 'Filter by Board Type',
     unknownHotel: 'Unknown Hotel',
    printSelectedRooms: 'Print selected rooms',
    exitDashboard: 'Exit dashboard',
    roomTypePlaceholder: 'Enter room type',
    roomDescriptionPlaceholder: 'Detailed room description',
    altDescriptionPlaceholder: 'Description in other language',
    basePricePlaceholder: 'Enter price in SAR',
    alternativePricePlaceholder: 'Enter alternative price in SAR',
    seasonalPriceNote: 'Seasonal pricing can be configured later for different periods',
    filterByName: 'Filter by Name',
    searchByName: 'Search by name...',
    filterByType: 'Filter by Type',
    searchByType: 'Search by type...',
    noRoomsMatch: 'No rooms match your search',
    roomDetails: 'Room Details',
    price: 'Price',
    enterRoomDescription: 'Detailed room description',
    enterAltDescription: 'Description in other language',
    enterBasePrice: 'Enter price in SAR',
    enterAlternativePrice: 'Enter alternative price in SAR',
    alternativePriceDescription: 'Seasonal pricing can be configured later for different periods',
    searchRoomOrHotel: 'Search by room or hotel name...',
    searchRoomType: 'Search by room type...',
    noMatchingRooms: 'No rooms match your search',
    roomInformation: 'Room Information',
  },
  
  layout: {
    hotelManagement: 'Hotel Management',
    dashboard: 'Dashboard',
    menu: 'Menu',
    profile: 'Profile',
    settings: 'Settings',
    help: 'Help',
    about: 'About',
    version: 'Version',
    copyright: '© 2024 Hotel Management System',
  },
  
  errors: {
    networkError: 'Network error. Please check your connection.',
    serverError: 'Server error. Please try again later.',
    validationError: 'Please check your input and try again.',
    authenticationError: 'Authentication failed. Please login again.',
    authorizationError: 'You do not have permission to perform this action.',
    notFound: 'The requested resource was not found.',
    somethingWentWrong: 'Something went wrong. Please try again.',
    tryAgain: 'Please try again.',
    contactSupport: 'Please contact support if the problem persists.',
    invalidCredentials: 'Invalid username or password.',
    sessionExpired: 'Your session has expired. Please login again.',
    accessDenied: 'Access denied.',
    requiredField: 'This field is required.',
    invalidEmail: 'Please enter a valid email address.',
    invalidPhone: 'Please enter a valid phone number.',
    invalidDate: 'Please enter a valid date.',
    minLength: 'Minimum length required.',
    maxLength: 'Maximum length exceeded.',
  },
  
  success: {
    loginSuccess: 'Login successful!',
    logoutSuccess: 'Logout successful!',
    saveSuccess: 'Saved successfully!',
    deleteSuccess: 'Deleted successfully!',
    updateSuccess: 'Updated successfully!',
    createSuccess: 'Created successfully!',
    bookingCreated: 'Booking created successfully!',
    bookingUpdated: 'Booking updated successfully!',
    bookingCancelled: 'Booking cancelled successfully!',
    guestCheckedIn: 'Guest checked in successfully!',
    guestCheckedOut: 'Guest checked out successfully!',
    emailSent: 'Email sent successfully!',
    passwordReset: 'Password reset successfully!',
    profileUpdated: 'Profile updated successfully!',
  },
};

// Arabic translations
const ar: Translations = {
  login: {
    title: 'تسجيل الدخول',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    language: 'اللغة',
    loginButton: 'تسجيل الدخول',
    exitButton: 'خروج',
    loggingIn: 'جاري تسجيل الدخول...',
    usernamePlaceholder: 'أدخل اسم المستخدم',
    passwordPlaceholder: 'أدخل كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    rememberMe: 'تذكرني',
  },
  
  sidebar: {
    logo: 'إدارة الفنادق',
    hotelsManagement: 'إدارة الفنادق',
    roomsManagement: 'إدارة الغرف',
    createReservation: 'إنشاء حجز',
    allReservations: 'جميع الحجوزات',
    allGuests: 'جميع النزلاء',
    logout: 'تسجيل الخروج',
    loggingOut: 'جاري تسجيل الخروج...',
    languageToggle: 'تغيير اللغة',
    english: 'English',
    arabic: 'العربية',
  },
  
  common: {
    loading: 'جاري التحميل...',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    add: 'إضافة',
    search: 'بحث',
    filter: 'تصفية',
    export: 'تصدير',
    import: 'استيراد',
    refresh: 'تحديث',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    submit: 'إرسال',
    reset: 'إعادة تعيين',
    confirm: 'تأكيد',
    yes: 'نعم',
    no: 'لا',
    ok: 'موافق',
    close: 'إغلاق',
    view: 'عرض',
    details: 'التفاصيل',
    actions: 'الإجراءات',
    status: 'الحالة',
    date: 'التاريخ',
    time: 'الوقت',
    total: 'المجموع',
    amount: 'المبلغ',
    price: 'السعر',
    quantity: 'الكمية',
    available: 'متاح',
    unavailable: 'غير متاح',
    active: 'نشط',
    inactive: 'غير نشط',
    currency: 'ر.س',
    reviewAndConfirm: 'مراجعة وتأكيد',
    optional: 'اختياري',
    clearFilters: 'مسح المرشحات',
    createdDate: 'تاريخ الإنشاء',
  },
  
  booking: {
    title: 'إنشاء حجز',
    createReservation: 'إنشاء حجز جديد',
    guestInformation: 'معلومات النزيل',
    roomSelection: 'اختيار الغرفة',
    paymentDetails: 'تفاصيل الدفع',
    confirmBooking: 'تأكيد الحجز',
    guestName: 'اسم النزيل',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    nationality: 'الجنسية',
    checkIn: 'تاريخ الوصول',
    checkOut: 'تاريخ المغادرة',
    nights: 'الليالي',
    adults: 'البالغون',
    children: 'الأطفال',
    roomType: 'نوع الغرفة',
    boardType: 'نوع الإقامة',
    specialRequests: 'طلبات خاصة',
    totalAmount: 'المبلغ الإجمالي',
    paymentMethod: 'طريقة الدفع',
    bookingConfirmed: 'تم تأكيد الحجز',
    bookingFailed: 'فشل في الحجز',
    selectHotel: 'اختر الفندق',
    selectRoom: 'اختر الغرفة',
    guestClassification: 'تصنيف النزيل',
    travelAgent: 'وكيل السفر',
    company: 'الشركة',
    source: 'المصدر',
    group: 'المجموعة',
    vip: 'شخصية مهمة',
    rateCode: 'رمز التعرفة',
    roomRate: 'سعر الغرفة',
    resId: 'رقم الحجز',
    profileId: 'رقم الملف الشخصي',
    hotel: 'الفندق',
    guestDataEntry: 'بيانات النزيل',
    fullName: 'الاسم الكامل',
    enterFullName: 'أدخل الاسم الكامل',
    email: 'البريد الإلكتروني',
    enterEmail: 'أدخل البريد الإلكتروني',
    selectHotelFirst: 'اختر الفندق أولاً',
    roomsAvailable: 'غرف متاحة',
    notAvailable: 'غير متاح',
    numberOfRooms: 'عدد الغرف',
    selectRoomTypeFirst: 'اختر نوع الغرفة أولاً',
    room: 'غرفة',
    rooms: 'غرف',
    maximumRooms: 'الحد الأقصى: {{count}} غرف متاحة',
    arrivalDate: 'تاريخ الوصول',
    departureDate: 'تاريخ المغادرة',
    numberOfNights: 'عدد الليالي',
    night: 'ليلة',
    nights: 'ليالي',
    alternativePrice: 'السعر البديل',
    enterAlternativePrice: 'أدخل السعر البديل',
    descriptionAmenities: 'الوصف والخدمات:',
    total: 'الإجمالي',
    roomDetails: 'تفاصيل الغرفة',
    guestDetails: 'بيانات النزيل',
    paymentBreakdown: 'تفاصيل الدفع',
    hotelLabel: 'الفندق:',
    roomTypeLabel: 'نوع الغرفة:',
    boardTypeLabel: 'نوع الإقامة:',
    rateLabel: 'السعر:',
    arrivalLabel: 'الوصول:',
    departureLabel: 'المغادرة:',
    nightsLabel: 'الليالي:',
    numberOfRoomsLabel: 'عدد الغرف:',
    totalLabel: 'الإجمالي:',
    nameLabel: 'الاسم:',
    emailLabel: 'البريد الإلكتروني:',
    classificationLabel: 'التصنيف:',
    nationalityLabel: 'الجنسية:',
    telephoneLabel: 'الهاتف:',
    companyLabel: 'الشركة:',
    travelAgentLabel: 'وكيل السفر:',
    vipLabel: 'شخصية مهمة:',
    roomNoLabel: 'رقم الغرفة:',
    methodLabel: 'الطريقة:',
    amountPaidLabel: 'المبلغ المدفوع:',
    paymentDateLabel: 'تاريخ الدفع:',
    paidTodayLabel: 'المدفوع اليوم:',
    remainingLabel: 'المتبقي:',
    perNight: '/ليلة',
  },
  
  reservations: {
    title: 'الحجوزات',
    allReservations: 'جميع الحجوزات',
    reservationId: 'رقم الحجز',
    guestName: 'اسم النزيل',
    hotel: 'الفندق',
    room: 'الغرفة',
    checkIn: 'تاريخ الوصول',
    checkOut: 'تاريخ المغادرة',
    status: 'الحالة',
    amount: 'المبلغ',
    actions: 'الإجراءات',
    viewDetails: 'عرض التفاصيل',
    editReservation: 'تعديل الحجز',
    cancelReservation: 'إلغاء الحجز',
    checkInGuest: 'تسجيل وصول النزيل',
    checkOutGuest: 'تسجيل مغادرة النزيل',
    pending: 'في الانتظار',
    confirmed: 'مؤكد',
    checkedIn: 'وصل',
    checkedOut: 'غادر',
    cancelled: 'ملغي',
    noShow: 'لم يحضر',
    searchReservations: 'البحث في الحجوزات',
    filterByStatus: 'تصفية حسب الحالة',
    filterByDate: 'تصفية حسب التاريخ',
    exportReservations: 'تصدير الحجوزات',
  },
  
  guests: {
    title: 'النزلاء',
    allGuests: 'جميع النزلاء',
    guestProfile: 'ملف النزيل',
    personalInfo: 'المعلومات الشخصية',
    contactInfo: 'معلومات الاتصال',
    preferences: 'التفضيلات',
    bookingHistory: 'تاريخ الحجوزات',
    loyaltyProgram: 'برنامج الولاء',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    nationality: 'الجنسية',
    passportNumber: 'رقم جواز السفر',
    dateOfBirth: 'تاريخ الميلاد',
    gender: 'الجنس',
    address: 'العنوان',
    city: 'المدينة',
    country: 'البلد',
    company: 'الشركة',
    totalStays: 'إجمالي الإقامات',
    totalSpent: 'إجمالي المبلغ المنفق',
    lastStay: 'آخر إقامة',
    vipStatus: 'حالة الشخصية المهمة',
    notes: 'ملاحظات',
    emergencyContact: 'جهة الاتصال في حالات الطوارئ',
    addGuest: 'إضافة نزيل',
    editGuest: 'تعديل النزيل',
    deleteGuest: 'حذف النزيل',
    searchGuests: 'البحث في النزلاء',
    male: 'ذكر',
    female: 'أنثى',
  },
  
  hotels: {
    title: 'الفنادق',
    hotelManagement: 'إدارة الفنادق',
    addHotel: 'إضافة فندق',
    editHotel: 'تعديل الفندق',
    deleteHotel: 'حذف الفندق',
    hotelName: 'اسم الفندق',
    hotelCode: 'رمز الفندق',
    description: 'الوصف',
    address: 'العنوان',
    city: 'المدينة',
    country: 'البلد',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    rating: 'التقييم',
    amenities: 'المرافق',
    rooms: 'الغرف',
    bookings: 'الحجوزات',
    revenue: 'الإيرادات',
    occupancyRate: 'معدل الإشغال',
    averageRate: 'المعدل المتوسط',
    addNewHotel: 'إضافة فندق جديد',
    enterHotelDetails: 'أدخل تفاصيل الفندق الجديد',
    altHotelName: 'الاسم البديل للفندق',
    hotelAddress: 'عنوان الفندق',
    enterHotelName: 'أدخل اسم الفندق',
    enterHotelCode: 'أدخل رمز الفندق',
    enterAltName: 'أدخل الاسم البديل',
    enterHotelAddress: 'أدخل عنوان الفندق',
    hotelsList: 'قائمة الفنادق',
    viewManageHotels: 'عرض وإدارة الفنادق المضافة',
    filterByName: 'تصفية بالاسم',
    filterByCode: 'تصفية بالرمز',
    searchByName: 'البحث بالاسم...',
    searchByCode: 'البحث بالرمز...',
    deleteSelected: 'حذف المحدد',
    printSelected: 'طباعة المحدد',
    deleteAll: 'حذف الكل',
    printAll: 'طباعة الكل',
    noHotelsMatch: 'لا توجد فنادق تطابق البحث',
    noHotelsAdded: 'لم يتم إضافة فنادق بعد',
    hotelDetails: 'تفاصيل الفندق',
    createdDate: 'تاريخ الإنشاء',
    print: 'طباعة',
    hotelStats: 'إحصائيات الفندق',
    manageRooms: 'إدارة الغرف',
    viewBookings: 'عرض الحجوزات',
    hotelDescription: 'وصف الفندق',
    altHotelDescription: 'الوصف البديل للفندق',
    enterHotelDescription: 'أدخل وصف الفندق',
    enterAltHotelDescription: 'أدخل الوصف البديل للفندق',
    updateHotelDetails: 'تحديث تفاصيل الفندق',
    updateHotel: 'تحديث الفندق',
    adding: 'جاري الإضافة...',
    updating: 'جاري التحديث...',
    clear: 'مسح',
    confirmDeleteHotel: 'هل أنت متأكد من حذف هذا الفندق؟',
    confirmDeleteSelectedHotels: 'هل أنت متأكد من حذف {{count}} فندق محدد؟',
  },
  
  rooms: {
    title: 'الغرف',
    roomManagement: 'إدارة الغرف',
    addRoom: 'إضافة غرفة',
    editRoom: 'تعديل الغرفة',
    deleteRoom: 'حذف الغرفة',
    roomType: 'نوع الغرفة',
    description: 'الوصف',
    basePrice: 'السعر الأساسي',
    quantity: 'الكمية',
    boardType: 'نوع الإقامة',
    size: 'الحجم',
    capacity: 'السعة',
    floor: 'الطابق',
    amenities: 'المرافق',
    availability: 'التوفر',
    seasonalPricing: 'التسعير الموسمي',
    roomStatus: 'حالة الغرفة',
    available: 'متاحة',
    occupied: 'مشغولة',
    maintenance: 'صيانة',
    outOfOrder: 'خارج الخدمة',
    roomOnly: 'الغرفة فقط',
    bedBreakfast: 'إفطار',
    halfBoard: 'نصف إقامة',
    fullBoard: 'إقامة كاملة',
    maxOccupancy: 'الحد الأقصى للإشغال',
    roomAmenities: 'مرافق الغرفة',
    addAmenity: 'إضافة مرفق',
    removeAmenity: 'إزالة مرفق',
    addNewRoom: 'إضافة غرفة جديدة',
    hotel: 'الفندق',
    selectHotel: 'اختر الفندق',
    roomDescription: 'وصف الغرفة',
    altDescription: 'الوصف البديل',
    numberOfRooms: 'عدد الغرف',
    basePricePerNight: 'السعر الأساسي',
    enableAlternativePrice: 'تفعيل السعر البديل',
    alternativePrice: 'السعر البديل',
    alternativePricePerNight: 'السعر البديل',
    seasonalPricingNote: 'يمكن تكوين التسعير الموسمي لاحقاً',
    viewAddedRooms: 'عرض الغرف المضافة',
    deleteAll: 'حذف الكل',
    printAll: 'طباعة الكل',
    deleteSelected: 'حذف المحدد',
    printSelected: 'طباعة المحدد',
    noRoomsAdded: 'لم يتم إضافة غرف بعد',
    print: 'طباعة',
    createdDate: 'تاريخ الإنشاء',
    enterRoomType: 'أدخل نوع الغرفة',
    detailedRoomDescription: 'وصف مفصل للغرفة',
    descriptionOtherLanguage: 'الوصف بلغة أخرى',
    roomQuantity: 'كمية الغرف',
    enterPriceSAR: 'أدخل السعر بالريال السعودي',
    enterAlternativePriceSAR: 'أدخل السعر البديل بالريال السعودي',
    roomQuantityPlaceholder: 'أدخل عدد الغرف',
    updateRoom: 'تحديث الغرفة',
    fillAllFields: 'يرجى ملء جميع الحقول المطلوبة',
    selectValidHotel: 'يرجى اختيار فندق صحيح',
    roomUpdatedSuccessfully: 'تم تحديث الغرفة بنجاح',
    roomAddedSuccessfully: 'تم إضافة الغرفة بنجاح',
    errorAddingRoom: 'خطأ في إضافة الغرفة',
    roomLoadedForEdit: 'تم تحميل الغرفة للتعديل',
    errorFetchingRoom: 'خطأ في جلب بيانات الغرفة',
    roomDeletedSuccessfully: 'تم حذف الغرفة بنجاح',
    errorDeletingRoom: 'خطأ في حذف الغرفة',
    noRoomsSelected: 'لم يتم تحديد أي غرف',
    selectedRoomsDeleted: 'تم حذف {{count}} غرفة محددة بنجاح',
    partialDeleteSuccess: 'تم حذف {{success}} غرفة، فشل في حذف {{failed}} غرفة',
    errorDeletingSelectedRooms: 'خطأ في حذف الغرف المحددة',
    printingSelectedRooms: 'جاري طباعة {{count}} غرفة محددة',
    noRoomsToDelete: 'لا توجد غرف للحذف',
    allRoomsDeleted: 'تم حذف جميع الغرف ({{count}}) بنجاح',
    errorDeletingAllRooms: 'خطأ في حذف جميع الغرف',
    allHotels: 'جميع الفنادق',
    allBoardTypes: 'جميع أنواع الإقامة',
    priceRange: 'نطاق السعر',
    minPrice: 'أقل سعر',
    maxPrice: 'أعلى سعر',
    quantityRange: 'نطاق الكمية',
    minQty: 'أقل كمية',
    maxQty: 'أعلى كمية',
    createdBy: 'أنشئ بواسطة',
    filterByHotel: 'تصفية بالفندق',
    filterByBoardType: 'تصفية بنوع الإقامة',
    unknownHotel: 'فندق غير معروف',
    printSelectedRooms: 'طباعة الغرف المحددة',
    exitDashboard: 'الخروج من لوحة التحكم',
    roomTypePlaceholder: 'أدخل نوع الغرفة',
    roomDescriptionPlaceholder: 'وصف مفصل للغرفة',
    altDescriptionPlaceholder: 'الوصف بلغة أخرى',
    basePricePlaceholder: 'أدخل السعر بالريال السعودي',
    alternativePricePlaceholder: 'أدخل السعر البديل بالريال السعودي',
    seasonalPriceNote: 'يمكن تكوين التسعير الموسمي لاحقاً لفترات مختلفة',
    filterByName: 'تصفية بالاسم',
    searchByName: 'البحث بالاسم...',
    filterByType: 'تصفية بالنوع',
    searchByType: 'البحث بالنوع...',
    noRoomsMatch: 'لا توجد غرف تطابق البحث',
    roomDetails: 'تفاصيل الغرفة',
    price: 'السعر',
    enterRoomDescription: 'وصف مفصل للغرفة',
    enterAltDescription: 'الوصف بلغة أخرى',
    enterBasePrice: 'أدخل السعر بالريال السعودي',
    enterAlternativePrice: 'أدخل السعر البديل بالريال السعودي',
    alternativePriceDescription: 'يمكن تكوين التسعير الموسمي لاحقاً لفترات مختلفة',
    searchRoomOrHotel: 'البحث بالغرفة أو اسم الفندق...',
    searchRoomType: 'البحث بنوع الغرفة...',
    noMatchingRooms: 'لا توجد غرف تطابق البحث',
    roomInformation: 'معلومات الغرفة',
  },
  
  layout: {
    hotelManagement: 'إدارة الفنادق',
    dashboard: 'لوحة التحكم',
    menu: 'القائمة',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    help: 'المساعدة',
    about: 'حول',
    version: 'الإصدار',
    copyright: '© 2024 نظام إدارة الفنادق',
  },
  
  errors: {
    networkError: 'خطأ في الشبكة. يرجى التحقق من الاتصال.',
    serverError: 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.',
    validationError: 'يرجى التحقق من المدخلات والمحاولة مرة أخرى.',
    authenticationError: 'فشل في المصادقة. يرجى تسجيل الدخول مرة أخرى.',
    authorizationError: 'ليس لديك صلاحية لتنفيذ هذا الإجراء.',
    notFound: 'المورد المطلوب غير موجود.',
    somethingWentWrong: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    tryAgain: 'يرجى المحاولة مرة أخرى.',
    contactSupport: 'يرجى الاتصال بالدعم الفني إذا استمرت المشكلة.',
    invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
    sessionExpired: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
    accessDenied: 'تم رفض الوصول.',
    requiredField: 'هذا الحقل مطلوب.',
    invalidEmail: 'يرجى إدخال عنوان بريد إلكتروني صحيح.',
    invalidPhone: 'يرجى إدخال رقم هاتف صحيح.',
    invalidDate: 'يرجى إدخال تاريخ صحيح.',
    minLength: 'الحد الأدنى للطول مطلوب.',
    maxLength: 'تم تجاوز الحد الأقصى للطول.',
  },
  
  success: {
    loginSuccess: 'تم تسجيل الدخول بنجاح!',
    logoutSuccess: 'تم تسجيل الخروج بنجاح!',
    saveSuccess: 'تم الحفظ بنجاح!',
    deleteSuccess: 'تم الحذف بنجاح!',
    updateSuccess: 'تم التحديث بنجاح!',
    createSuccess: 'تم الإنشاء بنجاح!',
    bookingCreated: 'تم إنشاء الحجز بنجاح!',
    bookingUpdated: 'تم تحديث الحجز بنجاح!',
    bookingCancelled: 'تم إلغاء الحجز بنجاح!',
    guestCheckedIn: 'تم تسجيل وصول النزيل بنجاح!',
    guestCheckedOut: 'تم تسجيل مغادرة النزيل بنجاح!',
    emailSent: 'تم إرسال البريد الإلكتروني بنجاح!',
    passwordReset: 'تم إعادة تعيين كلمة المرور بنجاح!',
    profileUpdated: 'تم تحديث الملف الشخصي بنجاح!',
  },
};

// Export translations object
export const translations = {
  en,
  ar,
};

// Export default
export default translations;