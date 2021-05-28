import { Injectable, Logger } from '@nestjs/common';
import { Option, OptionDocument } from '@app/shared/option.schema';
import { AuctusService } from './auctus/auctus.service';
import { BinanceService } from './binance/binance.service';
import { DeribitService } from './deribit/deribit.service';
import { HegicService } from './hegic/hegic.service';
import { OkexService } from './okex/okex.service';
import { OpynService } from './opyn/opyn.service';
import { SirenService } from './siren/siren.service';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface IAggregator {
    getCurrentData: () => Promise<Array<Option>>;
}

abstract class AggregatorAbstract implements IAggregator {
    getCurrentData: () => Promise<Array<Option>>;
}

@Injectable()
export class OptionsAggregatorService {
    private readonly logger: Logger = new Logger(OptionsAggregatorService.name);

    constructor(
        @InjectModel(Option.name) private optionsDataModel: Model<OptionDocument>,
        private readonly configService: ConfigService,

        private readonly auctusService: AuctusService,
        private readonly binanceService: BinanceService,
        private readonly deribitService: DeribitService,
        private readonly hegicService: HegicService,
        private readonly lienService: LienService,
        private readonly okexService: OkexService,
        private readonly opynService: OpynService,
        private readonly sirenService: SirenService,
    ) {}

    async start(): Promise<void> {
        const intervalTime: number = Number(this.configService.get<string>('OA_SYNC_INTERVAL_MS'));

        this.doSyncAll();
        setInterval(this.doSyncAll.bind(this), intervalTime);
    }

    private doSyncAll(): void {
        this.logger.verbose('Sync started');

        [
            this.auctusService,
            this.binanceService,
            this.deribitService,
            this.hegicService,
            this.okexService,
            this.opynService,
            this.sirenService,
        ].forEach(this.doSync.bind(this));
    }

    private doSync(service: AggregatorAbstract): void {
        service
            .getCurrentData()
            .then(this.handleSyncResult.bind(this))
            .catch(this.makeErrorHandlerSyncError(Object.getPrototypeOf(service).constructor));
    }

    private async handleSyncResult(result: Array<Option> | null): Promise<void> {
        for (const data of result || []) {
            await this.optionsDataModel.updateOne({ id: data.id }, data, { upsert: true });
        }
    }

    private makeErrorHandlerSyncError(target: typeof AggregatorAbstract): (error: Error) => void {
        return (error: Error): void => this.logger.error(`Sync error - ${target.name}`, String(error));
    }
}
