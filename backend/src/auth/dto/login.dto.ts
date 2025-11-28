import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@loginus.ru',
    description: 'Email или номер телефона пользователя',
  })
  @IsString({ message: 'Логин должен быть строкой (email или телефон)' })
  login: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  password: string;
}
