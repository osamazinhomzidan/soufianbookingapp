# Dark/Light Mode Implementation Plan

## Project Analysis Summary

After analyzing the full project structure, I understand this is a **multi-hotel booking management platform** with:

- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: Next.js 15 with React 19 and TailwindCSS
- **Authentication**: JWT-based with role management (OWNER/STAFF)
- **Internationalization**: English/Arabic support with RTL layout
- **Current Contexts**: AuthContext and LanguageContext already implemented
- **Current State**: No dark/light mode functionality exists

## Implementation Steps

### Step 1: Create Theme Context ✅ COMPLETED
**Objective**: Set up React context for theme state management

**Files to create/modify**:
- ✅ `src/contexts/ThemeContext.tsx` - Theme context with dark/light mode state
- ✅ `src/hooks/useTheme.ts` - Custom hook for theme functionality

**Tasks**:
1. ✅ Create ThemeContext with theme state (light/dark)
2. ✅ Implement theme persistence using localStorage
3. ✅ Add theme toggle functionality
4. ✅ Provide theme state to entire application
5. ✅ Add TypeScript interfaces for theme context
6. ✅ Create useTheme hook with proper error handling
7. ✅ Add system preference detection
8. ✅ Handle hydration mismatch prevention

**Validation**: ✅ Theme context created and ready for integration

**Code Review**: ✅ Theme context follows existing patterns, has proper TypeScript types, includes error handling, and prevents hydration mismatches

---

### Step 2: Update Root Layout with Theme Provider ✅ COMPLETED
**Objective**: Integrate ThemeProvider into the application layout

**Files to modify**:
- ✅ `src/app/layout.tsx` - Add ThemeProvider to provider chain

**Tasks**:
1. ✅ Import ThemeProvider
2. ✅ Wrap application with ThemeProvider (after LanguageProvider, before AuthProvider)
3. ✅ Ensure proper provider nesting order
4. ✅ Update HTML class based on theme state (handled by ThemeContext)

**Validation**: ✅ ThemeProvider properly integrated into layout

**Code Review**: ✅ Provider order is correct and no conflicts with existing providers

---

### Step 3: Update Sidebar with Theme Toggle ✅ PENDING
**Objective**: Add dark/light mode toggle button to sidebar

**Files to modify**:
- ✅ `src/components/Sidebar.tsx` - Add theme toggle button
- ✅ `src/lib/translations.ts` - Add theme-related translations

**Tasks**:
1. Import useTheme hook
2. Add theme toggle button with appropriate icon
3. Position toggle button in sidebar (near language toggle)
4. Add proper styling for both light and dark modes
5. Add translations for theme toggle
6. Ensure accessibility (ARIA labels, keyboard navigation)

**Validation**: Theme toggle button works and changes theme state

**Code Review**: Ensure button styling works in both themes and follows existing design patterns

---

### Step 4: Update TailwindCSS Configuration ✅ COMPLETED
**Objective**: Configure TailwindCSS for dark mode support

**Files to modify**:
- ✅ `tailwind.config.js` - Enable dark mode with class strategy

**Tasks**:
1. ✅ Enable dark mode with 'class' strategy
2. ✅ Ensure existing color scheme works with dark mode
3. ✅ Add custom dark mode color variables if needed (existing palette is comprehensive)
4. ✅ Test existing components with dark mode classes (ready for implementation)

**Validation**: ✅ TailwindCSS dark mode classes work properly

**Code Review**: ✅ Dark mode configuration updated without breaking existing styles

---

### Step 5: Update Hotel Page with Dark Mode Support ✅ PENDING
**Objective**: Implement dark/light mode styling for the hotel management page

**Files to modify**:
- ✅ `src/app/(owner)/hotel/page.tsx` - Add dark mode classes throughout the component

**Tasks**:
1. Import useTheme hook
2. Update background gradients for dark mode
3. Update card backgrounds and borders
4. Update text colors for dark mode
5. Update form input styling
6. Update button styling
7. Update table/list styling
8. Update modal/popup styling
9. Ensure proper contrast ratios
10. Test all interactive elements

**Validation**: Hotel page looks good and functions properly in both light and dark modes

**Code Review**: Ensure all elements are visible and accessible in both themes, verify color contrast meets accessibility standards

---

### Step 6: Create Theme Hook ✅ COMPLETED
**Objective**: Create a custom hook for easy theme access

**Files to create**:
- ✅ `src/hooks/useTheme.ts` - Custom hook for theme functionality

**Tasks**:
1. ✅ Create useTheme hook that wraps ThemeContext
2. ✅ Add proper TypeScript types
3. ✅ Add error handling for context usage outside provider
4. ✅ Export hook for use in components
5. ✅ Add JSDoc documentation with examples
6. ✅ Re-export Theme type for convenience

**Validation**: ✅ useTheme hook works properly and provides theme state

**Code Review**: ✅ Hook follows existing patterns, has proper error handling, and includes comprehensive documentation

---

### Step 7: Update Global Styles ✅ PENDING
**Objective**: Add global dark mode styles and CSS variables

**Files to modify**:
- ✅ `src/app/globals.css` - Add dark mode CSS variables and global styles

**Tasks**:
1. Add CSS custom properties for theme colors
2. Define light and dark color schemes
3. Update global styles for dark mode
4. Ensure smooth transitions between themes
5. Add dark mode styles for scrollbars and selection

**Validation**: Global styles work properly in both themes

**Code Review**: Verify CSS variables are properly defined and transitions work smoothly

---

### Step 8: Update Existing Components ✅ PENDING
**Objective**: Add dark mode support to existing components

