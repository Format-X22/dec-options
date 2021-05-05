export type OptionsParamsList = {
    market: string[];
    base: string[];
    quote: string[];
};

// tslint:disable-next-line:typedef
export const getOptionsParamsList = async (): Promise<OptionsParamsList> => {
    const url: URL = new URL(`${(process.env.REACT_APP_API_URL || window.location.origin)}/options_data_list`);
    // tslint:disable-next-line:typedef
    const res = await fetch(url.toString());
    // tslint:disable-next-line:typedef
    const options = await res.json();
    // tslint:disable-next-line:typedef
    const { market, base, quote } = options;
    return { market, base, quote };
};
