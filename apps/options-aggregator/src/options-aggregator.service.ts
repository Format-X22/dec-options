import { Injectable, Logger } from '@nestjs/common';
import { BinanceService } from './options/binance/binance.service';
import { DeribitService } from './options/deribit/deribit.service';
import { HegicService } from './options/hegic/hegic.service';
import { OkexService } from './options/okex/okex.service';
import { ConfigService } from '@nestjs/config';
import { AggregatorAbstract } from './options/aggregator.abstract';

@Injectable()
export class OptionsAggregatorService {
    private readonly logger: Logger = new Logger(OptionsAggregatorService.name);

    constructor(
        private readonly configService: ConfigService,

        private readonly binanceService: BinanceService,
        private readonly deribitService: DeribitService,
        private readonly hegicService: HegicService,
        private readonly okexService: OkexService,
    ) {}

    async start(): Promise<void> {
        [this.binanceService, this.deribitService, this.okexService].forEach(
            this.startSync.bind(this),
        );

        this.logger.verbose('Sync loops started');
    }

    private startSync(service: AggregatorAbstract<Record<string, unknown>>): void {
        service.startSyncLoop().catch(this.makeErrorHandlerSyncError(Object.getPrototypeOf(service).constructor));
    }

    private makeErrorHandlerSyncError(target: typeof AggregatorAbstract): (error: Error) => void {
        return (error: Error): void => this.logger.error(`FATAL sync error - ${target.name}`, String(error));
    }
}
