'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card, CardBody, CardHeader } from '@heroui/react';
import { Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
            mutation Register($input: RegisterInput!) {
              register(input: $input) {
                token
                user { id email firstName lastName }
              }
            }
          `,
                    variables: {
                        input: {
                            email: formData.email,
                            password: formData.password,
                            firstName: formData.firstName,
                            lastName: formData.lastName,
                        },
                    },
                }),
            });

            const { data, errors } = await response.json();

            if (errors) {
                console.error('Registration errors:', errors);
                alert(errors[0].message || 'Registration failed');
                return;
            }

            if (data?.register?.token) {
                localStorage.setItem('token', data.register.token);
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="flex flex-col gap-2 text-center">
                    <h1 className="text-2xl font-bold">Create Account</h1>
                    <p className="text-gray-400">Join the LLM Agent Marketplace</p>
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

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="flex gap-4">
                            <Input
                                name="firstName"
                                label="First Name"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={handleChange}
                                startContent={<User className="w-4 h-4 text-gray-400" />}
                                required
                            />
                            <Input
                                name="lastName"
                                label="Last Name"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Input
                            type="email"
                            name="email"
                            label="Email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            startContent={<Mail className="w-4 h-4 text-gray-400" />}
                            required
                        />

                        <Input
                            type="password"
                            name="password"
                            label="Password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            startContent={<Lock className="w-4 h-4 text-gray-400" />}
                            required
                            minLength={8}
                        />

                        <Input
                            type="password"
                            name="confirmPassword"
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
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
                            Create Account
                        </Button>
                    </form>

                    <p className="text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <a href="/login" className="text-primary-500 hover:underline">
                            Log in
                        </a>
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}
