'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SiteSettings {
  // General
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeWhatsapp: string;
  storeAddress: string;
  currency: string;
  freeShippingThreshold: number;
  // Social
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  // Business
  openingHoursWeekday: string;
  openingHoursSaturday: string;
  openingHoursSunday: string;
  // Payment toggles
  paymentMtnEnabled: boolean;
  paymentAirtelEnabled: boolean;
  paymentPaypalEnabled: boolean;
  paymentCodEnabled: boolean;
  paymentCardEnabled: boolean;
  // Notification toggles
  notifyOrderConfirm: boolean;
  notifyOrderShipped: boolean;
  notifyAppointmentReminder: boolean;
  // SEO
  metaTitle: string;
  metaDescription: string;
  // Misc
  instagramHandle: string;
  googleMapsEmbed: string;
}

const defaultSettings: SiteSettings = {
  storeName: "CHOCKY'S Ultimate Glamour Unisex Salon",
  storeEmail: 'josephchandin@gmail.com',
  storePhone: '+256703878485',
  storeWhatsapp: '+256703878485',
  storeAddress: 'Annex Building, Wandegeya, Kampala, Uganda',
  currency: 'UGX',
  freeShippingThreshold: 200000,
  facebookUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  tiktokUrl: '',
  youtubeUrl: '',
  openingHoursWeekday: 'Mon - Fri: 9:00 AM - 7:00 PM',
  openingHoursSaturday: 'Saturday: 9:00 AM - 7:00 PM',
  openingHoursSunday: 'Sunday: 10:00 AM - 5:00 PM',
  paymentMtnEnabled: true,
  paymentAirtelEnabled: true,
  paymentPaypalEnabled: true,
  paymentCodEnabled: true,
  paymentCardEnabled: true,
  notifyOrderConfirm: true,
  notifyOrderShipped: true,
  notifyAppointmentReminder: true,
  metaTitle: "CHOCKY'S Ultimate Glamour - Premium Beauty & Salon",
  metaDescription: 'Premium beauty products and professional salon services in Kampala, Uganda.',
  instagramHandle: 'chockys_glamour',
  googleMapsEmbed: '',
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        const s = data.data;
        setSettings({
          storeName: s.storeName || defaultSettings.storeName,
          storeEmail: s.storeEmail || defaultSettings.storeEmail,
          storePhone: s.storePhone || defaultSettings.storePhone,
          storeWhatsapp: s.storeWhatsapp || s.storePhone || defaultSettings.storeWhatsapp,
          storeAddress: s.storeAddress || defaultSettings.storeAddress,
          currency: s.currency || defaultSettings.currency,
          freeShippingThreshold: Number(s.freeShippingThreshold) || defaultSettings.freeShippingThreshold,
          facebookUrl: s.facebookUrl || defaultSettings.facebookUrl,
          instagramUrl: s.instagramUrl || defaultSettings.instagramUrl,
          twitterUrl: s.twitterUrl || defaultSettings.twitterUrl,
          tiktokUrl: s.tiktokUrl || defaultSettings.tiktokUrl,
          youtubeUrl: s.youtubeUrl || defaultSettings.youtubeUrl,
          openingHoursWeekday: s.openingHoursWeekday || defaultSettings.openingHoursWeekday,
          openingHoursSaturday: s.openingHoursSaturday || defaultSettings.openingHoursSaturday,
          openingHoursSunday: s.openingHoursSunday || defaultSettings.openingHoursSunday,
          paymentMtnEnabled: s.paymentMtnEnabled === 'true' || s.paymentMtnEnabled === undefined,
          paymentAirtelEnabled: s.paymentAirtelEnabled === 'true' || s.paymentAirtelEnabled === undefined,
          paymentPaypalEnabled: s.paymentPaypalEnabled === 'true' || s.paymentPaypalEnabled === undefined,
          paymentCodEnabled: s.paymentCodEnabled === 'true' || s.paymentCodEnabled === undefined,
          paymentCardEnabled: s.paymentCardEnabled === 'true' || s.paymentCardEnabled === undefined,
          notifyOrderConfirm: s.notifyOrderConfirm === 'true' || s.notifyOrderConfirm === undefined,
          notifyOrderShipped: s.notifyOrderShipped === 'true' || s.notifyOrderShipped === undefined,
          notifyAppointmentReminder: s.notifyAppointmentReminder === 'true' || s.notifyAppointmentReminder === undefined,
          metaTitle: s.metaTitle || defaultSettings.metaTitle,
          metaDescription: s.metaDescription || defaultSettings.metaDescription,
          instagramHandle: s.instagramHandle || defaultSettings.instagramHandle,
          googleMapsEmbed: s.googleMapsEmbed || defaultSettings.googleMapsEmbed,
        });
      }
    } catch (error) {
      console.error('Failed to fetch site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

export { defaultSettings };
