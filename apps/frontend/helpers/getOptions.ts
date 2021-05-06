import { Pagination } from '@app/shared/list.dto';

type RequestParams = {
    [key: string]: string;
};

export default async function getOptions(params: RequestParams): Promise<{ data: []; pagination: Pagination }> {
    const url: URL = new URL(process.env.REACT_APP_API_URL || window.location.origin);
    url.search = new URLSearchParams(params).toString();
    // tslint:disable-next-line:typedef
    const res = await fetch(url.toString());
    // tslint:disable-next-line:typedef
    const options = await res.json();
    // tslint:disable-next-line:typedef
    const { data, pagination } = options;
    return { data, pagination };
}
