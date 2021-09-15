import { InjectModel } from '@nestjs/mongoose';
import { ESymbol, Option, OptionDocument } from '@app/shared/option.schema';
import { Model } from 'mongoose';
import { HttpService, Logger } from '@nestjs/common';
import * as sleep from 'sleep-promise';
import { OrderBook, OrderBookDocument } from '@app/shared/orderbook.schema';
import { PriceService } from '../price/price.service';

export abstract class AggregatorAbstract<TRawOption> {
    protected readonly logger: Logger;
    protected readonly isGetWithPagination: boolean = false;
    protected readonly pageSize: number = null;

    protected abstract get rateLimit(): number;

    constructor(
        @InjectModel(Option.name) private optionsDataModel: Model<OptionDocument>,
        @InjectModel(OrderBook.name) private orderBookDataModel: Model<OrderBookDocument>,
        protected httpService: HttpService,
        protected priceService: PriceService,
    ) {}

    async startSyncLoop(): Promise<void> {
        if (!this.rateLimit) {
            return;
        }

        try {
            await this.iteration();
        } catch (error) {
            this.logger.error(error);
        }

        setImmediate(this.startSyncLoop.bind(this));
    }

    protected async iteration(): Promise<void> {
        let rawOptions: Array<TRawOption>;

        if (this.isGetWithPagination) {
            rawOptions = await this.getRawOptionsWithPagination();
        } else {
            rawOptions = await this.getRawOptions();
        }

        sleep(this.rateLimit);

        for (const raw of rawOptions) {
            const orderBook: OrderBook | null = await this.getOrderBook(raw);
            const option: Option | null = await this.constructOptionData(raw, orderBook);

            if (orderBook) {
                await this.saveOrderBook(orderBook);
            }

            if (option) {
                this.normalizeOptionBase(option);
                await this.saveResult(option);
            }

            sleep(this.rateLimit);
        }
    }

    private async saveOrderBook(orderBook: OrderBook): Promise<void> {
        await this.orderBookDataModel.updateOne({ optionId: orderBook.optionId }, orderBook, { upsert: true });
    }

    private async saveResult(data: Option): Promise<void> {
        await this.optionsDataModel.updateOne({ id: data.id }, data, { upsert: true });
    }

    throwRequestError(type: string, data: Record<string, unknown>): never {
        throw new Error(`Invalid response - ${type} - ${JSON.stringify(data, null, 2)}`);
    }

    private async getRawOptionsWithPagination(): Promise<Array<TRawOption>> {
        const result: Array<TRawOption> = [];
        let skip = 0;

        while (true) {
            const data: Array<TRawOption> = await this.getRawOptions(skip);

            if (!data.length) {
                break;
            }

            result.push(...data);
            skip += this.pageSize;

            await sleep(this.rateLimit);
        }

        return result;
    }

    private normalizeOptionBase(option: Option): void {
        if (option.base === ESymbol.WETH) {
            option.base = ESymbol.ETH;
        }

        if (option.base === ESymbol.WBTC) {
            option.base = ESymbol.BTC;
        }
    }

    protected abstract getRawOptions(skip?: number): Promise<Array<TRawOption>>;
    protected abstract getOrderBook(rawOption: TRawOption): Promise<OrderBook | null>;
    protected abstract constructOptionData(
        rawOption: TRawOption,
        orderBook: OrderBook | null,
    ): Option | null | Promise<Option | null>;
}
