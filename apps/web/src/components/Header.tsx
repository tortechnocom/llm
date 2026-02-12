'use client';

import Link from 'next/link';
import { Brain } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { AuthButton } from './AuthButton';

export function Header() {
    return (
        <header className="border-b border-gray-800 bg-background/50 backdrop-blur sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Brain className="w-8 h-8 text-primary-500" />
                    <h1 className="text-2xl font-bold">LLM Platform</h1>
                </Link>
                <div className="flex items-center gap-4">
                    <ThemeSwitcher />
                    <AuthButton />
                </div>
            </div>
        </header>
    );
}
