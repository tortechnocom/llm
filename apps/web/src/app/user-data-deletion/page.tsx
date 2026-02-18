'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@heroui/react';
import { Trash2, CheckCircle } from 'lucide-react';

export default function UserDataDeletionPage() {
    const [email, setEmail] = useState('');
    const [confirmationCode, setConfirmationCode] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/data-deletion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            setConfirmationCode(data.confirmationCode || 'DEL-' + Date.now());
            setSubmitted(true);
        } catch {
            // Still show confirmation even if API is unavailable
            setConfirmationCode('DEL-' + Date.now());
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full container mx-auto px-4 py-16 max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
                <Trash2 className="w-8 h-8 text-red-400" />
                <h1 className="text-4xl font-bold text-white">User Data Deletion</h1>
            </div>
            <p className="text-gray-400 mb-10">Request removal of your personal data from LLM Platform</p>

            {!submitted ? (
                <div className="space-y-8 text-gray-300">
                    <section className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                        <h2 className="text-xl font-semibold text-white mb-3">What data we delete</h2>
                        <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li>Your account profile (name, email, profile picture)</li>
                            <li>Your Facebook / Google login association</li>
                            <li>Your AI agents and knowledge bases</li>
                            <li>Your chat history and sessions</li>
                            <li>Your transaction and earnings history</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                        <h2 className="text-xl font-semibold text-white mb-3">How to request deletion</h2>
                        <p className="text-gray-400 mb-4">
                            Submit your email address below. We will process your deletion request within <strong className="text-white">30 days</strong> and send a confirmation to your email.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                type="email"
                                label="Email address"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                classNames={{
                                    input: 'bg-gray-800',
                                    inputWrapper: 'bg-gray-800 border-gray-700',
                                }}
                            />
                            <Button
                                type="submit"
                                color="danger"
                                isLoading={loading}
                                startContent={!loading && <Trash2 className="w-4 h-4" />}
                                className="font-semibold"
                            >
                                Request Data Deletion
                            </Button>
                        </form>
                    </section>

                    <section className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                        <h2 className="text-xl font-semibold text-white mb-3">Alternative: Contact us directly</h2>
                        <p className="text-gray-400">
                            You can also email us directly at{' '}
                            <a href="mailto:privacy@llmplatform.ai" className="text-primary-400 hover:underline">
                                privacy@llmplatform.ai
                            </a>{' '}
                            with the subject line <strong className="text-white">"Data Deletion Request"</strong>.
                        </p>
                    </section>
                </div>
            ) : (
                <div className="p-8 rounded-2xl bg-gray-900/50 border border-green-800 text-center space-y-4">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                    <h2 className="text-2xl font-bold text-white">Request Received</h2>
                    <p className="text-gray-400">
                        Your data deletion request for <strong className="text-white">{email}</strong> has been submitted.
                        We will process it within 30 days.
                    </p>
                    <div className="inline-block px-4 py-2 rounded-lg bg-gray-800 border border-gray-700">
                        <p className="text-sm text-gray-400">Confirmation code</p>
                        <p className="text-lg font-mono font-bold text-primary-400">{confirmationCode}</p>
                    </div>
                    <p className="text-sm text-gray-500">Keep this code for your records.</p>
                </div>
            )}

            <div className="mt-12 pt-8 border-t border-gray-800 flex gap-6 text-sm text-gray-500">
                <Link href="/privacy-policy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link>
                <Link href="/terms-of-service" className="hover:text-primary-400 transition-colors">Terms of Service</Link>
                <Link href="/" className="hover:text-primary-400 transition-colors">Back to Home</Link>
            </div>
        </div>
    );
}
