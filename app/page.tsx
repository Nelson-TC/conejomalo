import { prisma } from '../src/lib/prisma';
import ProductCard from '../components/ProductCard';
import Image from 'next/image';
import NewsletterForm from '../components/NewsletterForm';

// Podríamos optar por ISR, pero mientras tanto mantenemos dinámico para reflejar cambios inmediatos.
export const dynamic = 'force-dynamic';

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { category: { select: { name: true } } }
    });
  } catch {
    return [];
  }
}

async function getTopCategories() {
  try {
    return await prisma.category.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
      take: 4
    });
  } catch {
    return [];
  }
}

// Fallbacks locales para imágenes de categorías si no hay imageUrl.
const categoryImageFallback: Record<string, string> = {
  accesorios: '/images/accesorios.jpg',
  alimento: '/images/alimento.jpg',
  juguetes: '/images/juguetes.jpg'
};

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getTopCategories()
  ]);

  return (
    <main className="space-y-28">
      {/* HERO (New Transparent Layered Design) */}
      <section aria-labelledby="hero-heading" className="relative px-6 pb-6 overflow-hidden md:m-0 rounded-xl">
        {/* Background layers */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none -z-10">
          {/* Soft dual radial gradients */}
          <div className="absolute inset-0 opacity-80" style={{backgroundImage:'radial-gradient(circle at 15% 35%,rgba(255,138,61,0.20) 0,transparent 55%),radial-gradient(circle at 85% 65%,rgba(255,107,107,0.18) 0,transparent 55%)'}} />
          {/* Large subtle glow blobs (responsive sizing) */}
          <div className="absolute -top-48 -left-40 w-[430px] h-[430px] sm:-top-40 sm:-left-32 sm:w-[520px] sm:h-[520px] rounded-full bg-gradient-to-br from-carrot/18 via-brand/10 to-carrot/5 blur-3xl" />
          <div className="absolute -bottom-48 -right-52 w-[520px] h-[520px] sm:-bottom-40 sm:-right-32 sm:w-[600px] sm:h-[600px] rounded-full bg-gradient-to-tr from-brand/15 via-carrot/10 to-brand/5 blur-3xl" />
          {/* Grid pattern with radial mask */}
          <div className="absolute inset-0 opacity-40 mix-blend-overlay [mask-image:radial-gradient(circle_at_center,rgba(0,0,0,0.9),transparent_75%)] bg-[linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:36px_36px]" />
          {/* Noise layer (SVG tiny pattern) */}
          <div className="absolute inset-0 opacity-20 mix-blend-multiply" style={{backgroundImage:"url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\"><filter id=\"n\"><feTurbulence baseFrequency=\"0.65\" numOctaves=\"2\" seed=\"3\"/></filter><rect width=\"80\" height=\"80\" filter=\"url(%23n)\" opacity=\"0.25\"/></svg>')"}} />
        </div>

        <div className="relative grid items-center max-w-6xl mx-auto md:grid-cols-2 gap-14 lg:gap-20">
          {/* Left content */}
          <div className="relative space-y-9">
            {/* Accent floating shape */}
            <div aria-hidden className="absolute w-32 h-32 -top-10 -left-10 rounded-3xl bg-gradient-to-br from-carrot/20 to-brand/10 blur-xl md:blur-2xl" />
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-medium tracking-wide rounded-full bg-white/50 backdrop-blur-md text-carrot ring-1 ring-carrot/30 shadow-sm">
                <i className='bx bxs-leaf text-[13px]' /> Cuidado especializado
              </span>
              <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-nav">
                Bienestar
                <span className="relative inline-block mx-2">
                  <span className="absolute inset-x-0 h-3 rounded-full bottom-1 bg-gradient-to-r from-carrot/60 via-brand/40 to-carrot/40" />
                  <span className="relative">premium</span>
                </span>
                para tu conejo
              </h1>
              <p className="text-base leading-relaxed sm:text-lg max-w-prose text-neutral-600/95">
                Alimento nutritivo, juguetes enriquecedores y accesorios confiables seleccionados por amantes de conejos.
              </p>
            </div>
            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <a href="/products" className="relative px-6 py-3 text-sm font-semibold rounded-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-carrot/70">
                <span className="absolute inset-0 transition-opacity rounded-full bg-gradient-to-r from-carrot/80 via-carrot-dark/60 to-brand/80 group-hover:opacity-90" />
                <span className="relative flex items-center gap-2 text-nav">Ver catálogo <i className='bx bx-right-arrow-alt text-base transition -mr-1 group-hover:translate-x-0.5' /></span>
              </a>
              <a href="#categorias" className="px-6 py-3 text-sm font-medium transition border rounded-full border-nav/15 text-nav/90 backdrop-blur bg-white/60 hover:bg-white/80 hover:text-nav focus:outline-none focus-visible:ring-2 focus-visible:ring-carrot/60">
                Explorar categorías
              </a>
            </div>
            {/* Value mini list */}
            <ul className="flex flex-wrap pt-2 text-xs gap-x-8 gap-y-4 text-neutral-600/90">
              <li className="flex items-center gap-2"><i className='text-base bx bxs-leaf text-carrot' /> Ingredientes seleccionados</li>
              <li className="flex items-center gap-2"><i className='text-base bx bxs-truck text-carrot' /> Envío rápido</li>
              <li className="flex items-center gap-2"><i className='text-base bx bxs-shield text-carrot' /> Pago seguro</li>
            </ul>
          </div>
          {/* Right visual card */}
          <div className="relative hidden md:block">
            <div className="relative w-full max-w-md mx-auto aspect-square">
              {/* Glass panel card */}
              <div className="absolute inset-0 rounded-3xl bg-white/55 backdrop-blur-md ring-1 ring-white/40 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.15)]" />
              <div className="relative flex items-center justify-center h-full rounded-3xl">
                <div className="relative flex items-center justify-center w-full h-full">
                  <Image src="/images/transparentlogo.png" alt="Logotipo ConejoMalo" fill className="object-contain p-10" priority />
                </div>
              </div>
              {/* Decorative corner shapes */}
              <div className="absolute shadow-inner w-28 h-28 -bottom-7 -left-7 rounded-2xl bg-gradient-to-br from-carrot/30 to-brand/20 backdrop-blur-md ring-1 ring-carrot/30" />
              <div className="absolute w-24 h-24 rounded-full -top-6 -right-5 bg-brand/25 blur-xl" />
              <div className="absolute w-16 h-16 bottom-20 -right-6 rounded-xl bg-carrot/25 blur-lg rotate-12" />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS DESTACADAS */}
      <section id="categorias" aria-labelledby="cat-heading" className="px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="cat-heading" className="text-2xl font-semibold tracking-tight md:text-3xl">Categorías para empezar</h2>
            <a href="/categories" className="px-3 py-1 text-sm font-medium text-black transition-colors rounded bg-carrot hover:bg-carrot-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-carrot/60">Ver todas →</a>
          </div>
          {categories.length === 0 && (
            <div className="text-sm text-neutral-500">Aún no hay categorías activas.</div>
          )}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {categories.map(c => {
              const img = c.imageUrl || categoryImageFallback[c.slug] || '/images/noimage.webp';
              return (
                <a key={c.id} href={`/categories/${c.slug}`} className="relative overflow-hidden transition border group rounded-xl bg-neutral-100 border-neutral-200 hover:border-carrot/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-carrot/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={c.name} className="object-cover w-full h-40" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-3">
                    <h3 className="text-sm font-medium tracking-wide text-white transition group-hover:text-carrot">{c.name}</h3>
                    <span className="text-[11px] text-white/70 group-hover:text-white">Ver</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section id="productos" aria-labelledby="prod-heading" className="px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="prod-heading" className="text-2xl font-semibold tracking-tight md:text-3xl">Productos destacados</h2>
            <a href="/products" className="px-3 py-1 text-sm font-medium text-black transition-colors rounded bg-carrot hover:bg-carrot-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-carrot/60">Ver catálogo completo →</a>
          </div>
          {products.length === 0 && (
            <div className="text-sm text-neutral-500">No hay productos disponibles todavía.</div>
          )}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5">
            {products.map((p: any) => <ProductCard key={p.id} product={p} variant="compact" />)}
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section aria-labelledby="val-heading" className="px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <h2 id="val-heading" className="text-2xl font-semibold tracking-tight md:text-3xl">Por qué elegirnos</h2>
          <div className="grid gap-6 md:grid-cols-4 sm:grid-cols-2">
            {[
              { icon: 'bxs-bowl-hot', title: 'Nutrición óptima', desc: 'Productos con ingredientes seleccionados para la salud digestiva.' },
              { icon: 'bxs-joystick', title: 'Enriquecimiento', desc: 'Juguetes que previenen el aburrimiento y fomentan conducta natural.' },
              { icon: 'bxs-truck', title: 'Envío ágil', desc: 'Procesamos y enviamos tus pedidos rápidamente.' },
              { icon: 'bxs-heart-circle', title: 'Cuidado experto', desc: 'Equipo apasionado que prueba y evalúa cada categoría.' }
            ].map(v => (
              <div key={v.title} className="relative flex flex-col gap-3 p-5 bg-white border shadow-sm rounded-xl border-neutral-200">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-carrot/15 text-carrot">
                  <i className={`bx ${v.icon} text-xl`} />
                </div>
                <h3 className="text-sm font-semibold tracking-wide">{v.title}</h3>
                <p className="text-xs leading-relaxed text-neutral-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BANNER CTA */}
      <section aria-labelledby="cta-heading" className="px-6">
        <div className="relative max-w-6xl mx-auto overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-carrot to-brand opacity-90" />
          <div className="relative flex flex-col items-center gap-10 px-8 py-14 md:py-16 md:flex-row text-nav">
            <div className="max-w-xl space-y-5">
              <h2 id="cta-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">Convierte la rutina en bienestar</h2>
              <p className="text-sm sm:text-base text-nav/80 max-w-prose">Suscríbete y recibe las últimas novedades en cuidado de conejos.</p>
              <a href="#newsletter" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition rounded-full bg-nav hover:bg-nav-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                Obtener guía gratis <i className='text-base bx bx-right-arrow-alt' />
              </a>
            </div>
            <div className="relative hidden w-full max-w-xs aspect-square sm:block">
              <div className="absolute inset-0 border rounded-3xl border-nav/20 bg-white/10 backdrop-blur" />
              <Image src="/images/alimento.jpg" alt="Alimento saludable" fill className="object-cover rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section id="newsletter" aria-labelledby="news-heading" className="px-6 pb-10">
        <div className="max-w-3xl mx-auto space-y-8 text-center">
          <div className="space-y-3">
            <h2 id="news-heading" className="text-2xl font-semibold tracking-tight md:text-3xl">Mantente al día</h2>
            <p className="mx-auto text-sm text-neutral-600 max-w-prose">Promociones exclusivas, lanzamientos y consejos de cuidado. Sin spam.</p>
          </div>
          <NewsletterForm />
          <p className="text-[11px] text-neutral-500">Puedes cancelar la suscripción en cualquier momento.</p>
        </div>
      </section>
    </main>
  );
}
