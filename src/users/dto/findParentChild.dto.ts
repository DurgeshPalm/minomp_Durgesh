import { IsOptional, IsEmail, Matches, IsString, IsNotEmpty, ValidateIf } from 'class-validator';

export class FindParentChildDto {
    @ValidateIf((o) => o.name !== "") 
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @ValidateIf((o) => o.email !== "") 
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @ValidateIf((o) => o.mobileno !== "") 
  @IsNotEmpty({ message: 'Mobile number cannot be empty' })
  @Matches(/^\d{10}$/, { message: 'Mobile number must be exactly 10 digits' })
  mobileno?: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsString({ message: 'Role must be a string' })
  role: string;
}
