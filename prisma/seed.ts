import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'alimento' },
      update: {},
      create: { name: 'Alimento', slug: 'alimento' }
    }),
    prisma.category.upsert({
      where: { slug: 'juguetes' },
      update: {},
      create: { name: 'Juguetes', slug: 'juguetes' }
    }),
    prisma.category.upsert({
      where: { slug: 'accesorios' },
      update: {},
      create: { name: 'Accesorios', slug: 'accesorios' }
    })
  ]);

  await prisma.product.createMany({
    data: [
      {
        name: 'Heno Premium',
        slug: 'heno-premium',
        description: 'Heno natural para una dieta equilibrada.',
        price: 9.99,
        imageUrl: '/images/alimento.jpg',
        categoryId: categories[0].id
      },
      {
        name: 'Pelota Mordedora',
        slug: 'pelota-mordedora',
        description: 'Juguete seguro para desgaste dental.',
        price: 5.5,
        imageUrl: '/images/juguetes.jpg',
        categoryId: categories[1].id
      },
      {
        name: 'Arnés Ajustable',
        slug: 'arnes-ajustable',
        description: 'Arnés cómodo para paseos controlados.',
        price: 15.0,
        imageUrl: '/images/accesorios.jpg',
        categoryId: categories[2].id
      }
    ],
    skipDuplicates: true
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
