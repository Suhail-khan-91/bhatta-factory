# Phase 1: Authentication, Security, & Core System Architecture

## 1. User Roles & Accounts (Pre-defined)
* **System Type:** Closed system. NO Sign-up page. Accounts are manually seeded into the database.
* **Roles:**
    * `Admin`: Can Create, Read, Update, Delete (CRUD).
    * `Viewer`: Strictly Read-Only.
* **Identities (7 Total):**
    * Admin 1: `Owner` (Uncle) - Has ultimate authority, can approve/reject, can force logout.
    * Admin 2: `Master` (Factory Manager) - Handles daily data entry.
    * Viewers: `Viewer 1`, `Viewer 2`, `Viewer 3`, `Viewer 4`, `Viewer 5`.

## 2. Login Flow & Session Management
* **Step 1:** User selects Role (`Admin` or `Viewer`).
* **Step 2:** User selects Identity from a dropdown.
    * *Constraint:* The dropdown MUST NOT show Identities that are currently logged in.
* **Step 3:** User enters the specific password for that Identity.
* **Strict Single-Session Logic:** * When an Identity logs in, an entry is created in an `Active_Sessions` database table.
    * If someone attempts to log in with an Identity already in `Active_Sessions`, the system blocks it and shows: "Identity is already in use."
    * Sessions persist via secure cookies/tokens until the user explicitly clicks "Log Out" (which removes them from the `Active_Sessions` table).

## 3. Owner-Exclusive Security Dashboard
* **Location Tracking:** When a user logs in, the system grabs their IP address and uses a free Geolocation API to store their approximate location (City/Region).
* **Active Logins View:** The `Owner` dashboard has a "Security" tab showing a list of everyone currently logged in, their location, and login time.
* **Force Logout:** The `Owner` has a button next to each active user to "Revoke Session." This deletes their token from the `Active_Sessions` table, instantly kicking them out of the app.

## 4. Audit Trail (Visual Indicators)
* Every data table in the database includes an `updated_by` column.
* **UI Rules:**
    * If `updated_by` == 'Master', render a **Blue Circle** icon next to the data.
    * If `updated_by` == 'Owner', render a **Red Circle** icon next to the data.
    * Hovering over the circle shows text: "Created/Updated by [Identity]".

## 5. Two-Way Approval System (Critical Operations)
* For sensitive data (e.g., Salary/Payroll), changes made by the `Master` do not immediately update the official ledger.
* **Workflow:**
    * Master submits salary payment.
    * Database records the entry with `status = 'pending_approval'`.
    * Owner sees a notification/dashboard for "Pending Actions."
    * Owner clicks "Accept."
    * Database updates to `status = 'approved'`, making it official.

## 6. Edit System & UI Safety
* **Inline Editing:** All submitted entries feature an "Edit" option for authorized roles to correct data entry mistakes directly on the page.
* **Edit Constraints (Strict Limits):**
    * **Time Limit:** Entries cannot be edited if they are too old (e.g., locked 48 hours after creation).
    * **Count Limit:** A single entry can be edited a maximum of 3 times. After the 3rd edit, the edit button is permanently disabled for that row.
* **The "Edited" Audit Trail:** * When a row is modified after its initial creation, the database updates an `is_edited` boolean column to `true`.
    * The UI displays an *(Edited)* tag next to the data (similar to WhatsApp).
    * The visual tracking remains: A **Blue Circle** shows if it was edited by the Master, and a **Red Circle** if edited by the Owner.
* **Action Friction (Preventing Accidents):**
    * For the Owner's Approval dashboard, the "Accept" button is large, green, and primary.
    * The "Decline" or "Reject" option is intentionally hidden behind a dropdown menu (e.g., clicking a 3-dot icon or down-arrow) to completely eliminate accidental rejections.