import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProviders } from '@/providers/AppProviders';
import { Header } from '@/components/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'LLM Platform - AI Agent Marketplace',
    description: 'Create, share, and monetize AI agents with blockchain technology',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <AppProviders>
                    <div className="flex flex-col min-h-screen">
                        <Header />
                        <main className="flex-1">
                            {children}
                        </main>
                    </div>
                </AppProviders>
            </body>
        </html>
    );
}
