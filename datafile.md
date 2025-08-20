# Hotel Management System - Data Inputs Documentation

This document provides a comprehensive overview of all data inputs, their purposes, and relationships for each frontend file in the multi-hotel booking management platform.

## Project Overview

This is a **multi-hotel booking management platform** for **internal use only**. The system supports two main roles:
- **Owner**: Full administrative control (hotels, rooms, pricing, staff accounts)
- **Staff**: Booking management (reservations, guest details, room browsing)

---

## 1. Authentication & Layout Files

### `/src/app/page.tsx` - Login Page
**Purpose**: User authentication and language selection

#### Data Inputs:
- `language`: String ('en' | 'ar') - Interface language selection
- `username`: String - User login identifier
- `password`: String - User authentication credential
- `showPassword`: Boolean - Password visibility toggle
- `rememberMe`: Boolean - Session persistence option

#### Data Flow:
- Collects user credentials for authentication
- Supports bilingual interface (English/Arabic)
- Handles login validation and session management

### `/src/app/layout.tsx` - Root Layout
**Purpose**: Global application structure and font configuration

#### Data Inputs:
- Font configurations (Geist Sans, Geist Mono)
- Metadata (title, description)
- Global CSS imports

### `/src/components/LayoutWrapper.tsx` - Layout Container
**Purpose**: Main application layout with sidebar management

#### Data Inputs:
- `sidebarOpen`: Boolean - Sidebar visibility state
- `children`: React.ReactNode - Page content

### `/src/components/Sidebar.tsx` - Navigation Sidebar
**Purpose**: Application navigation menu

#### Data Inputs:
- `isOpen`: Boolean - Sidebar visibility state
- `pathname`: String - Current route for active menu highlighting
- Menu items configuration with icons and routes

---

## 2. Owner Management Files (Admin Dashboard)

### `/src/app/(owner)/addhotel/page.tsx` - Hotel Management
**Purpose**: CRUD operations for hotel entities

#### Data Inputs:

##### Hotel Creation Form:
- `hotelName`: String - Primary hotel name (required)
- `hotelCode`: String - Unique hotel identifier (required)
- `altHotelName`: String - Alternative/Arabic hotel name (required)

##### Hotel Search & Filter:
- `nameFilter`: String - Filter hotels by name (supports both primary and alternative names)
- `codeFilter`: String - Filter hotels by code

##### Hotel Management:
- `selectedHotels`: String[] - Array of selected hotel IDs for bulk operations
- `selectedHotelDetails`: Hotel | null - Currently viewed hotel details

##### Hotel Data Structure:
```typescript
interface Hotel {
  id: string;           // Unique identifier
  name: string;         // Primary hotel name
  code: string;         // Hotel code (e.g., 'GPH001')
  altName: string;      // Alternative/Arabic name
  createdAt: string;    // Creation timestamp
}
```

#### Business Logic:
- Validates unique hotel codes
- Supports bilingual hotel names
- Enables bulk hotel operations
- Tracks creation timestamps

### `/src/app/(owner)/addroom/page.tsx` - Room Management
**Purpose**: CRUD operations for room types and pricing

#### Data Inputs:

##### Room Creation Form:
- `hotelId`: String - Associated hotel ID (required)
- `roomType`: String - Room type name (e.g., 'Deluxe Suite')
- `roomTypeDescription`: String - English room description
- `altDescription`: String - Arabic room description
- `price`: String - Base room price (converted to number)
- `quantity`: String - Number of available rooms (default: '1')
- `boardType`: 'Room only' | 'Bed & breakfast' | 'Half board' | 'Full board' - Meal plan

##### Pricing Management:
- `hasAlternativePrice`: Boolean - Enable seasonal/alternative pricing
- `alternativePrice`: String - Alternative price value

##### Room Search & Filter:
- `nameFilter`: String - Filter by room type or hotel name
- `typeFilter`: String - Filter by board type or room type

##### Room Management:
- `selectedRooms`: String[] - Selected room IDs for bulk operations
- `selectedRoomDetails`: Room | null - Currently viewed room details

##### Room Data Structure:
```typescript
interface Room {
  id: string;                    // Unique identifier
  hotelId: string;              // Associated hotel ID
  hotelName: string;            // Hotel name (for display)
  roomType: string;             // Room type name
  roomTypeDescription: string;   // English description
  altDescription: string;        // Arabic description
  price: number;                // Base price
  quantity: number;             // Available quantity
  boardType: BoardType;         // Meal plan type
  seasonalPrices?: SeasonalPrice[]; // Optional seasonal pricing
  createdAt: string;            // Creation timestamp
}

interface SeasonalPrice {
  startDate: string;
  endDate: string;
  price: number;
}
```

