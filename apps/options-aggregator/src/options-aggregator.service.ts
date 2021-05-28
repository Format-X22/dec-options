import { Injectable, Logger } from '@nestjs/common';
import { AuctusService } from './auctus/auctus.service';
import { BinanceService } from './binance/binance.service';
import { DeribitService } from './deribit/deribit.service';
import { HegicService } from './hegic/hegic.service';
import { OkexService } from './okex/okex.service';
import { OpynService } from './opyn/opyn.service';
import { SirenService } from './siren/siren.service';
import { ConfigService } from '@nestjs/config';
import { AggregatorAbstract } from './aggregator.abstract';

@Injectable()
export class OptionsAggregatorService {
    private readonly logger: Logger = new Logger(OptionsAggregatorService.name);

    constructor(
        private readonly configService: ConfigService,

        private readonly auctusService: AuctusService,
        private readonly binanceService: BinanceService,
        private readonly deribitService: DeribitService,
        private readonly hegicService: HegicService,
        private readonly okexService: OkexService,
        private readonly opynService: OpynService,
        private readonly sirenService: SirenService,
    ) {}

    async start(): Promise<void> {
        [
            this.auctusService,
            this.binanceService,
            this.deribitService,
            this.hegicService,
            this.okexService,
            this.opynService,
            this.sirenService,
        ].forEach(this.startSync.bind(this));

        this.logger.verbose('Sync loops started');
    }

    private startSync(service: AggregatorAbstract<Object, Object>): void {
        service.startSyncLoop().catch(this.makeErrorHandlerSyncError(Object.getPrototypeOf(service).constructor));
    }

    private makeErrorHandlerSyncError(target: typeof AggregatorAbstract): (error: Error) => void {
        return (error: Error): void => this.logger.error(`FATAL sync error - ${target.name}`, String(error));
    }
}
