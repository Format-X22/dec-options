import { InjectModel } from '@nestjs/mongoose';
import { Option, OptionDocument } from '@app/shared/option.schema';
import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import * as sleep from 'sleep-promise';

export abstract class AggregatorAbstract<TRawOption, TDepth> {
    protected logger: Logger;
    protected abstract get rateLimit(): number;

    constructor(@InjectModel(Option.name) private optionsDataModel: Model<OptionDocument>) {}

    async startSyncLoop(): Promise<void> {
        try {
            await this.iteration();
        } catch (error) {
            this.logger.error(error);
        }

        setImmediate(this.iteration.bind(this));
    }

    protected async iteration(): Promise<void> {
        const rawOptions: Array<TRawOption> = await this.getRawOptions();

        sleep(this.rateLimit);

        for (const raw of rawOptions) {
            const depth: TDepth = await this.getDepth(raw);
            const option: Option = this.constructOptionData(raw, depth);

            await this.saveResult(option);

            sleep(this.rateLimit);
        }
    }

    protected async saveResult(data: Option): Promise<void> {
        await this.optionsDataModel.updateOne({ id: data.id }, data, { upsert: true });
    }

    throwRequestError(type: string, data: Object): never {
        throw new Error(`Invalid response - ${type} - ${JSON.stringify(data, null, 2)}`);
    }

    protected abstract getRawOptions(): Promise<Array<TRawOption>>;
    protected abstract getDepth(rawOption: TRawOption): Promise<TDepth>;
    protected abstract constructOptionData(rawOption: TRawOption, depth: TDepth): Option;
}
