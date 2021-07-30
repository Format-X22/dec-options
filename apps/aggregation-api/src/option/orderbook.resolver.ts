import { Args, Query, Resolver } from '@nestjs/graphql';
import { OrderBook } from '@app/shared/orderbook.schema';
import { OptionService } from './option.service';
import { EMarketKey } from '@app/shared/market.schema';

@Resolver((): typeof OrderBook => OrderBook)
export class OrderBookResolver {
    constructor(private readonly optionService: OptionService) {}

    @Query((): typeof OrderBook => OrderBook, { nullable: true })
    async orderBook(
        @Args('optionMarketKey', { type: (): typeof EMarketKey => EMarketKey }) optionMarketKey: EMarketKey,
        @Args('optionId', { type: (): typeof String => String }) optionId: string,
    ): Promise<OrderBook | null> {
        return this.optionService.getOrderBook(optionMarketKey, optionId);
    }
}
