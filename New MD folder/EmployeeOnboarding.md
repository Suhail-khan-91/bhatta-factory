# Component Analysis: EmployeeOnboarding.js

## Summary
This file implements an employee onboarding form with personal details, work details, and document upload functionality. Several reusable patterns are identified that could be extracted into shared components.

## Recommended Components

### 1. Combobox
**Type:** Form/UI
**Current Usage:** Used 5 times for Employee Category, Boss/Contractor Name, Gender, Religion
**Suggested Props:**
- `id: string` - Input element ID
- `value: string` - Current selected value
- `onChange: (value: string) => void` - Callback when value changes
- `options: string[]` - Array of available options
- `placeholder: string` - Placeholder text
- `accentClass?: string` - Custom accent color classes (e.g., "focus:ring-purple-500")

**Suggested Implementation:**
```jsx
// Already exists at batta-app/components/ui/Combobox.js
// This file has a local duplicate that should be removed
import Combobox from "@/components/ui/Combobox";
```

**Benefits:**
- Eliminates 70+ lines of duplicate code
- Centralizes dropdown behavior and styling
- Makes future accessibility improvements easier

---

### 2. StyledSelect
**Type:** Form
**Current Usage:** Used for Pay Frequency select dropdown
**Suggested Props:**
- `id: string` - Select element ID
- `value: string` - Current value
- `onChange: (value: string) => void` - Value change callback
- `children: ReactNode` - Option elements

**Suggested Implementation:**
```jsx
function StyledSelect({ id, value, onChange, children }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full bg-gray-800 border border-gray-700 rounded-xl
          pl-4 pr-10 py-3 text-white text-base
          focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500
          transition-all appearance-none [color-scheme:dark]
        "
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  );
}
```

**Benefits:**
- Consistent select dropdown styling across app
- Custom chevron icon for consistent look

---

### 3. FormInput
**Type:** Form
**Current Usage:** Used 6 times (Full Name, Base Salary, Age, Home City, Date inputs)
**Suggested Props:**
- `type: string` - Input type (text, number, date)
- `value: string | number` - Current value
- `onChange: (value: string) => void` - Change callback
- `placeholder?: string` - Placeholder text
- `error?: string` - Error message to display
- `accentClass?: string` - Custom focus ring color
- `label?: string` - Label text
- `required?: boolean` - Required field indicator

**Suggested Implementation:**
```jsx
function FormInput({ type = "text", value, onChange, placeholder, error, accentClass = "focus:ring-purple-500/40 focus:border-purple-500", label, required }) {
  const inputCls = `w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-base
    placeholder-gray-500 focus:outline-none focus:ring-2 transition-all
    ${error ? "border-red-500 focus:ring-red-500/40" : "border-gray-700 ${accentClass}"}`;
  
  return (
    <div>
      {label && <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
```

**Benefits:**
- Consistent input styling across all forms
- Built-in error handling and display
- Reusable label + input combination

---

### 4. FileUpload
**Type:** Form/UI
**Current Usage:** Used twice - Aadhar Card and PAN/Bank Passbook upload
**Suggested Props:**
- `label: string` - Field label
- `value: File | null` - Selected file
- `preview: string | null` - Image preview URL
- `onChange: (file: File) => void` - File selection callback
- `onRemove: () => void` - Remove file callback
- `accept?: string` - Accepted file types
- `placeholder?: string` - Upload prompt text

**Suggested Implementation:**
```jsx
function FileUpload({ label, value, preview, onChange, onRemove, accept = "image/*", placeholder }) {
  return (
    <div>
      <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5">{label}</label>
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full max-h-48 object-cover rounded-xl border border-gray-700" />
          <button type="button" onClick={onRemove} className="absolute top-2 right-2 bg-gray-900/80 rounded-full p-1 hover:bg-red-600 transition-colors">
            <X size={16} />
          </button>
          {value && <p className="text-gray-500 text-xs mt-1 truncate">{value.name}</p>}
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-gray-700 rounded-xl py-7 flex flex-col items-center gap-2 text-gray-500 hover:border-purple-500 hover:text-purple-400 transition-all">
          <Upload size={22} />
          <span className="text-sm">{placeholder}</span>
        </button>
      )}
      <input ref={fileRef} type="file" accept={accept} onChange={(e) => onChange(e.target.files?.[0])} className="hidden" />
    </div>
  );
}
```

**Benefits:**
- Consistent file upload UI across app
- Built-in preview functionality
- Reusable remove button with X icon

---

### 5. SubmitButton
**Type:** UI
**Current Usage:** Single usage (Save Employee button)
**Suggested Props:**
- `type?: "button" | "submit"` - Button type
- `disabled?: boolean` - Disabled state
- `isLoading?: boolean` - Loading state
- `loadingText?: string` - Text during loading
- `icon?: ReactNode` - Icon component
- `children: ReactNode` - Button text
- `variant?: "primary" | "secondary"` - Button style variant
- `color?: string` - Custom color classes

**Suggested Implementation:**
```jsx
function SubmitButton({ type = "submit", disabled, isLoading, loadingText = "Saving...", icon, children, colorClass = "bg-purple-600 hover:bg-purple-500" }) {
  return (
    <button type={type} disabled={disabled} className={`w-full py-4 rounded-2xl ${colorClass} disabled:opacity-50 text-white font-semibold text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2`}>
      {isLoading ? loadingText : <>{icon}{children}</>}
    </button>
  );
}
```

**Benefits:**
- Consistent submit button styling
- Built-in loading state handling
- Configurable colors for different contexts

---

### 6. PageHeader
**Type:** Navigation/Layout
**Current Usage:** Header with back button, icon, and title
**Suggested Props:**
- `onBack: () => void` - Back button callback
- `icon: ReactNode` - Icon component
- `title: string` - Page title
- `subtitle?: string` - Optional subtitle

**Suggested Implementation:**
```jsx
function PageHeader({ onBack, icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-gray-800">
      <button onClick={onBack} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all" aria-label="Go back">
        <ArrowLeft size={20} />
      </button>
      <div className="flex items-center gap-2">
        <Icon size={20} className="text-purple-400" />
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </div>
  );
}
```

**Benefits:**
- Consistent header across all pages
- Proper back navigation handling

---

## Priority Recommendations

- **High Priority:** Combobox - Appears in almost every form file with minor variations. Already exists as a shared component at `batta-app/components/ui/Combobox.js` but is duplicated in this file.

- **Medium Priority:** FormInput, StyledSelect, FileUpload - Used multiple times in this file and appear in other payroll/sales forms.

- **Low Priority:** SubmitButton, PageHeader - Single usage in this file but useful for consistency across the app.

---

## Notes

This file contains the most complete example of a form in the codebase. Refactoring this file would provide a template for all other forms in the application. The Combobox component already exists at `/batta-app/components/ui/Combobox.js` - this file's local duplicate should be removed in favor of the imported version.