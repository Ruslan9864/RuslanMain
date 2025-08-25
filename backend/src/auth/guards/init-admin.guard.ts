import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class InitAdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const initToken = request.headers['x-init-token'] as string;
    const expectedToken = this.configService.get<string>('INIT_ADMIN_TOKEN');

    if (!expectedToken) {
      throw new ForbiddenException('INIT_ADMIN_TOKEN не настроен');
    }

    if (!initToken || initToken !== expectedToken) {
      throw new ForbiddenException('Неверный токен инициализации');
    }

    return true;
  }
}
