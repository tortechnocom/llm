'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardBody, CardHeader } from '@heroui/react';

import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // TODO: Implement GraphQL mutation
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

            const { data } = await response.json();

            if (data?.login?.token) {
                localStorage.setItem('token', data.login.token);
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Login failed:', error);
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
                        Don't have an account?{' '}
                        <a href="/register" className="text-primary-500 hover:underline">
                            Sign up
                        </a>
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}
