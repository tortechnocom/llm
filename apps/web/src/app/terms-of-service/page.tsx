'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-full container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold mb-2 text-white">Terms of Service</h1>
            <p className="text-gray-400 mb-10">Last updated: February 18, 2026</p>

            <div className="space-y-10 text-gray-300">
                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using the LLM Platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">2. Use of the Service</h2>
                    <p className="mb-2">You agree to use the Service only for lawful purposes and in a way that does not infringe the rights of others. You must not:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li>Use the Service to transmit harmful, offensive, or illegal content</li>
                        <li>Attempt to gain unauthorized access to any part of the Service</li>
                        <li>Interfere with or disrupt the integrity or performance of the Service</li>
                        <li>Collect or harvest any personally identifiable information from the Service</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">3. User Accounts</h2>
                    <p>
                        You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">4. Social Login</h2>
                    <p>
                        When you choose to log in using a third-party service (such as Google or Facebook), you authorize us to access certain information from that service as permitted by your privacy settings. We will use this information only to create and manage your account on our platform.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">5. AI Agents & Content</h2>
                    <p>
                        You retain ownership of the content and knowledge bases you upload to train your AI agents. By uploading content, you grant us a non-exclusive license to use it solely for providing the Service. You are solely responsible for ensuring your content does not violate any third-party rights or applicable laws.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">6. Earnings & Payments</h2>
                    <p>
                        Earnings from shared AI agents are subject to our platform fee structure. We reserve the right to modify the fee structure with reasonable notice. Payments are processed according to our payment schedule and are subject to our payment terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">7. Intellectual Property</h2>
                    <p>
                        The Service and its original content, features, and functionality are owned by LLM Platform and are protected by international copyright, trademark, and other intellectual property laws.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">8. Disclaimer of Warranties</h2>
                    <p>
                        The Service is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or completely secure.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
                    <p>
                        To the fullest extent permitted by law, LLM Platform shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">10. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these Terms at any time. We will notify users of significant changes. Your continued use of the Service after changes constitutes acceptance of the updated Terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-3">11. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms of Service, please contact us at{' '}
                        <a href="mailto:support@llmplatform.ai" className="text-primary-400 hover:underline">
                            support@llmplatform.ai
                        </a>.
                    </p>
                </section>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-800 flex gap-6 text-sm text-gray-500">
                <Link href="/privacy-policy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link>
                <Link href="/" className="hover:text-primary-400 transition-colors">Back to Home</Link>
            </div>
        </div>
    );
}
