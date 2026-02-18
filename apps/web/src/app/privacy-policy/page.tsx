'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-full container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold mb-2 text-white">Privacy Policy</h1>
            <p className="text-gray-400 mb-10">Last updated: February 18, 2026</p>

            <div className="space-y-10 text-gray-300">
                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">1. Introduction</h2>
                    <p>
                        LLM Platform ("we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">2. Information We Collect</h2>
                    <p className="mb-3">We collect information in the following ways:</p>
                    <h3 className="text-lg font-medium text-gray-200 mb-2">Information you provide directly</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-400 mb-4">
                        <li>Name and email address when registering</li>
                        <li>Profile information and preferences</li>
                        <li>Content and knowledge bases you upload</li>
                    </ul>
                    <h3 className="text-lg font-medium text-gray-200 mb-2">Information from social login (Google / Facebook)</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li>Name and email address from your social account</li>
                        <li>Profile picture (if available)</li>
                        <li>A unique identifier from the social provider</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li>To create and manage your account</li>
                        <li>To provide and improve the Service</li>
                        <li>To process transactions and send related information</li>
                        <li>To send administrative and support messages</li>
                        <li>To respond to your comments and questions</li>
                        <li>To monitor and analyze usage and trends</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">4. Social Login Data</h2>
                    <p>
                        When you log in using Google or Facebook, we receive limited profile data (name, email, profile photo) solely to create or link your account. We do not post on your behalf, access your contacts, or store your social media passwords. You can revoke our access at any time through your Google or Facebook account settings.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">5. Data Sharing & Disclosure</h2>
                    <p className="mb-2">We do not sell your personal data. We may share your information only in these limited circumstances:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li>With service providers who assist in operating our platform (under strict confidentiality)</li>
                        <li>To comply with legal obligations or respond to lawful requests</li>
                        <li>To protect the rights, property, or safety of our users or the public</li>
                        <li>In connection with a merger, acquisition, or sale of assets (with notice to you)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">6. Data Retention</h2>
                    <p>
                        We retain your personal information for as long as your account is active or as needed to provide the Service. You may request deletion of your account and associated data at any time by contacting us.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">7. Security</h2>
                    <p>
                        We implement industry-standard security measures including encryption, secure HTTPS connections, and hashed password storage. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">8. Your Rights</h2>
                    <p className="mb-2">Depending on your location, you may have the right to:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li>Access the personal data we hold about you</li>
                        <li>Correct inaccurate or incomplete data</li>
                        <li>Request deletion of your personal data</li>
                        <li>Object to or restrict processing of your data</li>
                        <li>Data portability</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">9. Cookies</h2>
                    <p>
                        We use cookies and similar tracking technologies to maintain your session and improve your experience. You can control cookie settings through your browser preferences.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">10. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">11. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at{' '}
                        <a href="mailto:privacy@llmplatform.ai" className="text-primary-400 hover:underline">
                            privacy@llmplatform.ai
                        </a>.
                    </p>
                </section>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-800 flex gap-6 text-sm text-gray-500">
                <Link href="/terms-of-service" className="hover:text-primary-400 transition-colors">Terms of Service</Link>
                <Link href="/" className="hover:text-primary-400 transition-colors">Back to Home</Link>
            </div>
        </div>
    );
}
