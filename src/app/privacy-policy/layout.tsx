import { siteConfig } from '@/config/site.config';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * Build social links array from site config for the Footer.
 */
function getSocialLinks() {
  const platforms = ['facebook', 'youtube', 'x', 'instagram', 'threads', 'wechat'] as const;
  return platforms.map((platform) => ({
    platform,
    url: siteConfig.social[platform] || undefined,
    icon: platform,
  }));
}

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const socialLinks = getSocialLinks();
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        locale={siteConfig.defaultLocale}
        supportedLocales={siteConfig.supportedLocales}
        showSearch={false}
        isImmersiveMode={false}
      />
      <main className="flex-1">{children}</main>
      <Footer
        socialLinks={socialLinks}
        year={currentYear}
        siteName={siteConfig.name}
      />
    </div>
  );
}
