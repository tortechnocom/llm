'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card, CardBody, CardHeader } from '@heroui/react';

import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Handle token from social login callback
    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            router.push('/dashboard');
        }
    }, [searchParams, router]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
            mutation Login($email: String!, $password: String!) {
              login(input: { email: $email, password: $password }) {
                token
                user { id email }
              }
            }
          `,
                    variables: { email, password },
                }),
            });

            const result = await response.json();

            if (result.errors) {
                setError(result.errors[0]?.message || 'Login failed');
                return;
            }

            if (result.data?.login?.token) {
                localStorage.setItem('token', result.data.login.token);
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="flex flex-col gap-2 text-center">
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to your account</p>
                </CardHeader>
                <CardBody className="gap-6">
                    {/* Social Login Buttons */}
                    <div className="flex flex-col gap-2">
                        <Button
                            as={Link}
                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/google`}
                            variant="bordered"
                            startContent={<img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />}
                        >
                            Continue with Google
                        </Button>
                        <Button
                            as={Link}
                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/facebook`}
                            variant="bordered"
                            startContent={<img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook" />}
                        >
                            Continue with Facebook
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-content1 px-2 text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    {/* Email Login */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <Input
                            type="email"
                            label="Email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            startContent={<Mail className="w-4 h-4 text-gray-400" />}
                            required
                        />
                        <Input
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            startContent={<Lock className="w-4 h-4 text-gray-400" />}
                            required
                        />
                        {error && (
                            <div className="bg-danger-500/10 border border-danger-500 text-danger-500 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <Button
                            type="submit"
                            color="primary"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Sign In
                        </Button>
                    </form>

                    <p className="text-center text-sm text-gray-400">
                        Don&apos;t have an account?{' '}
                        <a href="/register" className="text-primary-500 hover:underline">
                            Sign up
                        </a>
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}
