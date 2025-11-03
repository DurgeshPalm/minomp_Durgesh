import { Injectable } from '@nestjs/common';
import { QueryService } from '../Global/services/query.service'; // Adjust path as needed
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { RespDesc, RespStatusCodes } from '../common/constants/app.messages';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class TodosService {
  constructor(private readonly queryService: QueryService) {}

  // ✅ Create a new todo
  async create(createTodoDto: CreateTodoDto) {
    return this.queryService.executeTransaction(async (queryRunner) => {
      const { title, description } = createTodoDto;
      const query = `INSERT INTO todos (title, description, completed) VALUES (?, ?,? )`;
      await queryRunner.query(query, [title, description || '', false]);

      return {
        resp_code: RespStatusCodes.Success,
        resp_message: RespDesc.Success,
      };
    }).catch((error) => {
      console.error('Error creating todo:', error);
      return {
        resp_code: RespStatusCodes.Failed,
        resp_message: RespDesc.Failed,
      };
    });
  }

  // ✅ Fetch all todos with pagination
  async findAll(paginationDto: PaginationDto) {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const offset = (page - 1) * limit;

      const [todos, total] = await Promise.all([
        this.queryService.executeQuery(
          `SELECT * FROM todos ORDER BY created_at DESC LIMIT ? OFFSET ?`,
          [limit, offset],
        ),
        this.queryService.executeQuery(`SELECT COUNT(*) as count FROM todos`),
      ]);

      const formattedTodos = todos.map((todo: any) => ({
        ...todo,
        completed: Boolean(todo.completed),
      }));

      return {
        resp_code: RespStatusCodes.Success,
        resp_message: RespDesc.Success,
        data: formattedTodos,
        pagination: {
          total: Number(total[0].count),
          page,
          limit,
          totalPages: Math.ceil(total[0].count / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching todos:', error);
      // throw error;
        return {
          resp_code: RespStatusCodes.Failed,
          resp_message: RespDesc.Failed,
        };
    }
  }

  // ✅ Update a todo
  async update(id: number, updateTodoDto: UpdateTodoDto) {
    return this.queryService.executeTransaction(async (queryRunner) => {
      const { title, description, completed } = updateTodoDto;

      let query = `UPDATE todos SET `;
      const params: any[] = [];

      if (title !== undefined) {
        query += `title = ?, `;
        params.push(title);
      }

      if (description !== undefined) {
        query += `description = ?, `;
        params.push(description);
      }

      if (completed !== undefined) {
        query += `completed = ?, `;
        params.push(completed ? 1 : 0);
      }

      query = query.slice(0, -2); // remove trailing comma
      query += ` WHERE id = ?`;
      params.push(id);

      await queryRunner.query(query, params);

      return {
        resp_code: RespStatusCodes.Success,
        resp_message: RespDesc.Success,
      };
    }).catch((error) => {
      console.error('Error updating todo:', error);
      return {
        resp_code: RespStatusCodes.Failed,
        resp_message: RespDesc.Failed,
      };
    });
  }

  // ✅ Delete a todo
  async remove(id: number) {
    return this.queryService.executeTransaction(async (queryRunner) => {
      await queryRunner.query(`DELETE FROM todos WHERE id = ?`, [id]);
      return {
        resp_code: RespStatusCodes.Success,
        resp_message: RespDesc.Success,
      };
    }).catch((error) => {
      console.error('Error deleting todo:', error);
      return {
        resp_code: RespStatusCodes.Failed,
        resp_message: RespDesc.Failed,
      };
    });
  }
}