#### Business Logic:
- Links rooms to specific hotels
- Supports multiple board types (meal plans)
- Enables seasonal pricing strategies
- Bilingual room descriptions
- Quantity-based availability management

---

## 3. Staff Management Files (Booking Dashboard)

### `/src/app/booking/page.tsx` - Reservation Creation
**Purpose**: Multi-step booking process for staff to create reservations

#### Data Inputs:

##### Step 1: Room Selection
- `selectedHotelId`: String - Chosen hotel ID
- `selectedRoomId`: String - Chosen room ID
- `numberOfRooms`: Number - Quantity of rooms to book
- `arrivalDate`: String - Check-in date (YYYY-MM-DD)
- `departureDate`: String - Check-out date (YYYY-MM-DD)
- `numberOfNights`: Number - Calculated stay duration

##### Step 2: Guest Information
- `guestData`: Guest object with comprehensive guest details

##### Step 3: Payment Information
- `paymentData`: Payment object with payment details

##### Guest Data Structure:
```typescript
interface Guest {
  fullName: string;              // Complete guest name
  email: string;                 // Contact email
  guestClassification: string;   // Guest category (e.g., 'Saudi Citizen')
  travelAgent: string;           // Associated travel agency
  company: string;               // Guest's company
  source: string;                // Booking source (e.g., 'Online Booking')
  group: string;                 // Guest group classification
  arrival: string;               // Arrival date
  departure: string;             // Departure date
  vip: boolean;                  // VIP status
  nationality: string;           // Guest nationality
  telephone: string;             // Contact phone
  roomNo: string;                // Assigned room number
  rateCode: string;              // Rate classification code
  roomRate: number;              // Applied room rate
  payment: string;               // Payment method
  resId: string;                 // Reservation ID
  profileId: string;             // Guest profile ID
}
```

##### Payment Data Structure:
```typescript
interface Payment {
  method: 'cash' | 'credit' | 'visa';  // Payment method
  amount: number;                       // Total amount
  date: string;                         // Payment date
  startDate?: string;                   // Payment start date
  completionDate?: string;              // Payment completion date
  amountPaidToday?: number;             // Today's payment amount
  remainingBalance?: number;            // Outstanding balance
}
```

##### Booking Data Structure:
```typescript
interface Booking {
  id: string;                           // Unique booking ID
  resId: string;                        // Reservation ID
  guest: Guest;                         // Guest information
  room: Room;                           // Room details
  numberOfRooms: number;                // Quantity booked
  payment: Payment;                     // Payment information
  status: 'pending' | 'confirmed' | 'checked-in' | 'cancelled'; // Booking status
  createdAt: string;                    // Creation timestamp
}
```

#### Business Logic:
- Multi-step booking workflow
- Room availability validation
- Guest profile management
- Payment tracking and balance calculation
- Reservation ID generation
- Status lifecycle management

### `/src/app/guests/page.tsx` - Guest Management
**Purpose**: Comprehensive guest profile management and history tracking

#### Data Inputs:

##### Guest Search & Filtering:
- `searchQuery`: String - General search across guest data
- `nationalityFilter`: String - Filter by nationality
- `vipFilter`: String - Filter by VIP status
- `loyaltyFilter`: String - Filter by loyalty program level
- `genderFilter`: String - Filter by gender

##### View Management:
- `viewMode`: 'table' | 'cards' - Display format
- `sortBy`: 'name' | 'lastStay' | 'totalStays' | 'totalSpent' - Sort criteria
- `sortOrder`: 'asc' | 'desc' - Sort direction
- `currentPage`: Number - Pagination state
- `itemsPerPage`: Number - Items per page (default: 12)

##### Guest Selection:
- `selectedGuests`: String[] - Selected guest IDs for bulk operations
- `selectedGuest`: Guest | null - Currently viewed guest
- `isEditing`: Boolean - Edit mode state

