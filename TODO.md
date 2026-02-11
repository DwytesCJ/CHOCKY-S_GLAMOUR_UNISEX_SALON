# Bug Fixes TODO

## Issue 1: Districts API for Market Analysis
- [x] Created `src/app/api/districts/route.ts` - Public API to retrieve distinct districts from ShippingZone table, grouped by region

## Issue 2: Login Page - Handle callbackUrl
- [x] Updated `src/app/account/login/page.tsx` - Read `callbackUrl` from URL search params via `useSearchParams()`, wrapped in `Suspense`, redirect to callbackUrl after successful login

## Issue 3: Checkout - Session-Aware (Skip Info Step if Logged In)
- [x] Updated `src/app/checkout/page.tsx` - Added `useSession()`, auto-fill user data from session, skip to Delivery step (step 2) if authenticated

## Issue 4: Cart Page - Remove Hardcoded Shipping Fee
- [x] Updated `src/app/cart/page.tsx` - Removed hardcoded 10000 UGX shipping; shows "Calculated at checkout" when not free shipping; uses `isFreeShipping` boolean based on admin threshold from settings

## Issue 5: Checkout - Fix Shipping/Free Shipping Threshold Logic
- [x] Updated `src/app/checkout/page.tsx` - Applied free shipping threshold from SiteSettings; shipping = 0 when cart exceeds threshold; fixed grandTotal math: `subtotal - couponDiscount + shipping`

## Issue 6: Orders API - Fix Data Format Mismatch
- [x] Updated `src/app/api/orders/route.ts` - Accepts checkout's data format: inline `shippingAddress` object (creates Address record), `contactInfo`, `deliveryMethod` → `shippingMethod` mapping, `shippingZoneId`, guest checkout support, flexible `orderData` building

## Issue 7: Admin Layout - Fix Auth Redirect Loop
- [x] Updated `src/app/admin/layout.tsx` - Added MANAGER/STAFF to allowed roles, encodes current pathname in callbackUrl for proper redirect after login, redirects unauthorized users to `/account` instead of `/` to prevent loop

## Progress
- All 7 issues completed ✅

## Testing Results
- ✅ `GET /api/districts` → 200, returns 47 districts, 65 zones, 4 regions
- ✅ `GET /api/districts?region=Eastern` → 200, filtered correctly (11 districts)
- ✅ `GET /api/orders` (unauthenticated) → 401 Unauthorized (correct)
- ✅ `POST /api/orders` (unauthenticated) → 401 "Please sign in to place an order" (correct)
- ✅ Orders API uses Prisma relation `connect` syntax for `user`, `address`, `shippingZone`
- ✅ Payment method mapping: `mobile_money` → `MTN_MOBILE_MONEY`/`AIRTEL_MONEY`
- ✅ Admin dashboard API dynamically calculates all stats from database

## Files Modified
1. `src/app/api/districts/route.ts` - NEW (Districts API)
2. `src/app/account/login/page.tsx` - UPDATED (callbackUrl handling)
3. `src/app/checkout/page.tsx` - UPDATED (session-aware, free shipping, payment math)
4. `src/app/cart/page.tsx` - UPDATED (removed hardcoded shipping)
5. `src/app/api/orders/route.ts` - UPDATED (data format alignment)
6. `src/app/admin/layout.tsx` - UPDATED (auth redirect fix)

## Admin Dashboard API (Verified)
- `src/app/api/admin/dashboard/route.ts` - Already properly calculates: total revenue, orders, products, customers, low stock, pending orders, appointments, growth percentages - all dynamically from database
