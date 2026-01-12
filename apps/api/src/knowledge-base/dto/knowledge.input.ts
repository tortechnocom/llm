import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';

@InputType()
export class CreateKnowledgeInput {
    @Field()
    @IsString()
    agentId: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    title?: string;

    @Field()
    @IsString()
    content: string;

    @Field(() => GraphQLJSONObject, { nullable: true })
    @IsOptional()
    @IsObject()
    metadata?: any;

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    tags?: string[];
}

@InputType()
export class UpdateKnowledgeInput {
    @Field()
    @IsString()
    id: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    title?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    content?: string;

    @Field(() => GraphQLJSONObject, { nullable: true })
    @IsOptional()
    @IsObject()
    metadata?: any;

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    tags?: string[];
}
