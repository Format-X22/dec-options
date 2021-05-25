import { Injectable } from '@nestjs/common';
import { Option, OptionDocument } from '@app/shared/option.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ESortDirection, OptionsQueryDto } from './options-query.dto';
import { ListDto } from '@app/shared/list.dto';
import { Market, markets } from '@app/shared/market.schema';

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

    async getOptions(requestQuery: OptionsQueryDto): Promise<ListDto<Option>> {
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

    private makeOptionsQuery(requestQuery: OptionsQueryDto): TOptionsQuery {
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

    private makeOptionsSort(requestQuery: OptionsQueryDto): TOptionsSort {
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
}
