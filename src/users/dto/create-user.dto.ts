import { IsEmail, IsString, IsOptional, IsNumber, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsNumber()
  birthYear?: number;

  @IsOptional() @IsString()
  company?: string;

  @IsOptional() @IsString()
  position?: string;

  @IsOptional() @IsEnum(UserRole)
  role?: UserRole;
}
