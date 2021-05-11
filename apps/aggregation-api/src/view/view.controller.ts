import { Controller, Get, Logger, Req, Res } from '@nestjs/common';
import { ViewService } from './view.service';
import { Request, Response } from 'express';
import { NextServer } from 'next/dist/server/next';

@Controller()
export class ViewController {
    private readonly logger: Logger = new Logger(ViewController.name);

    constructor(private viewService: ViewService) {}

    @Get('*')
    getFrontend(@Req() req: Request, @Res() res: Response): void {
        const handle: ReturnType<
            NextServer['getRequestHandler']
        > = this.viewService.getNextServer().getRequestHandler();

        handle(req, res).catch(this.logger.error.bind(this.logger));
    }
}
