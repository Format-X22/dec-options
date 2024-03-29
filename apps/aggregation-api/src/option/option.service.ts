import { Injectable, Logger } from '@nestjs/common';
import { Option, OptionDocument, ExpirationGroup, StrikeGroup, Base } from '@app/shared/option.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { EMarketKey, Market, markets, marketsMapByKey } from '@app/shared/market.schema';
import { EPackByDateSize, ESortDirection, ExpirationGroupArgs, OptionListArgs, StrikeGroupArgs } from './option.args';
import * as moment from 'moment';
import { unitOfTime } from 'moment';
import { Paginated } from '@app/shared/list.dto';
import { SubscribeGroupArgs } from './subscribers.args';
import { SubscribeResult, Subscribers, SubscribersDocument } from '@app/shared/subscribers.schema';
import { PriceService } from '../price/price.service';
import { OrderBook, OrderBookDocument } from '@app/shared/orderbook.schema';

type TOptionsQuery = {
    marketKey?: Option['marketKey'];
    marketType?: Option['marketType'];
    type?: Option['type'];
    base?: Option['base'];
    strike?: Option['strike'];
    expirationDate?: { $lt?: Option['expirationDate']; $gt?: Option['expirationDate'] };
};

type TSortDirection = 1 | -1;

type TOptionsSort = {
    market?: TSortDirection;
    marketType?: TSortDirection;
    type?: TSortDirection;
    size?: TSortDirection;
    strike?: TSortDirection;
    expirationDate?: TSortDirection;
};

type TRawExpirationGroup = {
    expirationDate: Date;
    marketKeys: Array<EMarketKey>;
    uniqueValues: number[];
};

type TRawStrikeGroup = {
    strike: number;
    optionIds: string[];
    marketKeys: Array<EMarketKey>;
    minAsk: number;
    maxBid: number;
};

@Injectable()
export class OptionService {
    protected readonly logger: Logger = new Logger(OptionService.name);

    protected mapMarketKeys = (marketKeys: EMarketKey[]) => {
        return (
            marketKeys
                .filter((key: EMarketKey) => marketsMapByKey.has(key))
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                .map((key: EMarketKey) => marketsMapByKey.get(key)!)
        );
    };

    constructor(
        @InjectModel(Option.name) private optionsModel: Model<OptionDocument>,
        @InjectModel(Subscribers.name) private subscribersModel: Model<SubscribersDocument>,
        @InjectModel(OrderBook.name) private orderBookModel: Model<OrderBookDocument>,
        private priceService: PriceService,
    ) {}

    async getOption(_id: Option['_id']): Promise<Option | null> {
        return this.optionsModel.findById(_id);
    }

    async subscribe({ email }: SubscribeGroupArgs): Promise<SubscribeResult> {
        const result: Subscribers | null = await this.subscribersModel.findOne({ email });

        if (result) {
            return { success: true };
        }

        try {
            await this.subscribersModel.create({ email, date: new Date() });

            return { success: true };
        } catch (error) {
            this.logger.error(error);

            return { success: false };
        }
    }

    async getOptions(requestQuery: OptionListArgs): Promise<Paginated<Option>> {
        const dbQuery: TOptionsQuery = this.makeOptionsQuery(requestQuery);
        const dbSort: TOptionsSort = this.makeOptionsSort(requestQuery);
        const data: Array<OptionDocument> = await this.optionsModel.find(dbQuery, null, {
            sort: dbSort,
            skip: requestQuery.offset,
            limit: requestQuery.limit,
        });
        const total: number = await this.optionsModel.countDocuments(dbQuery);
        const pagination: Paginated<Option>['pagination'] = {
            offset: requestQuery.offset,
            limit: requestQuery.limit,
            total,
        };

        return { data, pagination };
    }

    getMarkets(): Array<Market> {
        return markets;
    }

