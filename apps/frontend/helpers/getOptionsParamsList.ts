export type OptionsParamsList = {
    market: Array<string>;
    base: Array<string>;
    quote: Array<string>;
};

export async function getOptionsParamsList(): Promise<OptionsParamsList> {
    const base: string =
        (process.env.REACT_APP_API_URL || process.env.OA_FRONTEND_API_URL || window.location.origin) + '/api';
    const url: URL = new URL(`${base}/options-params`);

    return (await fetch(url.toString())).json();
}
