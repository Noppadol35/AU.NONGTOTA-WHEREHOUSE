import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Ensure Branch id=1 exists
  let branch1 = await prisma.branch.findUnique({ where: { id: 1 } });
  if (!branch1) {
    branch1 = await prisma.branch.create({
      data: {
        id: 1,
        name: 'สาขาหลัก',
        address: '91/38 หมู่3 ถนน สุขุมวิท ตำบล บ้านสวน อำเภอ เมืองชลบุรี จังหวัดชลบุรี 20000',
      },
    });
    console.log('✅ Created default branch with id=1');
  } else {
    console.log('ℹ️ Default branch already exists with id=1');
  }



  // Ensure an OWNER user exists
  const owner = await prisma.user.upsert({
    where: { username: 'owner' },
    update: {},
    create: {
      username: 'owner',
      password: '$2b$12$jAR377NzEJhGPNPUebNi7ui41IaGknTXEsSPWC.Nd9LriG70KrNnK', // password: Noppadol2546
      fullName: 'เจ้าของระบบ',
      role: 'OWNER',
      branchId: branch1.id,
    },
  });
  console.log('ℹ️ Seeded owner user:', owner.username);

}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
