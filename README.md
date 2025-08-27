# AU.NONGTOTA - Inventory Management System

ระบบจัดการคลังอะไหล่สำหรับร้านซ่อมรถยนต์ ที่พัฒนาด้วยเทคโนโลยีสมัยใหม่

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15 (React 19) with App Router
- **Language**: TypeScript (.tsx)
- **Styling**: Tailwind CSS
- **UI Components**: 
  - Custom components
  - Material-UI (MUI) for alerts
  - Lucide React for icons
- **State Management**: React Hooks (useState, useEffect, useMemo, useCallback)
- **Build Tool**: Next.js built-in bundler

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs
- **Validation**: Express middleware + custom validation
- **API**: RESTful API design

### Database
- **Database**: PostgreSQL 15
- **ORM**: Prisma (TypeScript-first)
- **Features**:
  - Auto-generated Prisma Client
  - Database migrations
  - Seeding scripts
  - Prisma Studio for database management

### Development & Operations
- **Containerization**: Docker + Docker Compose
- **Database Admin**: pgAdmin 8
- **Environment**: Local development with hot reload
- **Package Manager**: npm

### Development Tools
- **Code Quality**: ESLint + TypeScript strict mode
- **Version Control**: Git
- **Editor**: VS Code (recommended)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Express)     │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 5001    │    │   Port: 5434    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   pgAdmin       │
                    │   Port: 5050    │
                    └─────────────────┘
```

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control (OWNER, ADMIN, USER)
- Password hashing with bcryptjs

### 📦 Product Management
- CRUD operations for products
- Auto-generated SKU system (prefix + 4 digits)
- Category management
- Stock quantity tracking
- Cost price and sell price management
- Role-based visibility (cost price for OWNER only)

### 🚗 Job Order Management
- Create and manage repair job orders
- Customer information tracking
- Vehicle details (car type, license plate)
- Job status management (OPEN, IN_PROGRESS, COMPLETED, CANCELLED)

### 📊 Inventory Operations
- **Stock In**: Receive products from suppliers
- **Stock Out**: Issue products for job orders
- **Stock Transactions**: Complete audit trail
- **Cycle Count**: Inventory reconciliation
- **Low Stock Alerts**: Automatic notifications

### 📋 Purchase Orders
- Create and manage purchase orders
- Supplier management
- Order tracking and receiving
- Integration with job orders

### 📈 Reporting & Analytics
- Low stock reports
- Inventory value reports
- Top-moving items
- Stock movement history
- User audit logs

### 🔧 System Administration
- User management
- Branch management
- Backup and restore functionality
- System configuration

## 🛠️ Installation & Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AU.NONGTOTA
   ```

2. **Start the application**
   ```bash
   docker compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - pgAdmin: http://localhost:5050
   - Database: localhost:5434

### Database Setup

1. **Apply migrations**
   ```bash
   docker compose exec backend npx prisma migrate dev
   ```

2. **Seed initial data**
   ```bash
   docker compose exec backend npm run db:seed
   ```

3. **Open Prisma Studio**
   ```bash
   docker compose exec backend npx prisma studio --port 5555
   ```

## 📁 Project Structure

```
AU.NONGTOTA/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Authentication & validation
│   │   ├── types/          # TypeScript type definitions
│   │   └── lib/            # Utility functions
│   ├── prisma/             # Database schema & migrations
│   └── package.json
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # Reusable UI components
│   │   └── globals.css     # Global styles
│   └── package.json
├── docker-compose.yml       # Container orchestration
└── README.md
```

## 🔧 Development

### Backend Development
```bash
# Install dependencies
cd backend
npm install

# Run in development mode
npm run dev

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npm run db:seed
```

### Frontend Development
```bash
# Install dependencies
cd frontend
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

### Database Management
```bash
# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# View database schema
npx prisma format
```

## 🌐 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Products
- `GET /products` - List products (with search & filter)
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /products/next-sku` - Get next SKU

### Job Orders
- `GET /job-orders` - List job orders
- `POST /job-orders` - Create job order
- `PUT /job-orders/:id` - Update job order
- `DELETE /job-orders/:id` - Delete job order
- `POST /job-orders/:id/stock-out` - Issue stock for job order

### Categories
- `GET /categories` - List categories
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

## 🔒 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@db:5434/app?schema=public"
PORT=5001
NODE_ENV=development
JWT_SECRET=your-secret-key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build

# Start production containers
docker compose -f docker-compose.prod.yml up -d
```

### Environment Configuration
- Update environment variables for production
- Set secure JWT secret
- Configure production database
- Enable HTTPS
- Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is proprietary software for AU.NONGTOTA.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using modern web technologies**
# AU.NONGTOTA-WHEREHOUSE
