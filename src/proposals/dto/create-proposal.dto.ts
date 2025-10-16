import { IsNotEmpty, IsInt, IsString, IsOptional, IsEnum, IsDateString, ValidateIf } from 'class-validator';

export class CreateProposalDto {
    @IsNotEmpty() 
    @IsString() 
    proposal_name: string;

    @IsOptional()
    @ValidateIf((o) => o.reward_id !== "" && o.reward_id !== null) 
    @IsInt({ message: "reward_id must be an integer number" }) 
    reward_id?: number | null;

    @IsOptional()
    @IsString()
    reward_name?: string;

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'start_datetime must be a valid ISO date string' })
    start_datetime: string;

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'end_datetime must be a valid ISO date string' })
    end_datetime: string;

    @IsOptional()
    @IsEnum(['pending', 'completed', 'ongoing']) 
    status?: 'pending' | 'completed' | 'ongoing';

    @IsNotEmpty() 
    @IsInt() 
    userid: number;
}
