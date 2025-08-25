import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Некорректный email адрес' })
  email: string;

  @ApiProperty({
    description: 'Пароль пользователя (минимум 8 символов)',
    example: 'SecurePassword123',
    minLength: 8,
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @MaxLength(128, { message: 'Пароль не должен превышать 128 символов' })
  password: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  @MaxLength(100, { message: 'Имя не должно превышать 100 символов' })
  name?: string;

  @ApiProperty({
    description: 'Роль пользователя',
    enum: ['ADMIN', 'EDITOR', 'AUTHOR'],
    example: 'AUTHOR',
    required: false,
  })
  @IsOptional()
  @IsEnum(['ADMIN', 'EDITOR', 'AUTHOR'], { message: 'Неверная роль пользователя' })
  role?: 'ADMIN' | 'EDITOR' | 'AUTHOR';
}
