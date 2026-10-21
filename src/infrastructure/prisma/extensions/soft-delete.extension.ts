import { Prisma } from '../generated/prisma/client';

const READ_OPERATIONS = new Set([
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
]);

type OperationContext = {
  model?: string;
  operation: string;
  args: any;
  query: (args: any) => Promise<any>;
  client: any;
};

function supportsSoftDelete(
  client: any,
  model?: string,
): boolean {
  if (!model) {
    return false;
  }

  const fields =
    client?._runtimeDataModel?.models?.[model]?.fields;

  return (
    Array.isArray(fields) &&
    fields.some(
      (field: { name: string }) => field.name === 'deletedAt',
    )
  );
}

export function applySoftDelete({
  model,
  operation,
  args,
  query,
  client,
}: OperationContext) {
  const a = {
    ...(args ?? {}),
  } as any;

  const includeDeleted = a._includeDeleted === true;

  delete a._includeDeleted;

  if (!supportsSoftDelete(client, model)) {
    return query(a);
  }

  /**
   * DELETE
   *
   * By default:
   *   prisma.user.delete(...)
   *
   * becomes:
   *   prisma.user.update({
   *     ...,
   *     data: {
   *       deletedAt: new Date(),
   *     },
   *   })
   *
   * To perform a real delete:
   *   prisma.user.delete({
   *     where: {...},
   *     _soft: false,
   *   })
   */
  if (operation === 'delete' || operation === 'deleteMany') {
    const soft = a._soft !== false;

    delete a._soft;

    if (!soft) {
      return query(a);
    }

    const data = {
      deletedAt: new Date(),
    };

    if (operation === 'delete') {
      return client[model!].update({
        where: a.where,
        data,
      });
    }

    return client[model!].updateMany({
      where: a.where,
      data,
    });
  }

  /**
   * READ
   *
   * Automatically exclude:
   *   deletedAt != null
   */
  if (READ_OPERATIONS.has(operation)) {
    if (!includeDeleted) {
      a.where = {
        ...a.where,
        deletedAt: null,
      };
    }

    return query(a);
  }

  return query(a);
}

export function softDeleteExtension() {
  return Prisma.defineExtension((client) =>
    client.$extends({
      query: {
        $allModels: {
          async $allOperations({
            model,
            operation,
            args,
            query,
          }) {
            return applySoftDelete({
              model,
              operation,
              args,
              query,
              client,
            });
          },
        },
      },
    }),
  );
}
