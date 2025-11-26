# Design Guidelines: Modern Digital Marketplace

## Design Approach

**Reference-Based Approach**: Drawing inspiration from modern e-commerce platforms with premium digital product experiences:
- **Stripe** - Clean, minimal payment flows and professional aesthetic
- **Gumroad** - Digital product presentation and user dashboard patterns
- **Linear** - Sharp typography and sophisticated dark mode implementation
- **Apple Store** - Premium product card design and smooth transitions

**Core Principles**:
- Glassmorphism with depth and transparency effects
- Dark mode as default with purple/blue gradient accents
- Mobile-first responsive design (320px minimum)
- Premium, trustworthy aesthetic for payment confidence
- Smooth, subtle animations that enhance (not distract)

## Typography

**Font Stack**:
- **Primary**: Inter or Geist (clean, modern sans-serif via Google Fonts)
- **Accent**: Space Grotesk for headings and CTAs (optional geometric flair)

**Hierarchy**:
- Hero Headlines: text-4xl md:text-6xl font-bold with tight leading
- Section Headings: text-2xl md:text-4xl font-semibold
- Product Titles: text-lg md:text-xl font-medium
- Body Text: text-base leading-relaxed
- Captions/Meta: text-sm text-gray-400
- Buttons: text-sm md:text-base font-medium uppercase tracking-wide

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 20** for consistency
- Component padding: p-4 to p-8
- Section spacing: py-12 md:py-20
- Card gaps: gap-4 md:gap-6
- Button padding: px-6 py-3

**Grid System**:
- Mobile: Single column (grid-cols-1)
- Tablet: 2 columns for products (md:grid-cols-2)
- Desktop: 3-4 columns (lg:grid-cols-3 xl:grid-cols-4)
- Max container width: max-w-7xl mx-auto px-4

**Responsive Breakpoints**:
- Mobile: 320px-768px (default, bottom nav, hamburger menu)
- Tablet: 768px-1024px (md:)
- Desktop: 1024px+ (lg: and xl:)

## Color & Visual Treatment

**Dark Mode Foundation** (as specified):
- Background: Deep dark gradient (gray-950 to gray-900)
- Cards/Surfaces: Glassmorphism with backdrop-blur-lg and bg-white/5 to bg-white/10
- Borders: border-white/10 to border-white/20

**Purple/Blue Gradient Accents** (as specified):
- Primary CTAs: bg-gradient-to-r from-purple-600 to-blue-600
- Hero backgrounds: Subtle purple/blue gradient overlays
- Hover states: Intensified gradient with brightness increase
- Active badges: Purple/blue glows with shadow-lg shadow-purple-500/50

**Payment Method Icons**:
- Full-color logos for PayPal, GCash, Binance (maintain brand recognition)
- White/light versions for dark backgrounds

## Component Library

### Navigation
**Desktop Header**:
- Fixed top navigation with glassmorphism (backdrop-blur-md bg-gray-900/80)
- Logo left, nav links center, cart/profile icons right
- Height: h-16 to h-20

**Mobile Bottom Nav**:
- Fixed bottom bar with 4-5 icons (Home, Store, Cart, Profile, More)
- h-16 with safe-area-inset-bottom
- Active state: gradient underline or icon color shift

### Product Cards
- Aspect ratio 4:3 or 1:1 for product images
- Glassmorphism card: rounded-xl border border-white/10 bg-white/5 hover:bg-white/10
- Stock badge: Absolute positioned top-right with rounded-full bg-green-500/90
- Price: Large, bold with currency symbol
- Hover: Subtle lift with shadow-xl and scale-105 transform

### Buttons
**Primary CTA** (gradient):
- px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600
- Hover: brightness-110 scale-105
- Active: brightness-90

**Secondary**:
- border border-white/20 bg-white/5 hover:bg-white/10

**Ghost/Text**:
- text-gray-400 hover:text-white

**Touch Targets**: Minimum 44px height for mobile

### Forms
- Input fields: bg-white/5 border border-white/10 rounded-lg px-4 py-3
- Focus: border-purple-500 ring-2 ring-purple-500/20
- Labels: text-sm text-gray-400 mb-2

### Dashboard Cards
- Glassmorphism with rounded-xl
- Click-to-reveal credentials: Initially blurred (blur-sm) with "Click to reveal" overlay
- Copy buttons: Small icon buttons with toast notification on success

### Payment Method Selection
- Large clickable cards (min-h-24) with payment logo, name, and badge
- Selected state: border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20
- QR codes: bg-white p-4 rounded-lg for contrast

### Admin Panel
- Sidebar: w-64 with glassmorphism, collapsible on mobile
- Data tables: Striped rows with hover:bg-white/5
- Stats cards: Gradient borders with metric numbers in large, bold text

## Animations (Framer Motion)

**Page Transitions**:
- Fade in with slight y-offset (y: 20 to y: 0)
- Duration: 0.3s ease-out

**Product Cards**:
- Hover: scale: 1.05, y: -4 with shadow transition
- Stagger children in grids (staggerChildren: 0.05)

**Cart Slide-out**:
- Slide from right: x: "100%" to x: 0
- Overlay fade: opacity: 0 to opacity: 1

**Skeleton Loaders**:
- Shimmer animation with gradient moving left to right

**Minimal Distractions**:
- No auto-playing carousels
- No excessive scroll-triggered animations
- Focus on micro-interactions (button hovers, card lifts)

## Images

**Hero Section**: 
- Large, high-quality hero image showing digital products/devices with gradient overlay
- Image: Full-width, min-height 70vh on desktop, 50vh on mobile
- Overlay: bg-gradient-to-r from-purple-900/80 to-blue-900/80 for text readability
- Buttons on hero: backdrop-blur-md bg-white/10 for glass effect

**Product Images**:
- Consistent aspect ratio (4:3 recommended)
- Use Next.js Image component with lazy loading
- Placeholder: Skeleton with shimmer animation

**Payment Logos**:
- Official PayPal, GCash, Binance logos in designated sections
- Display inline with "We Accept" text

**No custom SVG generation** - use Heroicons or Font Awesome via CDN for all interface icons