import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EOptionDeliveryType, EOptionStyleType, EOptionType, Option } from '@app/shared/option.schema';
import { gql, request } from 'graphql-request';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { AggregatorAbstract } from '../aggregator.abstract';
import * as puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';
import * as moment from 'moment';
import { Moment } from 'moment';
import { OrderBook, OrderBookOrder } from '@app/shared/orderbook.schema';

type TOptionsResponse = {
    otokens: Array<{
        id: string;
        name: string;
        isPut: boolean;
        expiryTimestamp: string;
        strikePrice: string;
        decimals: number;
        underlyingAsset: {
            symbol: string;
        };
        strikeAsset: {
            symbol: string;
        };
        collateralAsset: {
            symbol: string;
        };
    }>;
};

type TRawOption = TOptionsResponse['otokens'][0];
type TDepth = {
    ask: number;
    bid: number;
};
type TParsedPrices = Array<{
    base: string;
    expiration: string;
    strike: number;
    ask: number;
    bid: number;
    // Can't use enum in evaluate
    type: 'CALL' | 'PUT';
}>;

const API: string = 'https://api.thegraph.com/subgraphs/name/opynfinance/gamma-mainnet';
const MS_MULTIPLY: number = 1000;
const PARSE_URL: string = 'https://v2.opyn.co/#/';

@Injectable()
export class OpynService extends AggregatorAbstract<TRawOption> implements OnModuleInit {
    protected readonly logger: Logger = new Logger(OpynService.name);
    protected readonly pageSize: number = 1000;
    protected isGetWithPagination: boolean = true;
    private pricesCache: TParsedPrices = [];
    private browser: Browser;

    async onModuleInit(): Promise<void> {
        this.browser = await puppeteer.launch();
    }

    protected get rateLimit(): number {
        return 1000;
    }

    protected async getRawOptions(skip: number): Promise<Array<TRawOption>> {
        await this.parsePricesToCache();

        const rawOptionsResponse: TOptionsResponse = await request(API, this.getQuery(skip));

        return rawOptionsResponse.otokens;
    }

    protected async getOrderBook(rawOption: TRawOption): Promise<OrderBook> {
        const strike: number = Number(rawOption.strikePrice) / Math.pow(10, rawOption.decimals);
        const type: EOptionType = rawOption.isPut ? EOptionType.PUT : EOptionType.CALL;
        const date: Moment = moment.utc(Number(rawOption.expiryTimestamp) * MS_MULTIPLY).startOf('day');
        const cached: TDepth = this.pricesCache.find((parsedOption: TParsedPrices[0]): boolean => {
            return (
                parsedOption.strike === strike &&
                parsedOption.type === type &&
                Number(moment.utc(parsedOption.expiration, 'DD MMM YYYY').toDate()) === Number(date)
            );
        });
        let depth: TDepth;

        if (cached) {
            depth = { ask: cached.ask, bid: cached.bid };
        } else {
            depth = { ask: 0, bid: 0 };
        }

        return {
            optionId: rawOption.id,
            optionMarketKey: EMarketKey.OPYN,
            asks: [{ price: depth.ask, amount: 0 }],
            bids: [{ price: depth.bid, amount: 0 }],
        };
    }

    protected constructOptionData(rawOption: TRawOption, orderBook: OrderBook): Option {
        return {
            id: rawOption.id,
            name: rawOption.name,
            marketKey: EMarketKey.OPYN,
            marketType: EMarketType.DEX,
            type: rawOption.isPut ? EOptionType.PUT : EOptionType.CALL,
            size: 1,
            strike: Number(rawOption.strikePrice) / Math.pow(10, rawOption.decimals),
            expirationDate: new Date(Number(rawOption.expiryTimestamp) * MS_MULTIPLY),
            base: rawOption.underlyingAsset.symbol,
            quote: rawOption.collateralAsset.symbol,
            strikeAsset: rawOption.strikeAsset.symbol,
            marketUrl: 'https://www.opyn.co/#/trade',
            askBase: null,
            askQuote: orderBook.asks[0]?.price || 0,
            bidBase: null,
            bidQuote: orderBook.bids[0]?.price || 0,
            deliveryType: EOptionDeliveryType.SETTLEMENT,
            styleType: EOptionStyleType.EUROPEAN,
        };
    }

