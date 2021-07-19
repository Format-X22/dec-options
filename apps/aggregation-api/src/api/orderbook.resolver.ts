import { Args, Query, Resolver } from '@nestjs/graphql';
import { OrderBook } from '@app/shared/orderbook.schema';
import { ApiService } from './api.service';
import { EMarketKey } from '@app/shared/market.schema';

@Resolver((): typeof OrderBook => OrderBook)
export class OrderBookResolver {
    constructor(private readonly apiService: ApiService) {}

    @Query((): typeof OrderBook => OrderBook, { nullable: true })
    async orderBook(
        @Args('optionMarketKey', { type: (): typeof EMarketKey => EMarketKey }) optionMarketKey: EMarketKey,
        @Args('optionId', { type: (): typeof String => String }) optionId: string,
    ): Promise<OrderBook | null> {
        return this.apiService.getOrderBook(optionMarketKey, optionId);
    }
}
