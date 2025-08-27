import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create branches
  const branch1 = await prisma.branch.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'สาขาหลัก',
      address: '91/38 หมู่3 ถนน สุขุมวิท ตำบล บ้านสวน อำเภอ เมืองชลบุรี จังหวัดชลบุรี 20000',
    },
  });



  // Create users
  const owner = await prisma.user.upsert({
    where: { username: 'purmpoon' },
    update: {},
    create: {
      username: 'owner',
      password: '$2b$12$jAR377NzEJhGPNPUebNi7ui41IaGknTXEsSPWC.Nd9LriG70KrNnK', // password: Noppadol2546
      fullName: 'เจ้าของระบบ',
      role: 'OWNER',
      branchId: branch1.id,
    },
  });

}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
