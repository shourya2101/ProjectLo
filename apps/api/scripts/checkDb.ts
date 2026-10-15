import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: {
      seller: { select: { id: true, name: true, email: true, role: true } }
    }
  });
  console.log("ALL PRODUCTS:", JSON.stringify(products, null, 2));

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  console.log("ALL USERS:", JSON.stringify(users, null, 2));

  const rentals = await prisma.rental.findMany();
  console.log("ALL RENTALS:", JSON.stringify(rentals, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
