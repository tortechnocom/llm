import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';

@InputType()
export class CreateAgentInput {
    @Field()
    @IsString()
    name: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    domain?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    systemPrompt?: string;

    @Field(() => Float, { defaultValue: 1.0 })
    @IsOptional()
    @IsNumber()
    @Min(0.1)
    @Max(10)
    tokenPriceMultiplier?: number;

    @Field({ defaultValue: false })
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string;
}

@InputType()
export class UpdateAgentInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    name?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    domain?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    systemPrompt?: string;

    @Field(() => Float, { nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0.1)
    @Max(10)
    tokenPriceMultiplier?: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string;
}
