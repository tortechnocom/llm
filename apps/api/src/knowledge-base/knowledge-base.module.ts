import { Module } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeBaseResolver } from './knowledge-base.resolver';
import { AgentsModule } from '../agents/agents.module';

@Module({
    imports: [AgentsModule],
    providers: [KnowledgeBaseService, KnowledgeBaseResolver],
    exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule { }
