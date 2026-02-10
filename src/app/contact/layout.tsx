import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with CHOCKY'S Ultimate Glamour. Visit our salon at Annex Building, Wandegeya, Kampala or call us at +256 703 878 485.",
  openGraph: {
    title: "Contact Us | CHOCKY'S Ultimate Glamour",
    description: "Get in touch with CHOCKY'S Ultimate Glamour. Visit our salon in Wandegeya, Kampala.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
