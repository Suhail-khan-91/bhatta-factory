# Master Entry Data Schema

This document maps out the data structures and exact payloads collected during the Master Entry operations, derived from the frontend forms (`FuelInputForm`, `FuelOutputForm`, and `BricksCountManager`). These schemas will be essential for building the Analytics tab and database integration.

## 1. Fuel Operations

### Fuel Input (Adding Fuel to Tank)
When fuel is purchased and added to the stock, a **Fuel Slot** is created. This allows for tracking specific fuel purchases and their remaining balances.

**Source Component:** `FuelInputForm.js`

**State Variables:**
- `liters_bought` (String -> Number)
- `station_name` (String)
- `purchaser_name` (String, default: "Master")
- `total_cost` (String -> Number)
- `purchase_date` (String, YYYY-MM-DD format)
- `receipt_image` (File object)

**Data Payload (`fuel_slots` table equivalent):**
```javascript
{
  liters_bought: Number,     // Total liters purchased
  liters_remaining: Number,  // Initially set equal to liters_bought
  station_name: String,      // Name of the petrol pump
  purchaser_name: String,    // Who purchased it
  total_cost: Number,        // Total cost in ₹
  purchase_date: String,     // ISO timestamp including current time (e.g., "2023-10-25T14:30:00.000Z")
  receipt_image_url: null    // To be updated after image upload
}
```

### Fuel Output (Giving Fuel to Machine)
When fuel is given to a specific vehicle or machine from the stock.

**Source Component:** `FuelOutputForm.js`

**State Variables:**
- `machine_name` (String)
- `liters_used` (String -> Number)
- `given_by` (String, default: "Master")
- `usage_date` (String, YYYY-MM-DD format)
- `usage_time` (String, HH:MM format)

**Data Payload (`fuel_usage_logs` table equivalent):**
```javascript
{
  machine_name: String,  // Target machine/vehicle name (e.g., "JCB", "Tractor_1")
  liters_used: Number,   // Amount given in liters
  given_by: String,      // Who gave the fuel
  usage_date: String,    // ISO timestamp combining usage_date and usage_time
  logged_by: "Master"    // System/User logging the entry
}
```

---

## 2. Production/Bricks

The bricks tracking is split into two parts: defining the production teams and logging their daily counts.

### Team Creation
Defining a new team of workers that produces bricks.

**Source Component:** `BricksCountManager.js` (CreateTeamForm)

**State Variables:**
- `teamName` (String)
- `locationTag` (String)

**Data Payload (Team entity):**
```javascript
{
  id: String,           // Temporary timestamp on client, will be UUID in DB
  team_number: Number,  // Auto-incremented number (max existing + 1)
  team_name: String,    // Name of the team (e.g., "Raju Team")
  location_tag: String  // Where they work (e.g., "Near Chimni")
}
```

### Daily Bricks Entry
Logging the number of bricks produced by a specific team on a given day.

**Source Component:** `BricksCountManager.js` (TeamEntryForm)

**State Variables:**
- `bricks` (String -> Number)
- `date` (String, YYYY-MM-DD format)

**Data Payload (Daily Production Log):**
```javascript
{
  team_id: String,       // ID of the team
  team_number: Number,   // Team number
  team_name: String,     // Name of the team
  bricks_count: Number,  // Amount of bricks produced
  entry_date: String,    // Date of production (YYYY-MM-DD)
  logged_by: "Master"    // System/User logging the entry
}
```