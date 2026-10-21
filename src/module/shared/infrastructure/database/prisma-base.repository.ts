import type { PrismaTx } from 'src/module/shared/domain/transaction.types';
import { BaseRepository } from 'src/module/shared/domain/base/base.repository';
import type { PrismaService } from 'src/infrastructure/prisma/prisma.service';

export interface PrismaRepositoryDelegate<
  TWhereUnique extends object,
  TWhere extends object,
  TCreateInput extends object,
  TUpdateInput extends object,
  TRaw,
> {
  findFirst(args: { where: TWhere }): Promise<TRaw | null>;
  findUnique(args: { where: TWhereUnique }): Promise<TRaw | null>;
  findMany(): Promise<TRaw[]>;
  create(args: { data: TCreateInput }): Promise<TRaw>;
  update(args: { where: TWhereUnique; data: TUpdateInput }): Promise<TRaw>;
  delete(args: { where: TWhereUnique }): Promise<TRaw>;
  upsert(args: {
    where: TWhereUnique;
    create: TCreateInput;
    update: TUpdateInput;
  }): Promise<TRaw>;
}

export abstract class PrismaBaseRepository<
  TEntity,
  TWhereUnique extends object,
  TWhere extends object,
  TCreateInput extends object,
  TUpdateInput extends object,
  TRaw,
  TDelegate extends PrismaRepositoryDelegate<
    TWhereUnique,
    TWhere,
    TCreateInput,
    TUpdateInput,
    TRaw
  >,
> extends BaseRepository<TEntity, PrismaTx> {
  constructor(protected readonly prisma: PrismaService) {
    super();
  }

  protected abstract model(tx?: PrismaTx): TDelegate;

  protected abstract toCreateInput(entity: TEntity): TCreateInput;
  protected abstract toUpdateInput(entity: TEntity): TUpdateInput;
  protected abstract whereById(id: string): TWhereUnique;
  protected abstract whereByEntity(entity: TEntity): TWhereUnique;
  protected abstract toDomain(raw: TRaw): TEntity;

  async findFirst(where: TWhere, tx?: PrismaTx): Promise<TEntity | null> {
    const raw = await this.model(tx).findFirst({ where });
    return raw === null ? null : this.toDomain(raw);
  }

  async findById(id: string, tx?: PrismaTx): Promise<TEntity | null> {
    const raw = await this.model(tx).findUnique({ where: this.whereById(id) });
    return raw === null ? null : this.toDomain(raw);
  }

  async findAll(tx?: PrismaTx): Promise<TEntity[]> {
    const raws = await this.model(tx).findMany();
    return raws.map((raw) => this.toDomain(raw));
  }

  async create(entity: TEntity, tx?: PrismaTx): Promise<TEntity> {
    const raw = await this.model(tx).create({ data: this.toCreateInput(entity) });
    return this.toDomain(raw);
  }

  async update(
    where: TWhereUnique,
    data: TUpdateInput,
    tx?: PrismaTx,
  ): Promise<TEntity> {
    const raw = await this.model(tx).update({ where, data });
    return this.toDomain(raw);
  }

  async delete(id: string, tx?: PrismaTx): Promise<void> {
    await this.model(tx).delete({ where: this.whereById(id) });
  }

  async save(entity: TEntity, tx?: PrismaTx): Promise<TEntity> {
    const raw = await this.model(tx).upsert({
      where: this.whereByEntity(entity),
      create: this.toCreateInput(entity),
      update: this.toUpdateInput(entity),
    });
    return this.toDomain(raw);
  }
}
