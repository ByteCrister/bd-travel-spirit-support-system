# BD Travel Spirit Support System

A comprehensive travel platform support system built with **Next.js 15**, **React 19**, **TypeScript**, and **MongoDB** for managing tours, companies, employees, and user interactions.

---

## 🚀 Features

### 🧭 Tour Management
- **Comprehensive Tour System**: 150+ field tour schema covering destinations, itineraries, pricing, and policies  
- **Multi-level Caching**: Entity and query-based caching for optimal performance  
- **Tour Details**: Hero images, galleries, videos, SEO optimization, and rich content blocks  
- **Reviews & Reports**: Moderation system with status tracking  
- **FAQ System**: Q&A with voting, reporting, and moderation capabilities  

### 🏢 Company & Employee Management
- **Company Overview**: KPI tracking, total tours/employees, ratings dashboard  
- **Employee Records**: Detailed employee information with performance tracking  
- **Role-based Access**: 5 user roles — `TRAVELER`, `GUIDE`, `ASSISTANT`, `SUPPORT`, `ADMIN`  

### 💬 Real-time Chat & Messaging
- **Normalized Message Cache**: Efficient storage with optimistic updates  
- **Conversation Management**: Bidirectional chat between users  
- **Real-time Events**: WebSocket support for live updates  

### 📊 Analytics Dashboard
- **9-tab Dashboard**: KPIs, users, tours, reviews, reports, images, notifications, chat, employees  
- **Section-based Fetching**: Independent refresh for each analytics section  
- **Interactive Charts**: Line charts, bar charts, and data tables  

### 🤖 Machine Learning & Analytics
- **11 Event Types**: Tracks user behavior including views, searches, bookings, wishlist actions  
- **Dwell Time Analysis**: Measures engagement quality through time-on-page metrics  
- **Session Tracking**: Groups user actions by browser session  
- **TourFeatures Model**: Aggregates signals (views, bookings, ratings) into popularity scores  
- **Content Embeddings**: Vector representations for semantic similarity search  
- **Search Intelligence**: Query parsing with intent extraction and location detection  
- **User Feedback Loop**: Explicit LIKE/DISLIKE/HIDE signals for algorithm improvement  

### 📝 Content Management
- **Travel Articles**: Rich multi-destination content with structured attractions and activities  
- **Threaded Comments**: Nested comment system with moderation  
- **SEO Optimization**: Meta tags, Open Graph images, reading time calculation  

---

## 🛠️ Tech Stack

### Frontend
| Category | Technology |
|-----------|-------------|
| Framework | Next.js 15.4.3 (App Router) |
| UI Library | React 19.1.0 |
| State Management | Zustand 5.0.6 (persistent) |
| Styling | Tailwind CSS 4.0 |
| UI Components | Radix UI + shadcn/ui |
| Animation | Framer Motion 12.23.7 |
| Charts | Recharts 3.2.1 |

### Backend
| Category | Technology |
|-----------|-------------|
| Database | MongoDB 8.16.4 with Mongoose |
| Validation | Zod 4.0.8 |
| Authentication | JWT + bcrypt |
| Type System | TypeScript 5.8.3 |
| Image Storage | Cloudinary 2.7.0 |
| Error Tracking | Sentry 9.40.0 |

### Development Tools
| Category | Technology |
|-----------|-------------|
| Mock Data | @faker-js/faker 9.9.0 |
| API Client | Axios 1.11.0 |
| Form Management | React Hook Form 7.61.0 + Formik 2.4.6 |

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/ByteCrister/bd-travel-spirit-support-system.git

# Navigate to the project directory
cd bd-travel-spirit-support-system

# Install dependencies
npm install

# Set up environment variables (see Environment Setup section)
cp .env.example .env.local

