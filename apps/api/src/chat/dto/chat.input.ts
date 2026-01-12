import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class CreateSessionInput {
    @Field()
    @IsString()
    agentId: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    title?: string;
}

@InputType()
export class SendMessageInput {
    @Field()
    @IsString()
    sessionId: string;

    @Field()
    @IsString()
    content: string;
}
