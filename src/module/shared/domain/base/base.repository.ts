export abstract class BaseRepository<TEntity, TTransaction = never> {

  abstract findById(id: string, tx?: TTransaction): Promise<TEntity | null>;

  abstract save(entity: TEntity, tx?: TTransaction): Promise<TEntity>;

  abstract create(entity: TEntity, tx?: TTransaction): Promise<TEntity>;

  abstract delete(id: string, tx?: TTransaction): Promise<void>;

  abstract findAll(tx?: TTransaction): Promise<TEntity[]>;
}
