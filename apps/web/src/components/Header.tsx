'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Brain, Menu, X } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { AuthButton } from './AuthButton';

export function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="border-b border-gray-800 bg-background/50 backdrop-blur sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Brain className="w-7 h-7 text-primary-500" />
                    <span className="text-xl font-bold hidden sm:block">LLM Platform</span>
                    <span className="text-xl font-bold sm:hidden">LLM</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-2">
                    <Link href="/marketplace" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800">
                        Marketplace
                    </Link>
                    <Link href="/create" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800">
                        Create Agent
                    </Link>
                </nav>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    <ThemeSwitcher />
                    <div className="hidden sm:flex">
                        <AuthButton />
                    </div>
                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-gray-800 bg-background/95 backdrop-blur px-4 py-4 flex flex-col gap-3">
                    <Link
                        href="/marketplace"
                        className="text-sm text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-gray-800"
                        onClick={() => setMenuOpen(false)}
                    >
                        Marketplace
                    </Link>
                    <Link
                        href="/create"
                        className="text-sm text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-gray-800"
                        onClick={() => setMenuOpen(false)}
                    >
                        Create Agent
                    </Link>
                    <div className="pt-2 border-t border-gray-800">
                        <AuthButton />
                    </div>
                </div>
            )}
        </header>
    );
}
