import '../globals.css';
import { ReactNode } from 'react';
import { AuthProvider } from '../components/AuthProvider';
import { CartProvider } from '../components/CartProvider';
import { NavBar } from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';
import { ScrollToTop } from '../components/ScrollToTop';
import NextTopLoader from 'nextjs-toploader';

export const metadata = {
  title: 'ConejoMalo Store',
  description: 'Tienda especializada para conejos: alimento, juguetes y accesorios.'
};

export const dynamic = 'force-dynamic';
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-neutral-50 text-neutral-800">
        <NextTopLoader color='#FF8A3D' /> 
        <AuthProvider>
          <CartProvider>
            <header className="sticky top-0 z-50 border-b shadow-sm bg-white/80 backdrop-blur">
              <NavBar />
            </header>
            <ScrollToTop />
            <main id="main-content" tabIndex={-1} className="outline-none w-full min-h-[36vh] max-w-6xl px-6 py-8 mx-auto">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
