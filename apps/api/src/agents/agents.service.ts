import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentInput, UpdateAgentInput } from './dto/agent.input';

@Injectable()
export class AgentsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, input: CreateAgentInput) {
        return this.prisma.agent.create({
            data: {
                ...input,
                trainerId: userId,
            },
            include: {
                trainer: true,
            },
        });
    }

    async findAll(isPublic?: boolean) {
        return this.prisma.agent.findMany({
            where: isPublic !== undefined ? { isPublic } : undefined,
            include: {
                trainer: true,
                _count: {
                    select: {
                        knowledgeBase: true,
                        tokenTransactions: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const agent = await this.prisma.agent.findUnique({
            where: { id },
            include: {
                trainer: true,
                _count: {
                    select: {
                        knowledgeBase: true,
                        tokenTransactions: true,
                    },
                },
            },
        });

        if (!agent) {
            throw new NotFoundException('Agent not found');
        }

        return agent;
    }

    async findByTrainer(trainerId: string) {
        return this.prisma.agent.findMany({
            where: { trainerId },
            include: {
                _count: {
                    select: {
                        knowledgeBase: true,
                        tokenTransactions: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async update(id: string, userId: string, input: UpdateAgentInput) {
        // Check ownership
        const agent = await this.findOne(id);
        if (agent.trainerId !== userId) {
            throw new ForbiddenException('You can only update your own agents');
        }

        return this.prisma.agent.update({
            where: { id },
            data: input,
            include: {
                trainer: true,
            },
        });
    }

    async delete(id: string, userId: string) {
        // Check ownership
        const agent = await this.findOne(id);
        if (agent.trainerId !== userId) {
            throw new ForbiddenException('You can only delete your own agents');
        }

        await this.prisma.agent.delete({
            where: { id },
        });

        return true;
    }

    async searchByDomain(domain: string) {
        return this.prisma.agent.findMany({
            where: {
                domain: {
                    contains: domain,
                    mode: 'insensitive',
                },
                isPublic: true,
            },
            include: {
                trainer: true,
            },
        });
    }
}