##### Extended Guest Data Structure:
```typescript
interface Guest {
  id: string;                           // Unique guest ID
  fullName: string;                     // Complete name
  firstName: string;                    // First name
  lastName: string;                     // Last name
  email: string;                        // Contact email
  guestClassification: string;          // Guest category
  telephone: string;                    // Phone number
  nationality: string;                  // Nationality
  passportNumber: string;               // Passport/ID number
  dateOfBirth: string;                  // Birth date
  gender: 'male' | 'female';           // Gender
  address: string;                      // Full address
  city: string;                         // City
  country: string;                      // Country
  company: string;                      // Company name
  travelAgent: string;                  // Travel agent
  source: string;                       // Booking source
  group: string;                        // Group classification
  vip: boolean;                         // VIP status
  profileId: string;                    // Profile identifier
  preferences: GuestPreferences;        // Room preferences
  loyaltyProgram: LoyaltyProgram;       // Loyalty program data
  emergencyContact: EmergencyContact;   // Emergency contact info
  createdAt: string;                    // Profile creation date
  lastStay: string;                     // Last stay date
  totalStays: number;                   // Total number of stays
  totalSpent: number;                   // Total amount spent
  notes: string;                        // Additional notes
}

interface GuestPreferences {
  roomType: string;                     // Preferred room type
  bedType: string;                      // Bed preference
  smokingPreference: 'smoking' | 'non-smoking'; // Smoking preference
  floorPreference: string;              // Floor preference
  specialRequests: string[];            // Special requests array
}

interface LoyaltyProgram {
  member: boolean;                      // Membership status
  level: 'bronze' | 'silver' | 'gold' | 'platinum'; // Membership level
  points: number;                       // Loyalty points
}

interface EmergencyContact {
  name: string;                         // Contact name
  relationship: string;                 // Relationship to guest
  phone: string;                        // Contact phone
}
```

#### Business Logic:
- Comprehensive guest profiling
- Preference tracking for personalized service
- Loyalty program integration
- Stay history and spending analytics
- Emergency contact management
- Advanced search and filtering capabilities

### `/src/app/reservations/page.tsx` - Reservation Management
**Purpose**: View, search, and manage all existing reservations

#### Data Inputs:

##### Reservation Filtering:
- `statusFilter`: String - Filter by reservation status
- `hotelFilter`: String - Filter by hotel
- `dateRangeFilter`: {start: string, end: string} - Date range filter
- `searchQuery`: String - General search across reservation data

##### View Management:
- `viewMode`: 'table' | 'cards' - Display format
- `sortBy`: 'date' | 'name' | 'status' | 'amount' - Sort criteria
- `sortOrder`: 'asc' | 'desc' - Sort direction
- `currentPage`: Number - Pagination state
- `itemsPerPage`: Number - Items per page (default: 10)

##### Reservation Selection:
- `selectedBookings`: String[] - Selected booking IDs for bulk operations

##### Reservation Data Structure:
```typescript
interface Booking {
  id: string;                           // Unique booking ID
  resId: string;                        // Reservation ID
  guest: Guest;                         // Guest information
  room: Room;                           // Room details
  payment: Payment;                     // Payment information
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled'; // Status
  createdAt: string;                    // Creation timestamp
}
```

#### Business Logic:
- Comprehensive reservation overview
- Multi-criteria filtering and search
- Status-based reservation management
- Date range analysis
- Bulk reservation operations

---

## 4. Data Relationships and Flow

### Primary Entities:
1. **Hotels** - Core property entities
2. **Rooms** - Belong to hotels, define accommodation types
3. **Guests** - Customer profiles with preferences and history
4. **Bookings/Reservations** - Link guests to rooms with payment info

### Data Flow:
1. **Owner Flow**: Hotel Creation → Room Definition → Pricing Setup
2. **Staff Flow**: Room Search → Guest Selection/Creation → Booking Creation → Payment Processing
3. **Management Flow**: Reservation Monitoring → Guest History → Analytics

### Key Relationships:
- Hotels (1) → Rooms (Many)
- Guests (1) → Bookings (Many)
- Rooms (1) → Bookings (Many)
- Bookings (1) → Payments (1)

### Validation Rules:
- Hotel codes must be unique
- Room availability must be validated before booking
- Guest profiles can be reused across multiple bookings
- Payment amounts must match booking totals
- Date ranges must be logical (arrival < departure)

---

## 5. Technical Implementation Notes

### State Management:
- React useState for local component state
- Form validation on client-side
- Real-time filtering and search

### Data Persistence:
- Currently using JSON files for sample data
- Designed for database integration (Prisma + PostgreSQL)
- Supabase configuration present for cloud database

### Internationalization:
- Bilingual support (English/Arabic)
- Alternative names/descriptions for hotels and rooms
- Language-specific UI elements

### User Experience:
- Multi-step booking process
- Real-time search and filtering
- Bulk operations support
- Responsive design with mobile sidebar

This documentation serves as the foundation for database schema design and API endpoint development.