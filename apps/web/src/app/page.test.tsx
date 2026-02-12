import { render, screen } from '@testing-library/react';
import Home from './page';
import { vi } from 'vitest';

// Mock next-themes
vi.mock('next-themes', () => ({
    useTheme: () => ({
        theme: 'light',
        setTheme: vi.fn(),
    }),
}));

describe('Home Page', () => {
    it('renders main heading', () => {
        render(<Home />);

        // Check for header
        expect(screen.getByRole('heading', { name: /LLM Platform/i })).toBeInTheDocument();

        // Check for Hero text
        expect(screen.getByText(/Create & Monetize/i)).toBeInTheDocument();

        // Check for CTA buttons (HeroUI Button renders as button even with href)
        expect(screen.getByRole('button', { name: /Explore Marketplace/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Create Agent/i })).toBeInTheDocument();
    });
});
