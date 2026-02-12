import { render, screen } from '@testing-library/react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { vi } from 'vitest';

// Mock next-themes
vi.mock('next-themes', () => ({
    useTheme: () => ({
        theme: 'light',
        setTheme: vi.fn(),
    }),
}));

describe('ThemeSwitcher', () => {
    it('renders toggle button', () => {
        render(<ThemeSwitcher />);
        const button = screen.getByLabelText('Toggle theme');
        expect(button).toBeInTheDocument();
    });
});
