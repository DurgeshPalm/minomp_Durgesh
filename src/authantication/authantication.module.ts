import { Module } from '@nestjs/common';
import { AuthanticationService } from './authantication.service';
import { AuthanticationController } from './authantication.controller';
import { QueryService } from "../common/constants/app.query";
import { MailModule } from '../Global/services/mail.module'; 


@Module({
  imports: [MailModule],
  controllers: [AuthanticationController],
  providers: [AuthanticationService,QueryService],
})
export class AuthanticationModule {}
