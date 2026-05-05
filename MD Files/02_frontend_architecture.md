# Phase 2: Mobile Frontend Architecture & Feature Blueprint

## Global UI Layout
* **Design System:** Mobile-First design. Everyone uses mobile Chrome, so the layout will look and function like a native mobile app (like Instagram).
* **Navigation:** Fixed Bottom Navigation Bar with 5 tab icons always visible.

------

## Tab 1: The Calculator (Leftmost Button)
* **Function:** A built-in, complex calculator for quick on-site math.
* **Architecture:** 100% Client-Side rendering. It runs entirely on the user's phone CPU. Zero cloud CPU usage and zero server cost.
* **Features:**
  * Standard calculation interface.
  * Extended "History" log showing past calculations so users can review what they just added up.

------

## Tab 2: Master Entry (Operations Data)
* **Function:** The primary input hub for daily factory operations. Accessible by Admin/Master.
* **UI Layout:** A page filled with multiple Square Buttons for different entry types.
* **Square Button A: Fuel Input**
  * Opens a form to record newly bought fuel.
  * Fields: Liters bought, Gas station name, Purchaser name, Total price, Receipt/Bill photo upload.
* **Square Button B: Fuel Output**
  * Opens a form to record where fuel was used.
  * Fields: Amount used (liters), Target machine/vehicle dropdown (JCB, Tractor_1, etc.), Date/Time (Auto-fills to current time, but can be set manually).
* **Square Button C: Raw Bricks Count**
  * Flow: Opens a master list of all ~34 production teams.
  * List View: Shows Team Number, Team Name (e.g., "Raju Team"), and Location (e.g., "Near Chimni", "Near Jungle").
  * Action: Clicking a specific team opens their entry page.
  * Team Page: Form to enter how many bricks they made that day. Includes a "History Box" button on the same screen to quickly see their past production. After saving, it returns to the master list to select the next team.
* **Square Button D: Employee Profile Create**
  * Function: Onboarding new workers.
  * Employee Type Dropdown: Jhokwa (fires bricks), Drivers, Bharae wala (puts bricks in bhatti), Coal picker, Rabbis spreader (sand), General.
  * Detail Fields: Name, Gender, Religion, Age, Home City/Village name, Main Boss/Contractor name, Joining date.
  * Document Upload: Photo upload for Aadhar Card, PAN, or Bank Passbook.

------

## Tab 3: Stats & Analytics (Dashboard)
* **Function:** Visual representation of factory operations. Read-only view.
* **UI Layout:** A page with multiple Rectangle Buttons.
* **Rectangle Button A: Fuel Stats**
  * **Smart Button UI:** The button *itself* displays a progress bar (1% to 100%) showing how much of the current fuel slot is left, without even needing to click it.
  * **Current Slot View (When Clicked):**
    * Shows the recent purchase (e.g., "50 Liters bought yesterday").
    * Lists exactly where it is going daily (e.g., Yesterday: JCB 5L, Tractor_1 3L. Today: JCB 5L, Icer machine 5L).
    * Calculates and displays remaining fuel (e.g., 50L - 39L = 11L remaining).
  * **Previous Slots View:**
    * A scrollable list of older slots. Heading shows: Purchaser, Date, Amount (e.g., "Bade Abbu - 25 March - 55L").
    * Clicking a slot expands it to show vehicle breakdown (JCB used 20L, etc.) and a day-by-day usage breakdown.
  * **Global Filters:** Buttons at the top to view fuel usage by Week, Month, or by specific machine.
* **Rectangle Button B: Raw Bricks Count Stats**
  * Visualizes total bricks made.
  * Filters: View by specific team, by week, by month, custom date range (X to Y date), or just the most recent update by the Master.
* **Rectangle Button C: [Reserved for future data]**

------

## Tab 4: Salary & Payroll (Detailed Entry & History)
* **Function:** Comprehensive management of worker payouts, advances, custom gigs, and pending balances.
* **UI Layout:** A dedicated page with 6 distinct action buttons (Button A through F).

