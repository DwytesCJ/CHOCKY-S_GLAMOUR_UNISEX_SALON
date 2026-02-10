import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about orders, shipping, returns, salon services, and more at CHOCKY'S Ultimate Glamour.",
  openGraph: {
    title: "FAQ | CHOCKY'S Ultimate Glamour",
    description: "Frequently asked questions about orders, shipping, returns, salon services, and more.",
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
