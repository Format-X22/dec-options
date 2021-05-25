import { IMarket } from '../market';
import { Option } from '@app/shared/option.schema';

export class Hegic implements IMarket {
    async auth(): Promise<boolean> {
        // TODO -
        return true;
    }
    async buy(option: Option, amount: number): Promise<boolean> {
        // TODO -
        return true;
    }
    async sell(option: Option, amount: number): Promise<boolean> {
        // TODO -
        return true;
    }
}