import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email адрес' })
  email?: string;

  @ApiProperty({
    description: 'Новый пароль пользователя (минимум 8 символов)',
    example: 'NewSecurePassword123',
    minLength: 8,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @MaxLength(128, { message: 'Пароль не должен превышать 128 символов' })
  password?: string;

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
    example: 'EDITOR',
    required: false,
  })
  @IsOptional()
  @IsEnum(['ADMIN', 'EDITOR', 'AUTHOR'], { message: 'Неверная роль пользователя' })
  role?: 'ADMIN' | 'EDITOR' | 'AUTHOR';

  @ApiProperty({
    description: 'Активен ли пользователь',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive должно быть булевым значением' })
  isActive?: boolean;
}
