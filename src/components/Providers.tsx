"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/context/ToastContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SiteSettingsProvider>
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </SiteSettingsProvider>
    </SessionProvider>
  );
}
