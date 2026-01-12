'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Web3Provider } from '@/providers/Web3Provider';
import { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <Web3Provider>
            <NextThemesProvider attribute="class" defaultTheme="dark">
                <HeroUIProvider>{children}</HeroUIProvider>
            </NextThemesProvider>
        </Web3Provider>
    );
}
