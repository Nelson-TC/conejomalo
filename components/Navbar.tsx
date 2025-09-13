"use client";
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '../src/lib/format';
import Image from 'next/image';

interface NavLink { href: string; label: string; auth?: boolean; admin?: boolean; }

const links: NavLink[] = [
  { href: '/', label: 'Inicio' },
  { href: '/products', label: 'Productos' },
  { href: '/categories', label: 'Categorías' },
  { href: '/cart', label: 'Carrito' },
  { href: '/account', label: 'Cuenta', auth: true },
  { href: '/admin', label: 'Admin', auth: true, admin: true }
];

export function NavBar() {
  const { session } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement|null>(null);
  const boxRef = useRef<HTMLDivElement|null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  // Load cart count on mount and after search navigation events
  async function loadCartCount() {
    try {
      const res = await fetch('/api/cart', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const total = Array.isArray(data.items) ? data.items.reduce((s: number,i:any)=>s + (i.qty||0),0) : 0;
      setCartCount(total);
    } catch {}
  }
  useEffect(()=>{ loadCartCount(); }, []);
  // Listen to custom cart update events to refresh badge instantly
  useEffect(()=>{
    function handle(){ loadCartCount(); }
    window.addEventListener('cart:updated', handle);
    return () => window.removeEventListener('cart:updated', handle);
  }, []);
  const timer = useRef<any>();

  useEffect(()=>{
    if (!q || q.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.items || []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 250);
  }, [q]);

  // close search & menu dropdown on outside click
  useEffect(()=>{
    function onClick(e: MouseEvent) {
      if (!boxRef.current) return;
      const target = e.target as Node;
      if (!boxRef.current.contains(target)) setShowResults(false);
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false);
    }
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  },[]);

  function go(slug: string) {
    setShowResults(false); setQ(''); setResults([]);
    router.push(`/products/${slug}`);
  }

  const navLinks = links.filter(l => {
    if (l.admin && session?.role !== 'ADMIN') return false;
    if (l.auth && !session) return false;
    if (!l.auth && (l.href === '/login' || l.href === '/register') && session) return false;
    return true;
  });

  return (
  <div className="w-full shadow-sm bg-gradient-to-b from-brand to-brand-dark/90">
  <div className="flex flex-wrap items-center w-full max-w-6xl px-4 pt-3 pb-2 mx-auto text-white gap-x-4 gap-y-2 md:h-16 md:flex-nowrap md:py-0 md:px-6">
      {/* Left: menu button + logo */}
      <div className="flex items-center gap-3" ref={menuRef}>
        <button
          aria-haspopup="true"
          aria-expanded={menuOpen}
          onClick={()=>setMenuOpen(o=>!o)}
          className="flex items-center justify-center text-sm font-medium border rounded-md text-white/90 bg-white/15 border-white/20 w-9 h-9 hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/60 backdrop-blur"
        >
            <i className='bx bx-menu text-[1.5rem]'></i>
        </button>
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white">
          <Image src="/images/logo.png" alt="ConejoMalo" width={34} height={34} className="border rounded border-white/20" />
          <span className="hidden sm:inline drop-shadow">ConejoMalo</span>
        </Link>
        {menuOpen && (
          <div className="absolute z-50 w-56 mt-2 overflow-hidden bg-white border shadow-lg top-full left-4 rounded-xl text-neutral-700">
            <ul className="text-sm divide-y">
              {navLinks.map(l => {
                const active = pathname === l.href;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={()=>{ setMenuOpen(false); }}
                      className={`flex items-center gap-2 px-4 py-3 hover:bg-neutral-50 transition ${active ? 'bg-brand/10 text-brand font-medium' : 'text-neutral-700'}`}
                    >{l.label}</Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      {/* Center: search (full width on mobile, constrained on md+) */}
      <div className="order-last w-full md:order-none md:flex md:justify-center md:flex-1">
        <div ref={boxRef} className="relative w-full md:max-w-md">
          <input
            value={q}
            onChange={e=>{ setQ(e.target.value); setShowResults(true); setMenuOpen(false);} }
            onFocus={()=>{ setShowResults(true); setMenuOpen(false); }}
            placeholder="Buscar productos..."
            className="w-full px-4 py-2 pr-8 text-sm bg-white border rounded-full shadow-sm text-neutral-800 border-white/30 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/60"
          />
        <span className="absolute text-xs -translate-y-1/2 pointer-events-none text-neutral-400 right-3 top-1/2">
            {loading ? (<i className="bx bx-dots-horizontal-rounded text-[1.5rem] animate-pulse" />) : (<i className="bx bx-search text-[1.5rem]" />)}
        </span>
          {showResults && (q.length === 0 || (q.length>=2)) && (
            <div className="absolute left-0 z-40 w-full mt-2 overflow-hidden bg-white border shadow-lg rounded-xl text-neutral-700">
              {loading && <div className="px-4 py-3 text-xs text-neutral-500">Buscando...</div>}
              {!loading && results.length === 0 && q.length>=2 && (
                <div className="px-4 py-3 text-xs text-neutral-500">Sin resultados</div>
              )}
              <ul className="overflow-auto text-sm divide-y max-h-72">
                {results.map(r => (
                  <li key={r.id}>
                    <button
                      onClick={()=>{ go(r.slug); }}
                      className="flex items-center w-full gap-3 px-4 py-3 text-left hover:bg-neutral-50 focus:bg-neutral-100"
                    >
                      {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="object-cover w-10 h-10 border rounded" />}
                      <div className="flex-1">
                        <div className="font-medium leading-tight truncate">{r.name}</div>
                        <div className="text-[11px] text-neutral-500 truncate">/{r.slug}</div>
                      </div>
                      {r.price != null && (
                        <div className="text-xs font-medium text-neutral-700 whitespace-nowrap">{formatCurrency(Number(r.price))}</div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
  {/* Right: auth / account */}
  <div className="flex items-center gap-2 text-xs sm:text-sm md:gap-3">
        {!session && (
          <div className="flex items-center gap-3">
            <Link href="/cart" className="relative p-1 transition rounded hover:bg-white/20" aria-label="Carrito">
              <i className='text-white bx bxs-cart text-[1.5rem]'></i>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-white text-[10px] font-semibold text-brand flex items-center justify-center shadow">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            <Link href="/login" className="px-3 py-1.5 rounded border border-white/30 bg-white/10 hover:bg-white/25 text-white transition shadow-sm">Ingresar</Link>
            <Link href="/register" className="px-3 py-1.5 font-medium text-brand bg-white rounded hover:bg-white/90 transition shadow-sm">Registrar</Link>
          </div>
        )}
        {session && (
          <div className="flex items-center gap-3">
            <Link href="/account" className="p-1 transition rounded hover:bg-white/20 whitespace-nowrap">
            <i className='text-white bx bxs-user text-[1.5rem]'></i>
            </Link>
            <Link href="/cart" className="relative p-1 transition rounded hover:bg-white/20">
              <i className='text-white bx bxs-cart text-[1.5rem]'></i>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-white text-[10px] font-semibold text-brand flex items-center justify-center shadow">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            {session.role === 'ADMIN' && <Link href="/admin" className="px-3 py-1.5 rounded hover:bg-white/20 transition text-white">Admin</Link>}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
