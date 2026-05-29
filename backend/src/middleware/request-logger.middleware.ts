import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const correlationId = (req.headers['x-request-id'] as string) || randomUUID();
    const startTime = Date.now();

    res.setHeader('x-request-id', correlationId);

    this.logger.log(`→ [${correlationId}] ${method} ${originalUrl} - ${ip}`);

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const logLevel = statusCode >= 400 ? 'warn' : 'log';

      this.logger[logLevel](
        `← [${correlationId}] ${method} ${originalUrl} ${statusCode} - ${duration}ms`,
      );
    });

    next();
  }
}
