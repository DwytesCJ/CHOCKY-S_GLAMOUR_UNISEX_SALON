import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track your order status at CHOCKY'S Ultimate Glamour. Enter your order number to see real-time delivery updates.",
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
