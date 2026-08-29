import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching product 1...");
  try {
    const product = await prisma.product.findUnique({
      where: { id: "1" },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            department: true,
            rating: true,
            completedDeals: true,
          }
        }
      }
    });
    console.log("Product found:", product);
  } catch (error) {
    console.error("Error fetching product:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
