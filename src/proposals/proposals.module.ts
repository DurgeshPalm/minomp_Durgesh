import { Module } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { ProposalsController } from './proposals.controller';
import { QueryService } from "../common/constants/app.query";
import { ParentRoleGuard } from '../Global/guards/parent-role.guard';

@Module({
  controllers: [ProposalsController],
  providers: [
    ProposalsService,
    QueryService,
    ParentRoleGuard
  ],
})
export class ProposalsModule {}
