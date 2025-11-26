# Ultimata Shop - Digital Marketplace

## Overview

Ultimata Shop is a modern digital marketplace built for selling digital products (gaming accounts, streaming accounts, combo lists) and offering custom development services. The platform features a premium glassmorphism design with dark mode as default, PayPal payment integration, and a comprehensive admin panel for managing products, orders, users, and discounts.

**Key Technologies:**
- Frontend: React + TypeScript + Vite
- Backend: Express.js + Node.js
- Database: PostgreSQL (via Neon serverless)
- ORM: Drizzle
- UI Framework: Tailwind CSS + shadcn/ui (Radix UI components)
- Authentication: Session-based (email/password)
- Payment: PayPal SDK
- State Management: TanStack Query (React Query)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Organization:**
- Page-based routing using Wouter (lightweight React router)
- Shared UI components in `/client/src/components/ui/` using shadcn/ui library
- Feature components in `/client/src/components/` (Header, Footer, ProductCard, etc.)
- Pages in `/client/src/pages/` for each route
- Mobile-first responsive design (320px minimum width)

**State Management:**
- TanStack Query for server state and API calls
- Custom hooks for authentication (`useAuth`) and toast notifications
- Session-based authentication state maintained via cookies
- Query invalidation pattern for real-time data updates after mutations

**Design System:**
- Dark mode as default with light mode toggle capability
- Glassmorphism UI with purple/blue gradient accents
- Tailwind CSS with custom theme configuration
- Inter font family for typography
- Consistent spacing primitives (2, 4, 6, 8, 12, 16, 20)

**Rationale:** React Query eliminates the need for complex state management while providing built-in caching, refetching, and optimistic updates. The component library approach (shadcn/ui) allows for customization while maintaining consistency.

### Backend Architecture

**Express.js Server Structure:**
- `/server/app.ts` - Main Express application setup
- `/server/routes.ts` - API route definitions and middleware
- `/server/storage.ts` - Database abstraction layer (storage interface)
- `/server/emailAuth.ts` - Email/password authentication endpoints
- Separate dev and prod entry points for different serving strategies

**API Design:**
- RESTful endpoints organized by resource
- Session-based authentication with express-session
- Role-based access control (user/admin roles)
- Raw body buffering for webhook verification
- CORS and security middleware

**Authentication Flow:**
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Password hashed with bcryptjs (10 salt rounds)
3. Session created and stored in PostgreSQL sessions table
4. Session ID stored in HTTP-only cookie
5. Protected routes check session via middleware

**Rationale:** Session-based auth chosen over JWT for better security (server-side revocation), simpler implementation, and automatic session cleanup. The storage interface pattern allows swapping database implementations without changing route logic.

### Data Storage

**Database Schema (PostgreSQL via Drizzle ORM):**

**Core Tables:**
- `users` - User accounts with email/password, role (user/admin), profile data
- `sessions` - Express session storage (required for session middleware)
- `products` - Digital products with type (account/combo), pricing, stock, categories
- `categories` - Product categorization
- `cartItems` - Shopping cart with user-product-quantity relationships
- `orders` - Purchase records with payment status, totals, currency
- `orderItems` - Line items within orders
- `discountCodes` - Coupon codes with percentage, usage limits, product applicability
- `credentialsPool` - Account credentials (username/password) linked to products

**Enums:**
- `user_role` - user | admin
- `product_type` - account | combo
- `product_status` - active | draft
- `payment_method` - paypal | gcash | binance
- `payment_status` - pending | paid | failed | refunded
- `order_status` - pending | processing | completed | cancelled

**Key Relationships:**
- Products belong to categories (many-to-one)
- Cart items link users to products with quantities
- Orders contain multiple order items
- Discount codes can apply to all or specific products
- Credentials pool entries belong to products

**Rationale:** Drizzle ORM provides type-safe database queries with minimal runtime overhead. The schema supports complex e-commerce features (cart, orders, discounts) while maintaining flexibility for digital product delivery (credentials, file URLs). Using enums ensures data integrity at the database level.

### External Dependencies

**PayPal Integration:**
- SDK: `@paypal/paypal-server-sdk`
- Purpose: Payment processing for digital product purchases
- Implementation: Checkout flow initiated from frontend, orders created server-side
- Status: Configured for sandbox/test mode

**Neon Database:**
- PostgreSQL serverless database with WebSocket support
- Connection pooling via `@neondatabase/serverless`
- Environment variable: `DATABASE_URL`
- WebSocket constructor injected for serverless compatibility

**Shadcn/UI Component Library:**
- Radix UI primitives (`@radix-ui/*` packages)
- Pre-built accessible components (Dialog, Select, Toast, etc.)
- Customized via Tailwind CSS and CSS variables
- Configuration in `components.json`

**Google Drive Integration:**
- SDK: `googleapis` for Node.js
- Purpose: Cloud file storage for digital product downloads (15GB free tier, lifetime)
- Implementation: 
  - Service account authentication using `GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON` environment secret
  - File upload to Google Drive via `/api/admin/upload-file` endpoint (admin only)
  - Secure download links generated for authenticated users who purchased the product
  - File metadata (fileId, fileName, fileSize) stored in `products` table
- Features:
  - `uploadFileToDrive()` - Uploads files from FormData to Google Drive
  - `getFileDownloadLink()` - Generates shareable download links
  - `deleteFileFromDrive()` - Removes files from Google Drive
  - Download access validated: Users must be authenticated AND have purchased the product

**Third-Party Services:**
- Google Fonts (Inter, JetBrains Mono) loaded via CDN
- Google Drive API for file storage and downloads
- Payment gateways: PayPal (active), GCash/Binance (mentioned but not implemented)

**Development Tools:**
- Vite for frontend bundling and HMR
- Drizzle Kit for database migrations
- ESBuild for backend bundling
- Multer for file upload handling
- Replit-specific plugins for development environment

**Rationale:** PayPal chosen as primary payment gateway due to widespread adoption and robust SDK. Neon provides scalable PostgreSQL with serverless benefits (auto-scaling, branching). Google Drive chosen for file storage offering 15GB free tier with no expiration. Shadcn/ui offers pre-built accessible components that can be customized without being locked into a component library.