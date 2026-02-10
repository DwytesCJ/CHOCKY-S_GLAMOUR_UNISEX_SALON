import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/context/ToastContext";
import { Providers } from "@/components/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import BackToTop from "@/components/layout/BackToTop";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CHOCKY'S Ultimate Glamour | Premium Beauty & Salon Services",
    template: "%s | CHOCKY'S Ultimate Glamour",
  },
  description: "Your premier destination for luxury beauty products and professional salon services in Uganda. Shop makeup, skincare, hair products, perfumes, jewelry, and bags.",
  keywords: "beauty products Uganda, salon services Kampala, makeup, skincare, wigs, perfumes, jewelry, bags, CHOCKY'S",
  authors: [{ name: "CHOCKY'S Ultimate Glamour" }],
  openGraph: {
    title: "CHOCKY'S Ultimate Glamour | Premium Beauty & Salon Services",
    description: "Your premier destination for luxury beauty products and professional salon services in Uganda.",
    url: "https://chockys.ug",
    siteName: "CHOCKY'S Ultimate Glamour",
    locale: "en_UG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="font-body antialiased bg-white text-dark-900 overflow-x-hidden">
        <Providers>
          <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
                <CartDrawer />
                <BackToTop />
              </div>
            </WishlistProvider>
          </CartProvider>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
