# Room Feedback Implementation Plan

## Project Overview
This document outlines the comprehensive implementation plan for enhancing the room management system with new features including availability tracking, enhanced pricing structure, multiple room management, and advanced filtering capabilities.

## Current System Analysis

### Database Schema (Current State)
- **Room Model**: Contains basic fields like `basePrice`, `alternativePrice`, `quantity`, `boardType`
- **Hotel Model**: Basic hotel information with relationships
- **AvailabilitySlot Model**: Exists but needs enhancement for date-based filtering
- **User Model**: Authentication and role management

### API Endpoints (Current State)
- `GET /api/rooms` - Fetch rooms with basic filtering
- `POST /api/rooms` - Create single room
- `GET /api/rooms/[id]` - Get specific room
- `PUT /api/rooms/[id]` - Update room
- `DELETE /api/rooms/[id]` - Delete room

### Frontend (Current State)
- Basic room creation form
- Simple filtering by name, type, hotel, board type
- Price and quantity filtering
- Single room management

## Implementation Steps

### Step 1: Database Schema Updates ✅ PENDING
**File**: `prisma/schema.prisma`

#### 1.1 Add New Fields to Room Model
```prisma
model Room {
  // ... existing fields ...
  
  // New Pricing Structure
  purchasePrice       Decimal   @db.Decimal(10, 2) // سعر الشراء
  basePrice          Decimal   @db.Decimal(10, 2) // السعر الأساسي (سعر البيع)
  alternativePrice   Decimal?  @db.Decimal(10, 2) // السعر البديل
  
  // Availability Tracking
  availableFrom      DateTime? @db.Date // Available from date
  availableTo        DateTime? @db.Date // Available to date
  
  // ... rest of existing fields ...
}
```

#### 1.2 Enhance AvailabilitySlot Model (if needed)
- Review current AvailabilitySlot model
- Add any missing fields for date-based filtering

**Validation Steps**:
- [ ] Run `npx prisma db push` to apply changes
- [ ] Verify no database errors
- [ ] Check all relationships are maintained
- [ ] Ensure backward compatibility

---

### Step 2: API Endpoints Enhancement ✅ PENDING
**Files**: 
- `src/app/api/rooms/route.ts`
- `src/app/api/rooms/[id]/route.ts`

#### 2.1 Update GET /api/rooms
**Enhancements**:
- Add filtering by `purchasePrice` range
- Add filtering by `availableFrom` and `availableTo` dates
- Add support for date-based availability checking
- Enhance search to include new fields

**New Query Parameters**:
- `minPurchasePrice` - Minimum purchase price filter
- `maxPurchasePrice` - Maximum purchase price filter
- `minSellingPrice` - Minimum selling price (basePrice) filter
- `maxSellingPrice` - Maximum selling price (basePrice) filter
- `availableFrom` - Filter rooms available from date
- `availableTo` - Filter rooms available to date
- `checkAvailability` - Boolean to check current availability

#### 2.2 Update POST /api/rooms
**Enhancements**:
- Support for multiple room creation in single request
- Validate new pricing structure fields
- Handle availability date validation
- Implement bulk room creation logic

**New Request Body Structure**:
```typescript
{
  hotelId: string;
  rooms: {
    roomType: string;
    roomTypeDescription: string;
    altDescription?: string;
    purchasePrice: number;
    basePrice: number;
    alternativePrice?: number;
    quantity: number;
    boardType: string;
    availableFrom?: string;
    availableTo?: string;
    // ... other fields
  }[];
}
```

#### 2.3 Update PUT /api/rooms/[id]
**Enhancements**:
- Support updating new pricing fields
- Validate availability date ranges
- Handle price validation logic

#### 2.4 Add Bulk Operations Support
**New Endpoint**: `POST /api/rooms/bulk`
- Create multiple rooms for same hotel
- Validate all rooms before creation
- Rollback on any failure

**Validation Steps**:
- [ ] Test all CRUD operations
- [ ] Verify new filtering works correctly
- [ ] Test bulk room creation
- [ ] Validate error handling
- [ ] Check authentication and authorization

