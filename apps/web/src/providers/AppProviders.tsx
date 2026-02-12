'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

import { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="dark">
            <HeroUIProvider>{children}</HeroUIProvider>
        </NextThemesProvider>
    );
}
