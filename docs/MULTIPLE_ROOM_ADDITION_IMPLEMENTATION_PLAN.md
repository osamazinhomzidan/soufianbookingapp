# Multiple Room Addition Implementation Plan

## Overview
Implement functionality to allow users to add multiple rooms for the same hotel in a single operation through an enhanced UI with plus/minus icons, while maintaining the existing room table structure.

## Implementation Steps

### Step 1: Backend API Enhancement
**Files to modify:** `src/app/api/rooms/route.ts`

**Tasks:**
- ✅ **Already Implemented**: The API already supports bulk room creation through the `rooms` array parameter
- ✅ **Validation**: Existing validation handles both single and bulk room creation
- ✅ **Transaction Support**: Bulk creation uses Prisma transactions for data consistency

**Verification:**
- [x] Check that POST `/api/rooms` accepts both single room and bulk room creation
- [x] Verify transaction handling for multiple room creation
- [x] Confirm proper error handling for bulk operations

**Status:** ✅ COMPLETED - Backend already supports bulk room creation

---

### Step 2: Frontend State Management Enhancement
**Files to modify:** `src/app/(owner)/room/page.tsx`

**Tasks:**
- [x] Add state for managing multiple room forms
- [x] Implement functions to add/remove room forms
- [x] Update form submission to handle multiple rooms
- [x] Add validation for multiple room forms

**Implementation Details:**
```typescript
// New state variables added:
const [roomForms, setRoomForms] = useState([{ id: 1, ...defaultRoomForm }]);
const [nextRoomId, setNextRoomId] = useState(2);
const [selectedHotelForMultiple, setSelectedHotelForMultiple] = useState('');

// Functions implemented:
const addRoomForm = () => { /* Add new room form */ };
const removeRoomForm = (id: number) => { /* Remove specific room form */ };
const updateRoomForm = (id: number, field: string, value: any) => { /* Update specific room form field */ };
const handleAddMultipleRooms = async (e: React.FormEvent) => { /* Bulk submission logic */ };
```

**Verification Steps:**
- [x] Test adding new room forms
- [x] Test removing room forms (ensure at least one remains)
- [x] Test form data isolation between multiple forms
- [x] Verify state updates work correctly

**Status:** ✅ COMPLETED

---

### Step 3: UI Component Redesign
**Files to modify:** `src/app/(owner)/room/page.tsx`

**Tasks:**
- [ ] Redesign the "Add New Room" section for multiple room support
- [ ] Add plus/minus icons after hotel selection
- [ ] Create reusable room form component
- [ ] Implement responsive design for multiple forms
- [ ] Add visual indicators for form numbering

**UI Design Requirements:**
- Hotel selection at the top (shared across all rooms)
- Plus icon to add new room form
- Minus icon to remove room form (disabled if only one form)
- Each room form should be clearly separated
- Form numbering (Room 1, Room 2, etc.)
- Simplified and cleaner layout

**Verification Steps:**
- [ ] Test UI responsiveness with multiple forms
- [ ] Verify plus/minus icon functionality
- [ ] Check form separation and clarity
- [ ] Test hotel selection affects all room forms
- [ ] Validate visual design consistency

**Status:** 🔄 PENDING

---

### Step 4: Form Validation Enhancement
**Files to modify:** `src/app/(owner)/room/page.tsx`

**Tasks:**
- [ ] Update validation to handle multiple room forms
- [ ] Add cross-form validation (e.g., unique room types per hotel)
- [ ] Implement individual form error handling
- [ ] Add bulk validation before submission

**Validation Rules:**
- Each room form must have all required fields
- Room types should be unique within the same submission
- Price validation for each room
- Availability date validation for each room

**Verification Steps:**
- [ ] Test validation with empty required fields
- [ ] Test duplicate room type validation
- [ ] Test individual form error display
- [ ] Test bulk validation before submission

**Status:** 🔄 PENDING

---

### Step 5: Form Submission Logic Update
**Files to modify:** `src/app/(owner)/room/page.tsx`

**Tasks:**
- [ ] Update `handleAddRoom` function for bulk submission
- [ ] Implement progress indication during bulk creation
- [ ] Add success/error handling for bulk operations
- [ ] Update form reset logic for multiple forms

