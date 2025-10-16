import { Test, TestingModule } from '@nestjs/testing';
import { ErrorLogController } from './error-log.controller';
import { ErrorLogService } from './error-log.service';

describe('ErrorLogController', () => {
  let controller: ErrorLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ErrorLogController],
      providers: [ErrorLogService],
    }).compile();

    controller = module.get<ErrorLogController>(ErrorLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
