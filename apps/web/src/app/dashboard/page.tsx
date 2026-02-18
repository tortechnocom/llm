'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Chip } from '@heroui/react';
import { Plus, TrendingUp, DollarSign, MessageSquare } from 'lucide-react';
import Link from 'next/link';

import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default function DashboardPage() {
    const router = useRouter();
    const [myAgents, setMyAgents] = useState([]);
    const [stats, setStats] = useState({
        totalSpent: 0,
        totalEarned: 0,
        netBalance: 0,
        totalTransactions: 0,
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchMyAgents();
        fetchStats();
    }, [router]);

    const fetchMyAgents = async () => {
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
            query MyAgents {
              myAgents {
                id
                name
                domain
                isPublic
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
            setMyAgents(data?.myAgents || []);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        }
    };

    const fetchStats = async () => {
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
            query MyStats {
              myStats {
                totalSpent
                totalEarned
                netBalance
                totalTransactions
              }
            }
          `,
                }),
            });

            const { data } = await response.json();
            setStats(data?.myStats || stats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">


                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                        <p className="text-gray-400">Manage your AI agents and earnings</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        <Button
                            as={Link}
                            href="/create"
                            color="primary"
                            size="lg"
                            startContent={<Plus className="w-5 h-5" />}
                        >
                            Create Agent
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardBody className="gap-2">
                            <div className="flex items-center gap-2 text-green-500">
                                <TrendingUp className="w-5 h-5" />
                                <span className="text-sm">Total Earned</span>
                            </div>
                            <p className="text-2xl font-bold">${stats.totalEarned.toFixed(2)}</p>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="gap-2">
                            <div className="flex items-center gap-2 text-red-500">
                                <DollarSign className="w-5 h-5" />
                                <span className="text-sm">Total Spent</span>
                            </div>
                            <p className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</p>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="gap-2">
                            <div className="flex items-center gap-2 text-primary-500">
                                <DollarSign className="w-5 h-5" />
                                <span className="text-sm">Net Balance</span>
                            </div>
                            <p className="text-2xl font-bold">${stats.netBalance.toFixed(2)}</p>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="gap-2">
                            <div className="flex items-center gap-2 text-purple-500">
                                <MessageSquare className="w-5 h-5" />
                                <span className="text-sm">Transactions</span>
                            </div>
                            <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                        </CardBody>
                    </Card>
                </div>

                {/* My Agents */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">My Agents</h2>
                    {myAgents.length === 0 ? (
                        <Card>
                            <CardBody className="text-center py-12">
                                <p className="text-gray-400 mb-4">You haven't created any agents yet</p>
                                <Button
                                    as={Link}
                                    href="/create"
                                    color="primary"
                                    startContent={<Plus className="w-5 h-5" />}
                                >
                                    Create Your First Agent
                                </Button>
                            </CardBody>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myAgents.map((agent: any) => (
                                <Card key={agent.id}>
                                    <CardHeader className="flex justify-between">
                                        <h3 className="text-lg font-semibold">{agent.name}</h3>
                                        <Chip size="sm" color={agent.isPublic ? 'success' : 'default'}>
                                            {agent.isPublic ? 'Public' : 'Private'}
                                        </Chip>
                                    </CardHeader>
                                    <CardBody className="gap-4">
                                        {agent.domain && (
                                            <Chip size="sm" variant="flat">
                                                {agent.domain}
                                            </Chip>
                                        )}
                                        <div className="flex gap-4 text-sm text-gray-400">
                                            <span>{agent._count.knowledgeBase} docs</span>
                                            <span>{agent._count.tokenTransactions} chats</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                as={Link}
                                                href={`/agent/${agent.id}`}
                                                size="sm"
                                                variant="bordered"
                                                className="flex-1"
                                            >
                                                Manage
                                            </Button>
                                            <Button
                                                as={Link}
                                                href={`/chat?agentId=${agent.id}`}
                                                size="sm"
                                                color="primary"
                                                className="flex-1"
                                            >
                                                Chat
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
