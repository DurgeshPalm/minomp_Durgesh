import { Type } from 'class-transformer';
import { IsNotEmpty, IsInt, IsString, IsOptional, IsNumber } from 'class-validator';

export class GetRewardsDto {
    @IsNotEmpty()
    @IsNumber()
      @Type(() => Number)
    userid: number;
  }