import { PrismaClient } from '@prisma/client';
import { products, solutions } from './data.js';

const prisma = new PrismaClient();

async function main() {
  const productSeeds = products.map((product) =>
    prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product,
    })
  );

  const solutionSeeds = solutions.map((solution) =>
    prisma.solutions.upsert({
      where: { id: solution.id },
      update: {},
      create: solution,
    })
  );

  await Promise.all([...productSeeds, ...solutionSeeds]);
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