---

### Step 3: Frontend Implementation ✅ PENDING
**File**: `src/app/(owner)/room/page.tsx`

#### 3.1 Enhanced Form Structure
**New Form Fields**:
- Purchase Price (سعر الشراء) - Required number input
- Base Price (السعر الأساسي - سعر البيع) - Required number input  
- Alternative Price (السعر البديل) - Optional number input
- Available From Date - Date input
- Available To Date - Date input

#### 3.2 Multiple Room Management
**Features**:
- Hotel selection dropdown
- Dynamic room group addition/removal
- Plus (+) icon to add new room group
- Minus (-) icon to remove room group
- Single submit button for all rooms
- Form validation for all room groups

**UI Structure**:
```
[Hotel Selection Dropdown]

[Room Group 1]
  - Room Type
  - Description
  - Purchase Price
  - Base Price
  - Alternative Price
  - Availability Dates
  - Quantity
  - Board Type
  [- Remove Group]

[+ Add Another Room Group]

[Submit All Rooms Button]
```

#### 3.3 Enhanced Filtering
**New Filter Options**:
- Purchase Price Range (Min/Max)
- Selling Price Range (Min/Max)
- Availability Date Range
- Date-based availability checking

**Filter UI**:
```
[Existing Filters]

[Price Filters]
  Purchase Price: [Min] - [Max]
  Selling Price: [Min] - [Max]

[Availability Filters]
  Available From: [Date Input]
  Available To: [Date Input]
  Check Availability: [Checkbox]
```

#### 3.4 State Management Updates
**New State Variables**:
```typescript
// Multiple room management
const [roomGroups, setRoomGroups] = useState([defaultRoomGroup]);
const [selectedHotel, setSelectedHotel] = useState('');

// New pricing fields
const [purchasePrice, setPurchasePrice] = useState('');
const [basePrice, setBasePrice] = useState('');
const [alternativePrice, setAlternativePrice] = useState('');

// Availability dates
const [availableFrom, setAvailableFrom] = useState('');
const [availableTo, setAvailableTo] = useState('');

// Enhanced filters
const [minPurchasePrice, setMinPurchasePrice] = useState('');
const [maxPurchasePrice, setMaxPurchasePrice] = useState('');
const [minSellingPrice, setMinSellingPrice] = useState('');
const [maxSellingPrice, setMaxSellingPrice] = useState('');
const [availabilityFromFilter, setAvailabilityFromFilter] = useState('');
const [availabilityToFilter, setAvailabilityToFilter] = useState('');
```

#### 3.5 Form Validation
**Validation Rules**:
- Purchase price must be positive number
- Base price must be positive number
- Alternative price must be positive (if provided)
- Available from date must be before available to date
- All required fields must be filled for each room group
- Hotel must be selected before adding rooms

**Validation Steps**:
- [ ] Test form validation for all fields
- [ ] Verify multiple room group functionality
- [ ] Test add/remove room group operations
- [ ] Validate bulk submission
- [ ] Check error handling and user feedback

---

### Step 4: Enhanced Filtering Implementation ✅ PENDING

#### 4.1 Client-Side Filtering Logic
**Update `filteredRooms` function**:
```typescript
const filteredRooms = rooms.filter(room => {
  // Existing filters...
  
  // Purchase price filtering
  const purchasePriceMatch = (
    (minPurchasePrice === '' || room.purchasePrice >= parseFloat(minPurchasePrice)) &&
    (maxPurchasePrice === '' || room.purchasePrice <= parseFloat(maxPurchasePrice))
  );
  
  // Selling price filtering
  const sellingPriceMatch = (
    (minSellingPrice === '' || room.basePrice >= parseFloat(minSellingPrice)) &&
    (maxSellingPrice === '' || room.basePrice <= parseFloat(maxSellingPrice))
  );
  
  // Availability date filtering
  const availabilityMatch = (
    (availabilityFromFilter === '' || new Date(room.availableFrom) >= new Date(availabilityFromFilter)) &&
    (availabilityToFilter === '' || new Date(room.availableTo) <= new Date(availabilityToFilter))
  );
  
  return nameMatch && typeMatch && hotelMatch && boardMatch && 
         purchasePriceMatch && sellingPriceMatch && availabilityMatch;
});
```

