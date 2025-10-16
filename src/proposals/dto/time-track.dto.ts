import { IsInt, IsNotEmpty, IsDateString } from 'class-validator';

export class TimeTrackerDto {
  @IsInt()
  @IsNotEmpty()
  proposal_id: number;

  @IsInt()
  @IsNotEmpty()
  userid: number;

  @IsDateString()
  @IsNotEmpty()
  start_datetime: string;

  @IsDateString()
  @IsNotEmpty()
  end_datetime: string;
}
