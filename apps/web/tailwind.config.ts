import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/react';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
            },
        },
    },
    darkMode: 'class',
    plugins: [
        heroui({
            themes: {
                dark: {
                    colors: {
                        background: '#000000',
                        primary: {
                            DEFAULT: '#0ea5e9',
                            foreground: '#ffffff',
                        },
                        focus: '#0ea5e9',
                    },
                },
                light: {
                    colors: {
                        primary: {
                            DEFAULT: '#0ea5e9',
                            foreground: '#000000',
                        },
                        focus: '#0ea5e9',
                    },
                },
            },
        }),
    ],
};

export default config;
