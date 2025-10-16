import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ErrorLogService } from './error-log.service';


@Controller('error-log')
export class ErrorLogController {
  constructor(private readonly errorLogService: ErrorLogService) {}
}
