'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@heroui/react';
import { LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AuthButton() {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, [pathname]);

    const handleLogin = () => {
        router.push('/login');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        router.push('/login');
    };

    if (!mounted) return <Button variant="light" isLoading size="sm" />;

    return (
        <>
            {isLoggedIn && (
                <>
                    <Button
                        as={Link}
                        href="/dashboard"
                        variant="ghost"
                        size="sm"
                        startContent={<LayoutDashboard className="w-4 h-4" />}
                        className="hidden sm:flex"
                    >
                        Dashboard
                    </Button>
                    {/* Mobile: icon only */}
                    <Button
                        as={Link}
                        href="/dashboard"
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        className="sm:hidden"
                        aria-label="Dashboard"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="flat"
                        color="danger"
                        size="sm"
                        onPress={handleLogout}
                        startContent={<LogOut className="w-4 h-4" />}
                        className="hidden sm:flex"
                    >
                        Logout
                    </Button>
                    <Button
                        variant="flat"
                        color="danger"
                        size="sm"
                        isIconOnly
                        onPress={handleLogout}
                        className="sm:hidden"
                        aria-label="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </>
            )}
            {!isLoggedIn && pathname !== '/login' && pathname !== '/register' && (
                <>
                    <Button
                        variant="flat"
                        color="primary"
                        size="sm"
                        onPress={handleLogin}
                        startContent={<LogIn className="w-4 h-4" />}
                        className="hidden sm:flex"
                    >
                        Login
                    </Button>
                    <Button
                        variant="flat"
                        color="primary"
                        size="sm"
                        isIconOnly
                        onPress={handleLogin}
                        className="sm:hidden"
                        aria-label="Login"
                    >
                        <LogIn className="w-4 h-4" />
                    </Button>
                </>
            )}
        </>
    );
}
