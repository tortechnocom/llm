import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@llm-platform/database';

@Injectable()
export class TokenTransactionsService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        userId: string;
        agentId?: string;
        tokensUsed: number;
        amountDeducted: number;
        transactionType: TransactionType;
        txHash?: string;
    }) {
        const transaction = await this.prisma.tokenTransaction.create({
            data,
            include: {
                user: true,
                agent: true,
            },
        });
        return {
            ...transaction,
            amountDeducted: Number(transaction.amountDeducted),
        };
    }

    async findByUser(userId: string) {
        const transactions = await this.prisma.tokenTransaction.findMany({
            where: { userId },
            include: {
                agent: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return transactions.map(t => ({
            ...t,
            amountDeducted: Number(t.amountDeducted),
        }));
    }

    async findByAgent(agentId: string) {
        const transactions = await this.prisma.tokenTransaction.findMany({
            where: { agentId },
            include: {
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return transactions.map(t => ({
            ...t,
            amountDeducted: Number(t.amountDeducted),
        }));
    }

    async getUserStats(userId: string) {
        const transactions = await this.prisma.tokenTransaction.findMany({
            where: { userId },
        });

        const totalSpent = transactions
            .filter((t) => t.transactionType === 'USAGE')
            .reduce((sum, t) => sum + Number(t.amountDeducted), 0);

        const totalEarned = transactions
            .filter((t) => t.transactionType === 'REWARD')
            .reduce((sum, t) => sum + Number(t.amountDeducted), 0);

        return {
            totalTransactions: transactions.length,
            totalSpent,
            totalEarned,
            netBalance: totalEarned - totalSpent,
        };
    }
}
