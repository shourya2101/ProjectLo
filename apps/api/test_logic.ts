import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const productId = "1";
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { sellerId: true }
  });
  console.log("Product lookup result:", product);
}

main().finally(() => prisma.$disconnect());
