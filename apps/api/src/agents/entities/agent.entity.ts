import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class AgentCounts {
    @Field(() => Int)
    knowledgeBase: number;

    @Field(() => Int)
    tokenTransactions: number;
}

@ObjectType()
export class Agent {
    @Field(() => ID)
    id: string;

    @Field()
    trainerId: string;

    @Field()
    name: string;

    @Field({ nullable: true })
    domain?: string;

    @Field({ nullable: true })
    systemPrompt?: string;

    @Field(() => Float)
    tokenPriceMultiplier: number;

    @Field()
    isPublic: boolean;

    @Field({ nullable: true })
    description?: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;

    @Field(() => User, { nullable: true })
    trainer?: User;

    @Field(() => AgentCounts, { nullable: true })
    _count?: AgentCounts;
}
