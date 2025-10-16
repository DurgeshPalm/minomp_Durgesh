import { IsNotEmpty, IsInt, IsEnum } from 'class-validator';

export class RewardReceivedStatusDto {
    @IsNotEmpty()
    @IsInt()
    userid: number;

    @IsNotEmpty()
    @IsInt()
    proposal_id: number;

    @IsNotEmpty()
    @IsEnum([0, 1], { message: 'reward_received_status must be 0 or 1' })
    reward_received_status: 0 | 1;
}
