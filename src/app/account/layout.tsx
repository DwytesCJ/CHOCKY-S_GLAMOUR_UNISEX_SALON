import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your account, orders, and preferences at CHOCKY'S Ultimate Glamour.",
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
