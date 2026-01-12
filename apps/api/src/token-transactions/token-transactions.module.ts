import { Module } from '@nestjs/common';
import { TokenTransactionsService } from './token-transactions.service';
import { TokenTransactionsResolver } from './token-transactions.resolver';

@Module({
    providers: [TokenTransactionsService, TokenTransactionsResolver],
    exports: [TokenTransactionsService],
})
export class TokenTransactionsModule { }
