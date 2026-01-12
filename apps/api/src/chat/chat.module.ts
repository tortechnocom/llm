import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { ChatGateway } from './chat.gateway';
import { AgentsModule } from '../agents/agents.module';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';
import { TokenTransactionsModule } from '../token-transactions/token-transactions.module';

@Module({
    imports: [AgentsModule, KnowledgeBaseModule, TokenTransactionsModule],
    providers: [ChatService, ChatResolver, ChatGateway],
    exports: [ChatService],
})
export class ChatModule { }
