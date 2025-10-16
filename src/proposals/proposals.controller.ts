import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { GetRewardsDto } from './dto/getrewards.dto';
import { ProposalListDto } from './dto/proposalList.dto';
import { EditProposalDto } from './dto/edit-proposal.dto';
import { DeleteProposalDto } from './dto/delete-proposal.dto';
import { AcceptRejectProposalDto } from './dto/accept-reject.dto';
import { RewardReceivedStatusDto } from './dto/reward-received.dto';
import { ProposalDetailDto } from './dto/proposal-detail.dto';
import { TimeTrackerDto } from './dto/time-track.dto';

@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

 @Post('/create')
 async create(@Body() createProposalDto: CreateProposalDto) {
  return this.proposalsService.create(createProposalDto);
}

@Get('/getRewards')
async getRewards(@Query() query: GetRewardsDto) {
  return await this.proposalsService.getRewards(query.userid);
}
@Post('proposal_list')
    async getProposalList(@Body() proposalListDto: ProposalListDto) {
        return await this.proposalsService.getProposalList(proposalListDto);
    }
    @Put('edit_proposal')
    async editProposal(@Body() editProposalDto: EditProposalDto) {
        return this.proposalsService.editProposal(editProposalDto);
    }

    @Put('delete_proposal')
    async deleteProposal(@Body() deleteProposalDto: DeleteProposalDto) {
        return this.proposalsService.deleteProposal(deleteProposalDto);
    }
    
    @Put('accept-reject')
    async acceptRejectProposal(@Body() acceptRejectProposalDto: AcceptRejectProposalDto) {
        return this.proposalsService.acceptRejectProposal(acceptRejectProposalDto);
    }

    @Put('reward-received-status')
    async updateRewardReceivedStatus(@Body() rewardReceivedStatusDto: RewardReceivedStatusDto) {
        return this.proposalsService.updateRewardReceivedStatus(rewardReceivedStatusDto);
    }

    @Post('getProposalDetail')
    async getProposalDetail(@Body() proposalDetailDto: ProposalDetailDto) {
      return this.proposalsService.getProposalDetail(proposalDetailDto);
    }
    @Post('time-track')
    async trackTime(@Body() timeTrackerDto: TimeTrackerDto) {
      return this.proposalsService.trackTime(timeTrackerDto);
    }
}
