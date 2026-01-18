# 🛠️ Development Guide

## 📋 Prerequisites

### Software Requirements

- Node.js 18+ (LTS recommended)
- PostgreSQL 15+
- Redis 7+
- Git
- Docker & Docker Compose (optional)

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- Auto Rename Tag
- GitLens

## 🚀 Development Setup

### Option 1: Manual Setup

1. **Clone repository**

```bash
git clone <repository-url>
cd mesin-cuci-store
```

1. **Setup Backend**

```bash
cd backend
npm install
cp .env.example .env
# Edit .env file dengan konfigurasi database
npx prisma migrate dev
npx prisma db seed
npm run dev
```

1. **Setup Frontend**

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Option 2: Docker Setup

```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
```

## 🏗️ Project Structure

### Frontend (`/frontend`)

```
src/
├── components/     # Reusable components
│   ├── UI/        # Basic UI components
│   ├── Layout/    # Layout components
│   ├── Product/   # Product-related components
│   ├── Cart/      # Cart components
│   └── Auth/      # Authentication components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── store/         # Redux store
├── services/      # API services
├── utils/         # Utility functions
├── assets/        # Static assets
└── styles/        # Global styles
```

### Backend (`/backend`)

```
src/
├── controllers/   # Route controllers
├── middleware/    # Express middleware
├── models/        # Database models (Prisma)
├── routes/        # API routes
├── services/      # Business logic
├── utils/         # Utility functions
├── config/        # Configuration files
├── validators/    # Input validators
└── socket/        # Socket.io handlers
```

## 🔧 Development Commands

### Root Commands

```bash
npm run dev          # Run both frontend and backend
npm run build        # Build both projects
npm run test         # Run all tests
npm run lint         # Lint all files
```

### Frontend Commands

```bash
cd frontend
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Lint files
```

### Backend Commands

```bash
cd backend
npm run dev          # Start dev server (localhost:5000)
npm start           # Start production server
npm run test        # Run tests
npm run lint        # Lint files
npx prisma studio   # Open Prisma Studio
```

## 🗄️ Database Management

### Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

### Seeding

```bash
# Seed database with dummy data
npx prisma db seed

# Run seed script directly
npm run prisma:seed
```

### Prisma Studio

```bash
# Open database GUI
npx prisma studio
```

## 🧪 Testing

### Unit Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# Watch mode
npm run test:watch
```

### API Testing with Postman

1. Import Postman collection dari `docs/postman/`
2. Set environment variables:
   - baseUrl: <http://localhost:5000>
   - token: (dapatkan dari login)

## 🔐 Authentication Flow

### User Registration

1. POST `/api/auth/register` → Create user
2. Verification email sent (if enabled)
3. User clicks verification link
4. User can login

### User Login

1. POST `/api/auth/login` → Get JWT token
2. Token stored in secure HTTP-only cookie
3. Subsequent requests include token in Authorization header

### Protected Routes

- Add `requireAuth` middleware to routes
- Check user role with `requireRole` middleware

## 📁 File Upload

### Product Images

1. Upload via `POST /api/products/:id/images`
2. Images processed and optimized
3. Stored in Cloudinary (production) or local uploads folder
4. Multiple sizes generated

### Configuration

```env
# Local storage
UPLOAD_PATH=./uploads

# Cloudinary (production)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📱 Responsive Design

### Breakpoints

```css
sm: 640px   /* Mobile */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large Desktop */
```

### Mobile-First Approach

1. Design for mobile first
2. Use Tailwind responsive prefixes
3. Test on real devices

## 🚀 Deployment

### Environment Variables

Set environment variables sesuai environment:

- Development: `.env` (backend), `.env.local` (frontend)
- Production: Environment variables di server

### Build Process

```bash
# Build for production
npm run build

# The build will create:
# - frontend/dist/ (static files)
# - backend/dist/ (compiled JavaScript)
```

### Docker Deployment

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Deploy stack
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Debugging

### Frontend Debugging

1. React DevTools extension
2. Redux DevTools extension
3. Network tab untuk API calls

### Backend Debugging

1. Console logs dengan morgan
2. Winston logs untuk production
3. Debug mode: `DEBUG=* npm run dev`

### Database Debugging

1. Prisma Studio untuk data inspection
2. Query logs di development
3. Explain queries untuk optimization

## 📝 Code Style

### JavaScript/TypeScript

- Use ESLint dengan Airbnb style guide
- Prettier untuk formatting
- TypeScript strict mode

### Naming Conventions

- Components: PascalCase (`ProductCard.tsx`)
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case untuk non-components

### Commit Messages

Format: `type(scope): description`

Types:

- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Testing
- chore: Maintenance

Example: `feat(products): add product filter component`

## 🆘 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Check firewall settings

2. **Prisma client not generated**

   ```bash
   npx prisma generate
   ```

3. **Port already in use**

   ```bash
   # Find process using port
   lsof -i :3000
   # Kill process
   kill -9 <PID>
   ```

4. **Memory issues during build**

   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

### Getting Help

1. Check existing issues di GitHub
2. Search error messages
3. Ask in team channel
4. Create new issue dengan detail error

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [Docker Documentation](https://docs.docker.com)
