import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { CommonModule } from '../Global/services/common.module';

@Module({
  imports: [CommonModule],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
