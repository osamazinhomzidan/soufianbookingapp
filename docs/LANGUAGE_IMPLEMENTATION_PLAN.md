# Language Implementation Plan: Arabic/English Switching with Context State Management

## Project Analysis Summary

The project is a Next.js hotel management system with:
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom JWT-based auth with context
- **UI**: Tailwind CSS with modern glassmorphism design
- **Structure**: App router with protected routes
- **Current Language**: Basic language selector on login page (not persistent)

### Current State:
- Login page has language selector but it's local state only
- No global language management
- No persistent language preference
- Sidebar and other components are English-only
- Database has some Arabic fields (altName, altDescription) but not utilized

## Implementation Steps

### ✅ Step 1: Create Language Context and Provider
**Status**: PENDING
**Files to create/modify**:
- `src/contexts/LanguageContext.tsx` (NEW)
- `src/app/layout.tsx` (MODIFY)

**Tasks**:
1. Create LanguageContext with TypeScript interfaces
2. Implement language state management (Arabic/English)
3. Add language persistence using localStorage
4. Integrate with existing AuthProvider in layout
5. **Recheck**: Verify context works correctly and persists language choice

---

### ✅ Step 2: Create Translation System
**Status**: PENDING
**Files to create**:
- `src/lib/translations.ts` (NEW)
- `src/hooks/useTranslation.ts` (NEW)

**Tasks**:
1. Create translation object with Arabic and English text
2. Include all UI text from login, sidebar, and main pages
3. Create custom hook for easy translation access
4. **Recheck**: Test translation hook returns correct text for both languages

---

### ✅ Step 3: Update Login Page with Global Language Context
**Status**: PENDING
**Files to modify**:
- `src/app/page.tsx`

**Tasks**:
1. Replace local language state with global LanguageContext
2. Update all text to use translation system
3. Ensure language choice persists after login
4. Add RTL support for Arabic text
5. **Recheck**: Verify login page language switching works and persists

---

### ✅ Step 4: Add Language Toggle to Sidebar
**Status**: COMPLETED
**Files to modify**:
- `src/components/Sidebar.tsx`

**Tasks**:
1. ✅ Add language toggle switch component
2. ✅ Update all sidebar text to use translations
3. ✅ Implement smooth toggle animation
4. ✅ Position toggle appropriately in sidebar
5. ✅ **Recheck**: Verify sidebar toggle works and updates all text immediately

---

### ✅ Step 5: Update All Main Pages with Translations
**Status**: IN PROGRESS
**Files to modify**:
- `src/app/booking/page.tsx` ✅
- `src/app/reservations/page.tsx` ✅
- `src/app/guests/page.tsx` ✅
- `src/app/(owner)/hotel/page.tsx`
- `src/app/(owner)/room/page.tsx`

**Tasks**:
1. ✅ Replace all hardcoded English text with translation calls (booking page)
2. ✅ Add comprehensive Arabic translations for all UI elements
3. ✅ Update form labels, buttons, headers, and messages
4. ✅ Ensure proper RTL layout for Arabic
5. ✅ **Recheck**: Test each page individually to ensure all text translates correctly

---

### ✅ Step 6: Update Layout Components
**Status**: COMPLETED
**Files to modify**:
- `src/components/LayoutWrapper.tsx`
- `src/components/ProtectedRoute.tsx`

**Tasks**:
1. ✅ Add translation support to layout components
2. ✅ Update loading messages and headers
3. ✅ Ensure RTL support in layout structure
4. ✅ **Recheck**: Verify layout components display correctly in both languages

---

### ✅ Step 7: Add RTL Support and Styling
**Status**: PENDING
**Files to modify**:
- `src/app/globals.css`
- `src/app/layout.tsx`

**Tasks**:
1. Add RTL CSS classes and utilities
2. Update Tailwind configuration for RTL support
3. Add Arabic font support
4. Implement direction switching based on language
5. **Recheck**: Verify RTL layout works correctly for Arabic text

---

### ✅ Step 8: Enhance Database Integration
**Status**: PENDING
**Files to modify**:
- API routes in `src/app/api/`
- Database queries to utilize Arabic fields

**Tasks**:
1. Update API responses to include Arabic translations
2. Utilize existing altName and altDescription fields
3. Return appropriate language data based on user preference
4. **Recheck**: Verify API returns correct language data

---

### ✅ Step 9: Testing and Bug Fixes
**Status**: PENDING

**Tasks**:
1. Test language switching on all pages
2. Verify persistence across browser sessions
3. Test RTL layout and styling
4. Check for any untranslated text
5. Verify authentication flow with language context
6. Test responsive design in both languages
7. **Recheck**: Complete end-to-end testing of language functionality

---

### ✅ Step 10: Final Optimization and Documentation
**Status**: PENDING

**Tasks**:
1. Optimize translation loading and performance
2. Add error handling for missing translations
3. Update this documentation with completion status
4. Create user guide for language switching
5. **Recheck**: Final review of all implemented features

---

## Technical Implementation Details

### Language Context Structure
```typescript
interface LanguageContextType {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  isRTL: boolean;
  t: (key: string) => string; // Translation function
}
```

### Translation Key Structure
```typescript
interface Translations {
  login: {
    title: string;
    username: string;
    password: string;
    // ... more keys
  };
  sidebar: {
    hotels: string;
    rooms: string;
    // ... more keys
  };
  // ... more sections
}
```

### RTL Support
- Use Tailwind's RTL utilities
- Dynamic direction attribute on HTML element
- Arabic font integration (Noto Sans Arabic)
- Proper text alignment and spacing

## Success Criteria

1. ✅ Language choice on login persists globally
2. ✅ Sidebar toggle switches language immediately
3. ✅ All pages display in selected language
4. ✅ RTL layout works correctly for Arabic
5. ✅ No hardcoded English text remains
6. ✅ Language preference persists across sessions
7. ✅ Smooth transitions between languages
8. ✅ Database integration for multilingual content

## Notes

- Each step must be completed and rechecked before proceeding
- Focus on maintaining existing functionality while adding language support
- Ensure type safety throughout the implementation
- Keep the implementation simple and maintainable
- Test thoroughly after each step

---

**Implementation Start Date**: [To be filled]
**Expected Completion**: [To be filled]
**Current Step**: Step 1 - Create Language Context and Provider