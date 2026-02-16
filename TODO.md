# Chocky's Glamour - Bug Fixes TODO

## Issues to Fix

### 1. Booking Page - Login Screen Issue
- [x] Check if login screen appears in details section when already logged in
- [x] Verify session handling in booking page
- [x] Auto-fill form data from session when logged in
- **Status: FIXED** - Booking page uses useSession, auto-fills data, no login prompt

### 2. Appointments Not Appearing After Booking
- [x] Verify appointments API returns user's appointments
- [x] Check if appointments are being saved correctly
- [x] Verify account page fetches and displays appointments
- [x] Fixed field name mismatch (contactName vs customerName)
- [x] Made userId optional for guest bookings
- [x] Added contactName, contactEmail, contactPhone to schema
- **Status: FIXED** - Schema updated, API fixed, db pushed

### 3. Before/After Gallery in Admin Panel
- [x] Check if Gallery model exists in schema
- [x] Create admin page for gallery management
- [x] Create API endpoints for gallery CRUD
- **Status: FIXED** - Gallery model added, admin page created, APIs created

### 4. Hot Deals Button Not Working
- [x] Fix navigation dropdown Hot Deals link
- [x] Ensure proper routing to hot deals section
- [x] Added onClick handler to close mega menu
- [x] Added mobile menu Hot Deals link
- **Status: FIXED** - Header.tsx updated with working Hot Deals links

### 5. Discount/Flash Deal/Free Delivery Functionality
- [x] Implement promotion auto-apply in checkout
- [x] Add FREE_SHIPPING coupon type handling
- [x] Ensure discounts reflect in payment calculations
- [x] Created /api/promotions/active endpoint
- [x] Updated coupon validation to return freeShipping flag
- **Status: FIXED** - Checkout page updated with promo/points/free shipping

### 6. Payment Math Issues
- [x] Fix string concatenation issues with Decimal fields
- [x] Ensure coupon discounts are properly calculated
- [x] Verify grand total calculation
- [x] Added Number() casts throughout checkout
- [x] Fixed CartContext localStorage normalization
- **Status: FIXED** - All calculations use Number() casts

### 7. Rewards Page Not Functional
- [x] Fix login prompt when already logged in
- [x] Display user points and tier
- [x] Make page fully dynamic with admin panel controls
- [x] Created /api/rewards/points endpoint
- [x] Rewrote rewards page with session-aware dashboard
- **Status: FIXED** - Full rewards dashboard with tabs, redemption, FAQ

### 8. Admin Panel Editability
- [x] Ensure all reward settings are editable via admin
- [x] Points earn rates adjustable
- [x] Tier thresholds configurable
- [x] Created /api/admin/rewards/settings endpoint
- [x] Created admin rewards page with tier CRUD
- [x] Added Gallery to admin menu
- **Status: FIXED** - Admin rewards and gallery pages created

## Summary
All 8 issues have been addressed. Database schema updated and pushed.
