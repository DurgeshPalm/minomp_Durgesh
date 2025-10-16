import { IsNotEmpty, IsInt, IsEnum } from 'class-validator';

export class AcceptRejectProposalDto {
    @IsNotEmpty()
    @IsInt()
    userid: number; // Parent ID

    @IsNotEmpty()
    @IsInt()
    proposal_id: number;

    @IsNotEmpty()
    @IsEnum(['accepted', 'rejected'], { message: 'proposal_status must be either accepted or rejected' })
    proposal_status: 'accepted' | 'rejected';
}
