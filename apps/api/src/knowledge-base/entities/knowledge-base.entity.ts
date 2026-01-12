import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class KnowledgeBase {
    @Field(() => ID)
    id: string;

    @Field()
    agentId: string;

    @Field({ nullable: true })
    title?: string;

    @Field()
    content: string;

    @Field(() => GraphQLJSONObject, { nullable: true })
    metadata?: any;

    @Field(() => [String])
    tags: string[];

    @Field()
    createdAt: Date;
}