#### 4.2 Server-Side Filtering
**Update API calls to include new filters**:
- Modify fetch requests to include new query parameters
- Handle server-side filtering for better performance
- Implement pagination with new filters

**Validation Steps**:
- [ ] Test all filter combinations
- [ ] Verify filter reset functionality
- [ ] Check performance with large datasets
- [ ] Validate date filtering logic

---

### Step 5: Seed File Updates ✅ PENDING
**File**: `prisma/seed.js`

#### 5.1 Update Room Creation Data
**Add new fields to existing room data**:
```javascript
const deluxeSuite = await prisma.room.create({
  data: {
    // ... existing fields ...
    purchasePrice: 200.00,
    basePrice: 250.00,
    alternativePrice: 300.00,
    availableFrom: new Date('2024-01-01'),
    availableTo: new Date('2024-12-31'),
    // ... rest of fields ...
  },
});
```

#### 5.2 Create Sample Data for New Features
**Add diverse room data**:
- Different price ranges for testing filters
- Various availability date ranges
- Multiple rooms per hotel examples

**Validation Steps**:
- [ ] Run seed script successfully
- [ ] Verify all new fields are populated
- [ ] Check data consistency
- [ ] Test with updated frontend

---

### Step 6: Testing and Validation ✅ PENDING

#### 6.1 Database Testing
- [ ] Verify schema migration successful
- [ ] Test all CRUD operations
- [ ] Check data integrity
- [ ] Validate relationships

#### 6.2 API Testing
- [ ] Test all endpoints with new fields
- [ ] Verify filtering functionality
- [ ] Test bulk operations
- [ ] Check error handling
- [ ] Validate authentication

#### 6.3 Frontend Testing
- [ ] Test multiple room creation
- [ ] Verify all form validations
- [ ] Test filtering functionality
- [ ] Check responsive design
- [ ] Validate user experience

#### 6.4 Integration Testing
- [ ] Test complete workflow
- [ ] Verify data flow from frontend to database
- [ ] Test edge cases
- [ ] Check performance

---

## Implementation Notes

### Arabic Language Support
- All new labels should support Arabic translations
- Use existing translation system
- Maintain RTL layout compatibility

### Error Handling
- Implement comprehensive error messages
- Provide user-friendly feedback
- Handle network errors gracefully

### Performance Considerations
- Implement proper indexing for new fields
- Use pagination for large datasets
- Optimize filtering queries

### Security
- Validate all inputs on both client and server
- Maintain authentication requirements
- Implement proper authorization checks

---

## Success Criteria

### ✅ Completion Checklist
- [ ] Schema updated with new fields
- [ ] API endpoints enhanced with new functionality
- [ ] Frontend supports multiple room creation
- [ ] Enhanced filtering implemented
- [ ] Availability date tracking working
- [ ] Three-tier pricing structure implemented
- [ ] Bulk room operations functional
- [ ] All tests passing
- [ ] Seed data updated
- [ ] Documentation updated

### Quality Assurance
- [ ] No breaking changes to existing functionality
- [ ] All error scenarios handled
- [ ] User experience improved
- [ ] Performance maintained or improved
- [ ] Code follows project standards

---

## Risk Mitigation

### Potential Issues
1. **Database Migration**: Backup before schema changes
2. **Breaking Changes**: Maintain backward compatibility
3. **Performance**: Monitor query performance with new fields
4. **User Experience**: Ensure intuitive interface for multiple rooms

### Rollback Plan
- Keep backup of current schema
- Maintain version control for all changes
- Test rollback procedures

---

*This implementation plan will be updated after each step completion with actual results and any modifications needed.*