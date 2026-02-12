'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@heroui/react';
import { LogIn, LogOut } from 'lucide-react';
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

    if (!mounted) return <Button variant="light" isLoading />;

    return (
        <>
            {isLoggedIn && (
                <Button
                    variant="flat"
                    color="danger"
                    onPress={handleLogout}
                    startContent={<LogOut className="w-4 h-4" />}
                >
                    Logout
                </Button>
            )}
            {!isLoggedIn && pathname !== '/login' && pathname !== '/register' && (
                <Button
                    variant="flat"
                    color="primary"
                    onPress={handleLogin}
                    startContent={<LogIn className="w-4 h-4" />}
                >
                    Login
                </Button>
            )}
        </>
    );
}
