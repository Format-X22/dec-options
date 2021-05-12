import { Controller, Get, Req, Res } from '@nestjs/common';
import { ViewService } from './view.service';
import { Request, Response } from 'express';
import { NextServer } from 'next/dist/server/next';

@Controller()
export class ViewController {
    constructor(private viewService: ViewService) {}

    @Get('*')
    async getFrontend(@Req() req: Request, @Res() res: Response): Promise<void> {
        const handle: ReturnType<
            NextServer['getRequestHandler']
        > = this.viewService.getNextServer().getRequestHandler();

        await handle(req, res);
    }
}
