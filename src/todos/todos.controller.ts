import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(createTodoDto);
  }

 @Post('list')
  findAll(@Body() paginationDto: PaginationDto) {
    return this.todosService.findAll(paginationDto);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: number, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(id, updateTodoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.todosService.remove(id);
  }
}
