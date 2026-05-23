import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get()
  serveApp(@Res({ passthrough: false }) res: Response) {
    res.sendFile(join(__dirname, '..', 'public', 'index.html'), { root: '/' });
  }
}
