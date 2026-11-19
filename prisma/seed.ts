import { PrismaClient } from '@prisma/client';
import { DEFAULT_SETTINGS, INITIAL_PRODUCTS } from '../src/lib/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // Seed AppSettings
  const existingSettings = await prisma.appSettings.findUnique({ where: { id: 1 } });
  if (!existingSettings) {
    await prisma.appSettings.create({
      data: {
        id: 1,
        ...DEFAULT_SETTINGS,
      },
    });
    console.log('Seeded AppSettings ✅');
  }

  // Seed Products
  for (const prod of INITIAL_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {},
      create: {
        id: prod.id,
        name: prod.name,
        category: prod.category,
        priceCNY: prod.priceCNY,
        image: prod.image,
        description: prod.description,
        weightGram: prod.weightGram,
        originStore: prod.originStore,
        isPopular: prod.isPopular ?? false,
        inStock: prod.inStock ?? true,
      },
    });
  }
  console.log(`Seeded ${INITIAL_PRODUCTS.length} products ✅`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
