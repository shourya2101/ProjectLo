import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sellerId = "c7622633-f89c-4696-a85f-01a6d9996eda"; // Chotu

  // Update Chotu's name to "Alex Miller" to match the frontend
  await prisma.user.update({
    where: { id: sellerId },
    data: { name: "Alex Miller", avatar: "https://ui-avatars.com/api/?name=AM&background=0D8ABC&color=fff" }
  });

  const products = [
    {
      id: "1",
      title: "Autonomous Drone CV Engine",
      description: "Dummy product description",
      category: "Hardware",
      type: "RENT",
      priceRentPaise: 20000,
      sellerId: sellerId,
      status: "Available"
    },
    {
      id: "2",
      title: "Machine Learning Notebooks",
      description: "Dummy product description",
      category: "Digital",
      type: "SALE",
      priceSalePaise: 50000,
      sellerId: sellerId,
      status: "Available"
    },
    {
      id: "3",
      title: "Final Year CS Report & Specs",
      description: "Dummy product description",
      category: "Digital",
      type: "SALE",
      priceSalePaise: 120000,
      sellerId: sellerId,
      status: "Sold Out"
    },
    {
      id: "4",
      title: "IoT Smart Home Dev Kit",
      description: "Dummy product description",
      category: "Hardware",
      type: "BOTH",
      priceSalePaise: 450000,
      sellerId: sellerId,
      status: "Available"
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: p
    });
  }
  
  console.log("Products seeded successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