    private getQuery(skip: number): string {
        const now: number = Math.floor(Date.now() / MS_MULTIPLY);

        return gql`
            {
                otokens(where: { expiryTimestamp_gt: ${now} } first: ${this.pageSize} skip: ${skip}) {
                    id
                    underlyingAsset {
                        symbol
                    }
                    strikeAsset {
                        symbol
                    }
                    collateralAsset {
                        symbol
                    }
                    name
                    isPut
                    strikePrice
                    decimals
                    expiryTimestamp
                }
            }
        `;
    }

    private async parsePricesToCache(): Promise<void> {
        const page: Page = await this.browser.newPage();

        await page.goto(PARSE_URL, { waitUntil: 'networkidle2' });

        // Can't use `this` and any external functions and modules
        // Can't use enums too
        this.pricesCache = await page.evaluate(async (): Promise<TParsedPrices> => {
            const result: TParsedPrices = [];

            return await parse();

            async function parse(): Promise<TParsedPrices> {
                const [pairMenuButton, expirationMenuButton]: Array<HTMLButtonElement> = selectAll(
                    '.MuiButtonBase-root.MuiButton-root',
                );

                pairMenuButton.click();

                const [baseMenu, expirationMenu]: Array<Element> = selectAll(
                    '.MuiPaper-root.MuiMenu-paper.MuiPopover-paper',
                );
                const baseButtons: Array<HTMLButtonElement> = selectAll('ul li', baseMenu);

                for (const baseButton of baseButtons) {
                    baseButton.click();
                    expirationMenuButton.click();

                    await sleep();
                    await extractPricesForEachBase(baseButton, expirationMenu);
                }

                return result;
            }

            async function extractPricesForEachBase(
                baseButton: HTMLButtonElement,
                expirationMenu: Element,
            ): Promise<void> {
                const base: string = baseButton.innerHTML.split(' ')[0];
                const expirationButtons: Array<HTMLButtonElement> = selectAll('ul li', expirationMenu);

                for (const expirationButton of expirationButtons) {
                    expirationButton.click();

                    await sleep();

                    const expiration: string = getExpiration(expirationButton);
                    const rows: HTMLCollection = document.querySelector('.MuiGrid-root .MuiTableBody-root').children;
                    const stepForFiltrateGreeks: number = 2;

                    for (let i: number = 0; i < rows.length; i += stepForFiltrateGreeks) {
                        const row: HTMLTableRowElement = rows[i] as HTMLTableRowElement;

                        extractPricesForEachStrike(row, base, expiration);
                    }
                }
            }

            function extractPricesForEachStrike(row: HTMLTableRowElement, base: string, expiration: string): void {
                const cols: HTMLCollection = row.children;
                const strike: number = getStrike(cols);

                if (optionExists('CALL', cols)) {
                    const bid: number = parsePrice(cols, 1, 0);
                    const ask: number = parsePrice(cols, 1, 1);

                    result.push({ base, expiration, strike, bid, ask, type: 'CALL' });
                }

                if (optionExists('PUT', cols)) {
                    const bid: number = parsePrice(cols, 6, 0);
                    const ask: number = parsePrice(cols, 6, 1);

                    result.push({ base, expiration, strike, bid, ask, type: 'PUT' });
                }
            }

            function optionExists(type: 'CALL' | 'PUT', cols: HTMLCollection): boolean {
                let colIndex: number;

                if (type === 'CALL') {
                    colIndex = 0;
                } else {
                    colIndex = 5;
                }

                return cols[colIndex].innerHTML[0] !== '-';
            }

            function getExpiration(expirationButton: HTMLButtonElement): string {
                const rawDate: string = expirationButton.innerHTML;
                const rawDateTokens: Array<string> = rawDate.split(' ');

                return rawDateTokens.slice(1, rawDateTokens.length).join(' ');
            }

            function getStrike(cols: HTMLCollection): number {
                return Number(cols[4].innerHTML.replace('$', '').replace('&nbsp;', '').replace(',', ''));
            }

            function parsePrice(cols: HTMLCollection, colNum: number, priceIndex: number): number {
                return Number(
                    cols[colNum].children[priceIndex]
                        .querySelector('.MuiToggleButton-label .MuiBox-root')
                        .innerHTML.replace('$', ''),
                );
            }

            function sleep(): Promise<void> {
                return new Promise((resolve: Function): number => setTimeout(resolve, 3000));
            }

            function selectAll<T extends Element>(query: string, root: Element | Document = document): Array<T> {
                return Array.from(root.querySelectorAll(query));
            }
        });
        
        await page.close();
    }
}
