import { Injectable } from '@nestjs/common';
import { OptionsData, OptionsDataDocument } from '@app/shared/options-data.schema';
import { ListDto } from '@app/shared/list.dto';
import { ESortDirection, OptionsQueryDto } from './options-query.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

type TOptionsQuery = {
    market?: OptionsData['market'];
    marketType?: OptionsData['marketType'];
    type?: OptionsData['type'];
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
export class AggregationApiService {
    constructor(@InjectModel(OptionsData.name) private optionsDataModel: Model<OptionsDataDocument>) {}

    async getOptions(requestQuery: OptionsQueryDto): Promise<ListDto<OptionsData>> {
        const dbQuery: TOptionsQuery = this._makeOptionsQuery(requestQuery);
        const dbSort: TOptionsSort = this._makeOptionsSort(requestQuery);
        const data: Array<OptionsDataDocument> = await this.optionsDataModel.find(dbQuery, null, {
            sort: dbSort,
            skip: requestQuery.offset,
            limit: requestQuery.limit,
        });

        return { data };
    }

    private _makeOptionsQuery(requestQuery: OptionsQueryDto): TOptionsQuery {
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

    private _makeOptionsSort(requestQuery: OptionsQueryDto): TOptionsSort {
        const dbSort: TOptionsSort = {};

        if (requestQuery.sortByMarket) {
            dbSort.market = this._querySortToDbSort(requestQuery.sortByMarket);
        }

        if (requestQuery.sortByMarketType) {
            dbSort.marketType = this._querySortToDbSort(requestQuery.sortByMarketType);
        }

        if (requestQuery.sortByType) {
            dbSort.type = this._querySortToDbSort(requestQuery.sortByType);
        }

        if (requestQuery.sortBySize) {
            dbSort.size = this._querySortToDbSort(requestQuery.sortBySize);
        }

        if (requestQuery.sortByStrike) {
            dbSort.strike = this._querySortToDbSort(requestQuery.sortByStrike);
        }

        if (requestQuery.sortByExpirationDate) {
            dbSort.expirationDate = this._querySortToDbSort(requestQuery.sortByExpirationDate);
        }

        return dbSort;
    }

    private _querySortToDbSort(direction: ESortDirection): TSortDirection {
        if (direction === ESortDirection.ASC) {
            return 1;
        } else {
            return -1;
        }
    }
}
