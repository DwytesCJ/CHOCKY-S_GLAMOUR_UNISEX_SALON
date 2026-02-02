import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

export const metadata: Metadata = {
  title: "CHOCKY'S Ultimate Glamour | Beauty & Salon",
  description: "Your premier destination for luxury beauty products and professional salon services in Uganda. Shop hair styling, makeup, skincare, perfumes, jewelry, and bags.",
  keywords: "beauty, salon, makeup, skincare, hair styling, perfumes, jewelry, bags, Uganda, Kampala",
  authors: [{ name: "CHOCKY'S Ultimate Glamour" }],
  openGraph: {
    title: "CHOCKY'S Ultimate Glamour | Beauty & Salon",
    description: "Your premier destination for luxury beauty products and professional salon services in Uganda.",
    type: "website",
    locale: "en_UG",
    siteName: "CHOCKY'S Ultimate Glamour",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="antialiased">
        <CartProvider>
          <WishlistProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
