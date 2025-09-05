# Room Management System Implementation Plan

## Project Overview
This document outlines the step-by-step implementation plan for creating a comprehensive Room Management System that mirrors the existing Hotel Management System. The implementation will include schema updates, API endpoints, frontend integration, and database seeding.

## Current Analysis Summary

### Frontend Requirements (from room/page.tsx)
Based on the "Add New Room" section, the required fields are:
- **Hotel Select**: Dropdown to select from existing hotels
- **Room Type**: Text input (e.g., "Deluxe Suite", "Family Room")
- **Board Type**: Dropdown with options (Room only, Bed & breakfast, Half board, Full board)
- **Room Description**: Text input for English description
- **Alt Description**: Text input for Arabic description
- **Number of Rooms**: Number input for quantity
- **Base Price**: Number input for main price
- **Alternative Price**: Optional number input for alternative pricing

### Current Schema Analysis
The existing Room model in `prisma/schema.prisma` already contains most required fields but needs alignment with frontend requirements:
- ✅ `hotelId` - matches Hotel Select
- ✅ `roomType` - matches Room Type
- ✅ `roomTypeDescription` - matches Room Description
- ✅ `altDescription` - matches Alt Description
- ✅ `basePrice` - matches Base Price
- ✅ `quantity` - matches Number of Rooms
- ✅ `boardType` - matches Board Type (enum values need alignment)
- ❌ Missing: Alternative Price field
- ❌ BoardType enum values need frontend alignment

### API Pattern Analysis
Based on existing hotel APIs, the room APIs should follow the same pattern:
- Authentication required for all operations
- RESTful design with proper HTTP methods
- Consistent error handling and response format
- Proper validation and sanitization
- Role-based access control

## Implementation Steps

### Step 1: Update Prisma Schema ✅ PENDING
**Objective**: Align Room model with frontend requirements

**Tasks**:
1. Add `alternativePrice` field to Room model
2. Update BoardType enum values to match frontend exactly:
   - `ROOM_ONLY` → should display as "Room only"
   - `BED_BREAKFAST` → should display as "Bed & breakfast"
   - `HALF_BOARD` → should display as "Half board"
   - `FULL_BOARD` → should display as "Full board"
3. Ensure all existing relationships remain intact
4. Run database migration

**Validation**:
- [ ] Schema compiles without errors
- [ ] All existing relationships preserved
- [ ] New fields properly typed
- [ ] Migration runs successfully

**Files to modify**:
- `prisma/schema.prisma`

---

### Step 2: Create Room API Endpoints ✅ COMPLETED
**Objective**: Create RESTful API endpoints for Room CRUD operations

**Tasks**:
1. ✅ Create `src/app/api/rooms/route.ts` for:
   - GET: List all rooms with filtering and pagination
   - POST: Create new room
2. ✅ Create `src/app/api/rooms/[id]/route.ts` for:
   - GET: Get single room by ID
   - PUT: Update existing room
   - DELETE: Delete room
3. ✅ Implement proper authentication and authorization
4. ✅ Add input validation and sanitization
5. ✅ Include proper error handling
6. ✅ Follow same patterns as hotel APIs

**API Endpoints**:
- `GET /api/rooms` - List rooms with search/filter/pagination
- `POST /api/rooms` - Create new room
- `GET /api/rooms/[id]` - Get room by ID
- `PUT /api/rooms/[id]` - Update room
- `DELETE /api/rooms/[id]` - Delete room

**Validation**:
- [x] All endpoints respond correctly
- [x] Authentication works properly
- [x] Input validation prevents invalid data
- [x] Error handling provides meaningful messages
- [x] Follows RESTful conventions

**Files created**:
- `src/app/api/rooms/route.ts`
- `src/app/api/rooms/[id]/route.ts`

**Implementation Details**:
- Added comprehensive filtering (search, hotelId, boardType)
- Implemented pagination with page, limit, skip
- Added proper validation for all input fields
- Included role-based authorization for DELETE operations
- Added checks for active bookings before room deletion
- Followed existing hotel API patterns for consistency

---

### Step 3: Update Frontend Integration ✅ PENDING
**Objective**: Connect room page to use new API endpoints

**Tasks**:
1. Replace mock data with API calls
2. Implement proper error handling for API responses
3. Add loading states for better UX
4. Update form submission to use POST API
5. Implement edit functionality using PUT API
6. Implement delete functionality using DELETE API
7. Add proper success/error notifications
8. Ensure board type values match between frontend and backend

