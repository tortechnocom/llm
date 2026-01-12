import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AgentsService } from '../agents/agents.service';
import { CreateKnowledgeInput, UpdateKnowledgeInput } from './dto/knowledge.input';

@Injectable()
export class KnowledgeBaseService {
    private ollamaUrl: string;

    constructor(
        private prisma: PrismaService,
        private agentsService: AgentsService,
        private configService: ConfigService,
    ) {
        this.ollamaUrl = this.configService.get<string>('OLLAMA_BASE_URL') || 'http://localhost:11434';
    }

    async create(userId: string, input: CreateKnowledgeInput) {
        // Verify agent ownership
        const agent = await this.agentsService.findOne(input.agentId);
        if (agent.trainerId !== userId) {
            throw new ForbiddenException('You can only add knowledge to your own agents');
        }

        // Generate embedding
        const embedding = await this.generateEmbedding(input.content);

        const knowledge = await this.prisma.knowledgeBase.create({
            data: {
                agentId: input.agentId,
                title: input.title,
                content: input.content,
                metadata: input.metadata || {},
                tags: input.tags || [],
            },
        });

        if (embedding) {
            const embeddingStr = `[${embedding.join(',')}]`;
            await this.prisma.$executeRaw`
                UPDATE knowledge_base
                SET embedding = ${embeddingStr}::vector
                WHERE id = ${knowledge.id}::uuid
            `;
        }

        return knowledge;
    }

    async update(id: string, userId: string, input: UpdateKnowledgeInput) {
        // Get knowledge and verify ownership through agent
        const existingKnowledge = await this.prisma.knowledgeBase.findUnique({
            where: { id },
            include: { agent: true },
        });

        if (!existingKnowledge) {
            throw new ForbiddenException('Knowledge not found');
        }

        if (existingKnowledge.agent.trainerId !== userId) {
            throw new ForbiddenException('You can only update knowledge for your own agents');
        }

        // Prepare update data
        const updateData: any = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.content !== undefined) updateData.content = input.content;
        if (input.metadata !== undefined) updateData.metadata = input.metadata;
        if (input.tags !== undefined) updateData.tags = input.tags;

        // Update basic fields
        const updatedKnowledge = await this.prisma.knowledgeBase.update({
            where: { id },
            data: updateData,
        });

        // Re-generate embedding if content changed
        if (input.content) {
            try {
                const embedding = await this.generateEmbedding(input.content);
                if (embedding) {
                    const embeddingStr = `[${embedding.join(',')}]`;
                    await this.prisma.$executeRaw`
                        UPDATE knowledge_base
                        SET embedding = ${embeddingStr}::vector
                        WHERE id = ${id}::uuid
                    `;
                }
            } catch (error) {
                console.error('Failed to update embedding:', error);
                // Continue execution - don't fail the request just because embedding failed
            }
        }

        return updatedKnowledge;
    }

    async findByAgent(agentId: string) {
        return this.prisma.knowledgeBase.findMany({
            where: { agentId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async delete(id: string, userId: string) {
        // Get knowledge and verify ownership through agent
        const knowledge = await this.prisma.knowledgeBase.findUnique({
            where: { id },
            include: { agent: true },
        });

        if (!knowledge) {
            throw new ForbiddenException('Knowledge not found');
        }

        if (knowledge.agent.trainerId !== userId) {
            throw new ForbiddenException('You can only delete knowledge from your own agents');
        }

        await this.prisma.knowledgeBase.delete({
            where: { id },
        });

        return true;
    }

    async searchSimilar(agentId: string, query: string, limit: number = 5): Promise<any[]> {
        // Generate query embedding
        const queryEmbedding = await this.generateEmbedding(query);

        if (!queryEmbedding) {
            // Fallback to text search if embedding fails
            return this.prisma.$queryRaw`
        SELECT id, title, content, metadata, tags, created_at
        FROM knowledge_base
        WHERE agent_id = ${agentId}::uuid
        AND content ILIKE ${'%' + query + '%'}
        LIMIT ${limit}
      ` as Promise<any[]>;
        }

        // Vector similarity search using pgvector
        const embeddingStr = `[${queryEmbedding.join(',')}]`;

        return this.prisma.$queryRaw`
      SELECT id, title, content, metadata, tags, created_at,
             1 - (embedding <=> ${embeddingStr}::vector) as similarity
      FROM knowledge_base
      WHERE agent_id = ${agentId}::uuid
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}
    ` as Promise<any[]>;
    }

    private async generateEmbedding(text: string): Promise<number[] | null> {
        try {
            const response = await fetch(`${this.ollamaUrl}/api/embeddings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'all-minilm',
                    prompt: text,
                }),
            });

            if (!response.ok) {
                console.error('Failed to generate embedding:', await response.text());
                return null;
            }

            const data = await response.json();
            return (data as any).embedding;
        } catch (error) {
            console.error('Error generating embedding:', error);
            return null;
        }
    }

    async chunkText(text: string, chunkSize: number = 500): Promise<string[]> {
        const chunks: string[] = [];
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

        let currentChunk = '';

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += sentence;
            }
        }

        if (currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }
}
