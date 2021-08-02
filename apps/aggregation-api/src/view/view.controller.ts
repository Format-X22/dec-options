import { Controller, Get, Next, Req, Res } from '@nestjs/common';
import { ViewService } from './view.service';
import { NextFunction, Request, Response } from 'express';
import { NextServer } from 'next/dist/server/next';

const EXCLUDE_PATH: Array<string> = ['/option', '/graphql'];

@Controller()
export class ViewController {
    constructor(private viewService: ViewService) {}

    @Get('*')
    async getFrontend(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction): Promise<void> {
        if (EXCLUDE_PATH.includes(req.path)) {
            next();
            return;
        }

        const handle: ReturnType<NextServer['getRequestHandler']> = this.viewService
            .getNextServer()
            .getRequestHandler();

        await handle(req, res);
    }
}
