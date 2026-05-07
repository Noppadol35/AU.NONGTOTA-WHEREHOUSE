import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAccounts() {
  const users = await prisma.user.findMany({
    include: { accounts: true }
  });

  console.log(`Found ${users.length} users.`);
  
  for (const user of users) {
    if (user.accounts.length === 0) {
      console.log(`Fixing user ${user.username} (${user.email})...`);
      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.email,
          providerId: 'credential',
          password: user.password,
        }
      });
      console.log(`✅ Created credential account for ${user.username}`);
    } else {
      console.log(`ℹ️ User ${user.username} already has accounts.`);
    }
  }
}

fixAccounts()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
