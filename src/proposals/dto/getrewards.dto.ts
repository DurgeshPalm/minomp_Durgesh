import { IsNotEmpty, IsInt, IsString, IsOptional, IsNumber } from 'class-validator';

export class GetRewardsDto {
    @IsNotEmpty()
    @IsNumber()
    userid: number;
  }