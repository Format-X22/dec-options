import { Pagination } from '@app/shared/list.dto';
import { Filters } from '../pages';
import { OptionsData } from '@app/shared/options-data.schema';

type TRequestParams = {
    limit: number;
    offset: number;
} & Filters;

type TResponseData = {
    data: Array<OptionsData>;
    pagination: Pagination;
};

export default async function getOptions(params: TRequestParams): Promise<TResponseData> {
    const url: URL = new URL(
        process.env.REACT_APP_API_URL || process.env.OA_FRONTEND_API_URL || window.location.origin,
    );

    url.search = new URLSearchParams({
        ...params,
        limit: String(params.limit),
        offset: String(params.offset),
    }).toString();

    return (await fetch(url.toString())).json();
}
