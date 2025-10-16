import { IsNotEmpty, IsInt } from 'class-validator';

export class DeleteProposalDto {
    @IsNotEmpty()
    @IsInt()
    userid: number;

    @IsNotEmpty()
    @IsInt()
    proposal_id: number;
}
