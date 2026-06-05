# 🛒 EcomStore - Frontend

A modern, fully-featured ecommerce frontend built with **React 19**, **Redux Toolkit**, **Tailwind CSS**, and **Framer Motion**.

🔗 **Backend Repository:** [ecom-store-backend](https://github.com/amirreza-ansari/ecom-store-backend)

---

## 🚀 Features

### 🏠 Storefront

- Professional landing page with animated hero sections
- Product grid with hover effects & quick add-to-cart
- Advanced filtering, search, sorting & pagination
- Product detail page with variants & image gallery
- Autocomplete search dropdown with keyboard navigation
- Category hierarchy with subcategory support
- Trust badges & stats counters

### 🛒 Shopping Experience

- Shopping cart with quantity controls
- Coupon code application & removal
- Wishlist with add/remove functionality
- Checkout with address management (CRUD)
- Mock payment form with card validation
- Order history with status tracking
- PDF invoice download
- Order cancellation

### 👤 User Account

- Login/Register modals with validation
- Password reset flow with email
- Email verification
- Profile management (name, email, password)
- Address CRUD operations
- Protected routes with auth persistence

### ⭐ Reviews System

- Interactive star rating
- Create, edit, delete reviews
- Helpful vote system
- Review pagination

### 📊 Admin Dashboard

- Revenue analytics with animated bar chart
- Stats cards with count-up animation
- Product management (CRUD + image upload)
- Category management (hierarchical tree)
- Order management (status transitions + tracking)
- User management (view, deactivate, delete)
- Coupon management (CRUD + usage stats)
- Inventory management (stock updates + low stock alerts)

### 💬 Live Chat

- Floating chat widget (customer side)
- Real-time 5-second polling
- Admin chat dashboard
- Auto-assign conversations
- Unread message badges
- Close conversation

### 🎨 UI/UX

- Skeleton loaders (products, orders, tables)
- Page transitions with Framer Motion
- Staggered list animations
- Sticky header with shrink effect
- Announcement bar (auto-hide on scroll)
- Animated stat counters
- Toast notifications
- Fully responsive (mobile-first)
- 404 Not Found page

### 🛡️ Error Handling

- Global error states
- Loading states for all async operations
- Form validation feedback
- Network error handling
- Auth error redirect

---

## 🏗️ Tech Stack

| Category         | Technology                 |
| ---------------- | -------------------------- |
| Framework        | React 19                   |
| Build Tool       | Vite                       |
| State Management | Redux Toolkit              |
| Routing          | React Router v6            |
| Styling          | Tailwind CSS               |
| Animations       | Framer Motion              |
| HTTP Client      | Axios                      |
| Icons            | React Icons (Heroicons v2) |
| Notifications    | React Hot Toast            |
| Forms            | React Hook Form            |
| Cookies          | js-cookie                  |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── store.js              # Redux store configuration
│   └── hooks.js              # Custom Redux hooks
│
├── components/
│   ├── layout/
│   │   ├── Header.jsx        # Main header with nav & search
│   │   ├── Footer.jsx        # Site footer
│   │   ├── AdminLayout.jsx   # Admin dashboard layout
│   │   ├── AdminSidebar.jsx  # Admin sidebar navigation
│   │   ├── AdminHeader.jsx   # Admin top header
│   │   └── CustomerLayout.jsx # Main site layout wrapper
│   ├── shared/
│   │   ├── ProtectedRoute.jsx # Auth guard for private routes
│   │   └── AdminRoute.jsx     # Admin-only route guard
│   └── ui/
│       ├── Button.jsx         # Reusable button component
│       ├── Input.jsx          # Form input with validation
│       ├── Modal.jsx          # Generic modal component
│       ├── Spinner.jsx        # Loading spinner
│       ├── Skeleton.jsx       # Skeleton loader
│       ├── Badge.jsx          # Status badge
│       ├── StarRating.jsx     # Interactive star rating
│       ├── PriceDisplay.jsx   # Price with discount
│       ├── SearchBar.jsx      # Autocomplete search
│       ├── Pagination.jsx     # Page navigation
│       ├── EmptyState.jsx     # Empty state placeholder
│       ├── QuantitySelector.jsx # +/- quantity control
│       ├── PageTransition.jsx  # Framer Motion wrapper
│       ├── StaggerList.jsx     # Staggered animation list
│       ├── FadeIn.jsx          # Fade-in animation
│       ├── Illustration.jsx    # SVG illustrations
│       └── TableSkeleton.jsx   # Table loading skeleton
│
├── features/
│   ├── admin/
│   │   ├── Dashboard.jsx      # Admin overview with charts
│   │   ├── ProductManager.jsx # Product CRUD
│   │   ├── CategoryManager.jsx # Category CRUD
│   │   ├── OrderManager.jsx   # Order management
│   │   ├── UserManager.jsx    # User management
│   │   ├── CouponManager.jsx  # Coupon CRUD
│   │   ├── InventoryManager.jsx # Stock management
│   │   ├── ChatManager.jsx    # Admin chat dashboard
│   │   └── adminApi.js        # Admin API calls
│   ├── auth/
│   │   ├── authSlice.js       # Auth Redux state
│   │   ├── authApi.js         # Auth API calls
│   │   ├── LoginModal.jsx     # Login popup
│   │   ├── RegisterModal.jsx  # Register popup
│   │   └── ForgotPasswordModal.jsx # Password reset modal
│   ├── cart/
│   │   ├── cartSlice.js       # Cart Redux state
│   │   └── cartApi.js         # Cart API calls
│   ├── wishlist/
│   │   ├── wishlistSlice.js   # Wishlist Redux state
│   │   └── wishlistApi.js     # Wishlist API calls
│   ├── products/
│   │   ├── productSlice.js    # Product Redux state
│   │   ├── productApi.js      # Product API calls
│   │   ├── categoryApi.js     # Category API calls
│   │   ├── ProductCard.jsx    # Product card component
│   │   └── ProductCardSkeleton.jsx # Card loading state
│   ├── reviews/
│   │   └── reviewApi.js       # Review API calls
│   ├── orders/
│   │   ├── orderApi.js        # Order API calls
│   │   └── OrderCardSkeleton.jsx # Order loading state
│   ├── payment/
│   │   ├── PaymentModal.jsx   # Payment form modal
│   │   └── paymentApi.js      # Payment API calls
│   ├── chat/
│   │   ├── ChatWidget.jsx     # Floating chat bubble + window
│   │   ├── ChatBubble.jsx     # Toggle button
│   │   ├── ChatWindow.jsx     # Message list + input
│   │   └── chatApi.js         # Chat API calls
│   └── users/
│       ├── userApi.js         # User API calls
│       └── addressApi.js      # Address API calls
│
├── pages/
│   ├── HomePage.jsx           # Landing page
│   ├── ShopPage.jsx           # Product grid with filters
│   ├── ProductPage.jsx        # Product details
│   ├── CartPage.jsx           # Shopping cart
│   ├── WishlistPage.jsx       # Wishlist
│   ├── CheckoutPage.jsx       # Checkout
│   ├── OrderHistoryPage.jsx   # Order list
│   ├── OrderDetailsPage.jsx   # Order details
│   ├── ProfilePage.jsx        # User profile
│   ├── AddressPage.jsx        # Address management
│   ├── ResetPasswordPage.jsx  # Password reset
│   └── NotFoundPage.jsx       # 404 page
│
├── utils/
│   ├── axios.js               # Axios instance with interceptors
│   └── validators.js          # Form validation schemas
│
├── App.jsx                    # Root component with routing
├── main.jsx                   # Entry point
└── index.css                  # Global styles + Tailwind
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **Backend API** running (see [ecom-store-backend](https://github.com/amirreza-ansari/ecom-store-backend))

### Installation

```bash
# Clone the repository
git clone https://github.com/amirreza-ansari/ecom-store-front-end.git
cd ecom-store-front-end

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Variables

Edit `.env` with your backend URL:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Run

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app starts on `http://localhost:5173`.

---

## 🔌 API Connection

This frontend connects to the EcomStore Backend API:

- **Backend Repo:** [ecom-store-backend](https://github.com/amirreza-ansari/ecom-store-backend)
- **API Docs:** `http://localhost:5000/api-docs`
- Set `VITE_API_URL` to your backend URL

---

## 🎨 Design System

### Color Palette (Amazon-inspired)

| Name           | Hex       | Usage                            |
| -------------- | --------- | -------------------------------- |
| Primary Orange | `#FF9900` | Buttons, links, highlights       |
| Dark Navy      | `#131A22` | Header, footer                   |
| Light Gray     | `#EAEDED` | Page background                  |
| White          | `#FFFFFF` | Cards, sections                  |
| Red            | `#B12704` | Discount prices, errors, remove  |
| Green          | `#067D62` | Success, in-stock, added to cart |
| Star Yellow    | `#FFA41C` | Ratings, badges                  |
| Text Dark      | `#0F1111` | Headings, body text              |
| Text Gray      | `#565959` | Secondary text                   |
| Border Gray    | `#D5D9D9` | Borders, dividers                |

---

## 📱 Pages & Routes

| Route                    | Page                | Access  |
| ------------------------ | ------------------- | ------- |
| `/`                      | Home Page           | Public  |
| `/shop`                  | Shop (Product Grid) | Public  |
| `/product/:slug`         | Product Detail      | Public  |
| `/reset-password/:token` | Reset Password      | Public  |
| `/cart`                  | Shopping Cart       | Private |
| `/wishlist`              | Wishlist            | Private |
| `/checkout`              | Checkout            | Private |
| `/orders`                | Order History       | Private |
| `/orders/:id`            | Order Details       | Private |
| `/profile`               | User Profile        | Private |
| `/profile/addresses`     | Address Management  | Private |
| `/admin`                 | Admin Dashboard     | Admin   |
| `/admin/products`        | Product Manager     | Admin   |
| `/admin/categories`      | Category Manager    | Admin   |
| `/admin/orders`          | Order Manager       | Admin   |
| `/admin/users`           | User Manager        | Admin   |
| `/admin/coupons`         | Coupon Manager      | Admin   |
| `/admin/inventory`       | Inventory Manager   | Admin   |
| `/admin/chats`           | Live Chat           | Admin   |
| `*`                      | 404 Not Found       | Public  |

---

## 🎯 Key Features in Detail

### Product Card

- Image zoom on hover
- Quick add-to-cart button (slides up on hover)
- Wishlist heart toggle with animation
- Discount percentage badge
- Stock availability indicator
- Variant color swatches

### Search Bar

- Autocomplete dropdown with 300ms debounce
- Keyboard navigation (↑↓ arrows + Enter)
- Matched text highlighting in orange
- Product image, name, brand, price in results
- "See all results" link

### Admin Dashboard

- Revenue bar chart (last 12 months)
- Stats cards with animated count-up
- Top products ranking by sales
- Order status breakdown with progress bars
- Recent orders table

### Live Chat

- Floating orange chat bubble (customer)
- Real-time 5-second message polling
- Admin auto-assignment
- Unread message count badges
- Conversation closing
- Empty states

### Animations

- Page transitions (fade + slide)
- Staggered product grid reveal
- Hero banner auto-rotation
- Stat counter animation on scroll
- Header shrink effect on scroll
- Hover scale effects on cards/buttons
- Toast notifications with icons

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Set environment variable: `VITE_API_URL`
5. Deploy

### Deploy to Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Set environment variable: `VITE_API_URL`

---

## 📄 License

MIT
