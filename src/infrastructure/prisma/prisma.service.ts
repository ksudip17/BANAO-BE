import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { softDeleteExtension } from './extensions/soft-delete.extension';
import { PrismaClient } from './generated/prisma/client';
import { adapter } from './adapter';

export type ExtendedPrismaClient = ReturnType<typeof createExtendedClient>;

export type PrismaTransactionClient = Omit<
  ExtendedPrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

function createExtendedClient() {

  return new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  }).$extends(softDeleteExtension());
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly _client: ExtendedPrismaClient;

  constructor() {
    this._client = createExtendedClient();
  }
  
  get client(): ExtendedPrismaClient {
    return this._client;
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to the database...');
    await this._client.$connect();
    this.logger.log('Prisma connected');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from the database...');
    await this._client.$disconnect();
    this.logger.log('Prisma disconnected');
  }
}
