# AU.NONGTOTA Warehouse Management System

ระบบจัดการคลังอะไหล่สำหรับอู่น้องโตต้า - ระบบจัดการสินค้า, งานซ่อม, และรายงานแบบครบวงจร

## 🚀 Features

### 📦 Product Management
- จัดการสินค้าและอะไหล่
- ระบบ SKU และหมวดหมู่สินค้า
- ติดตามสต็อกและระดับสินค้าใกล้หมด
- ราคาขายและต้นทุน

### 🔧 Job Order Management
- สร้างและจัดการงานซ่อม
- ติดตามสถานะงาน
- เชื่อมโยงกับลูกค้าและรถ
- คำนวณค่าใช้จ่ายอัตโนมัติ

### 📊 Dashboard & Reports
- Dashboard แสดงข้อมูลแบบ Real-time
- รายงานยอดขายและกำไร
- รายงานสินค้าใกล้หมด
- รายงานประวัติลูกค้า

### 👥 User Management
- ระบบผู้ใช้งานหลายระดับ
- การจัดการสิทธิ์ตาม Role
- Audit Log สำหรับติดตามการใช้งาน

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (React 19)
- **TypeScript**
- **Tailwind CSS**
- **Material-UI (MUI)**
- **Lucide React** (Icons)

### Backend
- **Node.js**
- **Express.js**
- **TypeScript**
- **PostgreSQL** (Supabase)
- **Prisma ORM**
- **JWT Authentication**
- **bcrypt** (Password Hashing)

### Deployment
- **Vercel** (Frontend & Backend)
- **Supabase** (Database)
- **Docker** (Local Development)

## 📋 Prerequisites

- Node.js 18+ 
- npm / bun
- PostgreSQL Database (หรือใช้ Supabase)
- Git

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-username/AU.NONGTOTA-WHEREHOUSE.git
cd AU.NONGTOTA-WHEREHOUSE
```

### 2. Environment Setup

สร้างไฟล์ `.env` ใน root directory:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/au_nongtota"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

```

### 3. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL และสร้าง database
# Run migrations
cd backend
npx prisma migrate dev
npx prisma db seed
```

#### Option B: Supabase (Recommended)
1. สร้างโปรเจคใหม่ใน [Supabase](https://supabase.com)
2. Copy connection string มาใส่ใน `.env`
3. Run migrations:
```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

### 4. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

## 🐳 Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📱 Default Login

หลังจาก seed database แล้ว สามารถ login ด้วย:

- **Username:** `admin`
- **Password:** `admin123`
- **Role:** `OWNER`

## 🚀 Deployment

### Vercel Deployment

#### Frontend
```bash
cd frontend
vercel --prod
```

#### Backend
```bash
cd backend
vercel --prod
```

### Environment Variables สำหรับ Production

ใน Vercel Dashboard ตั้งค่า Environment Variables:

**Frontend:**
- `NEXT_PUBLIC_API_URL`: URL ของ backend API

**Backend:**
- `DATABASE_URL`: Connection string ของ database
- `JWT_SECRET`: Secret key สำหรับ JWT

## 📁 Project Structure

```
AU.NONGTOTA-WHEREHOUSE/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── routes/         # API Routes
│   │   ├── middleware/     # Auth & Session
│   │   ├── lib/           # Utilities
│   │   └── services/      # Business Logic
│   ├── prisma/            # Database Schema
│   └── swagger.json       # API Documentation
├── frontend/               # Frontend App
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   ├── components/    # React Components
│   │   ├── contexts/      # React Contexts
│   │   └── services/      # API Services
│   └── public/            # Static Assets
├── docker-compose.yml      # Docker Configuration
└── README.md
```

## 🔧 API Documentation

หลังจาก start backend แล้ว สามารถดู API Documentation ได้ที่:

- **Swagger UI:** `http://localhost:8000/docs`

## 👥 User Roles

- **OWNER**: เจ้าของระบบ - เข้าถึงได้ทุกฟีเจอร์
- **MANAGER**: ผู้จัดการ - จัดการสินค้าและงาน
- **STAFF**: พนักงาน - เบิกสินค้าและบันทึกงาน

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # ตรวจสอบ DATABASE_URL ใน .env
   # ตรวจสอบว่า database server ทำงานอยู่
   ```

2. **JWT Token Error**
   ```bash
   # ตรวจสอบ JWT_SECRET ใน .env
   # ลองลบ localStorage และ login ใหม่
   ```

3. **CORS Error**
   ```bash
   # ตรวจสอบ CORS settings ใน backend
   # ตรวจสอบ NEXT_PUBLIC_API_URL ใน frontend
   ```

4. **Build Error**
   ```bash
   # ลบ node_modules และ package-lock.json
   rm -rf node_modules package-lock.json
   npm install
   ```

### Logs

```bash
# Backend logs
cd backend && npm run dev

# Frontend logs
cd frontend && npm run dev

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

หากมีปัญหาหรือคำถาม:

- สร้าง Issue ใน GitHub
- ติดต่อทีมพัฒนา

## 🔄 Version History

- **v1.0.0** - Initial release with basic features for management
---

**Made with ❤️ for AU.NONGTOTA**