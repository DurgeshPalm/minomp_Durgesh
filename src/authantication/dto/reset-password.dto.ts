import { IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsNumber()
  userid: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  new_password: string;
}
