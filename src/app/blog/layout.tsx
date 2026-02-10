import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read the latest beauty tips, salon trends, skincare routines, and style guides from CHOCKY'S Ultimate Glamour experts.",
  openGraph: {
    title: "Beauty Blog | CHOCKY'S Ultimate Glamour",
    description: "Read the latest beauty tips, salon trends, skincare routines, and style guides.",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
