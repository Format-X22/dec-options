import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { NextServer } from 'next/dist/server/next';
import next from 'next';

@Injectable()
export class ViewService implements OnModuleInit, OnModuleDestroy {
    private readonly logger: Logger = new Logger(ViewService.name);
    private server: NextServer;

    async onModuleInit(): Promise<void> {
        try {
            this.server = next({ dev: true, dir: './apps/frontend' });

            await this.server.prepare();
        } catch (error) {
            this.logger.error(error);
        }
    }

    async onModuleDestroy(): Promise<void> {
        await this.server.close();
    }

    getNextServer(): NextServer {
        return this.server;
    }
}