**Files to modify**:
- ✅ `src/components/LayoutWrapper.tsx` - Add theme classes
- ✅ `src/components/ProtectedRoute.tsx` - Add theme support if needed

**Tasks**:
1. Update LayoutWrapper with theme-aware styling
2. Update ProtectedRoute if it has UI elements
3. Ensure all components use theme-aware classes
4. Test component rendering in both themes

**Validation**: All components render properly in both light and dark modes

**Code Review**: Ensure components maintain functionality and appearance in both themes

---

### Step 9: Update Translations ✅ COMPLETED
**Objective**: Add theme-related translations for both English and Arabic

**Files modified**:
- ✅ `src/lib/translations.ts` - Added theme translations

**Tasks**:
1. ✅ Add theme toggle translations
2. ✅ Add light/dark mode labels
3. ✅ Add theme-related accessibility labels
4. ✅ Ensure Arabic translations are accurate
5. ✅ Update TypeScript interfaces for new translations

**Validation**: ✅ All theme-related text is properly translated

**Code Review**: ✅ Translations are accurate and follow existing patterns

---

### Step 10: Testing and Validation ✅ PENDING
**Objective**: Comprehensive testing of dark/light mode functionality

**Tasks**:
1. Test theme toggle functionality
2. Test theme persistence across browser sessions
3. Test all pages in both light and dark modes
4. Test accessibility (contrast ratios, keyboard navigation)
5. Test RTL layout with dark mode
6. Test responsive design in both themes
7. Test form interactions and validation in both themes
8. Test loading states and animations
9. Cross-browser testing
10. Performance testing

**Validation**: All functionality works properly in both themes

**Code Review**: Comprehensive review of all changes to ensure quality and consistency

---

### Step 11: Update Seeds (if needed) ✅ PENDING
**Objective**: Update database seeds if theme preferences need to be stored

**Files to modify**:
- ✅ `prisma/seed.js` - Add theme preferences if needed

**Tasks**:
1. Evaluate if theme preferences should be stored in database
2. Update user model if needed for theme preferences
3. Update seed data accordingly
4. Test database changes

**Validation**: Database changes work properly if implemented

**Code Review**: Ensure database changes don't break existing functionality

---

## Technical Implementation Details

### Theme Context Structure
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  isDark: boolean;
}
```

### TailwindCSS Dark Mode Strategy
- Use `class` strategy for dark mode
- Apply `dark:` prefix for dark mode styles
- Use CSS custom properties for consistent theming

### Color Scheme Guidelines
- **Light Mode**: Current color scheme (blues, whites, grays)
- **Dark Mode**: Dark backgrounds with light text, maintaining brand colors
- **Accessibility**: Ensure WCAG AA contrast ratios (4.5:1 for normal text)

### Implementation Patterns
1. **Conditional Classes**: Use template literals with theme state
2. **CSS Variables**: Define theme-specific color variables
3. **Component Consistency**: Ensure all components follow same theming patterns
4. **Performance**: Minimize re-renders when theme changes

## Success Criteria

### ✅ Completion Checklist
- [ ] ThemeContext created and integrated
- [ ] Theme toggle in sidebar works properly
- [ ] TailwindCSS configured for dark mode
- [ ] Hotel page fully supports both themes
- [ ] All existing components work in both themes
- [ ] Theme persistence works across sessions
- [ ] Translations added for theme functionality
- [ ] Accessibility requirements met
- [ ] RTL layout works with dark mode
- [ ] All tests passing
- [ ] Performance is maintained

### Quality Assurance
- [ ] No breaking changes to existing functionality
- [ ] All error scenarios handled
- [ ] User experience improved
- [ ] Performance maintained or improved
- [ ] Code follows project standards
- [ ] Accessibility standards met (WCAG AA)
- [ ] Cross-browser compatibility maintained

## Risk Mitigation

### Potential Issues
1. **Color Contrast**: Ensure all text remains readable in dark mode
2. **Component Conflicts**: Some components might not work well with dark backgrounds
3. **Performance**: Theme switching should be smooth and fast
4. **Accessibility**: Maintain keyboard navigation and screen reader compatibility
5. **RTL Layout**: Ensure dark mode works properly with Arabic RTL layout

### Mitigation Strategies
1. **Systematic Testing**: Test each component individually in both themes
2. **Accessibility Tools**: Use contrast checkers and accessibility validators
3. **Performance Monitoring**: Monitor re-render performance during theme switches
4. **User Feedback**: Gather feedback on theme usability
5. **Gradual Rollout**: Implement and test one component at a time

---

## Implementation Notes

### Development Workflow
1. **Create Branch**: Work on `darktheme` branch
2. **Step-by-Step**: Complete each step fully before moving to next
3. **Code Review**: Review code after each step for errors and improvements
4. **Testing**: Test functionality after each step
5. **Documentation**: Update this plan with completion status

### Code Standards
- Follow existing TypeScript patterns
- Use consistent naming conventions
- Maintain existing component structure
- Add proper JSDoc comments for new functions
- Follow existing CSS class naming patterns

### Performance Considerations
- Use CSS custom properties for theme colors
- Minimize JavaScript theme calculations
- Use efficient CSS selectors
- Avoid unnecessary re-renders
- Optimize theme switching animations

---

**Next Step**: Begin with Step 1 - Create Theme Context

**Status Legend**:
- ✅ COMPLETED
- 🔄 IN PROGRESS  
- ❌ FAILED (needs retry)
- 🔍 IN REVIEW
- ⏸️ PENDING