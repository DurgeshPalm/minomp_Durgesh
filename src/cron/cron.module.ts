import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { CommonModule } from '../Global/services/common.module';

@Module({
  imports: [ScheduleModule,CommonModule],
  providers: [CronService],
  controllers: [CronController],
  exports: [CronService],
})
export class CronModule {}