    async getExpirations(args: ExpirationGroupArgs): Promise<Array<ExpirationGroup>> {
        const filter: FilterQuery<Option> = {
            expirationDate: {
                $gt: new Date(),
            },
        };

        if (args.base) {
            filter.base = args.base;
        }
        if (args.marketType) {
            filter.marketType = args.marketType;
        }

        const data: Array<TRawExpirationGroup> = await this.optionsModel.aggregate([
            {
                $match: filter,
            },
            {
                $group: {
                    _id: '$expirationDate',
                    marketKeys: {
                        $addToSet: '$marketKey',
                    },
                    uniqueValues: {
                        $addToSet: '$strike',
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
            {
                $project: {
                    _id: 0,
                    expirationDate: '$_id',
                    marketKeys: 1,
                    uniqueValues: 1,
                },
            },
        ]);

        let result: Array<ExpirationGroup> = data.map(
            (raw: TRawExpirationGroup): ExpirationGroup => ({
                expirationDate: raw.expirationDate,
                markets: this.mapMarketKeys(raw.marketKeys),
                strikes: raw.uniqueValues.length,
            }),
        );

        if (args.packByDateSize && args.timezone) {
            result = this.packExpirationsByDateSize(result, args.packByDateSize, args.timezone);
        }

        return result;
    }

    async getStrikes(args: StrikeGroupArgs): Promise<Array<StrikeGroup>> {
        const filter: FilterQuery<Option> = {};

        if (args.type) {
            filter.type = args.type;
        }

        if (args.base) {
            filter.base = args.base;
        }

        if (args.marketType) {
            filter.marketType = args.marketType;
        }

        if (args.fromDate || args.toDate) {
            filter.expirationDate = {};

            if (args.fromDate) {
                filter.expirationDate.$gte = args.fromDate;
            }

            if (args.toDate) {
                filter.expirationDate.$lte = args.toDate;
            }
        }

        const data: Array<TRawStrikeGroup> = await this.optionsModel.aggregate([
            {
                $match: filter,
            },
            {
                $group: {
                    _id: '$strike',
                    marketKeys: {
                        $addToSet: '$marketKey',
                    },
                    minAsk: {
                        $min: '$askQuote',
                    },
                    maxBid: {
                        $max: '$bidQuote',
                    },
                    optionIds: { $addToSet: '$id' },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
            {
                $project: {
                    _id: 0,
                    strike: '$_id',
                    optionIds: 1,
                    marketKeys: 1,
                    minAsk: 1,
                    maxBid: 1,
                },
            },
        ]);

        const optionIdsList = data.reduce((acc, { optionIds }) => [...acc, ...optionIds], []);
        const orderBookList = await this.orderBookModel.find({ optionId: { $in: optionIdsList } });
        const orderBooksById = orderBookList.reduce(
            (acc, orderBook) => ({ ...acc, [orderBook.optionId]: orderBook }),
            {},
        );

        return data.map(
            (raw: TRawStrikeGroup): StrikeGroup => ({
                strike: raw.strike,
                orderBookInfo: raw.optionIds.map((optionId) => ({
                    asksCount: orderBooksById[optionId].asks.length,
                    bidsCount: orderBooksById[optionId].bids.length,
                })),
                markets: this.mapMarketKeys(raw.marketKeys),
                type: args.type,
                base: args.base,
                minAsk: raw.minAsk,
                maxBid: raw.maxBid,
            }),
        );
    }

    async getBases(pricesRequired: boolean): Promise<Array<Base>> {
        const symbols: Array<Base['symbol']> = await this.optionsModel.distinct('base');
        const result: Array<Base> = [];

        for (const symbol of symbols) {
            if (symbol) {
                if (pricesRequired) {
                    const usdPrice = (await this.priceService.getPrice(symbol)) || 0;

                    result.push({ symbol, usdPrice });
                } else {
                    result.push({ symbol, usdPrice: 0 });
                }
            }
        }

        return result;
    }

    async getOrderBook(optionMarketKey: EMarketKey, optionId: string): Promise<OrderBook | null> {
        return this.orderBookModel.findOne({ optionMarketKey, optionId });
    }

    private makeOptionsQuery(requestQuery: OptionListArgs): TOptionsQuery {
        const dbQuery: TOptionsQuery = {};

        if (requestQuery.filterByMarket) {
            dbQuery.marketKey = requestQuery.filterByMarket;
        }

        if (requestQuery.filterByMarketType) {
            dbQuery.marketType = requestQuery.filterByMarketType;
        }

        if (requestQuery.filterByType) {
            dbQuery.type = requestQuery.filterByType;
        }

        if (requestQuery.filterByBase) {
            dbQuery.base = requestQuery.filterByBase;
        }

        if (requestQuery.filterByStrike) {
            dbQuery.strike = requestQuery.filterByStrike;
        }

        if (requestQuery.filterByExpirationDateFrom || requestQuery.filterByExpirationDateTo) {
            dbQuery.expirationDate = {};

            if (requestQuery.filterByExpirationDateFrom) {
                dbQuery.expirationDate.$gt = requestQuery.filterByExpirationDateFrom;
            }

            if (requestQuery.filterByExpirationDateTo) {
                dbQuery.expirationDate.$lt = requestQuery.filterByExpirationDateTo;
            }
        }

        if (!dbQuery.expirationDate) {
            dbQuery.expirationDate = { $gt: new Date() };
        }

        return dbQuery;
    }

    private makeOptionsSort(requestQuery: OptionListArgs): TOptionsSort {
        const dbSort: TOptionsSort = {};

        if (requestQuery.sortByMarket) {
            dbSort.market = this.querySortToDbSort(requestQuery.sortByMarket);
        }

        if (requestQuery.sortByMarketType) {
            dbSort.marketType = this.querySortToDbSort(requestQuery.sortByMarketType);
        }

        if (requestQuery.sortByType) {
            dbSort.type = this.querySortToDbSort(requestQuery.sortByType);
        }

        if (requestQuery.sortBySize) {
            dbSort.size = this.querySortToDbSort(requestQuery.sortBySize);
        }

        if (requestQuery.sortByStrike) {
            dbSort.strike = this.querySortToDbSort(requestQuery.sortByStrike);
        }

        if (requestQuery.sortByExpirationDate) {
            dbSort.expirationDate = this.querySortToDbSort(requestQuery.sortByExpirationDate);
        }

        return dbSort;
    }

    private querySortToDbSort(direction: ESortDirection): TSortDirection {
        if (direction === ESortDirection.ASC) {
            return 1;
        } else {
            return -1;
        }
    }

    private packExpirationsByDateSize(
        data: Array<ExpirationGroup>,
        size: EPackByDateSize,
        timezone: number,
    ): Array<ExpirationGroup> {
        const result: Array<ExpirationGroup> = [];
        const momentSize: unitOfTime.StartOf = size as unknown as unitOfTime.StartOf;

        for (const expiration of data) {
            const last: ExpirationGroup = result[result.length - 1];
            const lastDate: moment.Moment = moment(last?.expirationDate || 0)
                .utcOffset(timezone)
                .startOf(momentSize);
            const currentDate: moment.Moment = moment(expiration.expirationDate)
                .utcOffset(timezone)
                .startOf(momentSize);

            if (!result.length || !currentDate.isSame(lastDate)) {
                expiration.expirationDate = currentDate.toDate();

                result.push(expiration);
            } else {
                const marketsToPush: Array<Market> = [];

                for (const market of expiration.markets) {
                    if (!last.markets.includes(market)) {
                        marketsToPush.push(market);
                    }
                }

                last.markets.push(...marketsToPush);
            }
        }

        return result;
    }
}
