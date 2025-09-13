import '../globals.css';
import { ReactNode } from 'react';
import { AuthProvider } from '../components/AuthProvider';
import { CartProvider } from '../components/CartProvider';
import { NavBar } from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';

export const metadata = {
  title: 'ConejoMalo Store',
  description: 'Tienda especializada para conejos: alimento, juguetes y accesorios.'
};

export const dynamic = 'force-dynamic';
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-neutral-50 text-neutral-800">
        <AuthProvider>
          <CartProvider>
            <header className="sticky top-0 z-50 border-b shadow-sm bg-white/80 backdrop-blur">
              <NavBar />
            </header>
            <main className="w-full min-h-[36vh] max-w-6xl px-6 py-8 mx-auto">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
