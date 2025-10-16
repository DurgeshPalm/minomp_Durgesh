import { IsNotEmpty, IsInt, IsString, IsOptional } from 'class-validator';


export class PageDTO {
 

    @IsNotEmpty()
    @IsInt()
    page: number;

    @IsNotEmpty()
    @IsInt()
    rows: number;
}

export class ProposalListDto extends  PageDTO{
    @IsNotEmpty()
    @IsInt()
    userid: number;

    @IsNotEmpty()
    @IsString()
    role: string;

    @IsOptional()
    @IsString()
    proposal_status?: string;

}

