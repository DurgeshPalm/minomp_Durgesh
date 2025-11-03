import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { MailService } from './mail.service';
import { QueryLogService } from './query-log.service';
import { ExceptionLogService } from './exception-log.service';

@Module({
  providers: [QueryService,QueryLogService,ExceptionLogService, MailService,],
  exports: [QueryService,QueryLogService,ExceptionLogService, MailService,], // 👈 important!
})
export class CommonModule {}
