# การตั้งค่า Supabase PostgreSQL

## ขั้นตอนการตั้งค่า

### 1. สร้างโปรเจค Supabase
1. ไปที่ [supabase.com](https://supabase.com)
2. สร้างโปรเจคใหม่
3. เลือก PostgreSQL database
4. รอให้โปรเจคสร้างเสร็จ

### 2. ดูข้อมูลการเชื่อมต่อ
1. ไปที่ Settings > Database
2. คัดลอก Connection string
3. รูปแบบ: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

### 3. อัปเดต Environment Variables

#### สำหรับ Backend (.env)
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
NODE_ENV=development
PORT=5001
```

#### สำหรับ Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### 4. รัน Migrations และ Seed
```bash
# ใน backend directory
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### 5. รัน Docker Compose
```bash
docker compose up backend
```

## หมายเหตุสำคัญ

- **SSL**: Supabase ต้องการ SSL connection
- **Connection Pooling**: ใช้ connection pooling สำหรับ production
- **Row Level Security**: เปิดใช้งาน RLS ใน Supabase dashboard
- **Backup**: Supabase มี automatic backup

## การแก้ไขปัญหา

### SSL Error
หากเจอ SSL error ให้เพิ่ม `?sslmode=require` ที่ท้าย DATABASE_URL:
```
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?sslmode=require"
```

### Connection Timeout
เพิ่ม connection timeout:
```
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?sslmode=require&connect_timeout=10"
```

## การย้ายข้อมูล

### Export จาก Local Database
```bash
pg_dump -h localhost -p 5434 -U postgres -d app > backup.sql
```

### Import ไป Supabase
```bash
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" < backup.sql
```
