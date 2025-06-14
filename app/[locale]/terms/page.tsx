import { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Terms of Service | InkPress',
    description: 'InkPress terms of service and usage conditions.',
  }
}

export default async function TermsPage() {
  const tNav = await getTranslations('navigation')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center space-x-2 text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600">
                {tNav('home')}
              </Link>
            </li>
            <li>→</li>
            <li className="text-gray-900">Terms of Service</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using InkPress, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use License</h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily download one copy of the materials on InkPress for personal, 
              non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
              <li>attempt to decompile or reverse engineer any software contained on InkPress</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
            <p className="text-gray-700 mb-4">
              This license shall automatically terminate if you violate any of these restrictions and may be terminated 
              by InkPress at any time. Upon terminating your viewing of these materials or upon the termination of this license, 
              you must destroy any downloaded materials in your possession whether in electronic or printed format.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimer</h2>
            <p className="text-gray-700 mb-4">
              The materials on InkPress are provided on an 'as is' basis. InkPress makes no warranties, expressed or implied, 
              and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions 
              of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <p className="text-gray-700 mb-4">
              Further, InkPress does not warrant or make any representations concerning the accuracy, likely results, 
              or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitations</h2>
            <p className="text-gray-700 mb-4">
              In no event shall InkPress or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use 
              the materials on InkPress, even if InkPress or an authorized representative has been notified orally or in writing 
              of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, 
              or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accuracy of Materials</h2>
            <p className="text-gray-700 mb-4">
              The materials appearing on InkPress could include technical, typographical, or photographic errors. 
              InkPress does not warrant that any of the materials on its website are accurate, complete, or current. 
              InkPress may make changes to the materials contained on its website at any time without notice. 
              However, InkPress does not make any commitment to update the materials.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Links</h2>
            <p className="text-gray-700 mb-4">
              InkPress has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. 
              The inclusion of any link does not imply endorsement by InkPress of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Modifications</h2>
            <p className="text-gray-700 mb-4">
              InkPress may revise these terms of service for its website at any time without notice. 
              By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These terms and conditions are governed by and construed in accordance with the laws and you irrevocably 
              submit to the exclusive jurisdiction of the courts in that state or location.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>By email: legal@inkpress.com</li>
              <li>On our contact page: <Link href="/contact" className="text-blue-600 hover:text-blue-800">Contact Us</Link></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}