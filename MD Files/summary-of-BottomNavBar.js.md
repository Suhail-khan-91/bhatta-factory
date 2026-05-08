# File Summary: BottomNavBar.js

**File Path:** `batta-app/components/navigation/BottomNavBar.js`

## Purpose
The `BottomNavBar.js` component is a client-side navigation utility for the Batta application. It provides a mobile-friendly bottom navigation bar for switching between core application modules and includes a secondary action menu for administrative tasks and session management.

## Key Features
- **Dynamic Navigation:** Offers quick access to five main sections: Sales, Payroll, Analytics, Master Entry, and Calculator.
- **Active State Visualization:** Automatically detects the current route and applies distinct styling (blue color, scaled icon, and a top indicator pill) to the active navigation item.
- **Top-Right Action Menu:** A persistent floating "3-dot" menu button that provides access to:
    - **Admin Panel:** Opens a modal-style settings interface.
    - **Logout:** Triggers a logout API call and redirects the user to the home page.
- **Home Page Interception:** If the user is on the root path (`/`), navigation links and the action menu trigger a custom `batta:openLogin` event instead of standard navigation, serving as a gateway for authentication.
- **Responsive & Fixed Layout:** Positioned at the bottom (for nav) and top-right (for menu) with fixed positioning to ensure accessibility across all views.

## Key Components & Structure
- **`BottomNavBar` (Default Export):** The main functional component managing state for the menu and admin panel.
- **`NAV_ITEMS`:** A configuration array containing labels, paths, and icons for each navigation link.
- **Action Buttons:**
    - `MoreVertical` (Lucide icon) triggers the dropdown menu.
    - `AdminSettings` is conditionally rendered as an overlay.
- **Link Components:** Uses Next.js `Link` for client-side routing.

## Notable Patterns
- **Custom Events:** Uses `window.dispatchEvent` with a `CustomEvent` (`batta:openLogin`) to communicate with other parts of the application (e.g., triggering a login modal in `page.js`).
- **Conditional Styling:** Uses template literals and Tailwind CSS classes to toggle styles based on the `isActive` state.
- **State Management:** Uses React's `useState` to track visibility of the dropdown menu and the Admin Settings component.

## Dependencies
- `next/navigation`: `usePathname`, `useRouter` for routing logic.
- `next/link`: For optimized client-side navigation.
- `lucide-react`: For iconography (`Calculator`, `PlusSquare`, `BarChart2`, `Wallet`, `Truck`, `MoreVertical`).
- `@/components/admin/AdminSettings`: For the administrative settings interface.
