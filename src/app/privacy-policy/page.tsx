import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | InkPress',
  description: 'Privacy policy for the InkPress documentation knowledge base.',
};

/**
 * Privacy Policy page.
 * Written in English as per Requirement 21.1.
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--color-text-primary))] mb-8">
        Privacy Policy
      </h1>

      <div className="prose dark:prose-invert max-w-none text-[rgb(var(--color-text-secondary))] space-y-6">
        <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
          Last updated: January 2024
        </p>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mt-8 mb-3">
            1. Information We Collect
          </h2>
          <p>
            WebDoc is a static documentation website. We do not collect personal information directly.
            However, the following data may be collected through third-party services:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Browser type and version</li>
            <li>Pages visited and time spent</li>
            <li>Referring website</li>
            <li>General geographic location (country/city level)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mt-8 mb-3">
            2. How We Use Information
          </h2>
          <p>
            Any information collected is used solely to improve the content and user experience
            of this website. We do not sell, trade, or otherwise transfer your information to
            third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mt-8 mb-3">
            3. Cookies
          </h2>
          <p>
            This website may use cookies for:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Remembering your theme preference (dark/light mode)</li>
            <li>Analytics (if enabled) to understand site usage patterns</li>
            <li>Advertising (if enabled) through Google AdSense</li>
          </ul>
          <p className="mt-3">
            You can disable cookies through your browser settings at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mt-8 mb-3">
            4. Third-Party Services
          </h2>
          <p>
            This website may integrate the following third-party services:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>Google Analytics</strong> — for website traffic analysis</li>
            <li><strong>Google AdSense</strong> — for displaying advertisements</li>
            <li><strong>Vercel</strong> — for website hosting and delivery</li>
          </ul>
          <p className="mt-3">
            Each of these services has their own privacy policy governing data collection.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mt-8 mb-3">
            5. Data Security
          </h2>
          <p>
            We implement standard security measures to protect any data processed through this website.
            As a static website, no user data is stored on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mt-8 mb-3">
            6. Changes to This Policy
          </h2>
          <p>
            We may update this privacy policy from time to time. Changes will be posted on this page
            with an updated revision date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mt-8 mb-3">
            7. Contact
          </h2>
          <p>
            If you have questions about this privacy policy, please contact us through our
            social media channels listed in the footer.
          </p>
        </section>
      </div>
    </div>
  );
}
