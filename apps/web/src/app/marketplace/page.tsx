'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Chip } from '@heroui/react';
import { Search, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';

interface Agent {
    id: string;
    name: string;
    domain: string;
    description: string;
    tokenPriceMultiplier: number;
    trainer: {
        firstName: string;
        lastName: string;
    };
    _count: {
        knowledgeBase: number;
        tokenTransactions: number;
    };
}

export default function MarketplacePage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [marketplaceStats, setMarketplaceStats] = useState({
        totalChats: 0,
        totalAgents: 0,
        totalCreators: 0,
    });

    useEffect(() => {
        fetchAgents();
        fetchMarketplaceStats();
    }, []);

    const fetchAgents = async () => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
            query GetAgents {
              agents(isPublic: true) {
                id
                name
                domain
                description
                tokenPriceMultiplier
                trainer {
                  firstName
                  lastName
                }
                _count {
                  knowledgeBase
                  tokenTransactions
                }
              }
            }
          `,
                }),
            });

            const { data } = await response.json();
            setAgents(data?.agents || []);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMarketplaceStats = async () => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
            query MarketplaceStats {
              marketplaceStats {
                totalChats
                totalAgents
                totalCreators
              }
            }
          `,
                }),
            });
            const { data } = await response.json();
            if (data?.marketplaceStats) {
                setMarketplaceStats(data.marketplaceStats);
            }
        } catch (error) {
            console.error('Failed to fetch marketplace stats:', error);
        }
    };

    const filteredAgents = agents.filter(
        (agent) =>
            agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold mb-2">Agent Marketplace</h1>
                    <p className="text-gray-400">Discover and use AI agents created by the community</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Search */}
                <div className="mb-8">
                    <Input
                        size="lg"
                        placeholder="Search agents by name, domain, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        startContent={<Search className="w-5 h-5 text-gray-400" />}
                        classNames={{
                            input: 'text-lg',
                            inputWrapper: 'h-14',
                        }}
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardBody className="flex flex-row items-center gap-4">
                            <div className="p-3 rounded-lg bg-primary-500/10">
                                <Zap className="w-6 h-6 text-primary-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{marketplaceStats.totalAgents}</p>
                                <p className="text-sm text-gray-400">Active Agents</p>
                            </div>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="flex flex-row items-center gap-4">
                            <div className="p-3 rounded-lg bg-green-500/10">
                                <Users className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{marketplaceStats.totalCreators}</p>
                                <p className="text-sm text-gray-400">Creators</p>
                            </div>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="flex flex-row items-center gap-4">
                            <div className="p-3 rounded-lg bg-purple-500/10">
                                <TrendingUp className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{marketplaceStats.totalChats}</p>
                                <p className="text-sm text-gray-400">Total Chats</p>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Agents Grid */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400">Loading agents...</p>
                    </div>
                ) : filteredAgents.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No agents found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAgents.map((agent) => (
                            <Card key={agent.id} className="hover:border-primary-500/50 transition-colors">
                                <CardHeader className="flex flex-col items-start gap-2">
                                    <div className="flex items-start justify-between w-full">
                                        <h3 className="text-xl font-bold">{agent.name}</h3>
                                        {agent.domain && (
                                            <Chip size="sm" color="primary" variant="flat">
                                                {agent.domain}
                                            </Chip>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        by {agent.trainer.firstName || 'Anonymous'}
                                    </p>
                                </CardHeader>
                                <CardBody className="gap-4">
                                    <p className="text-gray-300 line-clamp-3">
                                        {agent.description || 'No description available'}
                                    </p>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex gap-4 text-gray-400">
                                            <span>{agent._count.knowledgeBase} docs</span>
                                            <span>{agent._count.tokenTransactions} chats</span>
                                        </div>
                                        <span className="text-primary-500 font-semibold">
                                            {agent.tokenPriceMultiplier}x
                                        </span>
                                    </div>

                                    <Button
                                        as={Link}
                                        href={`/chat?agentId=${agent.id}`}
                                        color="primary"
                                        className="w-full"
                                    >
                                        Start Chat
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
