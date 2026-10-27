import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { DemoRoleBar } from '@/components/layout/DemoRoleBar';
import { Navbar } from '@/components/layout/Navbar';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Anjali Spices | Authentic Indian Spices & Heritage Masalas',
  description: 'Pure, fresh-harvested whole spices, slow stone-ground masalas, and Grade A++ Kashmiri saffron directly from estate growers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#FCFBF8] text-[#2A2118] antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {/* Interactive Demo Role Switcher bar at top */}
              <DemoRoleBar />
              
              {/* Global Navigation Header */}
              <Navbar />

              {/* Slide-out Cart Drawer */}
              <CartDrawer />

              {/* Main Page Content */}
              <main className="flex-1">
                {children}
              </main>

              {/* Global Footer */}
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
