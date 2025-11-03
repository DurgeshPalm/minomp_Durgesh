import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { QueryLogService } from './query-log.service';

@Injectable()
export class QueryService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly queryLogService: QueryLogService,
  ) {}

  /**
   * Execute a function inside a managed transaction.
   */
  async executeTransaction<T>(
    callback: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await callback(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await this.queryLogService.logQueryError('TRANSACTION', [], error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Execute a raw SQL query safely outside of a transaction.
   */
  async executeQuery<T = any>(
    query: string,
    parameters: any[] = [],
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const result = await queryRunner.query(query, parameters);
      return result;
    } catch (error) {
      await this.queryLogService.logQueryError(query, parameters, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
