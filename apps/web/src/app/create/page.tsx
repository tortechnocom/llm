'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Input, Textarea, Button, Switch, Slider } from '@heroui/react';
import { Brain, DollarSign, Globe } from 'lucide-react';

export default function CreateAgentPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        description: '',
        systemPrompt: '',
        tokenPriceMultiplier: 1.0,
        isPublic: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    query: `
            mutation CreateAgent($input: CreateAgentInput!) {
              createAgent(input: $input) {
                id
                name
              }
            }
          `,
                    variables: { input: formData },
                }),
            });

            const { data } = await response.json();

            if (data?.createAgent?.id) {
                router.push(`/dashboard`);
            }
        } catch (error) {
            console.error('Failed to create agent:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Create AI Agent</h1>
                    <p className="text-gray-400">
                        Build your own AI agent with custom knowledge and personality
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-primary-500" />
                                <h2 className="text-xl font-semibold">Agent Configuration</h2>
                            </div>
                        </CardHeader>
                        <CardBody className="gap-6">
                            {/* Basic Info */}
                            <Input
                                label="Agent Name"
                                placeholder="e.g., Agriculture Expert"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                isRequired
                            />

                            <Input
                                label="Domain"
                                placeholder="e.g., agriculture, physics, cooking"
                                value={formData.domain}
                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                            />

                            <Textarea
                                label="Description"
                                placeholder="Describe what your agent does and what it's good at..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                minRows={3}
                            />

                            <Textarea
                                label="System Prompt"
                                placeholder="You are a helpful assistant specialized in..."
                                description="This defines your agent's personality and behavior"
                                value={formData.systemPrompt}
                                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                                minRows={4}
                            />

                            {/* Pricing */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-primary-500" />
                                    <label className="text-sm font-medium">
                                        Token Price Multiplier: {formData.tokenPriceMultiplier.toFixed(1)}x
                                    </label>
                                </div>
                                <Slider
                                    size="sm"
                                    step={0.1}
                                    minValue={0.1}
                                    maxValue={10}
                                    value={formData.tokenPriceMultiplier}
                                    onChange={(value) =>
                                        setFormData({ ...formData, tokenPriceMultiplier: value as number })
                                    }
                                    className="max-w-md"
                                />
                                <p className="text-xs text-gray-400">
                                    Higher multiplier = more earnings per usage
                                </p>
                            </div>

                            {/* Visibility */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-primary-500" />
                                    <div>
                                        <p className="text-sm font-medium">Public Agent</p>
                                        <p className="text-xs text-gray-400">
                                            Make this agent available in the marketplace
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    isSelected={formData.isPublic}
                                    onValueChange={(value) => setFormData({ ...formData, isPublic: value })}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="bordered"
                                    className="flex-1"
                                    onPress={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    className="flex-1"
                                    isLoading={isLoading}
                                >
                                    Create Agent
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </form>
            </div>
        </div>
    );
}
