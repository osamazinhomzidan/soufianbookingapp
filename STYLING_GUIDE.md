# PharmaBridge UI/UX Styling Guide

This guide serves as a comprehensive reference for maintaining consistent design patterns across the PharmaBridge application. All future pages should follow these established conventions.

## 🎨 Design Philosophy

### Apple-Inspired Design
- **Glassmorphism Effects**: Use backdrop-blur and semi-transparent backgrounds
- **Smooth Animations**: Implement subtle transitions and hover effects
- **Clean Typography**: Prioritize readability with proper font hierarchy
- **Rounded Corners**: Use consistent border radius values
- **Subtle Shadows**: Apply layered shadows for depth

### Bilingual Support
- **Arabic & English**: All components must support both languages
- **RTL Layout**: Consider right-to-left text direction for Arabic
- **Font Family**: Use 'Tajawal' for Arabic text support

## 🎯 Color Palette

### Apple-Inspired Colors
```css
/* Primary Colors */
--color-apple-blue: #007AFF
--color-apple-blue-light: #5AC8FA
--color-apple-blue-dark: #0051D5

/* Secondary Colors */
--color-apple-green: #34C759
--color-apple-purple: #AF52DE
--color-apple-orange: #FF9500
--color-apple-red: #FF3B30
--color-apple-yellow: #FFCC00
```

### Neutral Palette
```css
/* Gray Scale */
--color-gray-50: #F9FAFB   /* Lightest backgrounds */
--color-gray-100: #F3F4F6  /* Light backgrounds */
--color-gray-200: #E5E7EB  /* Borders */
--color-gray-400: #9CA3AF  /* Placeholders */
--color-gray-700: #374151  /* Text */
--color-gray-900: #111827  /* Headings */
```

### Usage Guidelines
- **Primary Actions**: Use `apple-blue` for main CTAs
- **Success States**: Use `apple-green` for positive actions
- **Destructive Actions**: Use `apple-red` for delete/remove
- **Warning States**: Use `apple-orange` for caution
- **Secondary Actions**: Use `gray-600` to `gray-700`

## 📐 Layout Patterns

### Page Structure
```jsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
  {/* Background decorative elements */}
  <div className="absolute inset-0 overflow-hidden">
    {/* Gradient orbs for visual interest */}
  </div>
  
  {/* Main content container */}
  <div className="relative z-10 w-full max-w-6xl">
    {/* Glassmorphism card */}
    <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8">
      {/* Page content */}
    </div>
  </div>
</div>
```

### Background Decorative Elements
```jsx
{/* Standard background orbs */}
<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-apple-blue/20 to-apple-purple/20 rounded-full blur-3xl"></div>
<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-apple-green/20 to-apple-teal/20 rounded-full blur-3xl"></div>
<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-apple-pink/10 to-apple-orange/10 rounded-full blur-3xl"></div>
```

## 🧩 Component Patterns

### Language Selector
```jsx
<div className="absolute top-4 right-4">
  <button
    onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
    className="px-4 py-2 bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-medium text-gray-700 hover:bg-white/40 transition-all duration-200 shadow-sm"
  >
    {language === 'en' ? 'العربية' : 'English'}
  </button>
</div>
```

### Form Inputs
```jsx
{/* Standard input field */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    {language === 'ar' ? 'النص العربي' : 'English Text'}
  </label>
  <div className="relative">
    <input
      type="text"
      className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
      placeholder={language === 'ar' ? 'النص التوضيحي' : 'Placeholder text'}
    />
    {/* Optional icon */}
    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
      <svg className="w-5 h-5 text-gray-400" /* icon */>
    </div>
  </div>
</div>
```

### Button Styles

#### Primary Button
```jsx
<button className="w-full px-6 py-3 bg-gradient-to-r from-apple-green to-apple-green-light text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-apple-green focus:ring-offset-2">
  {language === 'ar' ? 'النص العربي' : 'English Text'}
</button>
```

#### Secondary Button
```jsx
<button className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2">
  {language === 'ar' ? 'النص العربي' : 'English Text'}
</button>
```

#### Destructive Button
```jsx
<button className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200">
  {language === 'ar' ? 'حذف' : 'Delete'}
</button>
```

