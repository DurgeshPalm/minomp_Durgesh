import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
