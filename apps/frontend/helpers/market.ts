import { Option } from '@app/shared/option.schema';
import { Deribit } from './markets/Deribit';
import { Binance } from './markets/Binance';
import { Okex } from './markets/Okex';
import { Auctus } from './markets/Auctus';
import { Hegic } from './markets/Hegic';
import { Siren } from './markets/Siren';
import { Opyn } from './markets/Opyn';
import { EMarketKey } from '@app/shared/market.schema';

export interface IMarket {
    auth(): Promise<boolean>;
    buy(option: Option, amount: number): Promise<boolean>;
    sell(option: Option, amount: number): Promise<boolean>;
}

export const market: Record<EMarketKey, IMarket> = {
    [EMarketKey.DERIBIT]: new Deribit(),
    [EMarketKey.BINANCE]: new Binance(),
    [EMarketKey.OKEX]: new Okex(),
    [EMarketKey.AUCTUS]: new Auctus(),
    [EMarketKey.HEGIC]: new Hegic(),
    [EMarketKey.OPYN]: new Opyn(),
    [EMarketKey.SIREN]: new Siren(),
};