# Run development server
npm run dev
```

---

## ⚙️ Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret
BCRYPT_SALT_ROUNDS=10

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Sentry (error tracking)
SENTRY_DSN=your_sentry_dsn

# Optional: WebSocket (for real-time chat)
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

---

## 🚦 Available Scripts

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 📁 Project Structure

```
bd-travel-spirit-support-system/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (mock implementation)
│   │   │   ├── users-management/
│   │   │   ├── chat/
│   │   │   └── statistics/
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── companies/         # Company management pages
│   │   └── statistics/        # Analytics pages
│   ├── components/            # Reusable UI components
│   │   ├── company-details/   # Company & tour components
│   │   ├── dashboard-layout/  # Layout and navigation
│   │   ├── provider/          # Context providers
│   │   ├── statistics/        # Analytics components
│   │   └── ui/                # shadcn/ui components
│   ├── store/                 # Zustand stores
│   │   ├── useCompanyDetailStore.ts
│   │   ├── useChatMessageStore.ts
│   │   ├── useStatisticsStore.ts
│   │   └── useRegisterGuideStore.ts
│   ├── models/                # MongoDB/Mongoose schemas
│   │   ├── tour.model.ts
│   │   ├── user.model.ts
│   │   ├── travelArticle.model.ts
│   │   └── ml/               # ML/Analytics models
│   │       ├── interactionEvent.model.ts
│   │       ├── tourFeatures.model.ts
│   │       ├── contentEmbedding.model.ts
│   │       ├── searchLog.model.ts
│   │       └── recoFeedback.model.ts
│   ├── types/                 # TypeScript definitions
│   ├── constants/             # Enums and constants
│   ├── services/              # Business logic and API services
│   └── utils/                 # Utility functions
├── package.json
├── next.config.ts
└── tsconfig.json
```

---

## 🔑 Key Features

### 🗺️ Tour Detail Page
Provides full tour information with tabbed navigation:
- Hero section, booking info, overview, itinerary, roadmap, policies  
- Reviews and reports with moderation tools  
- FAQ system with voting and reporting  
- Engagement metrics (views, likes, shares, wishlist count)  

### 🧠 State Management
Zustand-powered global stores with multi-level caching:
- **useCompanyDetailStore** — Companies, tours, and employees with entity + query caching  
- **useChatMessageStore** — Normalized message cache with optimistic updates  
- **useStatisticsStore** — Dashboard analytics with section-based fetching  
- **useRegisterGuideStore** — Multi-step registration workflow with localStorage persistence  

---

## 🔐 Authentication & Authorization

Implements **role-based access control** (RBAC):

| Role | Description |
|------|--------------|
| TRAVELER | End users booking tours |
| GUIDE | Tour operators |
| ASSISTANT | Company support assistant (requires companyId) |
| SUPPORT | Platform-level customer support (no companyId) |
| ADMIN | System administrator |

---

## 🗄️ Database Models

### Core Collections
- **Tour** — 40+ fields including itinerary, destinations, pricing, and policies  
- **TourFAQ** — User-generated FAQs with voting and moderation  
- **User** — Authentication, profile management, account lifecycle  
- **Company** — Business organization and KPIs  
- **Employee** — Staff profiles with role-based validation  
- **ChatMessage** — Real-time conversations  
- **TravelArticle** — SEO content with multi-destination blocks  

### ML/Analytics Collections
- **InteractionEvent** — User behavior tracking (11 event types)  
- **TourFeatures** — Aggregated popularity scores and signals  
- **ContentEmbedding** — Vector representations for semantic search  
- **SearchLog** — Query parsing and intent extraction  
- **RecoFeedback** — User feedback for recommendation improvement  

---

## 📚 API Documentation

The system currently uses mock API endpoints powered by Faker.js. API contracts are defined in:

### Tour Management
- `GET /api/users-management/companies/[companyId]` — Company overview  
- `GET /api/users-management/companies/[companyId]/tours` — Tour list with pagination  
- `GET /api/users-management/companies/[companyId]/tours/[tourId]` — Tour detail (150+ fields)  
- `GET /api/users-management/companies/[companyId]/tours/[tourId]/reviews` — Tour reviews  
- `GET /api/users-management/companies/[companyId]/tours/[tourId]/reports` — Tour reports  
- `GET /api/users-management/companies/[companyId]/tours/[tourId]/faqs` — Tour FAQs  

### Employee Management
- `GET /api/users-management/companies/[companyId]/employees` — Employee list  
- `GET /api/users-management/companies/[companyId]/employees/[employeeId]` — Employee detail  

### Chat & Messaging
- `GET /api/chat/conversation` — Conversation messages with pagination  
- `GET /api/chat/user-list` — User conversation sidebar  

### Analytics
- `GET /api/statistics/**` — Various analytics endpoints (KPIs, users, tours, reviews, etc.)  

All endpoints return consistent DTO structures with pagination support where applicable.

---

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Requirements
- **Node.js**: 20.x or higher  
- **MongoDB**: 8.x or higher  
- **RAM**: Minimum 2GB recommended  
- **Storage**: Cloudinary account for image uploads  

### Deployment Platforms
- **Vercel** (recommended for Next.js)  
- **AWS EC2** with MongoDB Atlas  
- **Docker** (containerized deployment)  

---

## 🔧 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 3000
npx kill-port 3000
```

**MongoDB connection failed**
- Verify `MONGODB_URI` in `.env.local`  
- Ensure MongoDB service is running  
- Check network connectivity and firewall settings  
- Verify MongoDB Atlas IP whitelist (if using Atlas)  

**Build errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Cloudinary upload errors**
- Verify Cloudinary credentials in `.env.local`  
- Check API key permissions  
- Ensure image size is within limits  

---

## 🗺️ Roadmap

- [ ] Replace mock APIs with real MongoDB integration  
- [ ] Implement WebSocket server for real-time chat  
- [ ] Deploy ML recommendation engine  
- [ ] Add payment gateway integration (Stripe/PayPal)  
- [ ] Implement email notification system  
- [ ] Add multi-language support (i18n)  
- [ ] Implement advanced search with Elasticsearch  
- [ ] Add mobile app (React Native)  
- [ ] Implement tour booking workflow  
- [ ] Add social media authentication (Google, Facebook)  

---

## 🚧 Development Status

Currently in **development mode** — mock API routes use `@faker-js/faker` for frontend integration and testing.  
This setup enables independent frontend development with predefined API contracts.

**Mock Data Features:**
- Realistic tour images from `picsum.photos`  
- Realistic user avatars from `randomuser.me`  
- Consistent data generation with seeded randomness  
- Full DTO compliance for seamless production migration  

---

## 📝 License

This project is **private and proprietary**.

---

## 👥 Contributing

This is a private repository.  
To contribute, please contact the repository owner for collaboration details.

**Development Guidelines:**
- Follow TypeScript strict mode  
- Use ESLint and Prettier for code formatting  
- Write meaningful commit messages  
- Test all features before submitting PRs  

---

## 📧 Contact

For questions or technical support, please contact the **ByteCrister development team**.

- **GitHub**: [@ByteCrister](https://github.com/ByteCrister)  
- **Repository**: [bd-travel-spirit-support-system](https://github.com/ByteCrister/bd-travel-spirit-support-system)  

---

## 🙏 Acknowledgments

Built with modern technologies:
- [Next.js](https://nextjs.org/) — React framework  
- [MongoDB](https://www.mongodb.com/) — Database  
- [Zustand](https://github.com/pmndrs/zustand) — State management  
- [Radix UI](https://www.radix-ui.com/) — Accessible components  
- [Tailwind CSS](https://tailwindcss.com/) — Styling  
- [Faker.js](https://fakerjs.dev/) — Mock data generation  

---

> **Generated automatically** from repository code analysis and metadata.  
> Built with a modern full-stack TypeScript architecture integrating Next.js 15, React 19, and MongoDB.
