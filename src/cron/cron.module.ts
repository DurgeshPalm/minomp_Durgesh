import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';
import { MailModule } from '../Global/services/mail.module'; // adjust path to your mail module
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule,MailModule],
  providers: [CronService],
  controllers: [CronController],
  exports: [CronService],
})
export class CronModule {}
