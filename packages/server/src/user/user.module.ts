import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SecretTool } from '../utils/SecretTool';
import { RandomTool } from '../utils/RandomTool';

@Module({
  controllers: [UserController],
  providers: [UserService, SecretTool, RandomTool],
})
export class UserModule {}
