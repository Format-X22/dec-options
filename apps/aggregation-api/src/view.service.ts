import { Injectable, OnModuleInit } from '@nestjs/common';
import next from 'next';
import NextServer from 'next/dist/next-server/server/next-server';

@Injectable()
export class ViewService implements OnModuleInit {
    private server: NextServer;

    async onModuleInit(): Promise<void> {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.server = next({ dev: true, dir: './apps/frontend' });
            await this.server.prepare();
        } catch (error) {
            console.log(error);
        }
    }

    getNextServer(): NextServer {
        return this.server;
    }
}
