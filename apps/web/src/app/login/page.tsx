'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardBody, CardHeader } from '@heroui/react';
import { Mail, Lock, Wallet } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';

export default function LoginPage() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();

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

    const handleWalletLogin = async () => {
        if (!address) return;

        setIsLoading(true);

        try {
            // Get nonce
            const nonceResponse = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `query GetNonce($address: String!) { getNonce(walletAddress: $address) }`,
                    variables: { address },
                }),
            });

            const { data: nonceData } = await nonceResponse.json();
            const message = nonceData.getNonce;

            // Sign message
            const signature = await signMessageAsync({ message });

            // Login with signature
            const loginResponse = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
            mutation WalletLogin($address: String!, $signature: String!, $message: String!) {
              walletLogin(input: { 
                walletAddress: $address
                signature: $signature
                message: $message
              }) {
                token
                user { id walletAddress }
              }
            }
          `,
                    variables: { address, signature, message },
                }),
            });

            const { data } = await loginResponse.json();

            if (data?.walletLogin?.token) {
                localStorage.setItem('token', data.walletLogin.token);
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Wallet login failed:', error);
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
                    {/* Wallet Login */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Wallet className="w-4 h-4" />
                            <span>Connect with Web3 Wallet</span>
                        </div>
                        {isConnected ? (
                            <Button
                                color="primary"
                                size="lg"
                                className="w-full"
                                onPress={handleWalletLogin}
                                isLoading={isLoading}
                            >
                                Sign Message to Login
                            </Button>
                        ) : (
                            <ConnectButton />
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-900 text-gray-400">Or continue with email</span>
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
