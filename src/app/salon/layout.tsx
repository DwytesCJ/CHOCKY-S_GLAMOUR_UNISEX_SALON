import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salon Services",
  description: "Professional beauty and salon services in Wandegeya, Kampala. Hair styling, manicures, pedicures, facials, makeup, and more. Book your appointment today.",
  openGraph: {
    title: "Salon Services | CHOCKY'S Ultimate Glamour",
    description: "Professional beauty and salon services in Wandegeya, Kampala. Book your appointment today.",
  },
};

export default function SalonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
