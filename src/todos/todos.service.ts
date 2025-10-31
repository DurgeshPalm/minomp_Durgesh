import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { RespDesc, RespStatusCodes } from '../common/constants/app.messages';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class TodosService {
  constructor(private readonly dataSource: DataSource) {}

  // ✅ Create a new todo
  async create(createTodoDto: CreateTodoDto) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { title, description } = createTodoDto;
      const query = `INSERT INTO todos (title, description, completed) VALUES (?, ?, ?)`;
      await queryRunner.query(query, [title, description || '', false]);

      await queryRunner.commitTransaction();
      return { resp_code: RespStatusCodes.Success ,resp_message: RespDesc.Success };
    } catch (error) {
      console.error('Error creating todo:', error);
      await queryRunner.rollbackTransaction();
      return { resp_code: RespStatusCodes.Failed, resp_message: RespDesc.Failed };
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ Fetch all todos (convert 0/1 → boolean)
 async findAll(paginationDto: PaginationDto) {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const offset = (page - 1) * limit;

      const [todos, total] = await Promise.all([
        this.dataSource.query(
          `SELECT * FROM todos ORDER BY created_at DESC LIMIT ? OFFSET ?`,
          [limit, offset],
        ),
        this.dataSource.query(`SELECT COUNT(*) as count FROM todos`),
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
      return { resp_code: RespStatusCodes.Failed, resp_message: RespDesc.Failed };
    }
  }
  // ✅ Update a todo
  async update(id: number, updateTodoDto: UpdateTodoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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
        params.push(completed ? 1 : 0); // ✅ store as 1/0 for MySQL
      }

      query = query.slice(0, -2); // remove trailing comma
      query += ` WHERE id = ?`;
      params.push(id);

      await queryRunner.query(query, params);
      await queryRunner.commitTransaction();

      return { resp_code: RespStatusCodes.Success, resp_message: RespDesc.Success };
    } catch (error) {
      console.error('Error updating todo:', error);
      await queryRunner.rollbackTransaction();
      return { resp_code:RespStatusCodes.Failed, resp_message: RespDesc.Failed };
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ Delete a todo
  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(`DELETE FROM todos WHERE id = ?`, [id]);
      await queryRunner.commitTransaction();
      return { resp_code: RespStatusCodes.Success, resp_message: RespDesc.Success };
    } catch (error) {
      console.error('Error deleting todo:', error);
      await queryRunner.rollbackTransaction();
      return { resp_code:RespStatusCodes.Failed, resp_message: RespDesc.Failed};
    } finally {
      await queryRunner.release();
    }
  }
}
