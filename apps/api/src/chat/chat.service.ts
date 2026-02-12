import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ollama } from 'ollama';
import { PrismaService } from '../prisma/prisma.service';
import { AgentsService } from '../agents/agents.service';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { TokenTransactionsService } from '../token-transactions/token-transactions.service';

@Injectable()
export class ChatService {
    private ollama: Ollama;

    constructor(
        private prisma: PrismaService,
        private agentsService: AgentsService,
        private knowledgeBaseService: KnowledgeBaseService,
        private tokenTransactionsService: TokenTransactionsService,
        private configService: ConfigService,
    ) {
        const ollamaUrl = this.configService.get<string>('OLLAMA_BASE_URL') || 'http://localhost:11434';
        this.ollama = new Ollama({ host: ollamaUrl });
    }

    async createSession(userId: string | null, agentId: string, title?: string) {
        // Verify agent exists
        await this.agentsService.findOne(agentId);

        return this.prisma.chatSession.create({
            data: {
                userId: userId || undefined,
                agentId,
                title: title || 'New Chat',
            },
        });
    }

    async getUserSessions(userId: string) {
        return this.prisma.chatSession.findMany({
            where: { userId },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async getSession(sessionId: string) {
        return this.prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }

    async sendMessage(
        userId: string | null,
        sessionId: string,
        content: string,
    ): Promise<{ message: any; response: string; tokensUsed: number }> {
        // Get session and verify ownership
        const session = await this.getSession(sessionId);
        if (!session || session.userId !== userId) {
            throw new Error('Session not found or unauthorized');
        }

        // Get agent
        const agent = await this.agentsService.findOne(session.agentId);

        // Save user message
        await this.prisma.chatMessage.create({
            data: {
                sessionId,
                role: 'user',
                content,
            },
        });

        // Get relevant knowledge using RAG
        const relevantKnowledge = await this.knowledgeBaseService.searchSimilar(
            session.agentId,
            content,
            3,
        );

        // Build context from knowledge base
        const context = relevantKnowledge
            .map((k: any) => `${k.title || ''}\n${k.content}`)
            .join('\n\n---\n\n');

        // Get conversation history
        const history = session.messages
            .slice(-10) // Last 10 messages
            .map((m) => `${m.role}: ${m.content}`)
            .join('\n');

        // Build prompt
        const systemPrompt = agent.systemPrompt || 'You are a helpful AI assistant.';
        const prompt = this.buildPrompt(systemPrompt, context, history, content);

        // Generate response using Ollama
        const response = await this.generateResponse(prompt);

        // Save assistant message
        const assistantMessage = await this.prisma.chatMessage.create({
            data: {
                sessionId,
                role: 'assistant',
                content: response.content,
                metadata: {
                    model: response.model,
                    tokensUsed: response.tokensUsed,
                },
            },
        });

        // Update session timestamp
        await this.prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() },
        });

        // Record token usage
        const cost = response.tokensUsed * agent.tokenPriceMultiplier * 0.0001; // Example pricing
        if (userId) {
            await this.tokenTransactionsService.create({
                userId,
                agentId: session.agentId,
                tokensUsed: response.tokensUsed,
                amountDeducted: cost,
                transactionType: 'USAGE',
            });
        }

        return {
            message: assistantMessage,
            response: response.content,
            tokensUsed: response.tokensUsed,
        };
    }

    async *streamMessage(
        userId: string | null,
        sessionId: string,
        content: string,
    ): AsyncGenerator<string> {
        console.log('Service streamMessage called:', { userId, sessionId, content });
        // Get session and verify ownership
        const session = await this.getSession(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }

        if (session.userId && session.userId !== userId) {
            throw new Error('Unauthorized');
        }

        // Get agent
        const agent = await this.agentsService.findOne(session.agentId);

        // Save user message
        await this.prisma.chatMessage.create({
            data: {
                sessionId,
                role: 'user',
                content,
            },
        });

        // Get relevant knowledge
        const relevantKnowledge = await this.knowledgeBaseService.searchSimilar(
            session.agentId,
            content,
            3,
        );

        const context = relevantKnowledge
            .map((k: any) => `${k.title || ''}\n${k.content}`)
            .join('\n\n---\n\n');

        const history = session.messages
            .slice(-10)
            .map((m) => `${m.role}: ${m.content}`)
            .join('\n');

        const systemPrompt = agent.systemPrompt || 'You are a helpful AI assistant.';
        const prompt = this.buildPrompt(systemPrompt, context, history, content);

        // Stream response
        let fullResponse = '';
        const stream = await this.ollama.generate({
            model: 'llama3', // or mistral, or any model you have
            prompt,
            stream: true,
        });

        for await (const chunk of stream) {
            if (chunk.response) {
                fullResponse += chunk.response;
                yield chunk.response;
            }
        }

        // Save complete response
        await this.prisma.chatMessage.create({
            data: {
                sessionId,
                role: 'assistant',
                content: fullResponse,
            },
        });

        // Update session
        await this.prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() },
        });
    }

    private buildPrompt(
        systemPrompt: string,
        context: string,
        history: string,
        userMessage: string,
    ): string {
        return `${systemPrompt}

${context ? `Relevant Information:\n${context}\n` : ''}
${history ? `Conversation History:\n${history}\n` : ''}
User: ${userMessage}
Assistant:`;
    }

    private async generateResponse(
        prompt: string,
    ): Promise<{ content: string; model: string; tokensUsed: number }> {
        const response = await this.ollama.generate({
            model: 'llama3',
            prompt,
            stream: false,
        });

        return {
            content: response.response,
            model: 'llama3',
            tokensUsed: response.eval_count || 0,
        };
    }

    async deleteSession(sessionId: string, userId: string) {
        const session = await this.getSession(sessionId);
        if (!session || session.userId !== userId) {
            throw new Error('Session not found or unauthorized');
        }

        await this.prisma.chatSession.delete({
            where: { id: sessionId },
        });

        return true;
    }
}