**Validation**:
- [ ] Form submission creates rooms via API
- [ ] Room list loads from API
- [ ] Edit functionality works properly
- [ ] Delete functionality works properly
- [ ] Error states handled gracefully
- [ ] Loading states provide good UX
- [ ] Board type values display correctly

**Files to modify**:
- `src/app/(owner)/room/page.tsx`

---

### Step 4: Update Database Seed ✅ PENDING
**Objective**: Update seed file to reflect new Room model structure

**Tasks**:
1. Add `alternativePrice` field to existing room seed data
2. Ensure BoardType enum values are used correctly
3. Add more diverse room examples showcasing all features
4. Verify all relationships work properly
5. Test seed script runs without errors

**Validation**:
- [ ] Seed script runs successfully
- [ ] All room data includes new fields
- [ ] BoardType values are correct
- [ ] Relationships work properly
- [ ] Database populated with realistic data

**Files to modify**:
- `prisma/seed.js`

---

### Step 5: Testing and Validation ✅ PENDING
**Objective**: Comprehensive testing of all functionality

**Tasks**:
1. Test all API endpoints with various inputs
2. Test frontend functionality end-to-end
3. Verify data persistence and retrieval
4. Test error scenarios and edge cases
5. Validate security and authentication
6. Performance testing for large datasets
7. Cross-browser compatibility testing

**Test Scenarios**:
- [ ] Create room with all required fields
- [ ] Create room with optional alternative price
- [ ] Create room without alternative price
- [ ] Update existing room
- [ ] Delete room
- [ ] List rooms with filtering
- [ ] Handle invalid inputs gracefully
- [ ] Authentication required for all operations
- [ ] Proper error messages displayed

**Files to test**:
- All API endpoints
- Frontend room management page
- Database operations

---

## Technical Specifications

### Database Schema Changes
```prisma
model Room {
  // ... existing fields ...
  alternativePrice    Decimal?  @db.Decimal(10, 2) // New field
  // ... rest of existing fields ...
}

enum BoardType {
  ROOM_ONLY      // "Room only"
  BED_BREAKFAST  // "Bed & breakfast"
  HALF_BOARD     // "Half board"
  FULL_BOARD     // "Full board"
}
```

### API Response Format
```json
{
  "success": true,
  "data": {
    "id": "room_id",
    "hotelId": "hotel_id",
    "roomType": "Deluxe Suite",
    "roomTypeDescription": "Luxury suite with ocean view",
    "altDescription": "جناح فاخر مع إطلالة على المحيط",
    "basePrice": 250.00,
    "alternativePrice": 200.00,
    "quantity": 5,
    "boardType": "BED_BREAKFAST",
    "createdAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  },
  "message": "Room created successfully"
}
```

### Frontend State Management
- Use React hooks for state management
- Implement proper loading states
- Handle errors gracefully with user-friendly messages
- Maintain form validation on client side
- Sync with server-side validation

## Risk Assessment

### Low Risk
- Schema updates (minimal changes required)
- API creation (following established patterns)
- Frontend integration (existing structure in place)

### Medium Risk
- Data migration (if existing rooms need updates)
- BoardType enum alignment (frontend/backend sync)

### Mitigation Strategies
- Test all changes in development environment first
- Create database backups before migrations
- Implement comprehensive error handling
- Use TypeScript for type safety
- Follow existing code patterns and conventions

## Success Criteria

1. ✅ **Functional Requirements**
   - All CRUD operations work for rooms
   - Frontend form creates rooms successfully
   - Room list displays and filters properly
   - Edit and delete operations work

2. ✅ **Technical Requirements**
   - APIs follow RESTful conventions
   - Proper authentication and authorization
   - Input validation and error handling
   - Database relationships maintained

3. ✅ **User Experience**
   - Intuitive interface matching existing patterns
   - Proper loading and error states
   - Responsive design
   - Multilingual support maintained

4. ✅ **Code Quality**
   - Consistent with existing codebase
   - Proper TypeScript typing
   - Clean, maintainable code
   - Comprehensive error handling

## Post-Implementation Notes

### Completed Steps
- [ ] Step 1: Schema Update
- [ ] Step 2: API Creation
- [ ] Step 3: Frontend Integration
- [ ] Step 4: Seed Update
- [ ] Step 5: Testing & Validation

### Issues Encountered
(To be filled during implementation)

### Lessons Learned
(To be filled during implementation)

### Future Enhancements
- Room availability calendar integration
- Advanced pricing rules
- Room amenity management
- Photo upload functionality
- Bulk operations for rooms

---

**Implementation Status**: 🟡 IN PROGRESS
**Last Updated**: Initial Creation
**Next Step**: Begin Step 1 - Update Prisma Schema