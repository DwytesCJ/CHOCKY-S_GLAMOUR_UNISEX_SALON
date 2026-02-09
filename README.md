# CHOCKY'S Ultimate Glamour Unisex Salon

A modern, full-stack e-commerce platform for beauty products and salon services, built with Next.js 15, Tailwind CSS, and Prisma.

![CHOCKY'S Ultimate Glamour](public/images/og-image.jpg)

## 🌟 Features

### Customer-Facing Website
- **Homepage** - Hero carousel, featured categories, flash deals with countdown timer, recently viewed products, testimonials
- **Shop** - Product catalog with sidebar filters (category, price range, brand), sorting, grid/list view toggle, pagination
- **Product Details** - Image gallery with thumbnails, delivery estimation, "Buy Now" button, reviews with star breakdown, related products
- **Order Tracking** - Visual timeline/stepper for order journey, downloadable receipts
- **Public Order Tracking** - Track orders by order number without login (`/track`)
- **Salon Services** - Service listings with stylist profiles
- **Appointment Booking** - Calendar-based booking system with email reminders
- **Blog** - Beauty tips, tutorials, and trends
- **Rewards Program** - Bronze, Silver, Gold tier loyalty system
- **User Accounts** - Registration, login, order history, wishlist, notifications
- **Shopping Cart** - Add/remove items, quantity controls
- **Checkout** - Multi-step checkout with distance-based shipping calculation (80+ Uganda town centers)
- **Wishlist** - Save favorite products
- **Email Notifications** - Order confirmations, status updates, appointment reminders via Resend

### Admin Dashboard
- **Dashboard Overview** - Revenue, orders, customers, products stats with quick actions and activity feed
- **Product Management** - Full CRUD with add product form, SKU generation, image management
- **Category Management** - Create/edit categories with parent hierarchy
- **Service Management** - Add/edit salon services with category and duration
- **Order Management** - Status updates with email notifications and tracking number input
- **Appointment Management** - Calendar/list views, time-remaining badges, color-coded urgency, auto-reminders
- **Customer Management** - Customer profiles, reward tiers
- **Blog Management** - Create/edit posts with SEO fields
- **Coupon Management** - Create discount coupons with usage limits and date ranges
- **Export System** - Export any data (products, orders, customers, etc.) to CSV or branded PDF
- **Notification Panel** - Real-time notification dropdown with categorized alerts
- **Settings** - Store settings, payment methods, distance-based shipping zones management

### Technical Features
- **Responsive Design** - Mobile-first approach, Jumia-inspired UX
- **Dark Pink Theme** - Professional color scheme (#e54d6d)
- **Smooth Animations** - Page transitions, hover effects
- **WhatsApp Integration** - Floating support button
- **UGX Currency** - Uganda Shilling formatting
- **SEO Optimized** - Meta tags, Open Graph
- **Email Service** - Transactional emails via Resend (order confirmations, receipts, reminders)
- **Cron Jobs** - Automated appointment reminders via Vercel Cron
- **PDF Generation** - Branded receipts and export reports

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Email**: Resend (transactional emails)
- **PDF**: jsPDF + jspdf-autotable
- **Icons**: Font Awesome, Lucide React
- **Deployment**: Vercel (with Cron support)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MySQL database
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/chockys-glamour.git
cd chockys-glamour
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/chockys_glamour"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxx"
RESEND_FROM_EMAIL="orders@chockys.com"

# Cron Secret
CRON_SECRET="your-cron-secret"

# Payment (Optional)
MTN_MOMO_API_KEY="your-mtn-api-key"
AIRTEL_MONEY_API_KEY="your-airtel-api-key"
PAYPAL_CLIENT_ID="your-paypal-client-id"
```

4. **Set up the database**
```bash
npx prisma db push
npx prisma db seed
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open in browser**
- Website: http://localhost:3000
- Admin: http://localhost:3000/admin

## 📁 Project Structure

```
chockys-glamour/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── public/
│   └── images/            # Static images
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── admin/         # Admin dashboard pages
│   │   ├── api/           # API routes
│   │   ├── shop/          # Shop pages
│   │   ├── salon/         # Salon pages
│   │   ├── blog/          # Blog pages
│   │   ├── account/       # User account pages
│   │   └── ...
│   ├── components/        # Reusable components
│   │   ├── layout/        # Header, Footer
│   │   ├── products/      # Product cards
│   │   └── cart/          # Cart drawer
│   ├── context/           # React contexts
│   │   ├── CartContext.tsx
│   │   └── WishlistContext.tsx
│   ├── lib/               # Utilities
│   │   ├── prisma.ts      # Prisma client
│   │   ├── auth.ts        # Auth config
│   │   ├── email.ts       # Resend email service
│   │   ├── export.ts      # CSV/PDF export utility
│   │   └── notifications.ts # Notification helpers
│   └── types/             # TypeScript types
├── .env.example           # Environment template
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🎨 Design System

### Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Primary Pink | #e54d6d | Buttons, accents |
| Dark Pink | #c73e5a | Hover states |
| Black | #1a1a1a | Text, headers |
| White | #ffffff | Backgrounds |
| Gray | #6b7280 | Secondary text |

### Typography
- **Headings**: Playfair Display
- **Body**: Montserrat

## 💳 Payment Integration

### Supported Methods
1. **MTN Mobile Money** (Uganda)
2. **Airtel Money** (Uganda)
3. **PayPal**
4. **Credit/Debit Cards**

### Configuration
Set up payment credentials in `.env`:
```env
MTN_MOMO_API_KEY=your-key
MTN_MOMO_USER_ID=your-user-id
AIRTEL_MONEY_API_KEY=your-key
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-secret
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 📊 Database Schema

Key models:
- **User** - Customer accounts with notifications
- **Product** - Product catalog with images and variants
- **Order** - Customer orders with tracking events
- **OrderTrackingEvent** - Granular order status history
- **Appointment** - Salon bookings with reminder tracking
- **ShippingZone** - Uganda town centers with distance-based rates
- **Notification** - User and admin notifications
- **Review** - Product reviews
- **CartItem** - Shopping cart
- **WishlistItem** - Saved products
- **RewardPoint** - Loyalty points
- **BlogPost** - Blog articles
- **Coupon** - Discount codes

## 🔐 Admin Access

Default admin credentials (change in production):
- Email: admin@chockys.com
- Password: admin123

## 📞 Contact

**CHOCKY'S Ultimate Glamour Unisex Salon**
- Address: Annex Building, Wandegeya, Kampala, Uganda
- Phone: +256 703 878 485
- Email: josephchandin@gmail.com
- WhatsApp: +256 703 878 485

## 📄 License

This project is proprietary software for CHOCKY'S Ultimate Glamour Unisex Salon.

---

Built with ❤️ for CHOCKY'S Ultimate Glamour