### Data Tables
```jsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b border-gray-200/50">
        <th className="text-left py-3 px-4 font-semibold text-gray-700">
          {language === 'ar' ? 'العمود' : 'Column'}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-gray-100/50 hover:bg-white/30 transition-colors">
        <td className="py-3 px-4 text-gray-600">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Search/Filter Components
```jsx
{/* Search input with icon */}
<div className="relative">
  <input
    type="text"
    className="w-full px-4 py-3 pl-10 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
    placeholder={language === 'ar' ? 'البحث...' : 'Search...'}
  />
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>
</div>
```

### Modal/Dialog
```jsx
{/* Modal backdrop */}
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
  {/* Modal content */}
  <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 w-full max-w-md">
    {/* Modal header */}
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {language === 'ar' ? 'العنوان' : 'Title'}
      </h3>
      <button className="text-gray-400 hover:text-gray-600">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    {/* Modal body */}
    <div className="space-y-4">
      {/* Content */}
    </div>
  </div>
</div>
```

## 🎭 Animation & Transitions

### Standard Transitions
```css
/* Fast transitions for hover states */
transition-all duration-200

/* Normal transitions for state changes */
transition-all duration-300

/* Slow transitions for complex animations */
transition-all duration-500
```

### Hover Effects
```jsx
{/* Scale on hover */}
transform hover:scale-[1.02]

{/* Shadow enhancement */}
hover:shadow-xl

{/* Background opacity change */}
hover:bg-white/40
```

## 📱 Responsive Design

### Breakpoint Strategy
- **Mobile First**: Start with mobile design
- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up

### Common Responsive Patterns
```jsx
{/* Responsive grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

{/* Responsive flex */}
<div className="flex flex-col lg:flex-row gap-4">

{/* Responsive text */}
<h1 className="text-xl md:text-2xl lg:text-3xl">

{/* Responsive spacing */}
<div className="p-4 md:p-6 lg:p-8">
```

## ♿ Accessibility Guidelines

### Focus States
```jsx
focus:ring-2 focus:ring-apple-blue focus:ring-offset-2
focus:border-transparent
```

### ARIA Labels
```jsx
aria-label={language === 'ar' ? 'وصف عربي' : 'English description'}
role="button"
tabIndex={0}
```

### Color Contrast
- Ensure minimum 4.5:1 contrast ratio for normal text
- Use 3:1 contrast ratio for large text
- Test with color blindness simulators

## 🔧 State Management Patterns

### Language State
```jsx
const [language, setLanguage] = useState('en');
```

### Form State
```jsx
const [formData, setFormData] = useState({
  field1: '',
  field2: '',
});
```

### Selection State
```jsx
const [selectedItems, setSelectedItems] = useState<string[]>([]);
```

## 📋 Common Utility Classes

### Glassmorphism
```css
backdrop-blur-xl bg-white/70 border border-white/20
```

### Card Shadows
```css
shadow-2xl /* For main containers */
shadow-lg  /* For elevated elements */
shadow-md  /* For subtle elevation */
```

### Rounded Corners
```css
rounded-3xl /* For main containers */
rounded-xl  /* For form elements */
rounded-lg  /* For buttons */
```

## 🚀 Performance Considerations

### Image Optimization
- Use SVG for icons and simple graphics
- Optimize PNG/JPG images
- Consider WebP format for better compression

### CSS Optimization
- Use Tailwind's purge feature
- Minimize custom CSS
- Leverage CSS custom properties for theming

### JavaScript Optimization
- Use React.memo for expensive components
- Implement proper key props for lists
- Debounce search inputs

## 📝 Code Style Guidelines

### Component Structure
```jsx
// 1. Imports
import { useState } from 'react';

// 2. Interfaces/Types
interface ComponentProps {
  // props definition
}

// 3. Component
export default function ComponentName({ props }: ComponentProps) {
  // 4. State declarations
  const [state, setState] = useState();
  
  // 5. Event handlers
  const handleEvent = () => {
    // handler logic
  };
  
  // 6. Render
  return (
    // JSX
  );
}
```

### Naming Conventions
- **Components**: PascalCase (e.g., `LoginPage`)
- **Functions**: camelCase (e.g., `handleSubmit`)
- **Variables**: camelCase (e.g., `userName`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINT`)

## 🎯 Best Practices

1. **Consistency**: Always follow established patterns
2. **Accessibility**: Include proper ARIA labels and focus states
3. **Performance**: Optimize images and minimize re-renders
4. **Responsiveness**: Test on multiple screen sizes
5. **Bilingual**: Always provide Arabic translations
6. **Semantic HTML**: Use appropriate HTML elements
7. **Error Handling**: Provide clear error messages
8. **Loading States**: Show loading indicators for async operations

---

*This guide should be updated as new patterns emerge and the design system evolves.*