**Implementation Details:**
```typescript
const handleAddMultipleRooms = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate all forms
  // Prepare bulk data
  // Submit to API
  // Handle response
  // Reset forms on success
};
```

**Verification Steps:**
- [ ] Test successful bulk room creation
- [ ] Test partial failure handling
- [ ] Test progress indication
- [ ] Test form reset after successful submission

**Status:** 🔄 PENDING

---

### Step 6: Translation Keys Addition
**Files to modify:** `src/lib/translations.ts`

**Tasks:**
- [ ] Add translation keys for multiple room UI elements
- [ ] Add error messages for bulk operations
- [ ] Add success messages for bulk creation

**New Translation Keys:**
```typescript
// English
addRoom: 'Add Room',
removeRoom: 'Remove Room',
roomNumber: 'Room {number}',
addMultipleRooms: 'Add Multiple Rooms',
bulkRoomCreationSuccess: '{count} rooms created successfully',
bulkRoomCreationError: 'Error creating rooms: {error}',

// Arabic
addRoom: 'إضافة غرفة',
removeRoom: 'إزالة غرفة',
roomNumber: 'غرفة {number}',
addMultipleRooms: 'إضافة غرف متعددة',
bulkRoomCreationSuccess: 'تم إنشاء {count} غرفة بنجاح',
bulkRoomCreationError: 'خطأ في إنشاء الغرف: {error}',
```

**Verification Steps:**
- [ ] Test English translations display correctly
- [ ] Test Arabic translations display correctly
- [ ] Test dynamic values in translations (count, error messages)

**Status:** 🔄 PENDING

---

### Step 7: Testing and Validation
**Files to test:** All modified files

**Tasks:**
- [ ] Test single room creation (ensure backward compatibility)
- [ ] Test multiple room creation with various scenarios
- [ ] Test error handling and edge cases
- [ ] Test UI responsiveness and usability
- [ ] Test form validation and submission
- [ ] Verify no impact on existing room table structure

**Test Scenarios:**
1. Create single room (existing functionality)
2. Create 2-3 rooms for same hotel
3. Create rooms with different configurations
4. Test validation errors
5. Test network errors during submission
6. Test UI with different screen sizes
7. Test language switching

**Verification Steps:**
- [ ] All test scenarios pass
- [ ] No console errors
- [ ] Database integrity maintained
- [ ] UI/UX is intuitive and responsive

**Status:** 🔄 PENDING

---

### Step 8: Code Review and Optimization
**Files to review:** All modified files

**Tasks:**
- [ ] Review code for best practices
- [ ] Optimize performance for multiple forms
- [ ] Ensure proper error handling
- [ ] Verify accessibility compliance
- [ ] Check code documentation

**Review Checklist:**
- [ ] Code follows existing patterns
- [ ] No memory leaks in state management
- [ ] Proper TypeScript typing
- [ ] Consistent error handling
- [ ] Accessible UI components

**Status:** 🔄 PENDING

---

## Technical Notes

### Backend Considerations
- The existing API already supports bulk room creation through the `rooms` array parameter
- Transaction handling ensures data consistency during bulk operations
- No changes needed to the database schema or room table structure

### Frontend Architecture
- Use React state to manage multiple room forms
- Implement reusable components for better maintainability
- Ensure proper form isolation and validation
- Maintain existing functionality for single room creation

### UI/UX Guidelines
- Keep the interface simple and intuitive
- Provide clear visual feedback for actions
- Ensure responsive design for different screen sizes
- Maintain consistency with existing design patterns

## Success Criteria

1. ✅ Backend supports bulk room creation (already implemented)
2. 🔄 Users can add multiple rooms for the same hotel in one operation
3. 🔄 UI includes plus/minus icons for adding/removing room forms
4. 🔄 Form validation works for multiple rooms
5. 🔄 Existing single room creation functionality remains intact
6. 🔄 No impact on room table structure
7. 🔄 Proper error handling and user feedback
8. 🔄 Responsive and accessible design

## Legend
- ✅ COMPLETED
- 🔄 PENDING
- ❌ FAILED (needs retry)
- 🔍 IN REVIEW

---

**Next Step:** Begin with Step 2 - Frontend State Management Enhancement