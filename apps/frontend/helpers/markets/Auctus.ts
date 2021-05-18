import { IMarket } from '../market';
import { OptionsData } from '@app/shared/options-data.schema';

export class Auctus implements IMarket {
    async auth(): Promise<boolean> {
        // TODO -
        return true;
    }
    async buy(option: OptionsData, amount: number): Promise<boolean> {
        // TODO -
        return true;
    }
    async sell(option: OptionsData, amount: number): Promise<boolean> {
        // TODO -
        return true;
    }
}
