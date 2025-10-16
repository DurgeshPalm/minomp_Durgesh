import { IsNotEmpty, IsInt, IsString, IsOptional, IsDateString } from 'class-validator';

export class EditProposalDto {
    @IsNotEmpty()
    @IsInt()
    proposal_id: number;

    @IsNotEmpty()
    @IsInt()
    userid: number;

    @IsOptional()
    @IsString()
    proposal_name?: string;

    @IsOptional()
    @IsDateString({ strict: true }, { message: 'start_datetime must be a valid ISO date string' })
    start_datetime?: string;

    @IsOptional()
    @IsDateString({ strict: true }, { message: 'end_datetime must be a valid ISO date string' })
    end_datetime?: string;
}
