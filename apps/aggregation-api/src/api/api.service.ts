import { HttpService, Injectable, Logger } from '@nestjs/common';
import { Option, OptionDocument, ExpirationGroup, StrikeGroup, Base } from '@app/shared/option.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { EMarketKey, Market, markets, marketsMapByKey } from '@app/shared/market.schema';
import { EPackByDateSize, ESortDirection, ExpirationGroupArgs, OptionListArgs, StrikeGroupArgs } from './option.args';
import * as moment from 'moment';
import { unitOfTime } from 'moment';
import { AxiosResponse } from 'axios';
import { Paginated } from '@app/shared/list.dto';

type TOptionsQuery = {
    marketKey?: Option['marketKey'];
    marketType?: Option['marketType'];
    type?: Option['type'];
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
};

type TRawStrikeGroup = {
    strike: number;
    marketKeys: Array<EMarketKey>;
    minAsk: number;
    maxBid: number;
};

type TRaw3CommasPrice = {
    last: string;
};

@Injectable()
export class ApiService {
    protected readonly logger: Logger = new Logger(ApiService.name);

    constructor(
        @InjectModel(Option.name) private optionsDataModel: Model<OptionDocument>,
        private httpService: HttpService,
    ) {}

    async getOption(_id: Option['_id']): Promise<Option> {
        return this.optionsDataModel.findById(_id);
    }

    async getOptions(requestQuery: OptionListArgs): Promise<Paginated<Option>> {
        const dbQuery: TOptionsQuery = this.makeOptionsQuery(requestQuery);
        const dbSort: TOptionsSort = this.makeOptionsSort(requestQuery);
        const query: FilterQuery<OptionDocument> = { ...dbQuery, expirationDate: { $gt: new Date() } };
        const data: Array<OptionDocument> = await this.optionsDataModel.find(query, null, {
            sort: dbSort,
            skip: requestQuery.offset,
            limit: requestQuery.limit,
        });
        const total: number = await this.optionsDataModel.countDocuments(query);
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

        const data: Array<TRawExpirationGroup> = await this.optionsDataModel.aggregate([
            {
                $match: filter,
            },
            {
                $group: {
                    _id: '$expirationDate',
                    marketKeys: {
                        $addToSet: '$marketKey',
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
                },
            },
        ]);

        let result: Array<ExpirationGroup> = data.map(
            (raw: TRawExpirationGroup): ExpirationGroup => ({
                expirationDate: raw.expirationDate,
                markets: raw.marketKeys.map((key: EMarketKey): Market => marketsMapByKey.get(key)),
            }),
        );

        if (args.packByDateSize) {
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

        if (args.fromDate || args.toDate) {
            filter.expirationDate = {};

            if (args.fromDate) {
                filter.expirationDate.$gte = args.fromDate;
            }

            if (args.toDate) {
                filter.expirationDate.$lte = args.toDate;
            }
        }

        const data: Array<TRawStrikeGroup> = await this.optionsDataModel.aggregate([
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
                        $min: '$ask',
                    },
                    maxBid: {
                        $max: '$bid',
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
                    strike: '$_id',
                    marketKeys: 1,
                    minAsk: 1,
                    maxBid: 1,
                },
            },
        ]);

        return data.map(
            (raw: TRawStrikeGroup): StrikeGroup => ({
                strike: raw.strike,
                markets: raw.marketKeys.map((key: EMarketKey): Market => marketsMapByKey.get(key)),
                type: args.type,
                base: args.base,
                minAsk: raw.minAsk,
                maxBid: raw.maxBid,
            }),
        );
    }

    async getBases(): Promise<Array<Base>> {
        const symbols: Array<Base['symbol']> = await this.optionsDataModel.distinct('base');
        const result: Array<Base> = [];

        for (const symbol of symbols) {
            const priceUrl: string = `https://api.3commas.io/currency_rates?pair=USDT_${symbol}&type=Accounts%3A%3AFtx`;
            let priceResponse: AxiosResponse<TRaw3CommasPrice>;

            try {
                priceResponse = await this.httpService.get<TRaw3CommasPrice>(priceUrl).toPromise();
            } catch (error) {
                result.push({ symbol, usdPrice: 0 });

                Logger.error(`3Commas price FATAL error - ${error}, base ${symbol}`);
                continue;
            }

            if (priceResponse.status !== 200 || !Number(priceResponse?.data?.last)) {
                const status: number = priceResponse.status;
                const statusText: string = priceResponse.statusText;
                const errorData: string = JSON.stringify(priceResponse.data || null, null, 2);
                const responseErrorData: string = `${status}: ${statusText} (data: ${errorData})`;

                Logger.error(`3Commas price error - ${responseErrorData}, base ${symbol}`);

                result.push({ symbol, usdPrice: 0 });
            } else {
                result.push({ symbol, usdPrice: Number(priceResponse.data.last) });
            }
        }

        return result;
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
        const momentSize: unitOfTime.StartOf = (size as unknown) as unitOfTime.StartOf;

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
