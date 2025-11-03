import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { QueryService } from './query.service';

@Module({
  providers: [QueryService,MailService],
  exports: [QueryService,MailService], 
})
export class MailModule {}
