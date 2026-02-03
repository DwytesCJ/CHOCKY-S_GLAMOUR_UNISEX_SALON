# CHOCKY'S Ultimate Glamour Unisex Salon

A modern, full-stack e-commerce platform for beauty products and salon services, built with Next.js 15, Tailwind CSS, and Prisma.

![CHOCKY'S Ultimate Glamour](public/images/og-image.jpg)

## 🌟 Features

### Customer-Facing Website
- **Homepage** - Hero carousel, featured categories, new arrivals, testimonials
- **Shop** - Product catalog with filters, sorting, and pagination
- **Product Details** - Image gallery, variants, reviews, related products
- **Salon Services** - Service listings with stylist profiles
- **Appointment Booking** - Calendar-based booking system
- **Blog** - Beauty tips, tutorials, and trends
- **Rewards Program** - Bronze, Silver, Gold tier loyalty system
- **User Accounts** - Registration, login, order history, wishlist
- **Shopping Cart** - Add/remove items, quantity controls
- **Checkout** - Multi-step checkout with multiple payment options
- **Wishlist** - Save favorite products

### Admin Dashboard
- **Dashboard Overview** - Revenue, orders, customers, products stats
- **Product Management** - CRUD operations, inventory tracking
- **Order Management** - Order processing, status updates
- **Appointment Management** - Calendar and list views
- **Customer Management** - Customer profiles, reward tiers
- **Settings** - Store settings, payment methods, shipping zones

### Technical Features
- **Responsive Design** - Mobile-first approach
- **Dark Pink Theme** - Professional color scheme (#e54d6d)
- **Smooth Animations** - Page transitions, hover effects
- **WhatsApp Integration** - Floating support button
- **UGX Currency** - Uganda Shilling formatting
- **SEO Optimized** - Meta tags, Open Graph

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **Deployment**: Vercel

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
│   │   └── auth.ts        # Auth config
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
- **User** - Customer accounts
- **Product** - Product catalog
- **Order** - Customer orders
- **Appointment** - Salon bookings
- **Review** - Product reviews
- **CartItem** - Shopping cart
- **WishlistItem** - Saved products
- **RewardPoint** - Loyalty points
- **BlogPost** - Blog articles

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
