# AU.NONGTOTA Warehouse Management System

ระบบจัดการคลังสินค้าและงานซ่อมรถยนต์

## 🚀 **Deployment บน AWS EC2**

### **ขั้นตอนที่ 1: Clone โปรเจค**
```bash
git clone https://github.com/Noppadol35/AU.NONGTOTA-WHEREHOUSE.git
cd AU.NONGTOTA-WHEREHOUSE
```

### **ขั้นตอนที่ 2: รัน Deploy Script**
```bash
chmod +x deploy.sh
./deploy.sh
```

### **ขั้นตอนที่ 3: ตรวจสอบการทำงาน**
```bash
# ดูสถานะ Docker containers
docker-compose -f docker-compose.prod.yml ps

# ดู logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔧 **การจัดการระบบ**

### **Restart Services**
```bash
docker-compose -f docker-compose.prod.yml restart
```

### **Update Code**
```bash
git pull origin main
docker-compose -f docker-compose.prod.yml up --build -d
```

### **View Logs**
```bash
# Frontend logs
docker-compose -f docker-compose.prod.yml logs frontend

# Backend logs
docker-compose -f docker-compose.prod.yml logs backend

# Database logs
docker-compose -f docker-compose.prod.yml logs db
```

### **Database Management**
```bash
# เข้าไปใน PostgreSQL container
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d app

# Backup database
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres app > backup.sql

# Restore database
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres -d app < backup.sql
```

## 📱 **Default Users**

- **Owner**: username: `owner`, password: `owner123`
- **Manager**: username: `manager`, password: `manager123`
- **Worker**: username: `worker`, password: `worker123`

## 🔒 **Security Notes**

- เปลี่ยน JWT_SECRET และ SESSION_SECRET ใน `docker-compose.prod.yml`
- เปลี่ยน default passwords สำหรับ database และ PgAdmin
- เปิด port เฉพาะที่จำเป็นใน AWS Security Groups

## 🆘 **Troubleshooting**

### **Port Already in Use**
```bash
# ดู process ที่ใช้ port
sudo netstat -tulpn | grep :3000

# Kill process
sudo kill -9 <PID>
```

### **Permission Issues**
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

### **Nginx Issues**
```bash
# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx
```

## 📞 **Support**

หากมีปัญหาการ deploy หรือใช้งาน กรุณาติดต่อทีมพัฒนา
