import { InjectModel } from '@nestjs/mongoose';
import { Option, OptionDocument } from '@app/shared/option.schema';
import { Model } from 'mongoose';
import { HttpService, Logger } from '@nestjs/common';
import * as sleep from 'sleep-promise';
import { OrderBook, OrderBookDocument } from '@app/shared/orderbook.schema';
import { BasePrice, BasePriceDocument } from '@app/shared/base-price.schema';

export abstract class AggregatorAbstract<TRawOption> {
    protected logger: Logger;
    protected abstract get rateLimit(): number;
    protected isGetWithPagination = false;
    protected readonly pageSize: number = null;

    constructor(
        @InjectModel(Option.name) private optionsDataModel: Model<OptionDocument>,
        @InjectModel(OrderBook.name) private orderBookDataModel: Model<OrderBookDocument>,
        @InjectModel(BasePrice.name) private basePriceModel: Model<BasePriceDocument>,
        protected httpService: HttpService,
    ) {}

    async startSyncLoop(): Promise<void> {
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
            if (!this.pageSize) {
                this.logger.error(`Invalid page size = ${this.pageSize}`);
                sleep(this.rateLimit * 10);
                return;
            }

            rawOptions = await this.getRawOptionsWithPagination();
        } else {
            if (this.pageSize) {
                this.logger.error(`Page size unacceptable = ${this.pageSize}`);
                sleep(this.rateLimit * 10);
                return;
            }

            rawOptions = await this.getRawOptions();
        }

        sleep(this.rateLimit);

        for (const raw of rawOptions) {
            const orderBook: OrderBook = await this.getOrderBook(raw);
            const option: Option = this.constructOptionData(raw, orderBook);

            await this.saveOrderBook(orderBook);
            await this.saveResult(option);

            sleep(this.rateLimit);
        }
    }

    protected async getBasePrice(symbol: string): Promise<number> {
        const result: BasePrice = await this.basePriceModel.findOne({ symbol }, { price: true });

        if (!result) {
            return 0;
        }

        return result.price;
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

    protected abstract getRawOptions(skip?: number): Promise<Array<TRawOption>>;
    protected abstract getOrderBook(rawOption: TRawOption): Promise<OrderBook>;
    protected abstract constructOptionData(rawOption: TRawOption, depth: OrderBook): Option;
}
