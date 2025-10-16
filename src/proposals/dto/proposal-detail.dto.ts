import { IsInt, IsNotEmpty } from 'class-validator';

export class ProposalDetailDto {
  @IsInt()
  @IsNotEmpty()
  proposal_id: number;

  @IsNotEmpty()
  status: string;
}
