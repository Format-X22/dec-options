import { EMarket, OptionsData } from '@app/shared/options-data.schema';
import { Deribit } from './markets/Deribit';
import { Binance } from './markets/Binance';
import { Ftx } from './markets/Ftx';
import { Okex } from './markets/Okex';
import { Auctus } from './markets/Auctus';
import { Hegic } from './markets/Hegic';
import { Siren } from './markets/Siren';
import { Opyn } from './markets/Opyn';

export interface IMarket {
    auth(): Promise<boolean>;
    buy(option: OptionsData, amount: number): Promise<boolean>;
    sell(option: OptionsData, amount: number): Promise<boolean>;
}

export const market: Record<EMarket, IMarket> = {
    [EMarket.DERIBIT]: new Deribit(),
    [EMarket.BINANCE]: new Binance(),
    [EMarket.FTX]: new Ftx(),
    [EMarket.OKEX]: new Okex(),
    [EMarket.AUCTUS]: new Auctus(),
    [EMarket.HEGIC]: new Hegic(),
    [EMarket.OPYN]: new Opyn(),
    [EMarket.SIREN]: new Siren(),
};
