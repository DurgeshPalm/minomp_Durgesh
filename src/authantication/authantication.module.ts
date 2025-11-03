import { Module } from '@nestjs/common';
import { AuthanticationService } from './authantication.service';
import { AuthanticationController } from './authantication.controller';
import { QueryService } from "../common/constants/app.query";
import { CommonModule } from '../Global/services/common.module';


@Module({
  imports: [CommonModule],
  controllers: [AuthanticationController],
  providers: [AuthanticationService,QueryService],
})
export class AuthanticationModule {}
