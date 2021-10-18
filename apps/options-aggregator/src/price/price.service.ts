import { HttpService, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Timeout = NodeJS.Timeout;
import { AxiosResponse } from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BasePrice, BasePriceDocument, GweiPrice, GweiPriceDocument } from '@app/shared/price.schema';
import { ESymbol } from '@app/shared/option.schema';

type TRaw3CommasPrice = {
    last: string;
};

type TGasApiResponse = {
    fast: number;
    safeLow: number;
    average: number;
}

enum EApiMarkets {
    FTX = 'ftx',
    BINANCE = 'binance',
}

const COMMAS_API_POINT: string = 'https://api.3commas.io/public/api/ver1';
const GAS_API_POINT: string = 'https://ethgasstation.info/api/ethgasAPI.json';
const GWEI_SIZE = 1_000_000_000;

@Injectable()
export class PriceService implements OnModuleInit, OnModuleDestroy {
    protected readonly logger: Logger = new Logger(PriceService.name);
    private basePriceInterval?: Timeout;
    private gweiInterval?: Timeout;
    private basePriceInSync: boolean = false;

    constructor(
        @InjectModel(BasePrice.name) private basePriceModel: Model<BasePriceDocument>,
        @InjectModel(GweiPrice.name) private gweiPriceModel: Model<GweiPriceDocument>,
        private configService: ConfigService,
        private httpService: HttpService,
    ) {}

    async getPrice(symbol: ESymbol): Promise<number> {
        const result: BasePrice = await this.basePriceModel.findOne({ symbol }, { price: true });

        return result?.price || 0;
    }

    async getGwei(): Promise<GweiPrice> {
        const result: GweiPrice = await this.gweiPriceModel.findOne({});

        return result || { slow: 0, standard: 0, fast: 0 };
    }

    async onModuleInit(): Promise<void> {
        this.basePriceInterval = setInterval(async (): Promise<void> => {
            if (this.basePriceInSync) {
                return;
            }

            try {
                this.basePriceInSync = true;

                await this.syncBasePrice();

                this.basePriceInSync = false;
            } catch (error) {
                this.logger.error(error);
                this.basePriceInSync = false;
            }
        }, Number(this.configService.get('OA_PRICE_SYNC_INTERVAL')) || 3_000);

        this.gweiInterval = setInterval(async (): Promise<void> => {
            try {
                await this.syncGwei();
            } catch (error) {
                this.logger.error(error);
            }
        }, Number(this.configService.get('OA_GWEI_SYNC_INTERVAL')) || 30_000);
    }

    async onModuleDestroy(): Promise<void> {
        if (this.basePriceInterval) {
            clearInterval(this.basePriceInterval);
        }

        if (this.gweiInterval) {
            clearInterval(this.gweiInterval);
        }
    }

    private async syncBasePrice(): Promise<void> {
        const handled: Set<string> = new Set();

        for (const symbol of Object.keys(ESymbol)) {
            if (handled.has(symbol)) {
                continue;
            }

            switch (symbol) {
                case ESymbol.USD:
                case ESymbol.USDC:
                    break;

                case ESymbol.BTC:
                case ESymbol.WBTC: {
                    const price: number = await this.getPriceFrom2Commas(EApiMarkets.FTX, `USD_${ESymbol.BTC}`);

                    await this.savePrice(ESymbol.BTC, price);
                    await this.savePrice(ESymbol.WBTC, price);
                    handled.add(ESymbol.BTC);
                    handled.add(ESymbol.WBTC);
                    break;
                }

                case ESymbol.ETH:
                case ESymbol.WETH: {
                    const price: number = await this.getPriceFrom2Commas(EApiMarkets.FTX, `USDT_${ESymbol.ETH}`);

                    await this.savePrice(ESymbol.ETH, price);
                    await this.savePrice(ESymbol.WETH, price);
                    handled.add(ESymbol.ETH);
                    handled.add(ESymbol.WETH);
                    break;
                }

                case ESymbol.SUSHI:
                case ESymbol.UNI:
                case ESymbol.YFI: {
                    const price: number = await this.getPriceFrom2Commas(EApiMarkets.FTX, `USDT_${symbol}`);

                    await this.savePrice(symbol, price);
                    handled.add(symbol);
                    break;
                }

                case ESymbol.EOS: {
                    const price: number = await this.getPriceFrom2Commas(EApiMarkets.BINANCE, `USDT_${symbol}`);
                    await this.savePrice(ESymbol.EOS, price);
                    break;
                }

                default:
                    this.logger.error(`Unknown symbol ${symbol}`);
            }
        }
    }

    private async syncGwei(): Promise<void> {
        let gweiResponse: AxiosResponse<TGasApiResponse>;

        try {
            gweiResponse = await this.httpService.get<TGasApiResponse>(GAS_API_POINT).toPromise();
        } catch (error) {
            Logger.error(`Gwei sync FATAL error - ${error}`);
            return;
        }

        const absoluteWei: TGasApiResponse = gweiResponse.data;

        await this.gweiPriceModel.updateOne(
            {},
            {
                $set: {
                    slow: absoluteWei.safeLow / GWEI_SIZE,
                    standard: absoluteWei.average / GWEI_SIZE,
                    fast: absoluteWei.fast / GWEI_SIZE,
                },
            },
            { upsert: true },
        );
    }

    private async savePrice(symbol: ESymbol, price: number): Promise<void> {
        await this.basePriceModel.updateOne({ symbol }, { $set: { symbol, price: price || 0 } }, { upsert: true });
    }

    private async getPriceFrom2Commas(market: EApiMarkets, pair: string): Promise<number> {
        const priceUrl = `${COMMAS_API_POINT}/accounts/currency_rates?market_code=${market}&pair=${pair}`;
        let priceResponse: AxiosResponse<TRaw3CommasPrice>;

        try {
            priceResponse = await this.httpService.get<TRaw3CommasPrice>(priceUrl).toPromise();
        } catch (error) {
            Logger.error(`3Commas price FATAL error - ${error}, base ${pair}`);
            return 0;
        }

        if (priceResponse.status !== 200 || !Number(priceResponse?.data?.last)) {
            const status: number = priceResponse.status;
            const statusText: string = priceResponse.statusText;
            const errorData: string = JSON.stringify(priceResponse.data || null, null, 2);
            const responseErrorData = `${status}: ${statusText} (data: ${errorData})`;

            Logger.error(`3Commas price error - ${responseErrorData}, pair ${pair}`);

            return 0;
        } else {
            return Number(priceResponse.data.last) || 0;
        }
    }
}
