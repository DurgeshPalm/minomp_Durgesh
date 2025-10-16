import { Test, TestingModule } from '@nestjs/testing';
import { AuthanticationController } from './authantication.controller';
import { AuthanticationService } from './authantication.service';

describe('AuthanticationController', () => {
  let controller: AuthanticationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthanticationController],
      providers: [AuthanticationService],
    }).compile();

    controller = module.get<AuthanticationController>(AuthanticationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
