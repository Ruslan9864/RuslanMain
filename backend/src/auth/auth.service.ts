import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Tokens } from './interfaces/tokens.interface';
import { InitAdminDto } from './dto/init-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        isActive: true,
        oidcProvider: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is OIDC-only
    if (user.oidcProvider && !user.password) {
      throw new UnauthorizedException('Please use OIDC login for this account');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Log audit
    await this.logAudit(user.id, 'LOGIN', 'USER', user.id, {
      method: 'email',
      ipAddress: 'N/A', // Will be set by controller
    });

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto, ipAddress?: string): Promise<Tokens> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    // Log audit with IP
    await this.logAudit(user.id, 'LOGIN', 'USER', user.id, {
      method: 'email',
      ipAddress,
    });

    return tokens;
  }

  async register(registerDto: RegisterDto): Promise<Tokens> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(registerDto.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
        role: 'AUTHOR', // Default role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    // Log audit
    await this.logAudit(user.id, 'REGISTER', 'USER', user.id, {
      method: 'email',
    });

    return tokens;
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<Tokens> {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check if token exists in database
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshTokenDto.refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.isRevoked) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (new Date() > storedToken.expiresAt) {
        throw new UnauthorizedException('Refresh token expired');
      }

      // Generate new tokens
      const user = {
        id: storedToken.user.id,
        email: storedToken.user.email,
        name: storedToken.user.name,
        role: storedToken.user.role,
      };

      const tokens = await this.generateTokens(user);

      // Revoke old token and save new one
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      });

      await this.saveRefreshToken(user.id, tokens.refreshToken);

      // Log audit
      await this.logAudit(user.id, 'REFRESH_TOKEN', 'USER', user.id, {});

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Revoke specific refresh token
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          token: refreshToken,
          isRevoked: false,
        },
        data: { isRevoked: true },
      });
    } else {
      // Revoke all user's refresh tokens
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          isRevoked: false,
        },
        data: { isRevoked: true },
      });
    }

    // Log audit
    await this.logAudit(userId, 'LOGOUT', 'USER', userId, {});
  }

  async handleOidcLogin(profile: any, provider: string): Promise<Tokens> {
    const { id, emails, displayName } = profile;
    const email = emails[0]?.value;

    if (!email) {
      throw new BadRequestException('Email is required for OIDC login');
    }

    // Find or create user
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { oidcId: id, oidcProvider: provider },
        ],
      },
    });

    if (!user) {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email,
          name: displayName || email.split('@')[0],
          oidcProvider: provider,
          oidcId: id,
          oidcEmail: email,
          role: 'AUTHOR', // Default role
        },
      });

      // Log audit
      await this.logAudit(user.id, 'REGISTER', 'USER', user.id, {
        method: 'oidc',
        provider,
      });
    } else if (!user.oidcProvider) {
      // Link existing email account to OIDC
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          oidcProvider: provider,
          oidcId: id,
          oidcEmail: email,
        },
      });
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    // Log audit
    await this.logAudit(user.id, 'LOGIN', 'USER', user.id, {
      method: 'oidc',
      provider,
    });

    return tokens;
  }

  async initAdmin(initAdminDto: InitAdminDto, ipAddress?: string): Promise<{ success: boolean; message: string }> {
    const { email, password } = initAdminDto;

    // Проверяем, существует ли уже пользователь с таким email
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: `Пользователь с email ${email} уже существует`,
      };
    }

    // Хешируем пароль
    const hashedPassword = await this.hashPassword(password);

    // Создаем администратора
    const admin = await this.prisma.user.create({
      data: {
        email,
        name: email.split('@')[0], // Используем часть email как имя по умолчанию
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Логируем создание администратора (без пароля)
    await this.logAudit(admin.id, 'INIT_ADMIN', 'USER', admin.id, {
      method: 'init-admin',
      ipAddress,
      email: admin.email,
      role: admin.role,
    });

    return {
      success: true,
      message: `Администратор ${email} успешно создан`,
    };
  }

  async invalidateInitToken(): Promise<void> {
    // В реальном приложении здесь можно:
    // 1. Удалить токен из env
    // 2. Сохранить флаг в базе данных
    // 3. Использовать Redis для инвалидации
    
    // Для демонстрации просто логируем
    console.log('INIT_ADMIN_TOKEN инвалидирован');
  }

  private async generateTokens(user: any): Promise<Tokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private async logAudit(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    details: any,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details,
      },
    });
  }
}
