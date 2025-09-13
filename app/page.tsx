import { prisma } from '../src/lib/prisma';
import ProductCard from '../components/ProductCard';
import { formatCurrency } from '../src/lib/format';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

async function getData() {
  try {
    const products = await prisma.product.findMany({
      take: 6,
      include: { category: true }
    });
    return products;
  } catch (e) {
    return [];
  }
}

export default async function HomePage() {
  const products = await getData();
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">Todo para tu conejo</h2>
          <p className="text-lg text-neutral-600 max-w-prose">
            Selección de alimento, juguetes y accesorios pensados para la salud y
            bienestar de tu conejo.
          </p>
          <div className="flex gap-4">
            <a className="px-5 py-2.5 rounded bg-brand text-white font-medium" href="/products">Ver productos</a>
            <a className="px-5 py-2.5 rounded border font-medium" href="#productos">Destacados</a>
          </div>
        </div>
        <div className="flex items-center justify-center w-full h-auto mx-auto text-2xl font-semibold rounded-lg max-w-80 aspect-square bg-gradient-to-br from-brand/20 to-brand/40 text-brand">
        <div className='relative w-full h-full'>
          <Image src="/images/logo.png" alt="Hero" layout="fill" objectFit="cover" />
        </div>
        </div>
      </section>

      <section id="productos" className="space-y-6">
        <h3 className="text-2xl font-semibold">Productos destacados</h3>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
