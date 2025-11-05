import { SetMetadata } from '@nestjs/common';

export const SkipApiLogging = () => SetMetadata('skipApiLogging', true);
