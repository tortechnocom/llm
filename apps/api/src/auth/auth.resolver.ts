import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/auth.response';
import { LoginInput, RegisterInput, WalletLoginInput } from './dto/auth.input';

@Resolver()
export class AuthResolver {
    constructor(private authService: AuthService) { }

    @Mutation(() => AuthResponse)
    async register(@Args('input') input: RegisterInput): Promise<AuthResponse> {
        return this.authService.register(input);
    }

    @Mutation(() => AuthResponse)
    async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
        return this.authService.login(input);
    }

    @Mutation(() => AuthResponse)
    async walletLogin(@Args('input') input: WalletLoginInput): Promise<AuthResponse> {
        return this.authService.walletLogin(input);
    }

    @Query(() => String)
    async getNonce(@Args('walletAddress') walletAddress: string): Promise<string> {
        return this.authService.getNonce(walletAddress);
    }
}
