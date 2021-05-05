import { Controller, Get, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';

import { ViewService } from './view.service';

@Controller('/')
export class ViewController {
    constructor(private viewService: ViewService) {}

    @Get('*')
    // tslint:disable-next-line:typedef
    static(@Req() req: Request, @Res() res: Response) {
        // tslint:disable-next-line:typedef
        const handle = this.viewService.getNextServer().getRequestHandler();
        handle(req, res);
    }
}