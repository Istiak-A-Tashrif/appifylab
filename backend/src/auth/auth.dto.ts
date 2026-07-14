import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";
export class RegisterDto {
  @IsString() @MinLength(1) @MaxLength(60) firstName: string;
  @IsString() @MinLength(1) @MaxLength(60) lastName: string;
  @IsEmail() @MaxLength(254) email: string;
  @IsString() @MinLength(8) @MaxLength(72) password: string;
}
export class LoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
}
