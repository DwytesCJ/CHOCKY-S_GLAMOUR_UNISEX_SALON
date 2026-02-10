import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse our curated collection of premium beauty products, skincare, makeup, wigs, perfumes, jewelry, and bags. Free delivery on orders over UGX 100,000.",
  openGraph: {
    title: "Shop All Products | CHOCKY'S Ultimate Glamour",
    description: "Browse our curated collection of premium beauty products, skincare, makeup, wigs, perfumes, jewelry, and bags.",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