* **Button A: Give Salary (Regular Payouts)**
  * **Flow:** Select Employee Type -> Select Pay Frequency (Weekly/Monthly) -> Select Employee Name.
  * **Display Info:** Shows fixed salary amount, last week's payment status, total paid to date, and automatically subtracts any Advanced Payments (from Button C).
  * **Entry Fields:** * Amount to Pay: Select the fixed amount OR enter a manual amount.
    * Paid By: Dropdown (Master, Uncle, etc.).
    * Payment Mode: Cash, Online, etc.
  * **Database Logic:** If the manual amount given is *less* than what they are owed, the system automatically sends the unpaid difference to the "Pending Salary" database.

* **Button B: Pending Salary (Clearing Dues)**
  * **Function:** Specifically for paying off leftover balances when an employee was given less salary previously.
  * **Flow:** Select Employee Type -> Select Pay Frequency -> Select Employee Name.
  * **Display Info:** Shows the exact pending amount owed (e.g., Fixed Salary minus Amount Given Last Time).
  * **Entry Fields:** Amount being cleared today, Paid By, Payment Mode, Date/Time.

* **Button C: Advanced Payment (Early Pay)**
  * **Function:** Issue money before the official payday. Acts as a strict subtractor for Button A.
  * **Flow:** Select Employee Type -> Select Pay Frequency -> Select Employee Name.
  * **Entry Fields:** Advance Amount, Date/Time, Paid By, Payment Mode.
  * **Database Logic:** Strictly links to Button A. If salary is ₹2000 and the employee takes ₹5000 advance, Button A will show ₹0 to pay on the upcoming Tuesday, and will carry over the remaining ₹3000 deduction to the *next* Tuesday automatically.

* **Button D: Set Salary Database (Master Configuration)**
  * **Function:** Defines the base pay for every worker. This is the foundation that Buttons A, B, and C use to calculate math.
  * **Flow:** Select Employee Type -> Select Pay Frequency -> Select Employee Name.
  * **Entry Fields:** Enter the "Fixed Salary Rate" for that specific employee.

* **Button E: Extra Work Salary (Overtime / Custom Tasks)**
  * **Function:** Pay workers for side tasks done in their free time.
  * **Flow:** Search Employee Name (auto-completes from existing database OR allows typing a manual name for temporary workers).
  * **Entry Fields:**
    * Work Description: Text input (e.g., "Cleaned the water tank").
    * Agreed Amount: Total deal price for the task.
    * Amount Given: How much is being handed over right now.
    * Paid By, Payment Mode, Date/Time.

* **Button F: History & Stats (Analytics)**
  * **Function:** Multi-view dashboard for all money movement.
  * **Filters/Views:**
    * *Normal Payment History:* Log of all standard salaries given via Button A.
    * *Advanced Payment History:* List of who took early money, when, and how much.
    * *Pending Payment History:* Shows who was paid less (who is currently owed money) and logs of when previous pending dues were cleared.
    * *Extra Work History:* Log of all side-gigs and overtime payouts.

------

## Tab 5: Brick Sales (Revenue & Dispatch)
* **Function:** Combined Entry and History page tracking outbound sales.
* **Button A: Entry Mode (Sales Form):**
  * Quantity: Number of bricks & Number of Trawlis.
  * Price per Trawli: Fixed at 14k by default, editable for bargained discounts.
  * Brick Category Dropdown: Red, Yellow, Broken.
  * Customer Details: Name, Mobile number, Delivery address.
  * Lead Source (Who brought customer): Dropdown (Soheab, Uncle, Bade Abbu, Dad, Pardhan, Master) + Manual typing option.
  * Salesperson: Who finalized the sale.
  * Delivery Driver: Dropdown populated from the employee list.
  * Date/Time: Auto-filled, manually editable.
  * Payment Details: Method (Cash, Cheque, UPI Online) and Who received the payment.
* **Button B: Stats & History Mode:**
  * Leaderboard: Who brought in the most customers/sales.
  * Time Filters: Sales this week, month, recent sales, total overall sales.
  * Pricing Analytics: How many trawlis sold at the full 14k rate vs. discounted 13.5k rate.
  * Revenue: Total earnings calculated.