import { Module } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { ProposalsController } from './proposals.controller';
import { QueryService } from "../common/constants/app.query";


@Module({
  controllers: [ProposalsController],
  providers: [ProposalsService,QueryService],
})
export class ProposalsModule {}
