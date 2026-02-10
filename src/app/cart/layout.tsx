import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your shopping cart at CHOCKY'S Ultimate Glamour.",
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
