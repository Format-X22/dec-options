import { Injectable } from '@nestjs/common';
import { Option, OptionDocument, ExpirationGroup, StrikeGroup } from '@app/shared/option.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { OptionsQueryDto } from './options-query.dto';
import { ListDto } from '@app/shared/list.dto';
import { EMarketKey, Market, markets, marketsMapByKey } from '@app/shared/market.schema';
import { EPackByDateSize, ESortDirection, ExpirationGroupArgs, OptionListArgs, StrikeGroupArgs } from './option.args';
import * as moment from 'moment';
import { unitOfTime } from 'moment';

export type TOptionsParams = {
    base: Array<Option['base']>;
    quote: Array<Option['quote']>;
    market: Array<Option['marketKey']>;
};

type TOptionsQuery = {
    market?: Option['marketKey'];
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

@Injectable()
export class ApiService {
    constructor(@InjectModel(Option.name) private optionsDataModel: Model<OptionDocument>) {}

    async getOption(_id: Option['_id']): Promise<Option> {
        return this.optionsDataModel.findById(_id);
    }

    async getOptionsParamsList(): Promise<TOptionsParams> {
        const base: TOptionsParams['base'] = await this.optionsDataModel.distinct('base');
        const quote: TOptionsParams['quote'] = await this.optionsDataModel.distinct('quote');
        const market: TOptionsParams['market'] = await this.optionsDataModel.distinct('market');

        return { base, quote, market };
    }

    async getOptions(requestQuery: OptionsQueryDto | OptionListArgs): Promise<ListDto<Option>> {
        const dbQuery: TOptionsQuery = this.makeOptionsQuery(requestQuery);
        const dbSort: TOptionsSort = this.makeOptionsSort(requestQuery);
        const query: FilterQuery<OptionDocument> = { ...dbQuery, expirationDate: { $gt: new Date() } };
        const data: Array<OptionDocument> = await this.optionsDataModel.find(query, null, {
            sort: dbSort,
            skip: requestQuery.offset,
            limit: requestQuery.limit,
        });
        const total: number = await this.optionsDataModel.countDocuments(query);
        const pagination: ListDto<Option>['pagination'] = {
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

    private makeOptionsQuery(requestQuery: OptionsQueryDto | OptionListArgs): TOptionsQuery {
        const dbQuery: TOptionsQuery = {};

        if (requestQuery.filterByMarket) {
            dbQuery.market = requestQuery.filterByMarket;
        }

        if (requestQuery.filterByMarketType) {
            dbQuery.marketType = requestQuery.filterByMarketType;
        }

        if (requestQuery.filterByType) {
            dbQuery.type = requestQuery.filterByType;
        }

        return dbQuery;
    }

    private makeOptionsSort(requestQuery: OptionsQueryDto | OptionListArgs): TOptionsSort {
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
