import allSettled from 'promise.allsettled';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Fees, FeesDocument } from '@app/shared/fees.schema';

@Injectable()
export class FeesService implements OnModuleInit, OnModuleDestroy {
    protected readonly logger: Logger = new Logger(FeesService.name);
    private interval?: NodeJS.Timeout;
    private inSync: boolean = false;

    constructor(@InjectModel(Fees.name) private feesModel: Model<FeesDocument>, private configService: ConfigService) {}

    async onModuleInit(): Promise<void> {
        this.interval = setInterval(async (): Promise<void> => {
            if (this.inSync) {
                return;
            }

            try {
                this.inSync = true;

                await this.syncFees();

                this.inSync = false;
            } catch (error) {
                this.logger.error(error);
                this.inSync = false;
            }
        }, Number(this.configService.get('OA_FEES_SYNC_INTERVAL')) || 60_000);
    }

    async onModuleDestroy(): Promise<void> {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    async syncFees(): Promise<void> {
        allSettled([this.syncBinance(), this.syncDeribit(), this.syncOkex(), this.syncHegic()]).catch((error) => {
            throw error;
        });
    }

    async syncBinance(): Promise<void> {
        // TODO -
    }

    async syncDeribit(): Promise<void> {
        // TODO -
    }

    async syncOkex(): Promise<void> {
        // TODO -
    }

    async syncHegic(): Promise<void> {
        // TODO -
    }
}
