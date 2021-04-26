import { Injectable, Logger } from '@nestjs/common';
import { OptionsData, OptionsDataDocument } from '@app/shared/options-data.schema';
import { AuctusService } from './auctus/auctus.service';
import { BinanceService } from './binance/binance.service';
import { CharmService } from './charm/charm.service';
import { DeribitService } from './deribit/deribit.service';
import { FinnexusService } from './finnexus/finnexus.service';
import { FtxService } from './ftx/ftx.service';
import { HegicService } from './hegic/hegic.service';
import { LienService } from './lien/lien.service';
import { OkexService } from './okex/okex.service';
import { OpiumService } from './opium/opium.service';
import { OpynService } from './opyn/opyn.service';
import { PlotxService } from './plotx/plotx.service';
import { PodsService } from './pods/pods.service';
import { PrimitiveService } from './primitive/primitive.service';
import { ProsperService } from './prosper/prosper.service';
import { SirenService } from './siren/siren.service';
import { XoptsService } from './xopts/xopts.service';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface IAggregator {
    getCurrentData: () => Promise<Array<OptionsData>>;
}

abstract class AggregatorAbstract implements IAggregator {
    getCurrentData: () => Promise<Array<OptionsData>>;
}

@Injectable()
export class OptionsAggregatorService {
    private readonly logger: Logger = new Logger(OptionsAggregatorService.name);

    constructor(
        @InjectModel(OptionsData.name) private optionsDataModel: Model<OptionsDataDocument>,
        private readonly configService: ConfigService,

        private readonly auctusService: AuctusService,
        private readonly binanceService: BinanceService,
        private readonly charmService: CharmService,
        private readonly deribitService: DeribitService,
        private readonly finnexusService: FinnexusService,
        private readonly ftxService: FtxService,
        private readonly hegicService: HegicService,
        private readonly lienService: LienService,
        private readonly okexService: OkexService,
        private readonly opiumService: OpiumService,
        private readonly opynService: OpynService,
        private readonly plotxService: PlotxService,
        private readonly podsService: PodsService,
        private readonly primitiveService: PrimitiveService,
        private readonly prosperService: ProsperService,
        private readonly sirenService: SirenService,
        private readonly xoptsService: XoptsService,
    ) {}

    async start(): Promise<void> {
        const intervalTime: number = Number(this.configService.get<string>('OA_SYNC_INTERVAL_MS'));

        this.doSyncAll();
        setInterval(this.doSyncAll.bind(this), intervalTime);
    }

    private doSyncAll(): void {
        this.logger.verbose('Start sync...');

        [
            this.auctusService,
            this.binanceService,
            this.charmService,
            this.deribitService,
            this.finnexusService,
            this.ftxService,
            this.hegicService,
            this.lienService,
            this.okexService,
            this.opiumService,
            this.opynService,
            this.plotxService,
            this.podsService,
            this.primitiveService,
            this.prosperService,
            this.sirenService,
            this.xoptsService,
        ].forEach(this.doSync.bind(this));

        this.logger.verbose('Sync done!');
    }

    private doSync(service: AggregatorAbstract): void {
        service
            .getCurrentData()
            .then(this.handleSyncResult.bind(this))
            .catch(this.makeErrorHandlerSyncError(Object.getPrototypeOf(service).constructor));
    }

    private async handleSyncResult(result: Array<OptionsData> | null): Promise<void> {
        for (const data of result || []) {
            await this.optionsDataModel.updateOne({ id: data.id }, data, { upsert: true });
        }
    }

    private makeErrorHandlerSyncError(target: typeof AggregatorAbstract): (error: Error) => void {
        return (error: Error): void => this.logger.error(`Sync error - ${target.name}`, String(error));
    }
}
