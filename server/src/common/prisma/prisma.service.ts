import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Buộc phải nạp biến môi trường TRƯỚC khi khởi tạo class
dotenv.config({ path: path.join(__dirname, '../../../../.env') });
// Lưu ý: Nếu file .env nằm ở apps/server, hãy chỉnh lại path cho đúng (ví dụ: './.env')

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const url = process.env.DATABASE_URL;

    if (!url) {
      throw new Error('❌ DATABASE_URL is missing in environment variables!');
    }

    const adapter = new PrismaPg({ connectionString: url });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      console.log('🚀 [Nexus Flow] Database connected successfully!');
    } catch (error) {
      console.error('❌ [Nexus Flow] Connection error:', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
