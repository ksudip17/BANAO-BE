import { applySoftDelete } from './soft-delete.extension';

const SOFT_MODEL = 'User';
const HARD_MODEL = 'Other';

describe('applySoftDelete', () => {
  const makeQuery = () => jest.fn().mockResolvedValue('result');
  const makeClient = (model: string) => ({
    _runtimeDataModel: {
      models: {
        [model]: {
          fields: model === SOFT_MODEL ? [{ name: 'deletedAt' }] : [],
        },
      },
    },
    [model]: {
      update: jest.fn().mockResolvedValue('updated-one'),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  });

  it('strips _includeDeleted before it can reach Prisma (non-soft-delete model)', async () => {
    const query = makeQuery();
    await applySoftDelete({
      model: HARD_MODEL,
      operation: 'findUnique',
      args: { where: { id: '1' }, _includeDeleted: true },
      query,
      client: makeClient(HARD_MODEL),
    });

    const passed = query.mock.calls[0][0];
    expect(passed).not.toHaveProperty('_includeDeleted');
    // No deletedAt filter is injected for a model that does not soft-delete.
    expect(passed.where).toEqual({ id: '1' });
  });

  it('does not throw when _includeDeleted is used on a non-soft-delete model', async () => {
    const query = makeQuery();
    await expect(
      applySoftDelete({
        model: HARD_MODEL,
        operation: 'findMany',
        args: { _includeDeleted: true },
        query,
        client: makeClient(HARD_MODEL),
      }),
    ).resolves.toBe('result');
  });

  it('injects deletedAt: null on reads for a soft-delete model', async () => {
    const query = makeQuery();
    await applySoftDelete({
      model: SOFT_MODEL,
      operation: 'findMany',
      args: { where: { name: 'x' } },
      query,
      client: makeClient(SOFT_MODEL),
    });

    expect(query.mock.calls[0][0].where).toEqual({ name: 'x', deletedAt: null });
  });

  it('does not inject the filter when _includeDeleted is set on a soft-delete model', async () => {
    const query = makeQuery();
    await applySoftDelete({
      model: SOFT_MODEL,
      operation: 'findMany',
      args: { where: { name: 'x' }, _includeDeleted: true },
      query,
      client: makeClient(SOFT_MODEL),
    });

    const passed = query.mock.calls[0][0];
    expect(passed).not.toHaveProperty('_includeDeleted');
    expect(passed.where).toEqual({ name: 'x' });
  });

  it('respects an explicit deletedAt filter and does not override it', async () => {
    const query = makeQuery();
    await applySoftDelete({
      model: SOFT_MODEL,
      operation: 'findFirst',
      args: { where: { deletedAt: { not: null } } },
      query,
      client: makeClient(SOFT_MODEL),
    });

    expect(query.mock.calls[0][0].where).toEqual({ deletedAt: { not: null } });
  });

  it('rewrites delete into an update (returns the row, throws on missing) setting deletedAt', async () => {
    const query = makeQuery();
    const client = makeClient(SOFT_MODEL);
    const result = await applySoftDelete({
      model: SOFT_MODEL,
      operation: 'delete',
      args: { where: { id: '1' } },
      query,
      client,
    });

    expect(query).not.toHaveBeenCalled();
    expect(client[SOFT_MODEL].updateMany).not.toHaveBeenCalled();
    expect(client[SOFT_MODEL].update).toHaveBeenCalledTimes(1);
    const updateArgs = client[SOFT_MODEL].update.mock.calls[0][0];
    expect(updateArgs.where).toEqual({ id: '1' });
    expect(updateArgs.data.deletedAt).toBeInstanceOf(Date);
    expect(result).toBe('updated-one'); // delete resolves to the row, not { count }
  });

  it('rewrites deleteMany into an updateMany setting deletedAt', async () => {
    const query = makeQuery();
    const client = makeClient(SOFT_MODEL);
    const result = await applySoftDelete({
      model: SOFT_MODEL,
      operation: 'deleteMany',
      args: { where: { status: 'OLD' } },
      query,
      client,
    });

    expect(query).not.toHaveBeenCalled();
    expect(client[SOFT_MODEL].update).not.toHaveBeenCalled();
    expect(client[SOFT_MODEL].updateMany).toHaveBeenCalledTimes(1);
    const updateArgs = client[SOFT_MODEL].updateMany.mock.calls[0][0];
    expect(updateArgs.where).toEqual({ status: 'OLD' });
    expect(updateArgs.data.deletedAt).toBeInstanceOf(Date);
    expect(result).toEqual({ count: 1 }); // deleteMany resolves to a batch payload
  });

  it('performs a hard delete when _soft is false', async () => {
    const query = makeQuery();
    const client = makeClient(SOFT_MODEL);
    await applySoftDelete({
      model: SOFT_MODEL,
      operation: 'delete',
      args: { where: { id: '1' }, _soft: false },
      query,
      client,
    });

    expect(client[SOFT_MODEL].updateMany).not.toHaveBeenCalled();
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).not.toHaveProperty('_soft');
  });

  it('passes through operations on models with no model name', async () => {
    const query = makeQuery();
    await applySoftDelete({
      model: undefined,
      operation: 'executeRaw',
      args: { _includeDeleted: true },
      query,
      client: {},
    });

    expect(query.mock.calls[0][0]).not.toHaveProperty('_includeDeleted');
  });
});
