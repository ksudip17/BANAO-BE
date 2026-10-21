import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

export type PrismaTx =
  Parameters<
    Parameters<
      PrismaService['client']['$transaction']
    >[0]
  >[0];