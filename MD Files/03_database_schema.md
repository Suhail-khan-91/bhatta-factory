# Phase 3: Core Database Schema (PostgreSQL / Supabase)
*Note: This covers the foundation needed to make Tab 2 and Tab 3 functional for Fuel and Personnel.*

## Table 1: `app_users` (System Access)
*Stores the predefined logins for the Owner, Master, and Viewers.*
* `id` (uuid, primary key)
* `username` (text, unique) - e.g., 'Owner', 'Master', 'Viewer 1'
* `role` (text) - 'admin' or 'viewer'
* `created_at` (timestamp, default now)

## Table 2: `employees` (Worker Profiles)
*Used in Tab 2 (Employee Onboarding) and later for Salary (Tab 4).*
* `id` (uuid, primary key)
* `full_name` (text)
* `employee_category` (text) - e.g., 'Jhokwa', 'Driver', 'General'
* `pay_frequency` (text) - 'weekly' or 'monthly'
* `base_salary` (numeric) - Default fixed salary amount
* `boss_contractor_name` (text) - Who brought them to the factory
* `home_city` (text)
* `document_url` (text) - Link to Cloudflare R2 image of Aadhar/PAN
* `joining_date` (date)
* `is_active` (boolean, default true)

## Table 3: `production_teams` (Raw Bricks Teams)
*Used in Tab 2 (Bricks Count).*
* `id` (uuid, primary key)
* `team_number` (integer, unique)
* `team_name` (text) - e.g., 'Raju Team'
* `location_tag` (text) - e.g., 'Near Chimni'
* `is_active` (boolean, default true)

## Table 4: `fuel_slots` (Fuel Input / Purchases)
*Used in Tab 2 (Fuel Input) and Tab 3 (Current/Previous Slots).*
* `id` (uuid, primary key)
* `purchase_date` (timestamp)
* `liters_bought` (numeric)
* `liters_remaining` (numeric) - Auto-updates when output is logged
* `station_name` (text)
* `purchaser_name` (text)
* `total_cost` (numeric)
* `receipt_image_url` (text) - Link to Cloudflare R2
* `logged_by` (text) - Stores 'Master' or 'Owner' for the Audit Trail

## Table 5: `fuel_usage_logs` (Fuel Output)
*Used in Tab 2 (Fuel Output) and Tab 3 (Machine Breakdown).*
* `id` (uuid, primary key)
* `slot_id` (uuid, foreign key -> `fuel_slots.id`) - Ties usage to a specific purchase
* `machine_name` (text) - e.g., 'JCB', 'Tractor_1'
* `liters_used` (numeric)
* `usage_date` (timestamp)
* `logged_by` (text) - Stores 'Master' or 'Owner'
* `is_edited` (boolean, default false) - For the Edit System trail