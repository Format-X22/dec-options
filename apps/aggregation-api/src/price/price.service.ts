import { HttpService, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Timeout = NodeJS.Timeout;
import { AxiosResponse } from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BasePrice, BasePriceDocument } from '@app/shared/base-price.schema';

enum ESymbol {
    USD = 'USD',
    USDC = 'USDC',
    BTC = 'BTC',
    WBTC = 'WBTC',
    ETH = 'ETH',
    WETH = 'WETH',
    EOS = 'EOS',
    SUSHI = 'SUSHI',
    UNI = 'UNI',
    YFI = 'YFI',
}

type TRaw3CommasPrice = {
    last: string;
};

enum EApiMarkets {
    FTX = 'ftx',
    BINANCE = 'binance',
}

const API_POINT: string = 'https://api.3commas.io/public/api/ver1';

@Injectable()
export class PriceService implements OnModuleInit, OnModuleDestroy {
    protected readonly logger: Logger = new Logger(PriceService.name);
    private interval: Timeout;
    private inSync: boolean = false;
    private price: Map<ESymbol, number> = new Map([
        [ESymbol.USD, 1],
        [ESymbol.USDC, 1],
    ]);

    constructor(
        @InjectModel(BasePrice.name) private basePriceModel: Model<BasePriceDocument>,
        private configService: ConfigService,
        private httpService: HttpService,
    ) {}

    async onModuleInit(): Promise<void> {
        this.interval = setInterval(async (): Promise<void> => {
            if (this.inSync) {
                return;
            }

            try {
                this.inSync = true;

                await this.syncPrice();

                this.inSync = false;
            } catch (error) {
                this.logger.error(error);
                this.inSync = false;
            }
        }, Number(this.configService.get('OA_PRICE_SYNC_INTERVAL')) || 3000);
    }

    getPrice(symbol: string): number {
        return this.price.get(symbol as ESymbol);
    }

    async onModuleDestroy(): Promise<void> {
        clearInterval(this.interval);
    }

    private async syncPrice(): Promise<void> {
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

    private async savePrice(symbol: ESymbol, price: number): Promise<void> {
        this.price.set(symbol, price);
        await this.basePriceModel.updateOne({ symbol }, { $set: { symbol, price: price || 0 } }, { upsert: true });
    }

    private async getPriceFrom2Commas(market: EApiMarkets, pair: string): Promise<number> {
        const priceUrl = `${API_POINT}/accounts/currency_rates?market_code=${market}&pair=${pair}`;
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
