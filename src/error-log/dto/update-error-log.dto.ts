import { PartialType } from '@nestjs/swagger';
import { CreateErrorLogDto } from './create-error-log.dto';

export class UpdateErrorLogDto extends PartialType(CreateErrorLogDto) {}
