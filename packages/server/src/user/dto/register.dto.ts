import { IsString, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'username限制不为空!' })
  @IsString({ message: 'username限制为string类型!' })
  username: string;

  @IsNotEmpty({ message: 'password限制不为空!' })
  @IsString({ message: 'password限制为string类型!' })
  password: string;

  @IsNotEmpty({ message: 'confirm限制不为空!' })
  @IsString({ message: 'confirm限制为string类型!' })
  confirm: string;
}
