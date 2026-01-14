'use client';

import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from '@heroui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Sparkles, Brain, Coins } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen">
            {/* Header */}
            <header className="border-b border-gray-800">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Brain className="w-8 h-8 text-primary-500" />
                        <h1 className="text-2xl font-bold">LLM Platform</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        <ConnectButton />
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        <span className="text-sm text-primary-500">Powered by Blockchain & AI</span>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-bold mb-12 pb-2 bg-gradient-to-r from-primary-400 to-purple-500 bg-clip-text text-transparent">
                        Create & Monetize
                        <br />
                        AI Agents
                    </h2>

                    <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                        Build intelligent AI agents with custom knowledge bases, share them with the world,
                        and earn tokens when others use your creations.
                    </p>

                    <div className="flex gap-4 justify-center">
                        <Button
                            as={Link}
                            href="/marketplace"
                            size="lg"
                            color="primary"
                            className="font-semibold"
                        >
                            Explore Marketplace
                        </Button>
                        <Button
                            as={Link}
                            href="/create"
                            size="lg"
                            variant="bordered"
                            className="font-semibold"
                        >
                            Create Agent
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container mx-auto px-4 py-20">
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Brain className="w-12 h-12" />}
                        title="Custom AI Agents"
                        description="Train agents with your own knowledge base using RAG technology. Specialize in any domain."
                    />
                    <FeatureCard
                        icon={<Coins className="w-12 h-12" />}
                        title="Earn Tokens"
                        description="Get paid when others use your agents. Automatic revenue sharing via smart contracts."
                    />
                    <FeatureCard
                        icon={<Sparkles className="w-12 h-12" />}
                        title="Blockchain Powered"
                        description="Transparent payments on Base L2. Low fees, fast transactions, full ownership."
                    />
                </div>
            </section>

            {/* Stats */}
            <section className="container mx-auto px-4 py-20">
                <div className="grid md:grid-cols-4 gap-8 text-center">
                    <StatCard value="1,234" label="Active Agents" />
                    <StatCard value="45K" label="Total Users" />
                    <StatCard value="$2.5M" label="Creator Earnings" />
                    <StatCard value="99.9%" label="Uptime" />
                </div>
            </section>
        </main>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:border-primary-500/50 transition-colors shadow-md dark:shadow-none">
            <div className="text-primary-500 mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    );
}

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <div>
            <div className="text-4xl font-bold text-primary-500 mb-2">{value}</div>
            <div className="text-gray-400">{label}</div>
        </div>
    );
}
