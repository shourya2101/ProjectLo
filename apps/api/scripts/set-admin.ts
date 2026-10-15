import { PrismaClient, Role } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Total users in database:', users.length);
  for (const u of users) {
    console.log(`- ID: ${u.id} | Email: "${u.email}" | Name: "${u.name}" | Role: ${u.role}`);
  }

  const targetEmail = 'singhshourya434@gmail.com';
  const found = await prisma.user.findFirst({
    where: {
      email: {
        equals: targetEmail,
        mode: 'insensitive',
      },
    },
  });

  if (found) {
    console.log(`Found target user: ${found.id}, current role: ${found.role}`);
    if (found.role !== Role.ADMIN) {
      const updated = await prisma.user.update({
        where: { id: found.id },
        data: { role: Role.ADMIN },
      });
      console.log(`Updated user ${updated.email} to ADMIN!`);
    } else {
      console.log(`User ${found.email} is already ADMIN in DB.`);
    }
  } else {
    console.log(`User with email "${targetEmail}" does not exist in PostgreSQL database yet. (They may exist in Supabase auth or haven't signed up yet).`);
  }
}

main()
  .catch((e) => {
    console.error('Error running script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
