import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    const authUsers = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, email, created_at, raw_user_meta_data FROM auth.users;`
    );
    console.log('Supabase auth.users count:', authUsers.length);
    for (const u of authUsers) {
      console.log(`- Auth ID: ${u.id} | Email: "${u.email}" | Meta:`, u.raw_user_meta_data);
    }
  } catch (err) {
    console.error('Error querying auth.users:', err);
  }

  const publicUsers = await prisma.user.findMany();
  console.log('\nPublic User records count:', publicUsers.length);
  for (const u of publicUsers) {
    console.log(`- DB ID: ${u.id} | Email: "${u.email}" | Name: "${u.name}" | Role: ${u.role}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
