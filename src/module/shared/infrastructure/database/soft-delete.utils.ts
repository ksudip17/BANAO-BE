const DELETED_MARKER = "-deleted-";

/**
 * Soft-deletes a row while releasing its unique string fields (e.g. slug, name)
 * so the value can be reused by an active record. The global soft-delete
 * extension only sets `deletedAt`; unique constraints still cover deleted rows,
 * so we suffix the unique fields here to free up the active namespace.
 */
export async function softDeleteFreeingUniques(
  model: any,
  id: string,
  uniqueFields: string[],
): Promise<void> {
  const existing = await model.findUnique({
    where: { id },
    _includeDeleted: true,
  });
  if (!existing) return;

  const suffix = `${DELETED_MARKER}${Date.now()}`;
  const data: Record<string, unknown> = { deletedAt: new Date() };

  for (const field of uniqueFields) {
    const current = existing[field];
    if (typeof current === "string" && !current.includes(DELETED_MARKER)) {
      data[field] = `${current.slice(0, 200)}${suffix}`;
    }
  }

  await model.update({ where: { id }, data });
}
