import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuditLogModule } from './common/audit-log/audit-log.module';
import { UsersModule } from './users/users.module';
import { ApprovalRequestsModule } from './approval-requests/approval-requests.module';
import { AuthModule } from './auth/auth.module';
import { RequestTypesModule } from './request-types/request-types.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // Luôn để ConfigModule lên đầu tiên
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuditLogModule,
    AuthModule,
    UsersModule,
    ApprovalRequestsModule,
    RequestTypesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // JwtAuthGuard chạy trước: xác thực token và gán request.user
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // RolesGuard chạy sau: kiểm tra @Roles() dựa trên request.user
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
