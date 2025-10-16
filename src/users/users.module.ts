import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { QueryService } from './users.query';

@Module({
  controllers: [UsersController],
  providers: [UsersService,QueryService],
})
export class UsersModule {}
