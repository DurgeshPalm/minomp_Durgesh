import { Body, Controller, Get, Post, HttpException, HttpStatus } from '@nestjs/common';
import { CronService } from './cron.service';
import { CronMailDto } from './dto/cron-mail.dto';
import { EnableDto } from './dto/enable.dto';

@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Post('config')
  setConfig(@Body() dto: CronMailDto) {
    try {
      this.cronService.setConfig(dto);
      return { status: 'ok', message: 'Cron config saved', data: dto };
    } catch (err: any) {
      throw new HttpException(err?.message || 'Failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('config')
  getConfig() {
    return { status: 'ok', data: this.cronService.getConfig() };
  }

  @Post('send-now')
  async sendNow() {
    try {
      await this.cronService.sendNow();
      return { status: 'ok', message: 'Send triggered' };
    } catch (err: any) {
      throw new HttpException(err?.message || 'Failed to trigger send', HttpStatus.BAD_REQUEST);
    }
  }


  @Post('enable')
  toggleEnable(@Body() dto: EnableDto) {
    this.cronService.enableOrDisable(dto.enabled);
    return { status: 'ok', enabled: dto.enabled };
  }
}
