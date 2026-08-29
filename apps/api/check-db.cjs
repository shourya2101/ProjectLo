const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  console.log('Users:', users);
  const convs = await prisma.conversation.findMany();
  console.log('Conversations:', convs);
  const msgs = await prisma.message.findMany();
  console.log('Messages:', msgs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
