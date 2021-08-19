import { Injectable, Logger } from '@nestjs/common';
import { BinanceService } from './options/binance/binance.service';
import { DeribitService } from './options/deribit/deribit.service';
import { HegicService } from './options/hegic/hegic.service';
import { OkexService } from './options/okex/okex.service';
import { AggregatorAbstract } from './options/aggregator.abstract';
import { AuctusService } from './options/auctus/auctus.service';

@Injectable()
export class OptionsAggregatorService {
    private readonly logger: Logger = new Logger(OptionsAggregatorService.name);

    constructor(
        private readonly binanceService: BinanceService,
        private readonly deribitService: DeribitService,
        private readonly hegicService: HegicService,
        private readonly okexService: OkexService,
        private readonly auctusService: AuctusService,
    ) {}

    async start(): Promise<void> {
        [this.binanceService, this.deribitService, this.okexService, this.auctusService].forEach(
            this.startOptionsSync.bind(this),
        );

        this.logger.verbose('Sync loops started');
    }

    private startOptionsSync(service: AggregatorAbstract<Record<string, unknown>>): void {
        service.startSyncLoop().catch(this.makeErrorHandlerSyncError(Object.getPrototypeOf(service).constructor.name));
    }

    private makeErrorHandlerSyncError(target: string): (error: Error) => void {
        return (error: Error): void => this.logger.error(`FATAL sync error - ${target}`, String(error));
    }
}
