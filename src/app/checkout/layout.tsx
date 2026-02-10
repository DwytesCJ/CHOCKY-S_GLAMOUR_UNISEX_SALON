import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order at CHOCKY'S Ultimate Glamour. Secure checkout with multiple payment options and delivery across Uganda.",
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
