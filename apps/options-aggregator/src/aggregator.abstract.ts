import { InjectModel } from '@nestjs/mongoose';
import { Option, OptionDocument } from '@app/shared/option.schema';
import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import * as sleep from 'sleep-promise';

export abstract class AggregatorAbstract<TRawOption, TDepth> {
    protected logger: Logger;
    protected abstract get rateLimit(): number;
    protected isGetWithPagination: boolean = false;
    protected readonly pageSize: number = null;

    constructor(@InjectModel(Option.name) private optionsDataModel: Model<OptionDocument>) {}

    async startSyncLoop(): Promise<void> {
        try {
            await this.iteration();
        } catch (error) {
            this.logger.error(error);
        }

        setImmediate(this.startSyncLoop.bind(this));
    }

    protected async iteration(): Promise<void> {
        let rawOptions: Array<TRawOption>;

        if (this.isGetWithPagination) {
            if (!this.pageSize) {
                this.logger.error(`Invalid page size = ${this.pageSize}`);
                sleep(this.rateLimit * 10);
                return;
            }

            rawOptions = await this.getRawOptionsWithPagination();
        } else {
            if (this.pageSize) {
                this.logger.error(`Page size unacceptable = ${this.pageSize}`);
                sleep(this.rateLimit * 10);
                return;
            }

            rawOptions = await this.getRawOptions();
        }

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

    private async getRawOptionsWithPagination(): Promise<Array<TRawOption>> {
        const result: Array<TRawOption> = [];
        let skip: number = 0;

        while (true) {
            const data: Array<TRawOption> = await this.getRawOptions(skip);

            if (!data.length) {
                break;
            }

            result.push(...data);
            skip += this.pageSize;

            await sleep(this.rateLimit);
        }

        return result;
    }

    protected abstract getRawOptions(skip?: number): Promise<Array<TRawOption>>;
    protected abstract getDepth(rawOption: TRawOption): Promise<TDepth>;
    protected abstract constructOptionData(rawOption: TRawOption, depth: TDepth): Option;
}
