/**
 * Site configuration implementing the SiteConfig interface.
 * Central configuration for the multilingual documentation knowledge base.
 */

export interface SocialLink {
  platform: 'facebook' | 'youtube' | 'x' | 'instagram' | 'threads' | 'wechat';
  url?: string;
  icon: string;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  defaultLocale: string;
  supportedLocales: string[];
  features: {
    paywall: {
      enabled: boolean;
    };
    ads: {
      enabled: boolean;
      adsenseId?: string;
    };
    analytics: {
      enabled: boolean;
      gaId?: string;
    };
  };
  social: {
    facebook?: string;
    youtube?: string;
    x?: string;
    instagram?: string;
    threads?: string;
    wechat?: string;
  };
  footer: {
    privacyPolicyUrl: string;
    copyrightHolder: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "InkPress",
  description: "Multilingual Documentation Knowledge Base",
  url: "https://inkpress.example.com",
  defaultLocale: "zh",
  supportedLocales: ["zh", "en", "ja", "ko", "fr", "de", "es", "ms", "th"],
  features: {
    paywall: { enabled: false },
    ads: { enabled: false, adsenseId: "" },
    analytics: { enabled: false, gaId: "" },
  },
  social: {
    facebook: "",
    youtube: "",
    x: "",
    instagram: "",
    threads: "",
    wechat: "",
  },
  footer: {
    privacyPolicyUrl: "/privacy-policy",
    copyrightHolder: "InkPress",
  },
};
