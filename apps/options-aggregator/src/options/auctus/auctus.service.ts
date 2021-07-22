import { Injectable, Logger } from '@nestjs/common';
import { Option } from '@app/shared/option.schema';
import { AggregatorAbstract } from '../aggregator.abstract';
import { OrderBook } from '@app/shared/orderbook.schema';

// TODO Implement

type TRawOption = Object;

@Injectable()
export class AuctusService extends AggregatorAbstract<TRawOption> {
    protected readonly logger: Logger = new Logger(AuctusService.name);

    protected get rateLimit(): number {
        return null;
    }

    protected async getRawOptions(): Promise<Array<TRawOption>> {
        return null;
    }

    protected async getOrderBook(rawOption: TRawOption): Promise<OrderBook> {
        return null;
    }

    protected constructOptionData(rawOption: TRawOption, orderBook: OrderBook): Option {
        return null;
    }
}
