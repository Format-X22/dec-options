import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { NextServer } from 'next/dist/server/next';
import next from 'next';

@Injectable()
export class ViewService implements OnModuleInit, OnModuleDestroy {
    private readonly logger: Logger = new Logger(ViewService.name);
    private server?: NextServer;

    async onModuleInit(): Promise<void> {
        try {
            this.server = next({ dev: process.env.NODE_ENV !== 'production', dir: './apps/frontend' });

            await this.server.prepare();
        } catch (error) {
            this.logger.error(error);
        }
    }

    async onModuleDestroy(): Promise<void> {
        if (this.server) {
            await this.server.close();
        }
    }

    getNextServer(): NextServer {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.server!;
    }
}
