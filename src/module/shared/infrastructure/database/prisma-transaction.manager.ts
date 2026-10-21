import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { PrismaTx } from '../../domain/transaction.types';
import { TransactionManager } from '../../domain/transaction/transaction.manager';

@Injectable()
export class PrismaTransactionManager implements TransactionManager {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async run<T>(
    fn: (tx: PrismaTx) => Promise<T>,
  ): Promise<T> {

    return this.prisma.client.$transaction(
      async (tx) => fn(tx),
    );
  }
}