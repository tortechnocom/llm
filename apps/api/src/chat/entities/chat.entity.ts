import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class ChatMessage {
    @Field(() => ID)
    id: string;

    @Field()
    sessionId: string;

    @Field()
    role: string;

    @Field()
    content: string;

    @Field(() => GraphQLJSONObject, { nullable: true })
    metadata?: any;

    @Field()
    createdAt: Date;
}

@ObjectType()
export class ChatSession {
    @Field(() => ID)
    id: string;

    @Field()
    userId: string;

    @Field()
    agentId: string;

    @Field({ nullable: true })
    title?: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;

    @Field(() => [ChatMessage], { nullable: true })
    messages?: ChatMessage[];
}
