import { PrismaClient } from '@prisma/client';
import { products } from './data.js';

const prisma = new PrismaClient();

async function main() {
  const productSeeds = products.map((product) =>
    prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product,
    })
  );

  await Promise.all(productSeeds);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
