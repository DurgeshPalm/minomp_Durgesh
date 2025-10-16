import { Test, TestingModule } from '@nestjs/testing';
import { AuthanticationService } from './authantication.service';

describe('AuthanticationService', () => {
  let service: AuthanticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthanticationService],
    }).compile();

    service = module.get<AuthanticationService>(AuthanticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
