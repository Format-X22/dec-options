import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BasePrice, BasePriceDocument } from '@app/shared/base-price.schema';
import { ESymbol } from '@app/shared/option.schema';

@Injectable()
export class PriceService {
    protected readonly logger: Logger = new Logger(PriceService.name);

    constructor(@InjectModel(BasePrice.name) private basePriceModel: Model<BasePriceDocument>) {}

    async getPrice(symbol: ESymbol): Promise<number> {
        const result: BasePrice | null = await this.basePriceModel.findOne({ symbol }, { price: true });

        return result?.price || 0;
    }
}
