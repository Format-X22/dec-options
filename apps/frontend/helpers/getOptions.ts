import { Pagination } from '@app/shared/list.dto';
import { TFilters } from '../pages';
import { Option } from '@app/shared/option.schema';

type TRequestParams = {
    limit: number;
    offset: number;
} & TFilters;

export type TResponseData = {
    data: Array<Option>;
    pagination: Pagination;
};

export default async function getOptions(params: TRequestParams): Promise<TResponseData> {
    const url: URL = new URL(
        (process.env.REACT_APP_API_URL || process.env.OA_FRONTEND_API_URL || window.location.origin) + '/api',
    );

    url.search = new URLSearchParams({
        ...params,
        limit: String(params.limit),
        offset: String(params.offset),
    }).toString();

    return (await fetch(url.toString())).json();
}
